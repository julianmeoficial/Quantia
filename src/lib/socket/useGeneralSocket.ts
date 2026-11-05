"use client";

import {
  ChatGeneralClientEvent,
  ChatGeneralErrorCode,
  ChatGeneralEvent,
  RealtimeNamespace,
  type PresenceUser,
} from "@quantia/contracts";
import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

import type { ConnectionState } from "@/components/system";
import { useAuth } from "@/features/auth/AuthProvider";
import { getAccessToken, onAccessTokenChange, refreshAccessToken } from "@/lib/api/session";

import {
  parseChatGeneralAck,
  parseChatGeneralPayload,
  parseChatGeneralSocketError,
  type ChatGeneralPayloadByEvent,
} from "./chatEvents";
import {
  clearNamespacePause,
  disconnectNamespace,
  getSocket,
  isNamespacePaused,
  isTooManyConnections,
  reconnectSocket,
} from "./connection";
import { removePresenceUser, replacePresenceUsers, upsertPresenceUser } from "./presenceMap";

/** Why the socket stopped trying (each one has its own UI). */
export type GeneralSocketBlock = "avatar-required" | "chat-disabled" | "too-many-connections";

/** Domain events forwarded to the chat store (presence/typing stay inside this hook). */
export type GeneralSocketHandlers = {
  /** `presencia` received: the socket is authenticated and in the room. `isReconnect` → catch up. */
  onReady: (isReconnect: boolean) => void;
  onMessageCreated: (payload: ChatGeneralPayloadByEvent["chat.general.mensaje-creado"]) => void;
  onMessageEdited: (payload: ChatGeneralPayloadByEvent["chat.general.mensaje-editado"]) => void;
  onMessageDeleted: (payload: ChatGeneralPayloadByEvent["chat.general.mensaje-eliminado"]) => void;
  onReactions: (payload: ChatGeneralPayloadByEvent["chat.general.reacciones-actualizadas"]) => void;
  onRead: (payload: ChatGeneralPayloadByEvent["chat.general.lectura"]) => void;
  onUserUpdated: (user: PresenceUser) => void;
};

export type RecentPresence = { user: PresenceUser; lastSeenAt: string };

export type GeneralSocketState = {
  connectionState: ConnectionState;
  /** `connect` is not enough: ready only after `chat.general.presencia`. */
  ready: boolean;
  online: PresenceUser[];
  /** Other users currently typing (own user filtered out). */
  typing: PresenceUser[];
  /** Users who left during this session, newest first («visto por última vez»). */
  recentlyLeft: RecentPresence[];
  blocked: GeneralSocketBlock | null;
  reconnect: () => void;
  /** Call on every composer change; throttled to `typingTtlMs / 2`. Empty text stops. */
  notifyTyping: (text: string) => void;
  stopTyping: () => void;
};

export type UseGeneralSocketOptions = {
  enabled: boolean;
  handlersRef: RefObject<GeneralSocketHandlers | null>;
  typingTtlMs: number;
};

const MAX_BACKOFF_MS = 30_000;
const ACK_TIMEOUT_MS = 5_000;

export function useGeneralSocket({
  enabled,
  handlersRef,
  typingTtlMs,
}: UseGeneralSocketOptions): GeneralSocketState {
  const { user } = useAuth();
  const meId = user?.id ?? null;
  const [connectionState, setConnectionState] = useState<ConnectionState>("reconnecting");
  const [ready, setReady] = useState(false);
  const [online, setOnline] = useState<PresenceUser[]>([]);
  const [typing, setTyping] = useState<PresenceUser[]>([]);
  const [recentlyLeft, setRecentlyLeft] = useState<RecentPresence[]>([]);
  const onlineRef = useRef<PresenceUser[]>([]);

  useEffect(() => {
    onlineRef.current = online;
  }, [online]);
  const [blocked, setBlocked] = useState<GeneralSocketBlock | null>(null);

  const typingTimers = useRef(new Map<string, number>());
  const typingSentAt = useRef(0);
  const everReady = useRef(false);
  const retries = useRef(0);
  const retryTimer = useRef<number | null>(null);
  const authRetryUsed = useRef(false);
  const blockedRef = useRef<GeneralSocketBlock | null>(null);
  const ttlRef = useRef(typingTtlMs);

  useEffect(() => {
    ttlRef.current = typingTtlMs;
  }, [typingTtlMs]);

  const hideTyping = useCallback((userId: string) => {
    const timer = typingTimers.current.get(userId);
    if (timer !== undefined) window.clearTimeout(timer);
    typingTimers.current.delete(userId);
    setTyping((current) =>
      current.some((entry) => entry.id === userId)
        ? current.filter((entry) => entry.id !== userId)
        : current,
    );
  }, []);

  const showTyping = useCallback(
    (card: PresenceUser, ms: number) => {
      const previous = typingTimers.current.get(card.id);
      if (previous !== undefined) window.clearTimeout(previous);
      typingTimers.current.set(
        card.id,
        window.setTimeout(() => hideTyping(card.id), Math.max(ms, 1_000)),
      );
      setTyping((current) => upsertPresenceUser(current, card));
    },
    [hideTyping],
  );

  const block = useCallback((reason: GeneralSocketBlock) => {
    blockedRef.current = reason;
    setBlocked(reason);
    setConnectionState("disconnected");
  }, []);

  const reconnect = useCallback(() => {
    if (blockedRef.current === "avatar-required" || blockedRef.current === "chat-disabled") return;
    blockedRef.current = null;
    setBlocked(null);
    retries.current = 0;
    setConnectionState("reconnecting");
    clearNamespacePause(RealtimeNamespace.GENERAL);
    reconnectSocket(RealtimeNamespace.GENERAL);
  }, []);

  const stopTyping = useCallback(() => {
    if (!typingSentAt.current) return;
    typingSentAt.current = 0;
    const socket = getSocket(RealtimeNamespace.GENERAL);
    if (!socket.connected) return;
    void socket
      .timeout(ACK_TIMEOUT_MS)
      .emitWithAck(ChatGeneralClientEvent.ESCRIBIENDO, { isTyping: false })
      .catch(() => undefined);
  }, []);

  const notifyTyping = useCallback(
    (text: string) => {
      if (!text.trim()) {
        stopTyping();
        return;
      }
      const now = Date.now();
      if (now - typingSentAt.current < ttlRef.current / 2) return;
      const socket = getSocket(RealtimeNamespace.GENERAL);
      if (!socket.connected) return;
      typingSentAt.current = now;
      void socket
        .timeout(ACK_TIMEOUT_MS)
        .emitWithAck(ChatGeneralClientEvent.ESCRIBIENDO, { isTyping: true })
        .then((raw: unknown) => {
          const ack = parseChatGeneralAck(raw);
          // Rate limited: let the next keystroke try again after a full TTL.
          if (ack && !ack.ok) typingSentAt.current = now + ttlRef.current / 2;
        })
        .catch(() => undefined);
    },
    [stopTyping],
  );

  useEffect(() => {
    if (!enabled || !meId) return;
    if (isNamespacePaused(RealtimeNamespace.GENERAL)) {
      queueMicrotask(() => block("too-many-connections"));
      return;
    }

    const socket = getSocket(RealtimeNamespace.GENERAL);
    const timers = typingTimers.current;
    everReady.current = false;
    retries.current = 0;
    authRetryUsed.current = false;
    blockedRef.current = null;

    const clearRetry = () => {
      if (retryTimer.current !== null) window.clearTimeout(retryTimer.current);
      retryTimer.current = null;
    };

    const scheduleManualReconnect = () => {
      if (blockedRef.current) return;
      clearRetry();
      const wait = Math.min(1_000 * 2 ** retries.current, MAX_BACKOFF_MS);
      retries.current += 1;
      setConnectionState("reconnecting");
      retryTimer.current = window.setTimeout(() => {
        void refreshAccessToken().finally(() => {
          if (!blockedRef.current) socket.connect();
        });
      }, wait);
    };

    const onConnect = () => {
      // Authentication happens after `connect`: stay "reconnecting" until `presencia`.
      setConnectionState("reconnecting");
    };

    const onDisconnect = (reason: string) => {
      setReady(false);
      setConnectionState(blockedRef.current ? "disconnected" : "reconnecting");
      for (const timer of timers.values()) window.clearTimeout(timer);
      timers.clear();
      setTyping([]);
      // A server-side close never reconnects by itself (socket.io semantics).
      if (reason === "io server disconnect") scheduleManualReconnect();
    };

    const onReconnectAttempt = () => {
      if (!blockedRef.current) setConnectionState("reconnecting");
    };

    const onConnectError = (error: Error) => {
      if (isTooManyConnections(error.message)) {
        block("too-many-connections");
        return;
      }
      setConnectionState("reconnecting");
      if (authRetryUsed.current) return;
      authRetryUsed.current = true;
      void refreshAccessToken().then((token) => {
        if (token && !blockedRef.current) reconnectSocket(RealtimeNamespace.GENERAL);
      });
    };

    const onError = (raw: unknown) => {
      if (isTooManyConnections(raw)) {
        block("too-many-connections");
        return;
      }
      const error = parseChatGeneralSocketError(raw);
      if (!error) return;
      switch (error.code) {
        case ChatGeneralErrorCode.AVATAR_REQUIRED:
          socket.io.opts.reconnection = false;
          block("avatar-required");
          break;
        case ChatGeneralErrorCode.CHAT_DISABLED:
          socket.io.opts.reconnection = false;
          block("chat-disabled");
          break;
        case ChatGeneralErrorCode.UNAUTHORIZED:
        case ChatGeneralErrorCode.TOKEN_EXPIRED:
          // The server disconnects next; `scheduleManualReconnect` refreshes first.
          break;
        default:
          break;
      }
    };

    const onPresencia = (raw: unknown) => {
      const payload = parseChatGeneralPayload(ChatGeneralEvent.PRESENCIA, raw);
      if (!payload) return;
      const isReconnect = everReady.current;
      everReady.current = true;
      retries.current = 0;
      authRetryUsed.current = false;
      setReady(true);
      setConnectionState("connected");
      setOnline(replacePresenceUsers(payload.users));
      setRecentlyLeft((current) =>
        current.filter((entry) => !payload.users.some((card) => card.id === entry.user.id)),
      );
      for (const card of payload.typing) {
        if (card.id !== meId) showTyping(card, ttlRef.current);
      }
      handlersRef.current?.onReady(isReconnect);
    };

    const onUsuarioConectado = (raw: unknown) => {
      const payload = parseChatGeneralPayload(ChatGeneralEvent.USUARIO_CONECTADO, raw);
      if (!payload) return;
      setOnline((current) => upsertPresenceUser(current, payload.user));
      setRecentlyLeft((current) => current.filter((entry) => entry.user.id !== payload.user.id));
    };

    const onUsuarioDesconectado = (raw: unknown) => {
      const payload = parseChatGeneralPayload(ChatGeneralEvent.USUARIO_DESCONECTADO, raw);
      if (!payload) return;
      const card = onlineRef.current.find((entry) => entry.id === payload.userId);
      setOnline((current) => removePresenceUser(current, payload.userId));
      if (card) {
        setRecentlyLeft((current) =>
          [
            { user: card, lastSeenAt: payload.lastSeenAt },
            ...current.filter((entry) => entry.user.id !== card.id),
          ].slice(0, 8),
        );
      }
      hideTyping(payload.userId);
    };

    const onUsuarioActualizado = (raw: unknown) => {
      const payload = parseChatGeneralPayload(ChatGeneralEvent.USUARIO_ACTUALIZADO, raw);
      if (!payload) return;
      setOnline((current) =>
        current.some((entry) => entry.id === payload.user.id)
          ? upsertPresenceUser(current, payload.user)
          : current,
      );
      setTyping((current) =>
        current.map((entry) => (entry.id === payload.user.id ? payload.user : entry)),
      );
      handlersRef.current?.onUserUpdated(payload.user);
    };

    const onEscribiendo = (raw: unknown) => {
      const payload = parseChatGeneralPayload(ChatGeneralEvent.ESCRIBIENDO, raw);
      if (!payload || payload.user.id === meId) return;
      if (payload.isTyping) showTyping(payload.user, payload.expiresInMs);
      else hideTyping(payload.user.id);
    };

    const forward =
      <E extends keyof ChatGeneralPayloadByEvent>(
        event: E,
        pick: (handlers: GeneralSocketHandlers, payload: ChatGeneralPayloadByEvent[E]) => void,
      ) =>
      (raw: unknown) => {
        const payload = parseChatGeneralPayload(event, raw);
        const handlers = handlersRef.current;
        if (payload && handlers) pick(handlers, payload);
      };

    const onCreado = forward(ChatGeneralEvent.MENSAJE_CREADO, (handlers, payload) => {
      hideTyping(payload.message.author.id);
      handlers.onMessageCreated(payload);
    });
    const onEditado = forward(ChatGeneralEvent.MENSAJE_EDITADO, (handlers, payload) =>
      handlers.onMessageEdited(payload),
    );
    const onEliminado = forward(ChatGeneralEvent.MENSAJE_ELIMINADO, (handlers, payload) =>
      handlers.onMessageDeleted(payload),
    );
    const onReacciones = forward(ChatGeneralEvent.REACCIONES_ACTUALIZADAS, (handlers, payload) =>
      handlers.onReactions(payload),
    );
    const onLectura = forward(ChatGeneralEvent.LECTURA, (handlers, payload) =>
      handlers.onRead(payload),
    );

    // Keep the socket alive across JWT refreshes (own tab or another tab) without
    // reconnecting, so presence does not flicker (`chat.general.reautenticar`).
    const stopTokenSync = onAccessTokenChange((token) => {
      if (!socket.connected) return;
      void socket
        .timeout(ACK_TIMEOUT_MS)
        .emitWithAck(ChatGeneralClientEvent.REAUTENTICAR, { token })
        .catch(() => undefined);
    });

    socket.io.opts.reconnection = true;
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.io.on("reconnect_attempt", onReconnectAttempt);
    socket.on("connect_error", onConnectError);
    socket.on("error", onError);
    socket.on(ChatGeneralEvent.PRESENCIA, onPresencia);
    socket.on(ChatGeneralEvent.USUARIO_CONECTADO, onUsuarioConectado);
    socket.on(ChatGeneralEvent.USUARIO_DESCONECTADO, onUsuarioDesconectado);
    socket.on(ChatGeneralEvent.USUARIO_ACTUALIZADO, onUsuarioActualizado);
    socket.on(ChatGeneralEvent.ESCRIBIENDO, onEscribiendo);
    socket.on(ChatGeneralEvent.MENSAJE_CREADO, onCreado);
    socket.on(ChatGeneralEvent.MENSAJE_EDITADO, onEditado);
    socket.on(ChatGeneralEvent.MENSAJE_ELIMINADO, onEliminado);
    socket.on(ChatGeneralEvent.REACCIONES_ACTUALIZADAS, onReacciones);
    socket.on(ChatGeneralEvent.LECTURA, onLectura);

    socket.auth = { token: getAccessToken() };
    socket.connect();

    return () => {
      clearRetry();
      stopTokenSync();
      for (const timer of timers.values()) window.clearTimeout(timer);
      timers.clear();
      typingSentAt.current = 0;
      disconnectNamespace(RealtimeNamespace.GENERAL);
    };
  }, [block, enabled, handlersRef, hideTyping, meId, showTyping]);

  return {
    connectionState,
    ready,
    online,
    typing,
    recentlyLeft,
    blocked,
    reconnect,
    notifyTyping,
    stopTyping,
  };
}

"use client";

import {
  ChatGeneralEvent,
  RealtimeNamespace,
  type GeneralChatMessageDto,
  type PresenceUser,
} from "@quantia/contracts";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

import { useAuth } from "@/features/auth/AuthProvider";
import { insertChatMessageInCache } from "@/lib/api/chatCache";
import { queryKeys } from "@/lib/api/query-keys";
import { refreshAccessToken } from "@/lib/api/session";
import type { ConnectionState } from "@/components/system";

import { parseChatGeneralPayload } from "./chatEvents";
import {
  clearNamespacePause,
  disconnectNamespace,
  getSocket,
  isNamespacePaused,
  reconnectSocket,
} from "./connection";
import { removePresenceUser, replacePresenceUsers, upsertPresenceUser } from "./presenceMap";

export type GeneralSocketState = {
  users: PresenceUser[];
  connectionState: ConnectionState;
  pendingNewCount: number;
  liveAnnouncement: string;
  clearPendingNew: () => void;
  clearLiveAnnouncement: () => void;
  reconnect: () => void;
};

export type UseGeneralSocketOptions = {
  /** Shared with Virtuoso `atBottomStateChange` — when false, remote messages bump the pill. */
  isAtBottomRef: RefObject<boolean>;
};

export function useGeneralSocket({ isAtBottomRef }: UseGeneralSocketOptions): GeneralSocketState {
  const { status: authStatus, user } = useAuth();
  const queryClient = useQueryClient();
  const [users, setUsers] = useState<PresenceUser[]>([]);
  const [connectionState, setConnectionState] = useState<ConnectionState>("disconnected");
  const [pendingNewCount, setPendingNewCount] = useState(0);
  const [liveAnnouncement, setLiveAnnouncement] = useState("");
  const authRetryUsed = useRef(false);
  const announceTimer = useRef<number | null>(null);

  const clearPendingNew = useCallback(() => {
    setPendingNewCount(0);
  }, []);

  const clearLiveAnnouncement = useCallback(() => {
    setLiveAnnouncement("");
  }, []);

  const announce = useCallback((text: string) => {
    if (announceTimer.current !== null) window.clearTimeout(announceTimer.current);
    setLiveAnnouncement(text);
    announceTimer.current = window.setTimeout(() => {
      setLiveAnnouncement("");
      announceTimer.current = null;
    }, 1_500);
  }, []);

  const reconnect = useCallback(() => {
    clearNamespacePause(RealtimeNamespace.GENERAL);
    reconnectSocket(RealtimeNamespace.GENERAL);
  }, []);

  useEffect(() => {
    return () => {
      if (announceTimer.current !== null) window.clearTimeout(announceTimer.current);
    };
  }, []);

  useEffect(() => {
    if (authStatus !== "authenticated") return;

    authRetryUsed.current = false;

    if (isNamespacePaused(RealtimeNamespace.GENERAL)) {
      return;
    }

    const socket = getSocket(RealtimeNamespace.GENERAL);

    const onConnect = () => {
      authRetryUsed.current = false;
      setConnectionState("connected");
      void queryClient.invalidateQueries({ queryKey: queryKeys.chatGeneralHistory });
    };

    const onDisconnect = () => {
      setConnectionState("disconnected");
    };

    const onReconnectAttempt = () => {
      setConnectionState("reconnecting");
    };

    const onConnectError = () => {
      setConnectionState("disconnected");
      if (authRetryUsed.current) return;
      authRetryUsed.current = true;
      void refreshAccessToken().then((token) => {
        if (!token) return;
        reconnectSocket(RealtimeNamespace.GENERAL);
      });
    };

    const onPresencia = (raw: unknown) => {
      const payload = parseChatGeneralPayload(ChatGeneralEvent.PRESENCIA, raw);
      if (!payload) return;
      setUsers(replacePresenceUsers(payload.users));
    };

    const onUsuarioConectado = (raw: unknown) => {
      const payload = parseChatGeneralPayload(ChatGeneralEvent.USUARIO_CONECTADO, raw);
      if (!payload) return;
      setUsers((current) => upsertPresenceUser(current, payload.user));
    };

    const onUsuarioDesconectado = (raw: unknown) => {
      const payload = parseChatGeneralPayload(ChatGeneralEvent.USUARIO_DESCONECTADO, raw);
      if (!payload) return;
      setUsers((current) => removePresenceUser(current, payload.userId));
    };

    const onMensajeCreado = (raw: unknown) => {
      const payload = parseChatGeneralPayload(ChatGeneralEvent.MENSAJE_CREADO, raw);
      if (!payload) return;
      const message: GeneralChatMessageDto = payload.message;
      const inserted = insertChatMessageInCache(queryClient, message);
      if (!inserted) return;

      const isOwn = Boolean(user && message.author.id === user.id);
      if (!isOwn) {
        announce(`Nuevo mensaje de ${message.author.name}`);
      }

      const atBottom = isAtBottomRef.current;
      if (!atBottom && !isOwn) {
        setPendingNewCount((value) => value + 1);
      }
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.io.on("reconnect_attempt", onReconnectAttempt);
    socket.on("connect_error", onConnectError);
    socket.on(ChatGeneralEvent.PRESENCIA, onPresencia);
    socket.on(ChatGeneralEvent.USUARIO_CONECTADO, onUsuarioConectado);
    socket.on(ChatGeneralEvent.USUARIO_DESCONECTADO, onUsuarioDesconectado);
    socket.on(ChatGeneralEvent.MENSAJE_CREADO, onMensajeCreado);

    socket.connect();
    // If already connected, sync UI after this effect (avoid sync setState-in-effect).
    queueMicrotask(() => {
      if (socket.connected) onConnect();
    });

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.io.off("reconnect_attempt", onReconnectAttempt);
      socket.off("connect_error", onConnectError);
      socket.off(ChatGeneralEvent.PRESENCIA, onPresencia);
      socket.off(ChatGeneralEvent.USUARIO_CONECTADO, onUsuarioConectado);
      socket.off(ChatGeneralEvent.USUARIO_DESCONECTADO, onUsuarioDesconectado);
      socket.off(ChatGeneralEvent.MENSAJE_CREADO, onMensajeCreado);
      disconnectNamespace(RealtimeNamespace.GENERAL);
    };
  }, [announce, authStatus, isAtBottomRef, queryClient, user]);

  return {
    users,
    connectionState,
    pendingNewCount,
    liveAnnouncement,
    clearPendingNew,
    clearLiveAnnouncement,
    reconnect,
  };
}

export function resumeGeneralSocket() {
  clearNamespacePause(RealtimeNamespace.GENERAL);
  reconnectSocket(RealtimeNamespace.GENERAL);
}

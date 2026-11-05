"use client";

import {
  CHAT_GENERAL_REACTIONS,
  ChatGeneralErrorCode,
  type ChatGeneralReaction,
  type GeneralChatMessageDto,
  type GeneralChatStateResponse,
  type PresenceUser,
} from "@quantia/contracts";
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";

import { useAuth } from "@/features/auth/AuthProvider";
import {
  createGeneralChatMessage,
  deleteGeneralChatMessage,
  editGeneralChatMessage,
  GENERAL_CHAT_MESSAGE_MAX,
  getGeneralChatState,
  listGeneralChatMessages,
  listGeneralChatUpdates,
  markGeneralChatRead,
  removeGeneralChatReaction,
  setGeneralChatReaction,
} from "@/lib/api/chat";
import { ApiError } from "@/lib/api/errors";
import { canModerateChat } from "@/lib/auth";
import { useGeneralSocket, type GeneralSocketHandlers } from "@/lib/socket";

import {
  createChatReducer,
  findEntryById,
  initialChatState,
  LOCAL_SEQ,
  myReactionFor,
  renderKeyFor,
  selectLatestSeq,
  selectOrderedEntries,
  type ChatAction,
  type ChatEntry,
} from "./chatReducer";

export type ChatPhase = "loading" | "ready" | "error" | "avatar-required" | "chat-disabled";

export type ComposerNotice = { tone: "error" | "info"; text: string } | null;

const HISTORY_PAGE = 30;
const READ_DEBOUNCE_MS = 1_000;
const NETWORK_RETRY_MS = 1_500;
/** After this long offline, reload the first page instead of replaying the feed. */
const STALE_AFTER_MS = 24 * 60 * 60 * 1_000;
const CATCH_UP_OVERLAP_MS = 5_000;
const MAX_JUMP_PAGES = 10;

const chatReducer = createChatReducer(CHAT_GENERAL_REACTIONS);

function asApiError(cause: unknown) {
  return cause instanceof ApiError ? cause : new ApiError("unknown", null);
}

function newClientMessageId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `c-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function sendErrorText(error: ApiError): string {
  if (error.code === ChatGeneralErrorCode.REPLY_TARGET_NOT_FOUND) {
    return "El mensaje al que respondías ya no existe.";
  }
  if (error.kind === "rate_limited") return "Demasiados mensajes seguidos.";
  if (error.kind === "validation") return "El mensaje no es válido.";
  return "No se envió.";
}

export function useGeneralChat() {
  const { status: authStatus, user, replaceUser } = useAuth();
  const [store, dispatch] = useReducer(chatReducer, initialChatState);
  const [phase, setPhase] = useState<ChatPhase>("loading");
  const [loadError, setLoadError] = useState<ApiError | null>(null);
  const [serverState, setServerState] = useState<GeneralChatStateResponse | null>(null);
  const [isFetchingOlder, setIsFetchingOlder] = useState(false);
  const [rateLimitedUntil, setRateLimitedUntil] = useState<number | null>(null);
  const [notice, setNotice] = useState<ComposerNotice>(null);
  const [announcement, setAnnouncement] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  const hydratedRef = useRef(false);
  const buffer = useRef<ChatAction[]>([]);
  const syncPoint = useRef<string | null>(null);
  const storeRef = useRef(store);
  const readTimer = useRef<number | null>(null);
  const announceTimer = useRef<number | null>(null);
  const inFlight = useRef(new Set<string>());

  useEffect(() => {
    storeRef.current = store;
  }, [store]);

  const meId = user?.id ?? "";
  const me: PresenceUser | null = useMemo(
    () =>
      user ? { id: user.id, name: user.fullName, avatar: user.avatar, avatarUrl: null } : null,
    [user],
  );
  const avatarRequired = Boolean(user?.avatarRequired);
  const canModerate = user ? canModerateChat(user) : false;
  const limits = serverState?.limits;
  const maxLength = limits?.messageMaxLength ?? GENERAL_CHAT_MESSAGE_MAX;
  const typingTtlMs = limits?.typingTtlMs ?? 6_000;
  const reactions = serverState?.reactions ?? [...CHAT_GENERAL_REACTIONS];
  const enabled = authStatus === "authenticated" && Boolean(user) && !avatarRequired;

  const announce = useCallback((text: string) => {
    if (announceTimer.current !== null) window.clearTimeout(announceTimer.current);
    setAnnouncement(text);
    announceTimer.current = window.setTimeout(() => setAnnouncement(""), 2_000);
  }, []);

  /** Socket events arriving before the first REST page are replayed afterwards. */
  const live = useCallback((action: ChatAction) => {
    if (hydratedRef.current) dispatch(action);
    else buffer.current.push(action);
  }, []);

  const handleFatal = useCallback((error: ApiError) => {
    if (error.code === ChatGeneralErrorCode.AVATAR_REQUIRED) setPhase("avatar-required");
    else if (error.code === ChatGeneralErrorCode.CHAT_DISABLED || error.kind === "not_found")
      setPhase("chat-disabled");
    else {
      setLoadError(error);
      setPhase("error");
    }
  }, []);

  // ---------- Bootstrap (REST is independent from the socket) ----------
  useEffect(() => {
    if (!enabled || !meId) return;
    let active = true;
    hydratedRef.current = false;

    void Promise.all([getGeneralChatState(), listGeneralChatMessages({ limit: HISTORY_PAGE })])
      .then(([state, page]) => {
        if (!active) return;
        setServerState(state);
        dispatch({ type: "hydrate", page, state, meId });
        syncPoint.current = state.serverTime;
        hydratedRef.current = true;
        buffer.current.splice(0).forEach((action) => dispatch(action));
        setLoadError(null);
        setPhase("ready");
      })
      .catch((cause: unknown) => {
        if (active) handleFatal(asApiError(cause));
      });

    return () => {
      active = false;
    };
  }, [enabled, handleFatal, meId, reloadToken]);

  /** Reconnect without gaps: replay the change feed from `syncPoint − 5 s`. */
  const catchUp = useCallback(async () => {
    const since = syncPoint.current;
    if (!since || !hydratedRef.current) return;
    if (Date.now() - Date.parse(since) > STALE_AFTER_MS) {
      setReloadToken((token) => token + 1);
      return;
    }
    try {
      let cursor: string | null = null;
      let serverTime = since;
      const overlap = new Date(Date.parse(since) - CATCH_UP_OVERLAP_MS).toISOString();
      do {
        const response = await listGeneralChatUpdates(cursor ? { cursor } : { since: overlap });
        if (response.items.length) dispatch({ type: "upsertMany", messages: response.items });
        cursor = response.hasMore ? response.nextCursor : null;
        serverTime = response.serverTime;
      } while (cursor);
      syncPoint.current = serverTime;
      const state = await getGeneralChatState();
      setServerState(state);
      for (const read of state.readStates) {
        dispatch({ type: "read", userId: read.userId, lastReadSeq: read.lastReadSeq });
      }
    } catch (cause) {
      const error = asApiError(cause);
      if (error.code === ChatGeneralErrorCode.AVATAR_REQUIRED) setPhase("avatar-required");
    }
  }, []);

  // ---------- Socket ----------
  const handlersRef = useRef<GeneralSocketHandlers | null>(null);
  useEffect(() => {
    handlersRef.current = {
      onReady: (isReconnect) => {
        if (isReconnect) void catchUp();
      },
      onMessageCreated: ({ message }) => {
        const known = Boolean(findEntryById(storeRef.current, message.id));
        live({ type: "upsert", message, live: true });
        if (!known && message.author.id !== meId) {
          announce(`Nuevo mensaje de ${message.author.name}`);
        }
      },
      onMessageEdited: ({ message }) => live({ type: "upsert", message, live: true }),
      onMessageDeleted: (payload) => {
        const entry = findEntryById(storeRef.current, payload.id);
        live({ type: "deleted", payload });
        if (entry && entry.message.author.id === meId && payload.byModerator) {
          setNotice({ tone: "info", text: "Un administrador eliminó uno de tus mensajes." });
        }
      },
      onReactions: (payload) => live({ type: "reactions", payload }),
      onRead: (payload) =>
        live({ type: "read", userId: payload.userId, lastReadSeq: payload.lastReadSeq }),
      onUserUpdated: (card) => live({ type: "userUpdated", user: card }),
    };
  }, [announce, catchUp, live, meId]);

  const socket = useGeneralSocket({
    enabled: enabled && phase !== "chat-disabled" && phase !== "avatar-required",
    handlersRef,
    typingTtlMs,
  });

  useEffect(() => {
    if (socket.blocked === "avatar-required") queueMicrotask(() => setPhase("avatar-required"));
    if (socket.blocked === "chat-disabled") queueMicrotask(() => setPhase("chat-disabled"));
  }, [socket.blocked]);

  useEffect(
    () => () => {
      if (readTimer.current !== null) window.clearTimeout(readTimer.current);
      if (announceTimer.current !== null) window.clearTimeout(announceTimer.current);
    },
    [],
  );

  // ---------- History ----------
  const loadOlder = useCallback(async () => {
    const current = storeRef.current;
    if (!current.hasMore || !current.nextCursor || isFetchingOlder) return false;
    setIsFetchingOlder(true);
    try {
      const page = await listGeneralChatMessages({
        cursor: current.nextCursor,
        limit: HISTORY_PAGE,
      });
      dispatch({ type: "prependOlder", page });
      storeRef.current = {
        ...storeRef.current,
        hasMore: page.hasMore,
        nextCursor: page.nextCursor,
      };
      return page.items.length > 0;
    } catch {
      return false;
    } finally {
      setIsFetchingOlder(false);
    }
  }, [isFetchingOlder]);

  /** Tap on a quote → ensure the parent is loaded (pages older, bounded). */
  const ensureLoaded = useCallback(async (messageId: string): Promise<string | null> => {
    for (let page = 0; page <= MAX_JUMP_PAGES; page += 1) {
      const entry = findEntryById(storeRef.current, messageId);
      if (entry) return entry.key;
      const { hasMore, nextCursor } = storeRef.current;
      if (!hasMore || !nextCursor) return null;
      try {
        const response = await listGeneralChatMessages({ cursor: nextCursor, limit: 100 });
        dispatch({ type: "prependOlder", page: response });
        storeRef.current = chatReducer(storeRef.current, { type: "prependOlder", page: response });
      } catch {
        return null;
      }
    }
    return null;
  }, []);

  // ---------- Send / retry ----------
  const runSend = useCallback(
    async (localMessage: GeneralChatMessageDto): Promise<void> => {
      const clientMessageId = localMessage.clientMessageId ?? "";
      const key = renderKeyFor(localMessage);
      if (inFlight.current.has(clientMessageId)) return;
      inFlight.current.add(clientMessageId);
      dispatch({ type: "localStatus", key, status: "sending" });
      try {
        for (let attempt = 0; ; attempt += 1) {
          try {
            const confirmed = await createGeneralChatMessage({
              content: localMessage.content,
              clientMessageId,
              replyToId: localMessage.replyTo?.id,
              maxLength,
            });
            dispatch({ type: "upsert", message: confirmed, live: true });
            return;
          } catch (cause) {
            const error = asApiError(cause);
            const transient = error.kind === "network" || error.kind === "server";
            if (transient && attempt === 0) {
              // Same clientMessageId → the API deduplicates (200 replay) if the first one landed.
              await new Promise((resolve) => window.setTimeout(resolve, NETWORK_RETRY_MS));
              continue;
            }
            if (error.kind === "rate_limited") {
              setRateLimitedUntil(Date.now() + (error.retryAfterSeconds ?? 5) * 1_000);
            }
            dispatch({
              type: "localStatus",
              key,
              status: "failed",
              errorText: sendErrorText(error),
            });
            return;
          }
        }
      } finally {
        inFlight.current.delete(clientMessageId);
      }
    },
    [maxLength],
  );

  const send = useCallback(
    (content: string, replyTo: GeneralChatMessageDto | null) => {
      const text = content.trim();
      if (!text || !me) return false;
      if (rateLimitedUntil !== null && rateLimitedUntil > Date.now()) return false;
      setNotice(null);
      socket.stopTyping();
      const clientMessageId = newClientMessageId();
      const now = new Date().toISOString();
      const localMessage: GeneralChatMessageDto = {
        id: `local:${clientMessageId}`,
        seq: LOCAL_SEQ,
        version: 1,
        content: text.slice(0, maxLength),
        clientMessageId,
        createdAt: now,
        updatedAt: now,
        editedAt: null,
        deletedAt: null,
        author: me,
        replyTo: replyTo
          ? {
              id: replyTo.id,
              seq: replyTo.seq,
              author: replyTo.author,
              excerpt: replyTo.content.slice(0, 120),
              deleted: false,
            }
          : null,
        reactions: [],
      };
      dispatch({ type: "localAdd", message: localMessage });
      void runSend(localMessage);
      return true;
    },
    [maxLength, me, rateLimitedUntil, runSend, socket],
  );

  const retry = useCallback(
    (entry: ChatEntry) => {
      if (!entry.local) return;
      void runSend(entry.message);
    },
    [runSend],
  );

  const discard = useCallback((entry: ChatEntry) => {
    dispatch({ type: "localRemove", key: entry.key });
  }, []);

  // ---------- Edit / delete ----------
  const editWindowMs = (limits?.editWindowSeconds ?? 172_800) * 1_000;

  const canEdit = useCallback(
    (entry: ChatEntry) => {
      if (entry.local || entry.message.author.id !== meId) return false;
      if (editWindowMs === 0) return true;
      return Date.now() - Date.parse(entry.message.createdAt) < editWindowMs;
    },
    [editWindowMs, meId],
  );

  const canDelete = useCallback(
    (entry: ChatEntry) => !entry.local && (entry.message.author.id === meId || canModerate),
    [canModerate, meId],
  );

  const edit = useCallback(
    async (messageId: string, content: string) => {
      try {
        const message = await editGeneralChatMessage(messageId, content, maxLength);
        dispatch({ type: "upsert", message, live: true });
        setNotice(null);
        return true;
      } catch (cause) {
        const error = asApiError(cause);
        if (error.kind === "rate_limited") {
          setRateLimitedUntil(Date.now() + (error.retryAfterSeconds ?? 5) * 1_000);
        }
        setNotice({
          tone: "error",
          text:
            error.code === ChatGeneralErrorCode.EDIT_WINDOW_EXPIRED
              ? "Ya no se puede editar este mensaje."
              : error.code === ChatGeneralErrorCode.MESSAGE_NOT_FOUND
                ? "Ese mensaje ya no existe."
                : "No se pudo guardar la edición. Inténtalo de nuevo.",
        });
        return false;
      }
    },
    [maxLength],
  );

  const remove = useCallback(
    async (entry: ChatEntry) => {
      try {
        await deleteGeneralChatMessage(entry.message.id);
        dispatch({
          type: "deleted",
          payload: { id: entry.message.id, version: entry.message.version + 1 },
        });
        announce("Mensaje eliminado");
        return true;
      } catch (cause) {
        const error = asApiError(cause);
        if (error.code === ChatGeneralErrorCode.MESSAGE_NOT_FOUND) {
          dispatch({
            type: "deleted",
            payload: { id: entry.message.id, version: entry.message.version + 1 },
          });
          return true;
        }
        setNotice({ tone: "error", text: "No se pudo eliminar el mensaje. Inténtalo de nuevo." });
        return false;
      }
    },
    [announce],
  );

  // ---------- Reactions ----------
  const react = useCallback(
    async (entry: ChatEntry, emoji: ChatGeneralReaction) => {
      if (entry.local) return;
      const previous = myReactionFor(entry, meId);
      const next = previous === emoji ? null : emoji;
      dispatch({ type: "optimisticReaction", messageId: entry.message.id, meId, emoji: next });
      try {
        const message = next
          ? await setGeneralChatReaction(entry.message.id, next)
          : await removeGeneralChatReaction(entry.message.id);
        dispatch({ type: "upsert", message, live: true });
      } catch {
        dispatch({
          type: "optimisticReaction",
          messageId: entry.message.id,
          meId,
          emoji: previous,
        });
        setNotice({ tone: "error", text: "No se pudo guardar la reacción." });
      }
    },
    [meId],
  );

  // ---------- Read pointer ----------
  const markReadUpToLatest = useCallback(() => {
    if (readTimer.current !== null) window.clearTimeout(readTimer.current);
    readTimer.current = window.setTimeout(() => {
      readTimer.current = null;
      if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
      const latest = selectLatestSeq(storeRef.current);
      if (latest <= storeRef.current.myLastReadSeq) return;
      void markGeneralChatRead(latest)
        .then((response) => dispatch({ type: "myRead", lastReadSeq: response.lastReadSeq }))
        .catch(() => undefined);
    }, READ_DEBOUNCE_MS);
  }, []);

  // ---------- Avatar ----------
  const completeAvatar = useCallback(
    (next: Parameters<typeof replaceUser>[0]) => {
      const wasBlocked = avatarRequired || phase === "avatar-required";
      replaceUser(next);
      // Changing an existing avatar needs no reload: the socket emits `usuario-actualizado`.
      if (!wasBlocked) return;
      setLoadError(null);
      setPhase("loading");
      setReloadToken((token) => token + 1);
    },
    [avatarRequired, phase, replaceUser],
  );

  const ordered = useMemo(() => selectOrderedEntries(store), [store]);

  return {
    phase: avatarRequired ? ("avatar-required" as const) : phase,
    loadError,
    me,
    meId,
    canModerate,
    entries: ordered,
    store,
    limits: { maxLength, typingTtlMs, editWindowMs },
    reactions,
    hasMore: store.hasMore,
    isFetchingOlder,
    /** Epoch ms until which writes are rate limited (`Retry-After`); the view ticks it down. */
    rateLimitedUntil,
    clearRateLimit: () => setRateLimitedUntil(null),
    notice,
    dismissNotice: () => setNotice(null),
    announcement,
    socket,
    reload: () => {
      setPhase("loading");
      setReloadToken((token) => token + 1);
    },
    loadOlder,
    ensureLoaded,
    send,
    retry,
    discard,
    canEdit,
    canDelete,
    edit,
    remove,
    react,
    markReadUpToLatest,
    completeAvatar,
  };
}

export type GeneralChatController = ReturnType<typeof useGeneralChat>;

import {
  CHAT_GENERAL_REPLY_EXCERPT_MAX,
  type ChatGeneralMensajeEliminadoPayload,
  type ChatGeneralReaccionesActualizadasPayload,
  type ChatGeneralReaction,
  type GeneralChatHistoryResponse,
  type GeneralChatMessageDto,
  type GeneralChatReactionSummary,
  type GeneralChatStateResponse,
  type PresenceUser,
} from "@quantia/contracts";

/**
 * Chat General store (contracts 0.8.0, guía de integración §9):
 * - order by server `seq` (never by client clocks);
 * - merge by `version` (an event with a lower/equal version is ignored → idempotent);
 * - the optimistic bubble keeps its render key when the server confirms the same
 *   `clientMessageId`, so React does not remount the node (no jump, smooth swap).
 */

export type LocalDelivery = "sending" | "failed";

export type ChatEntry = {
  /** Stable React key: `c:<authorId>:<clientMessageId>` or `id:<id>`. */
  key: string;
  message: GeneralChatMessageDto;
  /** Present only while the message is not yet persisted. */
  local?: { status: LocalDelivery; errorText?: string };
  /** Arrived after hydration (socket / own send) → entry animation. History never animates. */
  live: boolean;
};

export type ReactionPop = { messageId: string; emoji: ChatGeneralReaction; token: number };

export type ChatStoreState = {
  entries: Record<string, ChatEntry>;
  keyById: Record<string, string>;
  hydrated: boolean;
  hasMore: boolean;
  nextCursor: string | null;
  /** userId → lastReadSeq ("visto por"). */
  readStates: Record<string, number>;
  myLastReadSeq: number;
  /** Seq before which the «Mensajes nuevos» divider is drawn (frozen at hydration). */
  unreadDividerSeq: number | null;
  lastPop: ReactionPop | null;
};

export const initialChatState: ChatStoreState = {
  entries: {},
  keyById: {},
  hydrated: false,
  hasMore: false,
  nextCursor: null,
  readStates: {},
  myLastReadSeq: 0,
  unreadDividerSeq: null,
  lastPop: null,
};

/** Optimistic bubbles sort after every persisted message. */
export const LOCAL_SEQ = Number.MAX_SAFE_INTEGER;

export function renderKeyFor(
  message: Pick<GeneralChatMessageDto, "id" | "clientMessageId" | "author">,
) {
  return message.clientMessageId
    ? `c:${message.author.id}:${message.clientMessageId}`
    : `id:${message.id}`;
}

export type ChatAction =
  | {
      type: "hydrate";
      page: GeneralChatHistoryResponse;
      state: GeneralChatStateResponse;
      meId: string;
    }
  | { type: "prependOlder"; page: GeneralChatHistoryResponse }
  | { type: "upsert"; message: GeneralChatMessageDto; live: boolean }
  | { type: "upsertMany"; messages: readonly GeneralChatMessageDto[] }
  | { type: "deleted"; payload: Pick<ChatGeneralMensajeEliminadoPayload, "id" | "version"> }
  | { type: "reactions"; payload: ChatGeneralReaccionesActualizadasPayload }
  | {
      type: "optimisticReaction";
      messageId: string;
      meId: string;
      emoji: ChatGeneralReaction | null;
    }
  | { type: "localAdd"; message: GeneralChatMessageDto }
  | { type: "localStatus"; key: string; status: LocalDelivery; errorText?: string }
  | { type: "localRemove"; key: string }
  | { type: "read"; userId: string; lastReadSeq: number }
  | { type: "myRead"; lastReadSeq: number }
  | { type: "userUpdated"; user: PresenceUser };

function excerptOf(content: string) {
  return content.slice(0, CHAT_GENERAL_REPLY_EXCERPT_MAX);
}

function mapEntries(
  entries: Record<string, ChatEntry>,
  fn: (entry: ChatEntry) => ChatEntry,
): Record<string, ChatEntry> {
  let changed = false;
  const next: Record<string, ChatEntry> = {};
  for (const [key, entry] of Object.entries(entries)) {
    const mapped = fn(entry);
    if (mapped !== entry) changed = true;
    next[key] = mapped;
  }
  return changed ? next : entries;
}

function markRepliesDeleted(entries: Record<string, ChatEntry>, parentId: string) {
  return mapEntries(entries, (entry) => {
    const reply = entry.message.replyTo;
    if (!reply || reply.id !== parentId || reply.deleted) return entry;
    return {
      ...entry,
      message: { ...entry.message, replyTo: { ...reply, deleted: true, excerpt: null } },
    };
  });
}

function refreshReplyExcerpts(entries: Record<string, ChatEntry>, parent: GeneralChatMessageDto) {
  const excerpt = excerptOf(parent.content);
  return mapEntries(entries, (entry) => {
    const reply = entry.message.replyTo;
    if (!reply || reply.id !== parent.id || reply.excerpt === excerpt) return entry;
    return { ...entry, message: { ...entry.message, replyTo: { ...reply, excerpt } } };
  });
}

function removeById(state: ChatStoreState, id: string): ChatStoreState {
  const key = state.keyById[id];
  if (!key) return { ...state, entries: markRepliesDeleted(state.entries, id) };
  const entries = { ...state.entries };
  delete entries[key];
  const keyById = { ...state.keyById };
  delete keyById[id];
  return { ...state, entries: markRepliesDeleted(entries, id), keyById };
}

export function applyMessage(
  state: ChatStoreState,
  incoming: GeneralChatMessageDto,
  live: boolean,
): ChatStoreState {
  const key = state.keyById[incoming.id] ?? renderKeyFor(incoming);
  const existing = state.entries[key];

  if (existing && !existing.local && existing.message.version >= incoming.version) {
    return state;
  }

  if (incoming.deletedAt) {
    // Tombstone (change feed): drop the bubble — also an optimistic one with the same key.
    const entries = { ...state.entries };
    delete entries[key];
    const keyById = { ...state.keyById };
    delete keyById[incoming.id];
    return { ...state, entries: markRepliesDeleted(entries, incoming.id), keyById };
  }

  let entries: Record<string, ChatEntry> = {
    ...state.entries,
    [key]: { key, message: incoming, live: existing ? existing.live : live },
  };

  if (existing && !existing.local && existing.message.content !== incoming.content) {
    entries = refreshReplyExcerpts(entries, incoming);
  }

  return { ...state, entries, keyById: { ...state.keyById, [incoming.id]: key } };
}

function applyPage(state: ChatStoreState, items: readonly GeneralChatMessageDto[]) {
  return items.reduce((acc, message) => applyMessage(acc, message, false), state);
}

function myReactionOf(reactions: readonly GeneralChatReactionSummary[], meId: string) {
  return reactions.find((reaction) => reaction.userIds.includes(meId))?.emoji ?? null;
}

/** Instant local toggle; the server response (higher `version`) replaces it. */
function toggleReactionLocally(
  reactions: readonly GeneralChatReactionSummary[],
  allowlistOrder: readonly string[],
  meId: string,
  emoji: ChatGeneralReaction | null,
): GeneralChatReactionSummary[] {
  const without = reactions
    .map((reaction) => {
      if (!reaction.userIds.includes(meId)) return reaction;
      const userIds = reaction.userIds.filter((id) => id !== meId);
      return { ...reaction, userIds, count: userIds.length };
    })
    .filter((reaction) => reaction.count > 0);

  if (!emoji) return without;

  const target = without.find((reaction) => reaction.emoji === emoji);
  const next = target
    ? without.map((reaction) =>
        reaction.emoji === emoji
          ? { ...reaction, userIds: [...reaction.userIds, meId], count: reaction.count + 1 }
          : reaction,
      )
    : [...without, { emoji, count: 1, userIds: [meId] }];

  // Server keeps the allowlist order so chips do not jump.
  return next.sort((a, b) => allowlistOrder.indexOf(a.emoji) - allowlistOrder.indexOf(b.emoji));
}

function nextPopToken(state: ChatStoreState) {
  return (state.lastPop?.token ?? 0) + 1;
}

export function createChatReducer(allowlistOrder: readonly string[]) {
  return function chatReducer(state: ChatStoreState, action: ChatAction): ChatStoreState {
    switch (action.type) {
      case "hydrate": {
        const locals = Object.values(state.entries).filter((entry) => entry.local);
        const base: ChatStoreState = {
          ...initialChatState,
          entries: Object.fromEntries(locals.map((entry) => [entry.key, entry])),
          hydrated: true,
          hasMore: action.page.hasMore,
          nextCursor: action.page.nextCursor,
          readStates: Object.fromEntries(
            action.state.readStates.map((read) => [read.userId, read.lastReadSeq]),
          ),
          myLastReadSeq: action.state.lastReadSeq,
        };
        const hydrated = applyPage(base, action.page.items);
        const firstUnread = action.page.items
          .filter(
            (message) =>
              message.seq > action.state.lastReadSeq && message.author.id !== action.meId,
          )
          .reduce<number | null>(
            (min, message) => (min === null || message.seq < min ? message.seq : min),
            null,
          );
        return { ...hydrated, unreadDividerSeq: firstUnread };
      }
      case "prependOlder": {
        const next = applyPage(state, action.page.items);
        return { ...next, hasMore: action.page.hasMore, nextCursor: action.page.nextCursor };
      }
      case "upsert":
        return applyMessage(state, action.message, action.live);
      case "upsertMany":
        return action.messages.reduce((acc, message) => applyMessage(acc, message, true), state);
      case "deleted": {
        const key = state.keyById[action.payload.id];
        const current = key ? state.entries[key] : undefined;
        if (current && current.message.version >= action.payload.version) return state;
        return removeById(state, action.payload.id);
      }
      case "reactions": {
        const { payload } = action;
        const key = state.keyById[payload.messageId];
        const current = key ? state.entries[key] : undefined;
        if (!key || !current || current.message.version >= payload.version) return state;
        return {
          ...state,
          entries: {
            ...state.entries,
            [key]: {
              ...current,
              message: {
                ...current.message,
                reactions: payload.reactions,
                version: payload.version,
              },
            },
          },
          lastPop: payload.emoji
            ? { messageId: payload.messageId, emoji: payload.emoji, token: nextPopToken(state) }
            : state.lastPop,
        };
      }
      case "optimisticReaction": {
        const key = state.keyById[action.messageId];
        const current = key ? state.entries[key] : undefined;
        if (!key || !current) return state;
        const reactions = toggleReactionLocally(
          current.message.reactions,
          allowlistOrder,
          action.meId,
          action.emoji,
        );
        return {
          ...state,
          entries: {
            ...state.entries,
            [key]: { ...current, message: { ...current.message, reactions } },
          },
          lastPop: action.emoji
            ? { messageId: action.messageId, emoji: action.emoji, token: nextPopToken(state) }
            : state.lastPop,
        };
      }
      case "localAdd": {
        const key = renderKeyFor(action.message);
        if (state.entries[key] && !state.entries[key]?.local) return state;
        return {
          ...state,
          entries: {
            ...state.entries,
            [key]: { key, message: action.message, local: { status: "sending" }, live: true },
          },
        };
      }
      case "localStatus": {
        const current = state.entries[action.key];
        if (!current?.local) return state;
        return {
          ...state,
          entries: {
            ...state.entries,
            [action.key]: {
              ...current,
              local: { status: action.status, errorText: action.errorText },
            },
          },
        };
      }
      case "localRemove": {
        if (!state.entries[action.key]?.local) return state;
        const entries = { ...state.entries };
        delete entries[action.key];
        return { ...state, entries };
      }
      case "read": {
        const previous = state.readStates[action.userId] ?? 0;
        if (action.lastReadSeq <= previous) return state;
        return {
          ...state,
          readStates: { ...state.readStates, [action.userId]: action.lastReadSeq },
        };
      }
      case "myRead":
        return action.lastReadSeq > state.myLastReadSeq
          ? { ...state, myLastReadSeq: action.lastReadSeq }
          : state;
      case "userUpdated": {
        const { user } = action;
        const entries = mapEntries(state.entries, (entry) => {
          const authorChanged = entry.message.author.id === user.id;
          const replyChanged = entry.message.replyTo?.author.id === user.id;
          if (!authorChanged && !replyChanged) return entry;
          return {
            ...entry,
            message: {
              ...entry.message,
              author: authorChanged ? user : entry.message.author,
              replyTo:
                replyChanged && entry.message.replyTo
                  ? { ...entry.message.replyTo, author: user }
                  : entry.message.replyTo,
            },
          };
        });
        return entries === state.entries ? state : { ...state, entries };
      }
      default:
        return state;
    }
  };
}

/** Chronological order: server `seq`, optimistic bubbles last (by creation time). */
export function selectOrderedEntries(state: ChatStoreState): ChatEntry[] {
  return Object.values(state.entries).sort((a, b) => {
    const seqA = a.local ? LOCAL_SEQ : a.message.seq;
    const seqB = b.local ? LOCAL_SEQ : b.message.seq;
    if (seqA !== seqB) return seqA - seqB;
    return a.message.createdAt.localeCompare(b.message.createdAt);
  });
}

/** Highest persisted seq loaded (for `PUT /read`). */
export function selectLatestSeq(state: ChatStoreState): number {
  let max = 0;
  for (const entry of Object.values(state.entries)) {
    if (!entry.local && entry.message.seq > max) max = entry.message.seq;
  }
  return max;
}

/** How many *other* users have read up to `seq` (✓✓ / «Visto por N»). */
export function seenByCount(state: ChatStoreState, seq: number, authorId: string): number {
  let count = 0;
  for (const [userId, lastReadSeq] of Object.entries(state.readStates)) {
    if (userId !== authorId && lastReadSeq >= seq) count += 1;
  }
  return count;
}

export function myReactionFor(entry: ChatEntry, meId: string): ChatGeneralReaction | null {
  return myReactionOf(entry.message.reactions, meId);
}

export function findEntryById(state: ChatStoreState, id: string): ChatEntry | undefined {
  const key = state.keyById[id];
  return key ? state.entries[key] : undefined;
}

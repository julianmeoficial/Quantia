import { CHAT_GENERAL_REACTIONS, type GeneralChatStateResponse } from "@quantia/contracts";
import { describe, expect, it } from "vitest";

import { ANA_ID, LUIS_ID, chatMessage, presenceUser } from "@/test/chatFixtures";

import {
  createChatReducer,
  initialChatState,
  LOCAL_SEQ,
  renderKeyFor,
  seenByCount,
  selectLatestSeq,
  selectOrderedEntries,
  type ChatStoreState,
} from "./chatReducer";

const reducer = createChatReducer(CHAT_GENERAL_REACTIONS);
const luis = presenceUser({ id: LUIS_ID, name: "Luis", avatar: "AVATAR_02" });

function state(partial: Partial<GeneralChatStateResponse> = {}): GeneralChatStateResponse {
  return {
    serverTime: "2026-11-05T12:00:00.000Z",
    latestSeq: 3,
    lastReadSeq: 1,
    unreadCount: 2,
    readStates: [{ userId: LUIS_ID, lastReadSeq: 2 }],
    limits: {
      messageMaxLength: 2000,
      editWindowSeconds: 172800,
      typingTtlMs: 6000,
      historyMaxLimit: 100,
    },
    reactions: [...CHAT_GENERAL_REACTIONS],
    ...partial,
  };
}

function hydrated(): ChatStoreState {
  return reducer(initialChatState, {
    type: "hydrate",
    meId: ANA_ID,
    state: state(),
    // API returns newest first.
    page: {
      items: [
        chatMessage({ seq: 3, author: luis, content: "tres" }),
        chatMessage({ seq: 2, author: luis, content: "dos" }),
        chatMessage({ seq: 1, content: "uno" }),
      ],
      nextCursor: "c1",
      hasMore: true,
    },
  });
}

describe("chatReducer", () => {
  it("hydrates in seq order and freezes the unread divider on the first foreign unread", () => {
    const next = hydrated();
    expect(selectOrderedEntries(next).map((entry) => entry.message.seq)).toEqual([1, 2, 3]);
    expect(next.unreadDividerSeq).toBe(2);
    expect(next.hasMore).toBe(true);
    expect(selectLatestSeq(next)).toBe(3);
    expect(Object.values(next.entries).every((entry) => !entry.live)).toBe(true);
  });

  it("ignores events whose version is not newer (idempotent merge)", () => {
    const base = hydrated();
    const target = selectOrderedEntries(base)[1]!.message;
    const edited = reducer(base, {
      type: "upsert",
      live: true,
      message: { ...target, version: 2, content: "dos (editado)", editedAt: target.createdAt },
    });
    const stale = reducer(edited, {
      type: "upsert",
      live: true,
      message: { ...target, version: 1, content: "viejo" },
    });
    expect(stale).toBe(edited);
    expect(selectOrderedEntries(stale)[1]!.message.content).toBe("dos (editado)");
  });

  it("swaps the optimistic bubble in place when the server confirms the clientMessageId", () => {
    const base = hydrated();
    const local = chatMessage({
      id: "local:c-9",
      seq: LOCAL_SEQ,
      clientMessageId: "c-9",
      content: "nuevo",
    });
    const withLocal = reducer(base, { type: "localAdd", message: local });
    const key = renderKeyFor(local);
    expect(withLocal.entries[key]?.local?.status).toBe("sending");

    const confirmed = chatMessage({ seq: 4, clientMessageId: "c-9", content: "nuevo" });
    const next = reducer(withLocal, { type: "upsert", message: confirmed, live: true });
    expect(next.entries[key]?.local).toBeUndefined();
    expect(next.entries[key]?.message.id).toBe(confirmed.id);
    expect(Object.keys(next.entries)).toHaveLength(4);

    // The socket echo of the same message is a no-op.
    expect(reducer(next, { type: "upsert", message: confirmed, live: true })).toBe(next);
  });

  it("removes deleted messages and marks quotes as deleted", () => {
    const base = hydrated();
    const parent = selectOrderedEntries(base)[0]!.message;
    const reply = chatMessage({
      seq: 4,
      author: luis,
      replyTo: {
        id: parent.id,
        seq: parent.seq,
        author: parent.author,
        excerpt: "uno",
        deleted: false,
      },
    });
    const withReply = reducer(base, { type: "upsert", message: reply, live: true });
    const next = reducer(withReply, { type: "deleted", payload: { id: parent.id, version: 2 } });
    const ordered = selectOrderedEntries(next);
    expect(ordered.find((entry) => entry.message.id === parent.id)).toBeUndefined();
    expect(ordered.at(-1)?.message.replyTo).toMatchObject({ deleted: true, excerpt: null });
  });

  it("applies reactions with a version bump and records the pop", () => {
    const base = hydrated();
    const target = selectOrderedEntries(base)[2]!.message;
    const next = reducer(base, {
      type: "reactions",
      payload: {
        messageId: target.id,
        seq: target.seq,
        version: 2,
        reactions: [{ emoji: "🔥", count: 1, userIds: [ANA_ID] }],
        actorId: ANA_ID,
        emoji: "🔥",
      },
    });
    expect(selectOrderedEntries(next)[2]!.message.reactions[0]?.emoji).toBe("🔥");
    expect(next.lastPop).toMatchObject({ messageId: target.id, emoji: "🔥" });
  });

  it("toggles my reaction optimistically, keeping one reaction per user in allowlist order", () => {
    const base = hydrated();
    const target = selectOrderedEntries(base)[2]!.message;
    const fire = reducer(base, {
      type: "optimisticReaction",
      messageId: target.id,
      meId: ANA_ID,
      emoji: "🔥",
    });
    const thumbs = reducer(fire, {
      type: "optimisticReaction",
      messageId: target.id,
      meId: ANA_ID,
      emoji: "👍",
    });
    const reactions = selectOrderedEntries(thumbs)[2]!.message.reactions;
    expect(reactions).toEqual([{ emoji: "👍", count: 1, userIds: [ANA_ID] }]);
    const cleared = reducer(thumbs, {
      type: "optimisticReaction",
      messageId: target.id,
      meId: ANA_ID,
      emoji: null,
    });
    expect(selectOrderedEntries(cleared)[2]!.message.reactions).toEqual([]);
  });

  it("counts «visto por» from other users' monotonic read pointers", () => {
    const base = hydrated();
    expect(seenByCount(base, 2, ANA_ID)).toBe(1);
    expect(seenByCount(base, 3, ANA_ID)).toBe(0);
    const advanced = reducer(base, { type: "read", userId: LUIS_ID, lastReadSeq: 3 });
    expect(seenByCount(advanced, 3, ANA_ID)).toBe(1);
    expect(reducer(advanced, { type: "read", userId: LUIS_ID, lastReadSeq: 1 })).toBe(advanced);
  });

  it("refreshes author cards when a user changes avatar", () => {
    const base = hydrated();
    const next = reducer(base, { type: "userUpdated", user: { ...luis, avatar: "AVATAR_05" } });
    const avatars = selectOrderedEntries(next)
      .filter((entry) => entry.message.author.id === LUIS_ID)
      .map((entry) => entry.message.author.avatar);
    expect(avatars).toEqual(["AVATAR_05", "AVATAR_05"]);
  });
});

import { ChatGeneralEvent } from "@quantia/contracts";
import { describe, expect, it } from "vitest";

import { ANA_ID, chatMessage, presenceUser } from "@/test/chatFixtures";

import {
  CHAT_GENERAL_SERVER_EVENTS,
  parseChatGeneralAck,
  parseChatGeneralPayload,
  parseChatGeneralSocketError,
} from "./chatEvents";

const messageId = "22222222-2222-4222-8222-222222222222";
const NOW = "2026-11-04T20:00:00.000Z";

describe("parseChatGeneralPayload", () => {
  it("covers the ten server events of contracts 0.8.0", () => {
    expect(CHAT_GENERAL_SERVER_EVENTS).toHaveLength(10);
  });

  it("accepts a presencia snapshot with typing and token expiry", () => {
    const payload = parseChatGeneralPayload(ChatGeneralEvent.PRESENCIA, {
      users: [presenceUser()],
      typing: [],
      generatedAt: NOW,
      tokenExpiresAt: NOW,
    });
    expect(payload?.users).toHaveLength(1);
  });

  it("drops invalid mensaje-creado payloads", () => {
    expect(parseChatGeneralPayload(ChatGeneralEvent.MENSAJE_CREADO, { nope: true })).toBeNull();
  });

  it("parses mensaje-creado with seq/version", () => {
    const payload = parseChatGeneralPayload(ChatGeneralEvent.MENSAJE_CREADO, {
      message: chatMessage({ id: messageId, seq: 7, version: 1 }),
    });
    expect(payload?.message.id).toBe(messageId);
    expect(payload?.message.seq).toBe(7);
  });

  it("parses reactions, deletion, typing and read events", () => {
    expect(
      parseChatGeneralPayload(ChatGeneralEvent.REACCIONES_ACTUALIZADAS, {
        messageId,
        seq: 7,
        version: 2,
        reactions: [{ emoji: "🔥", count: 1, userIds: [ANA_ID] }],
        actorId: ANA_ID,
        emoji: "🔥",
      })?.reactions,
    ).toHaveLength(1);
    expect(
      parseChatGeneralPayload(ChatGeneralEvent.MENSAJE_ELIMINADO, {
        id: messageId,
        seq: 7,
        version: 3,
        deletedAt: NOW,
        byModerator: false,
      })?.version,
    ).toBe(3);
    expect(
      parseChatGeneralPayload(ChatGeneralEvent.ESCRIBIENDO, {
        user: presenceUser(),
        isTyping: true,
        expiresInMs: 6000,
      })?.isTyping,
    ).toBe(true);
    expect(
      parseChatGeneralPayload(ChatGeneralEvent.LECTURA, {
        userId: ANA_ID,
        lastReadSeq: 7,
        readAt: NOW,
      })?.lastReadSeq,
    ).toBe(7);
  });

  it("rejects reactions outside the allowlist", () => {
    expect(
      parseChatGeneralPayload(ChatGeneralEvent.REACCIONES_ACTUALIZADAS, {
        messageId,
        seq: 7,
        version: 2,
        reactions: [{ emoji: "💩", count: 1, userIds: [ANA_ID] }],
        actorId: ANA_ID,
        emoji: "💩",
      }),
    ).toBeNull();
  });
});

describe("socket errors and acks", () => {
  it("parses error codes and acks", () => {
    expect(
      parseChatGeneralSocketError({ code: "AVATAR_REQUIRED", message: "Choose an avatar" })?.code,
    ).toBe("AVATAR_REQUIRED");
    expect(parseChatGeneralAck({ ok: true, tokenExpiresAt: NOW })?.ok).toBe(true);
    expect(parseChatGeneralAck({ ok: false, code: "RATE_LIMITED", error: "slow" })?.ok).toBe(false);
    expect(parseChatGeneralAck("nope")).toBeNull();
  });
});

import { ChatGeneralEvent } from "@quantia/contracts";
import { describe, expect, it } from "vitest";

import { parseChatGeneralPayload } from "./chatEvents";

const userId = "11111111-1111-4111-8111-111111111111";
const messageId = "22222222-2222-4222-8222-222222222222";

describe("parseChatGeneralPayload", () => {
  it("accepts a presencia snapshot", () => {
    const payload = parseChatGeneralPayload(ChatGeneralEvent.PRESENCIA, {
      users: [{ id: userId, name: "Ana", avatarUrl: null }],
      generatedAt: "2026-11-04T20:00:00.000Z",
    });
    expect(payload?.users).toHaveLength(1);
  });

  it("drops invalid mensaje-creado payloads", () => {
    expect(parseChatGeneralPayload(ChatGeneralEvent.MENSAJE_CREADO, { nope: true })).toBeNull();
  });

  it("parses mensaje-creado", () => {
    const payload = parseChatGeneralPayload(ChatGeneralEvent.MENSAJE_CREADO, {
      message: {
        id: messageId,
        content: "Hola",
        clientMessageId: "c1",
        createdAt: "2026-11-04T20:00:00.000Z",
        author: { id: userId, name: "Ana", avatarUrl: null },
      },
    });
    expect(payload?.message.id).toBe(messageId);
  });
});

import { describe, expect, it } from "vitest";

import type { GeneralChatMessageDto } from "@quantia/contracts";

import { mergeChatMessages } from "./mergeChatMessages";

function msg(
  partial: Partial<GeneralChatMessageDto> & Pick<GeneralChatMessageDto, "id" | "content">,
): GeneralChatMessageDto {
  return {
    clientMessageId: null,
    createdAt: "2026-11-04T15:00:00.000Z",
    author: { id: "u1", name: "Ana", avatarUrl: null },
    ...partial,
  };
}

describe("mergeChatMessages", () => {
  it("dedupes optimistic entries once the server confirms the same clientMessageId", () => {
    const server = [
      msg({
        id: "srv-1",
        content: "Hola",
        clientMessageId: "c-1",
        createdAt: "2026-11-04T15:01:00.000Z",
      }),
    ];
    const optimistic = [
      {
        deliveryState: "sending" as const,
        message: msg({
          id: "optimistic:c-1",
          content: "Hola",
          clientMessageId: "c-1",
          createdAt: "2026-11-04T15:00:50.000Z",
        }),
      },
    ];

    const merged = mergeChatMessages(server, optimistic);
    expect(merged).toHaveLength(1);
    expect(merged[0]?.message.id).toBe("srv-1");
    expect(merged[0]?.deliveryState).toBe("sent");
  });

  it("keeps failed optimistic messages that the server does not know yet", () => {
    const merged = mergeChatMessages(
      [],
      [
        {
          deliveryState: "failed",
          message: msg({
            id: "optimistic:c-2",
            content: "Reintento",
            clientMessageId: "c-2",
          }),
        },
      ],
    );
    expect(merged).toHaveLength(1);
    expect(merged[0]?.deliveryState).toBe("failed");
  });
});

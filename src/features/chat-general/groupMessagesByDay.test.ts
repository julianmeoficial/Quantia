import { describe, expect, it } from "vitest";

import type { GeneralChatMessageDto } from "@quantia/contracts";

import { daySeparatorLabel, groupMessagesByDay, type ChatRowMessage } from "./groupMessagesByDay";

function row(iso: string, id: string): ChatRowMessage {
  const message: GeneralChatMessageDto = {
    id,
    content: "hola",
    clientMessageId: null,
    createdAt: iso,
    author: { id: "u1", name: "Ana", avatarUrl: null },
  };
  return {
    kind: "message",
    key: id,
    message,
    deliveryState: "sent",
    isOwn: false,
  };
}

describe("groupMessagesByDay", () => {
  it("labels today and yesterday in Bogotá", () => {
    const now = new Date("2026-11-04T20:00:00.000Z");
    expect(daySeparatorLabel("2026-11-04T18:00:00.000Z", now)).toBe("Hoy");
    expect(daySeparatorLabel("2026-11-03T18:00:00.000Z", now)).toBe("Ayer");
    expect(daySeparatorLabel("2026-10-15T18:00:00.000Z", now)).toBe("15/10/2026");
  });

  it("inserts one separator per calendar day", () => {
    const now = new Date("2026-11-04T20:00:00.000Z");
    const rows = groupMessagesByDay(
      [
        row("2026-11-03T18:00:00.000Z", "1"),
        row("2026-11-03T19:00:00.000Z", "2"),
        row("2026-11-04T15:00:00.000Z", "3"),
      ],
      now,
    );
    const separators = rows.filter((item) => item.kind === "separator");
    expect(separators.map((item) => item.label)).toEqual(["Ayer", "Hoy"]);
    expect(rows.filter((item) => item.kind === "message")).toHaveLength(3);
  });
});

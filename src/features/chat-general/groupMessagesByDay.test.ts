import { describe, expect, it } from "vitest";

import { ANA_ID, LUIS_ID, chatMessage, presenceUser } from "@/test/chatFixtures";

import { renderKeyFor, type ChatEntry } from "./chatReducer";
import { buildChatRows, daySeparatorLabel } from "./groupMessagesByDay";

const luis = presenceUser({ id: LUIS_ID, name: "Luis" });

function entry(iso: string, seq: number, author = presenceUser()): ChatEntry {
  const message = chatMessage({ seq, createdAt: iso, author });
  return { key: renderKeyFor(message), message, live: false };
}

describe("buildChatRows", () => {
  it("labels today and yesterday in Bogotá", () => {
    const now = new Date("2026-11-04T20:00:00.000Z");
    expect(daySeparatorLabel("2026-11-04T18:00:00.000Z", now)).toBe("Hoy");
    expect(daySeparatorLabel("2026-11-03T18:00:00.000Z", now)).toBe("Ayer");
    expect(daySeparatorLabel("2026-10-15T18:00:00.000Z", now)).toBe("15/10/2026");
  });

  it("inserts one separator per calendar day", () => {
    const now = new Date("2026-11-04T20:00:00.000Z");
    const rows = buildChatRows(
      [
        entry("2026-11-03T18:00:00.000Z", 1),
        entry("2026-11-03T19:00:00.000Z", 2),
        entry("2026-11-04T15:00:00.000Z", 3),
      ],
      { meId: ANA_ID, unreadDividerSeq: null, now },
    );
    const separators = rows.filter((row) => row.kind === "separator");
    expect(separators.map((row) => row.label)).toEqual(["Ayer", "Hoy"]);
    expect(rows.filter((row) => row.kind === "message")).toHaveLength(3);
  });

  it("groups same-author runs within five minutes and breaks at the unread divider", () => {
    const rows = buildChatRows(
      [
        entry("2026-11-04T15:00:00.000Z", 1, luis),
        entry("2026-11-04T15:01:00.000Z", 2, luis),
        entry("2026-11-04T15:02:00.000Z", 3, luis),
        entry("2026-11-04T15:03:00.000Z", 4, luis),
        entry("2026-11-04T15:30:00.000Z", 5, luis),
      ],
      { meId: ANA_ID, unreadDividerSeq: 4, now: new Date("2026-11-04T20:00:00.000Z") },
    );
    const kinds = rows.map((row) => (row.kind === "message" ? row.groupPosition : row.kind));
    expect(kinds).toEqual(["separator", "first", "middle", "last", "unread", "single", "single"]);
  });
});

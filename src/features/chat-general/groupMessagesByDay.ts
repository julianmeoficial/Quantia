import type { ChatGroupPosition } from "@/components/composite";
import { formatDate } from "@/lib/format";

import type { ChatEntry } from "./chatReducer";

export type ChatRowMessage = {
  kind: "message";
  key: string;
  entry: ChatEntry;
  isOwn: boolean;
  groupPosition: ChatGroupPosition;
};

export type ChatRowSeparator = { kind: "separator"; key: string; label: string };
export type ChatRowUnread = { kind: "unread"; key: string };

export type ChatListRow = ChatRowMessage | ChatRowSeparator | ChatRowUnread;

const ZONE = "America/Bogota";
/** Same author within this window → one visual group (avatar/name once). */
const GROUP_WINDOW_MS = 5 * 60 * 1_000;

const dayFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function bogotaDayKey(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "invalid";
  return dayFormatter.format(date);
}

export function daySeparatorLabel(iso: string, now = new Date()): string {
  const key = bogotaDayKey(iso);
  if (key === bogotaDayKey(now)) return "Hoy";
  if (key === bogotaDayKey(new Date(now.getTime() - 24 * 60 * 60 * 1_000))) return "Ayer";
  return formatDate(iso);
}

export type BuildChatRowsOptions = {
  meId: string;
  /** Draw «Mensajes nuevos» before this seq (frozen at hydration). */
  unreadDividerSeq: number | null;
  now?: Date;
};

/**
 * Chronological rows (oldest → newest): a day separator before the first message of each
 * Bogotá calendar day, the unread divider once, and Telegram-like author groups.
 */
export function buildChatRows(
  entries: readonly ChatEntry[],
  { meId, unreadDividerSeq, now = new Date() }: BuildChatRowsOptions,
): ChatListRow[] {
  const rows: ChatListRow[] = [];
  let lastDay: string | null = null;
  let unreadDrawn = false;

  const sameGroup = (a: ChatEntry | undefined, b: ChatEntry | undefined) => {
    if (!a || !b) return false;
    if (a.message.author.id !== b.message.author.id) return false;
    if (bogotaDayKey(a.message.createdAt) !== bogotaDayKey(b.message.createdAt)) return false;
    if (unreadDividerSeq !== null && !b.local && b.message.seq === unreadDividerSeq) return false;
    return Date.parse(b.message.createdAt) - Date.parse(a.message.createdAt) < GROUP_WINDOW_MS;
  };

  entries.forEach((entry, index) => {
    const day = bogotaDayKey(entry.message.createdAt);
    if (day !== lastDay) {
      rows.push({
        kind: "separator",
        key: `day-${day}`,
        label: daySeparatorLabel(entry.message.createdAt, now),
      });
      lastDay = day;
    }
    if (
      !unreadDrawn &&
      unreadDividerSeq !== null &&
      !entry.local &&
      entry.message.seq >= unreadDividerSeq
    ) {
      rows.push({ kind: "unread", key: "unread-divider" });
      unreadDrawn = true;
    }

    const withPrevious = sameGroup(entries[index - 1], entry);
    const withNext = sameGroup(entry, entries[index + 1]);
    const groupPosition: ChatGroupPosition =
      withPrevious && withNext ? "middle" : withPrevious ? "last" : withNext ? "first" : "single";

    rows.push({
      kind: "message",
      key: entry.key,
      entry,
      isOwn: entry.message.author.id === meId,
      groupPosition,
    });
  });

  return rows;
}

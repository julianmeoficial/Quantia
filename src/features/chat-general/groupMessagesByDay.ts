import type { GeneralChatMessageDto } from "@quantia/contracts";

import { formatDate } from "@/lib/format";

import type { ChatDeliveryState } from "@/components/composite";

export type ChatRowMessage = {
  kind: "message";
  key: string;
  message: GeneralChatMessageDto;
  deliveryState: ChatDeliveryState;
  isOwn: boolean;
};

export type ChatRowSeparator = {
  kind: "separator";
  key: string;
  label: string;
};

export type ChatListRow = ChatRowMessage | ChatRowSeparator;

const ZONE = "America/Bogota";

function bogotaDayKey(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "invalid";
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function bogotaTodayKey(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function bogotaYesterdayKey(now = new Date()): string {
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  return bogotaTodayKey(yesterday);
}

export function daySeparatorLabel(iso: string, now = new Date()): string {
  const key = bogotaDayKey(iso);
  if (key === bogotaTodayKey(now)) return "Hoy";
  if (key === bogotaYesterdayKey(now)) return "Ayer";
  return formatDate(iso);
}

/**
 * Builds chronological list rows (oldest → newest) with a day separator
 * before the first message of each Bogotá calendar day.
 */
export function groupMessagesByDay(
  messages: readonly ChatRowMessage[],
  now = new Date(),
): ChatListRow[] {
  const rows: ChatListRow[] = [];
  let lastDay: string | null = null;

  for (const item of messages) {
    const day = bogotaDayKey(item.message.createdAt);
    if (day !== lastDay) {
      rows.push({
        kind: "separator",
        key: `day-${day}`,
        label: daySeparatorLabel(item.message.createdAt, now),
      });
      lastDay = day;
    }
    rows.push(item);
  }

  return rows;
}

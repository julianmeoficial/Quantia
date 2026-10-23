import type { TaskResponse } from "@quantia/contracts";

import { calendarDaysBetween } from "@/lib/format";

export type UrgencyBucket = "overdue" | "thisWeek" | "upcoming";

export const URGENCY_ORDER: readonly UrgencyBucket[] = ["overdue", "thisWeek", "upcoming"] as const;

export const URGENCY_LABEL: Record<UrgencyBucket, string> = {
  overdue: "Vencidas",
  thisWeek: "Esta semana",
  upcoming: "Próximas",
};

const ZONE = "America/Bogota";

function bogotaParts(date: Date) {
  const map = new Map<string, string>();
  for (const part of new Intl.DateTimeFormat("en-US", {
    timeZone: ZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    weekday: "short",
  }).formatToParts(date)) {
    if (part.type !== "literal") map.set(part.type, part.value);
  }
  return map;
}

/** Monday-start week index for a Bogotá calendar day (0 = Monday … 6 = Sunday). */
function weekdayMondayIndex(date: Date): number {
  const weekday = bogotaParts(date).get("weekday");
  const map: Record<string, number> = {
    Mon: 0,
    Tue: 1,
    Wed: 2,
    Thu: 3,
    Fri: 4,
    Sat: 5,
    Sun: 6,
  };
  return weekday ? (map[weekday] ?? 0) : 0;
}

/** End of current calendar week (Sunday) relative to `now`, as day offset from today. */
export function daysUntilEndOfWeek(now: Date = new Date()): number {
  return 6 - weekdayMondayIndex(now);
}

export function urgencyBucket(
  dueDate: string | null | undefined,
  now: Date = new Date(),
): UrgencyBucket {
  if (!dueDate) return "upcoming";
  const due = new Date(dueDate);
  if (Number.isNaN(due.getTime())) return "upcoming";

  const days = calendarDaysBetween(now, due);
  if (days < 0) return "overdue";
  if (days <= daysUntilEndOfWeek(now)) return "thisWeek";
  return "upcoming";
}

export function compareByDueDate(a: TaskResponse, b: TaskResponse): number {
  if (!a.dueDate && !b.dueDate) return 0;
  if (!a.dueDate) return 1;
  if (!b.dueDate) return -1;
  return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
}

export function groupByUrgency<T extends { dueDate: string | null }>(
  items: T[],
  now: Date = new Date(),
): Record<UrgencyBucket, T[]> {
  const groups: Record<UrgencyBucket, T[]> = {
    overdue: [],
    thisWeek: [],
    upcoming: [],
  };
  for (const item of items) {
    groups[urgencyBucket(item.dueDate, now)].push(item);
  }
  return groups;
}

import { formatDate, toApiDate } from "@/lib/format";

export const WEEKDAYS = ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"] as const;

export type CalendarMonth = { year: number; month: number };

export type CalendarCell = { iso: string; day: number };

export function ymdKey(iso: string | null | undefined): string {
  if (!iso) return "";
  const shown = formatDate(iso);
  if (shown === "—") return "";
  const [day, month, year] = shown.split("/");
  return `${year}${month}${day}`;
}

export function monthParts(iso?: string | null): CalendarMonth {
  const shown = iso ? formatDate(iso) : formatDate(new Date());
  if (shown === "—") {
    const now = new Date();
    return { year: now.getUTCFullYear(), month: now.getUTCMonth() };
  }
  const [, month, year] = shown.split("/");
  return { year: Number(year), month: Number(month) - 1 };
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

export function mondayIndex(year: number, month: number): number {
  const sunday = new Date(Date.UTC(year, month, 1)).getUTCDay();
  return (sunday + 6) % 7;
}

export function buildMonthCells(cursor: CalendarMonth): Array<CalendarCell | null> {
  const count = daysInMonth(cursor.year, cursor.month);
  const lead = mondayIndex(cursor.year, cursor.month);
  const items: Array<CalendarCell | null> = Array.from({ length: lead }, () => null);
  for (let day = 1; day <= count; day += 1) {
    const dd = String(day).padStart(2, "0");
    const mm = String(cursor.month + 1).padStart(2, "0");
    items.push({ day, iso: toApiDate(`${dd}/${mm}/${cursor.year}`) ?? "" });
  }
  return items;
}

export function shiftMonth(cursor: CalendarMonth, delta: number): CalendarMonth {
  const index = cursor.year * 12 + cursor.month + delta;
  return { year: Math.floor(index / 12), month: ((index % 12) + 12) % 12 };
}

export function monthLabel(cursor: CalendarMonth): string {
  return new Intl.DateTimeFormat("es-CO", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(cursor.year, cursor.month, 1)));
}

export function isDateDisabled(
  iso: string,
  minDate?: string | null,
  maxDate?: string | null,
): boolean {
  const key = ymdKey(iso);
  const minKey = ymdKey(minDate);
  const maxKey = ymdKey(maxDate);
  if (minKey && key < minKey) return true;
  if (maxKey && key > maxKey) return true;
  return false;
}

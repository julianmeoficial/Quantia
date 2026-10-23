const EMPTY = "—";
const ZONE = "America/Bogota";

function calendarDayKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** Days from `from` to `to` in America/Bogota calendar dates (can be negative). */
export function calendarDaysBetween(from: Date, to: Date): number {
  const start = calendarDayKey(from);
  const end = calendarDayKey(to);
  const startUtc = Date.parse(`${start}T00:00:00.000Z`);
  const endUtc = Date.parse(`${end}T00:00:00.000Z`);
  return Math.round((endUtc - startUtc) / 86_400_000);
}

/**
 * Relative due label for Mis tareas: «Vencida», «Hoy», «1 día», «2 días».
 * Absolute DD/MM/AAAA belongs in a Tooltip via `formatDate`.
 */
export function formatRelativeDue(
  value: string | Date | null | undefined,
  now: Date = new Date(),
): string {
  if (value === null || value === undefined || value === "") return EMPTY;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return EMPTY;

  const days = calendarDaysBetween(now, date);
  if (days < 0) return "Vencida";
  if (days === 0) return "Hoy";
  if (days === 1) return "1 día";
  return `${days} días`;
}

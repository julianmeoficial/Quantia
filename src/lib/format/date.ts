const EMPTY = "—";
const ZONE = "America/Bogota";
const BOGOTA_OFFSET_HOURS = 5;

function partsInBogota(date: Date) {
  const map = new Map<string, string>();
  for (const part of new Intl.DateTimeFormat("es-CO", {
    timeZone: ZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date)) {
    if (part.type !== "literal") map.set(part.type, part.value);
  }
  return map;
}

export function formatDate(
  value: string | Date | null | undefined,
  options?: { withTime?: boolean },
): string {
  if (value === null || value === undefined || value === "") return EMPTY;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return EMPTY;
  const parts = partsInBogota(date);
  const day = parts.get("day");
  const month = parts.get("month");
  const year = parts.get("year");
  if (!day || !month || !year) return EMPTY;
  const dateText = `${day}/${month}/${year}`;
  if (!options?.withTime) return dateText;
  const hour = parts.get("hour");
  const minute = parts.get("minute");
  if (!hour || !minute) return dateText;
  return `${dateText} ${hour}:${minute}`;
}

/** Clock time only (`HH:mm`) in America/Bogota — used by ChatMessage. */
export function formatTime(value: string | Date | null | undefined): string {
  if (value === null || value === undefined || value === "") return EMPTY;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return EMPTY;
  const parts = partsInBogota(date);
  const hour = parts.get("hour");
  const minute = parts.get("minute");
  if (!hour || !minute) return EMPTY;
  return `${hour}:${minute}`;
}

function parseDisplayDate(value: string): { year: number; month: number; day: number } | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const probe = new Date(Date.UTC(year, month - 1, day));
  if (
    probe.getUTCFullYear() !== year ||
    probe.getUTCMonth() !== month - 1 ||
    probe.getUTCDate() !== day
  ) {
    return null;
  }
  return { year, month, day };
}

/** ISO UTC built from 00:00 America/Bogota for a date-only field. */
export function toApiDate(value: string | Date | null | undefined): string | null {
  if (value === null || value === undefined || value === "") return null;

  let year: number;
  let month: number;
  let day: number;

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    const parts = partsInBogota(value);
    year = Number(parts.get("year"));
    month = Number(parts.get("month"));
    day = Number(parts.get("day"));
    if (!year || !month || !day) return null;
  } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(value.trim())) {
    const parsed = parseDisplayDate(value);
    if (!parsed) return null;
    year = parsed.year;
    month = parsed.month;
    day = parsed.day;
  } else {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    const parts = partsInBogota(date);
    year = Number(parts.get("year"));
    month = Number(parts.get("month"));
    day = Number(parts.get("day"));
    if (!year || !month || !day) return null;
  }

  return new Date(Date.UTC(year, month - 1, day, BOGOTA_OFFSET_HOURS, 0, 0)).toISOString();
}

export function formatRange(from?: string | null, to?: string | null): string {
  const start = from ? formatDate(from) : "";
  const end = to ? formatDate(to) : "";
  if (!start && !end) return EMPTY;
  if (start && end) return `${start} – ${end}`;
  return start || end;
}

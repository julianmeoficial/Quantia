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

function bogotaYmd(value: string | Date): { year: number; month: number; day: number } | null {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    const parts = partsInBogota(value);
    const year = Number(parts.get("year"));
    const month = Number(parts.get("month"));
    const day = Number(parts.get("day"));
    if (!year || !month || !day) return null;
    return { year, month, day };
  }
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value.trim())) {
    return parseDisplayDate(value);
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const parts = partsInBogota(date);
  const year = Number(parts.get("year"));
  const month = Number(parts.get("month"));
  const day = Number(parts.get("day"));
  if (!year || !month || !day) return null;
  return { year, month, day };
}

/** ISO UTC built from 00:00 America/Bogota for a date-only field. */
export function toApiDate(value: string | Date | null | undefined): string | null {
  if (value === null || value === undefined || value === "") return null;
  const ymd = bogotaYmd(value);
  if (!ymd) return null;
  return new Date(
    Date.UTC(ymd.year, ymd.month - 1, ymd.day, BOGOTA_OFFSET_HOURS, 0, 0),
  ).toISOString();
}

/**
 * ISO UTC from a calendar day + clock time in America/Bogota.
 * `time` is `HH:mm` (24h). Defaults to 00:00 when omitted.
 */
export function toApiDateTime(
  datePart: string | Date | null | undefined,
  timePart: string | null | undefined = "00:00",
): string | null {
  if (datePart === null || datePart === undefined || datePart === "") return null;
  const ymd = bogotaYmd(datePart);
  if (!ymd) return null;
  const match = /^(\d{2}):(\d{2})$/.exec((timePart ?? "00:00").trim());
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  // Bogota is UTC-5 year-round: local = UTC + 5h.
  return new Date(
    Date.UTC(ymd.year, ymd.month - 1, ymd.day, hour + BOGOTA_OFFSET_HOURS, minute, 0),
  ).toISOString();
}

/** `HH:mm` in America/Bogota from an ISO instant (defaults to 00:00). */
export function bogotaTimeParts(value: string | Date | null | undefined): {
  hour: string;
  minute: string;
} {
  if (!value) return { hour: "00", minute: "00" };
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return { hour: "00", minute: "00" };
  const parts = partsInBogota(date);
  return {
    hour: parts.get("hour") ?? "00",
    minute: parts.get("minute") ?? "00",
  };
}

export function formatRange(from?: string | null, to?: string | null): string {
  const start = from ? formatDate(from) : "";
  const end = to ? formatDate(to) : "";
  if (!start && !end) return EMPTY;
  if (start && end) return `${start} – ${end}`;
  return start || end;
}

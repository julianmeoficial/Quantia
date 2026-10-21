const EMPTY = "—";

/** 0–100, at most one decimal, es-CO separator. Example: `45,6 %`. */
export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return EMPTY;
  const rounded = Math.round(value * 10) / 10;
  const text = new Intl.NumberFormat("es-CO", {
    maximumFractionDigits: 1,
    minimumFractionDigits: Number.isInteger(rounded) ? 0 : 1,
  }).format(rounded);
  return `${text} %`;
}

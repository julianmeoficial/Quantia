const EMPTY = "—";

/** Display-only. Accepts the API decimal string or a number; never use the result for arithmetic. */
export function formatCOP(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return EMPTY;
  const amount = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(amount)) return EMPTY;

  const formatted = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Math.round(amount));

  return formatted.replace(/\u00a0/g, " ");
}

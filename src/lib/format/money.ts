/**
 * Money helpers that stay on decimal strings via integer cents (BigInt).
 * Never use IEEE floats for budget arithmetic.
 */

const MONEY_PATTERN = /^\d+(\.\d{1,2})?$/;

function toCents(value: string): bigint | null {
  const trimmed = value.trim();
  if (!MONEY_PATTERN.test(trimmed)) return null;
  const [whole, fraction = ""] = trimmed.split(".");
  const cents = `${whole}${fraction.padEnd(2, "0")}`.replace(/^0+(?=\d)/, "") || "0";
  try {
    return BigInt(cents);
  } catch {
    return null;
  }
}

const ZERO = BigInt(0);

function fromCents(cents: bigint): string {
  const negative = cents < ZERO;
  const absolute = negative ? -cents : cents;
  const raw = absolute.toString().padStart(3, "0");
  const whole = raw.slice(0, -2);
  const fraction = raw.slice(-2);
  const formatted = `${whole}.${fraction}`;
  return negative ? `-${formatted}` : formatted;
}

/** Sum decimal money strings. Invalid entries are skipped; empty input → `"0.00"`. */
export function sumMoney(values: readonly (string | null | undefined)[]): string {
  let total = ZERO;
  for (const value of values) {
    if (value === null || value === undefined || value === "") continue;
    const cents = toCents(value);
    if (cents === null) continue;
    total += cents;
  }
  return fromCents(total);
}

/**
 * Compare two money strings.
 * Returns negative if a < b, 0 if equal, positive if a > b.
 * Invalid values compare as equal to zero for the invalid side.
 */
export function compareMoney(a: string, b: string): number {
  const left = toCents(a) ?? ZERO;
  const right = toCents(b) ?? ZERO;
  if (left === right) return 0;
  return left < right ? -1 : 1;
}

export type RubricExecutionStatus = "complete" | "missing";

/** Completa when executed ≥ planned; otherwise Faltante. */
export function rubricExecutionStatus(
  plannedAmount: string,
  executedAmount: string,
): RubricExecutionStatus {
  return compareMoney(executedAmount, plannedAmount) >= 0 ? "complete" : "missing";
}

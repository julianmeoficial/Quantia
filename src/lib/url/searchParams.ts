import type { z } from "zod";

type Primitive = string | number | boolean;

function isPrimitive(value: unknown): value is Primitive {
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean";
}

/**
 * Builds a URLSearchParams from filter values, omitting keys that match defaults
 * so shared links stay short and readable.
 */
export function toSearchParams<T extends Record<string, unknown>>(
  values: T,
  defaults: T,
): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    const fallback = defaults[key];
    if (value === fallback) continue;
    if (value === undefined || value === null) continue;
    if (typeof value === "string" && value.trim() === "" && fallback === "") continue;
    if (!isPrimitive(value)) continue;
    params.set(key, String(value));
  }
  return params;
}

function readRaw(
  params: URLSearchParams | { get: (name: string) => string | null },
  keys: string[],
): Record<string, string> {
  const raw: Record<string, string> = {};
  for (const key of keys) {
    const value = params.get(key);
    if (value !== null) raw[key] = value;
  }
  return raw;
}

/**
 * Parses search params with a Zod schema. Invalid fields fall back to defaults
 * without throwing (shareable/malformed URLs must not break the screen).
 */
export function fromSearchParams<S extends z.ZodType>(
  params: URLSearchParams | { get: (name: string) => string | null },
  schema: S,
  defaults: z.infer<S>,
): z.infer<S> {
  const keys = Object.keys(defaults as Record<string, unknown>);
  const raw = readRaw(params, keys);
  const candidate: Record<string, unknown> = { ...(defaults as Record<string, unknown>), ...raw };

  const parsed = schema.safeParse(candidate);
  if (parsed.success) {
    return parsed.data;
  }

  const base = defaults as Record<string, unknown>;
  const salvaged: Record<string, unknown> = { ...base };
  for (const key of keys) {
    if (!(key in raw)) continue;
    const attempt = schema.safeParse({ ...base, [key]: raw[key] });
    if (attempt.success) {
      const data = attempt.data as Record<string, unknown>;
      salvaged[key] = data[key];
    }
  }
  return salvaged as z.infer<S>;
}

export function isFilteredAgainstDefaults<T extends Record<string, unknown>>(
  values: T,
  defaults: T,
  ignoreKeys: readonly string[] = ["page"],
): boolean {
  return Object.keys(defaults).some((key) => {
    if (ignoreKeys.includes(key)) return false;
    return values[key] !== defaults[key];
  });
}

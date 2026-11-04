import type { AppRole } from "./navigation";
import { canAccess } from "./permissions";

const FROM_PARAM = "from";

/**
 * Relative in-app path only: starts with `/`, rejects protocol-relative and login itself.
 */
export function isSafeReturnCandidate(value: string): boolean {
  if (!value.startsWith("/") || value.startsWith("//")) return false;
  if (value === "/login" || value.startsWith("/login?") || value.startsWith("/login#")) {
    return false;
  }
  if (value.includes("://")) return false;
  return true;
}

/** Pathname only (no query) for canAccess checks. */
function pathnameOf(href: string): string {
  const q = href.indexOf("?");
  const h = href.indexOf("#");
  let end = href.length;
  if (q >= 0) end = Math.min(end, q);
  if (h >= 0) end = Math.min(end, h);
  return href.slice(0, end) || "/";
}

export function buildLoginHref(from: string): string {
  const trimmed = from.trim();
  if (!trimmed || !isSafeReturnCandidate(trimmed)) return "/login";
  const params = new URLSearchParams();
  params.set(FROM_PARAM, trimmed);
  return `/login?${params.toString()}`;
}

/**
 * Returns a safe in-app href the user may open after login, or null → use landing().
 */
export function readSafeReturnPath(
  from: string | null | undefined,
  roles: readonly AppRole[],
): string | null {
  if (!from) return null;
  let decoded = from;
  try {
    decoded = decodeURIComponent(from);
  } catch {
    return null;
  }
  if (!isSafeReturnCandidate(decoded)) return null;
  if (!canAccess(pathnameOf(decoded), roles)) return null;
  return decoded;
}

export function postLoginHref(
  from: string | null | undefined,
  roles: readonly AppRole[],
  fallbackLanding: string | null,
): string | null {
  return readSafeReturnPath(from, roles) ?? fallbackLanding;
}

export const REFRESH_COOKIE = "quantia_refresh";

/** Refresh de 7 días. El access token no se guarda aquí. */
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export function readCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const [rawKey, ...rest] = part.trim().split("=");
    if (rawKey !== name) continue;
    const value = rest.join("=");
    if (!value) return null;
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }
  return null;
}

export function serializeRefreshCookie(token: string | null): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  if (!token) {
    return `${REFRESH_COOKIE}=; HttpOnly; SameSite=Strict; Path=/api/session; Max-Age=0${secure}`;
  }
  const value = encodeURIComponent(token);
  return `${REFRESH_COOKIE}=${value}; HttpOnly; SameSite=Strict; Path=/api/session; Max-Age=${MAX_AGE_SECONDS}${secure}`;
}

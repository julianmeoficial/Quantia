type SessionExpiredListener = () => void;
type AccessTokenListener = (token: string) => void;
type RefreshHandler = () => Promise<string | null>;

let accessToken: string | null = null;
let refreshHandler: RefreshHandler | null = null;
let refreshInFlight: Promise<string | null> | null = null;
const sessionExpiredListeners = new Set<SessionExpiredListener>();
const accessTokenListeners = new Set<AccessTokenListener>();
const tokenChangeListeners = new Set<AccessTokenListener>();

/** El access token vive solo en memoria; nunca en localStorage/sessionStorage. */
export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(token: string | null) {
  const changed = token !== accessToken;
  accessToken = token;
  if (changed && token) tokenChangeListeners.forEach((listener) => listener(token));
}

/**
 * Fires whenever a *new* access token is stored — own refresh, login or a token received
 * from another tab via BroadcastChannel. Used to re-authenticate long-lived sockets in band.
 */
export function onAccessTokenChange(listener: AccessTokenListener) {
  tokenChangeListeners.add(listener);
  return () => {
    tokenChangeListeners.delete(listener);
  };
}

/**
 * Registra cómo renovar el access token (cookie httpOnly gestionada por la API).
 * La implementación debe usar el endpoint y el schema de `@quantia/contracts`.
 */
export function configureRefresh(handler: RefreshHandler | null) {
  refreshHandler = handler;
}

/** Deduplica refrescos concurrentes: varias peticiones con 401 comparten un solo refresh. */
export async function refreshAccessToken(): Promise<string | null> {
  if (!refreshHandler) return null;

  refreshInFlight ??= refreshHandler()
    .catch(() => null)
    .finally(() => {
      refreshInFlight = null;
    });

  const token = await refreshInFlight;
  setAccessToken(token);
  if (token) accessTokenListeners.forEach((listener) => listener(token));
  return token;
}

export function onAccessToken(listener: AccessTokenListener) {
  accessTokenListeners.add(listener);
  return () => {
    accessTokenListeners.delete(listener);
  };
}

export function onSessionExpired(listener: SessionExpiredListener) {
  sessionExpiredListeners.add(listener);
  return () => {
    sessionExpiredListeners.delete(listener);
  };
}

export function expireSession() {
  setAccessToken(null);
  sessionExpiredListeners.forEach((listener) => listener());
}

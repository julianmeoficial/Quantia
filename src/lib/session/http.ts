import { authTokensResponseSchema, HttpHeader, loginRequestSchema } from "@quantia/contracts";

import { env } from "@/config/env";

import { readCookie, REFRESH_COOKIE, serializeRefreshCookie } from "./cookie";

const NO_STORE = "no-store";

function apiAuthUrl(action: "login" | "refresh" | "logout") {
  const origin = env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
  return `${origin}/api/v1/auth/${action}`;
}

function rejectCrossOrigin(request: Request): Response | null {
  const origin = request.headers.get("origin");
  let expected = "";
  try {
    expected = new URL(request.url).origin;
  } catch {
    expected = "";
  }
  if (!origin || origin !== expected) {
    return json({ message: "Origen no permitido" }, 403);
  }
  return null;
}

function json(body: unknown, status: number, setCookie?: string, retryAfter?: string | null) {
  const headers = new Headers();
  headers.set("content-type", "application/json; charset=utf-8");
  headers.set("cache-control", NO_STORE);
  if (setCookie) headers.set("set-cookie", setCookie);
  if (retryAfter) headers.set(HttpHeader.RETRY_AFTER, retryAfter);
  return new Response(JSON.stringify(body), { status, headers });
}

function empty(status: number, setCookie?: string) {
  const headers = new Headers();
  headers.set("cache-control", NO_STORE);
  if (setCookie) headers.set("set-cookie", setCookie);
  return new Response(null, { status, headers });
}

async function forwardAuth(action: "login" | "refresh" | "logout", body: unknown) {
  return fetch(apiAuthUrl(action), {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
}

function retryAfterOf(response: Response) {
  return response.headers.get(HttpHeader.RETRY_AFTER);
}

async function readJson(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return undefined;
  return response.json().catch(() => undefined);
}

/** Proxy de login: la cookie httpOnly se queda en el servidor. */
export async function handleLogin(request: Request): Promise<Response> {
  const forbidden = rejectCrossOrigin(request);
  if (forbidden) return forbidden;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ message: "Revisa los datos enviados." }, 400);
  }

  const parsed = loginRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return json({ message: "Revisa los datos enviados." }, 400);
  }

  let upstream: Response;
  try {
    upstream = await forwardAuth("login", parsed.data);
  } catch {
    return json({ message: "No pudimos conectar con el servidor." }, 503);
  }

  const retryAfter = retryAfterOf(upstream);
  if (!upstream.ok) {
    const body = await readJson(upstream);
    return json(
      body ?? { message: "No pudimos iniciar sesión." },
      upstream.status,
      undefined,
      retryAfter,
    );
  }

  const tokens = authTokensResponseSchema.safeParse(await readJson(upstream));
  if (!tokens.success) {
    return json({ message: "Recibimos una respuesta inesperada del servidor." }, 502);
  }

  return json(
    { accessToken: tokens.data.accessToken, expiresIn: tokens.data.expiresIn },
    200,
    serializeRefreshCookie(tokens.data.refreshToken),
  );
}

/** Rota el refresh guardado en la cookie. El navegador no envía el token. */
export async function handleRefresh(request: Request): Promise<Response> {
  const forbidden = rejectCrossOrigin(request);
  if (forbidden) return forbidden;

  const refreshToken = readCookie(request.headers.get("cookie"), REFRESH_COOKIE);
  if (!refreshToken) {
    return json({ message: "Tu sesión expiró." }, 401, serializeRefreshCookie(null));
  }

  let upstream: Response;
  try {
    upstream = await forwardAuth("refresh", { refreshToken });
  } catch {
    return json({ message: "No pudimos conectar con el servidor." }, 503);
  }

  const retryAfter = retryAfterOf(upstream);
  if (!upstream.ok) {
    const body = await readJson(upstream);
    return json(
      body ?? { message: "Tu sesión expiró." },
      upstream.status,
      serializeRefreshCookie(null),
      retryAfter,
    );
  }

  const tokens = authTokensResponseSchema.safeParse(await readJson(upstream));
  if (!tokens.success) {
    return json(
      { message: "Recibimos una respuesta inesperada del servidor." },
      502,
      serializeRefreshCookie(null),
    );
  }

  return json(
    { accessToken: tokens.data.accessToken, expiresIn: tokens.data.expiresIn },
    200,
    serializeRefreshCookie(tokens.data.refreshToken),
  );
}

/** Idempotente: revoca el refresh si existe y siempre limpia la cookie. */
export async function handleLogout(request: Request): Promise<Response> {
  const forbidden = rejectCrossOrigin(request);
  if (forbidden) return forbidden;

  const refreshToken = readCookie(request.headers.get("cookie"), REFRESH_COOKIE);
  if (refreshToken) {
    try {
      await forwardAuth("logout", { refreshToken });
    } catch {
      // La limpieza local sigue siendo obligatoria.
    }
  }

  return empty(204, serializeRefreshCookie(null));
}

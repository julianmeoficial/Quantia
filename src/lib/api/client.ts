import { HttpHeader } from "@quantia/contracts";
import type { z } from "zod";

import { env } from "@/config/env";

import { ApiError, toApiError } from "./errors";
import { expireSession, getAccessToken, refreshAccessToken } from "./session";

const API_PREFIX = "/api/v1";
const MAX_RETRY_AFTER_MS = 10_000;
const DEFAULT_RETRY_AFTER_MS = 1_000;

type QueryValue = string | number | boolean | null | undefined;

export type RequestOptions<S extends z.ZodType> = Omit<RequestInit, "body" | "credentials"> & {
  /** Schema de `@quantia/contracts` con el que se valida la respuesta. */
  schema: S;
  body?: unknown;
  query?: Record<string, QueryValue>;
  /** `false` para endpoints públicos (no se adjunta el token ni se intenta refresh). */
  auth?: boolean;
  /**
   * `false` en login: el 429 debe llegar al formulario con `Retry-After`,
   * sin el reintento silencioso del cliente.
   */
  rateLimitRetry?: boolean;
  /** `false` evita un segundo refresh (p. ej. revalidar `/users/me` justo después de rotar). */
  retryUnauthorized?: boolean;
};

export function buildApiUrl(path: string, query?: Record<string, QueryValue>) {
  const base = `${env.NEXT_PUBLIC_API_URL.replace(/\/$/, "")}${API_PREFIX}/`;
  const url = new URL(path.replace(/^\//, ""), base);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
  }
  return url;
}

async function parseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined;
  const contentType = response.headers.get("content-type") ?? "";
  return contentType.includes("application/json") ? response.json() : response.text();
}

export function readRetryAfterSeconds(response: Response): number | undefined {
  const header = response.headers.get(HttpHeader.RETRY_AFTER);
  if (!header) return undefined;
  const seconds = Number(header);
  if (!Number.isFinite(seconds) || seconds < 0) return undefined;
  return Math.trunc(seconds);
}

function retryAfterMs(response: Response) {
  const seconds = readRetryAfterSeconds(response);
  const ms = seconds === undefined ? DEFAULT_RETRY_AFTER_MS : seconds * 1_000;
  return Math.min(Math.max(ms, 0), MAX_RETRY_AFTER_MS);
}

function wait(ms: number, signal?: AbortSignal | null) {
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(signal.reason);
    });
  });
}

/**
 * Único punto de acceso a la API de Quantia.
 * - 401: un refresh silencioso y un solo reintento; si falla, expira la sesión.
 * - 429: espera `Retry-After` y reintenta una sola vez.
 * - Errores normalizados en `ApiError`; respuestas validadas con Zod.
 */
export async function request<S extends z.ZodType>(
  path: string,
  {
    schema,
    body,
    query,
    auth = true,
    rateLimitRetry = true,
    retryUnauthorized = true,
    headers,
    ...init
  }: RequestOptions<S>,
): Promise<z.infer<S>> {
  const isJsonBody = body !== undefined && !(body instanceof FormData);
  const url = buildApiUrl(path, query);

  const send = () => {
    const token = auth ? getAccessToken() : null;
    return fetch(url, {
      ...init,
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...(isJsonBody && { "Content-Type": "application/json" }),
        ...(token && { Authorization: `Bearer ${token}` }),
        ...headers,
      },
      body: isJsonBody ? JSON.stringify(body) : (body as BodyInit | undefined),
    });
  };

  let response: Response;
  try {
    response = await send();

    if (response.status === 401 && auth && retryUnauthorized) {
      const token = await refreshAccessToken();
      if (!token) {
        expireSession();
        throw toApiError(401, undefined, readRetryAfterSeconds(response));
      }
      response = await send();
    } else if (response.status === 429 && rateLimitRetry) {
      await wait(retryAfterMs(response), init.signal);
      response = await send();
    }
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ApiError("network", null);
  }

  const data = await parseBody(response).catch(() => undefined);

  if (!response.ok) {
    if (response.status === 401 && auth && retryUnauthorized) expireSession();
    throw toApiError(response.status, data, readRetryAfterSeconds(response));
  }

  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ApiError("invalid_response", response.status, undefined, result.error.issues);
  }
  return result.data;
}

type MethodOptions<S extends z.ZodType> = Omit<RequestOptions<S>, "method" | "body">;

export const api = {
  get: <S extends z.ZodType>(path: string, options: MethodOptions<S>) =>
    request(path, { ...options, method: "GET" }),
  post: <S extends z.ZodType>(path: string, body: unknown, options: MethodOptions<S>) =>
    request(path, { ...options, method: "POST", body }),
  put: <S extends z.ZodType>(path: string, body: unknown, options: MethodOptions<S>) =>
    request(path, { ...options, method: "PUT", body }),
  patch: <S extends z.ZodType>(path: string, body: unknown, options: MethodOptions<S>) =>
    request(path, { ...options, method: "PATCH", body }),
  delete: <S extends z.ZodType>(path: string, options: MethodOptions<S>) =>
    request(path, { ...options, method: "DELETE" }),
};

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { api, buildApiUrl } from "./client";
import { ApiError } from "./errors";
import { configureRefresh, getAccessToken, onSessionExpired, setAccessToken } from "./session";

const schema = z.object({ ok: z.boolean() });

function jsonResponse(status: number, body: unknown, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });
}

describe("api client", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    setAccessToken("initial-token");
  });

  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
    configureRefresh(null);
    setAccessToken(null);
  });

  it("construye la URL bajo /api/v1 con query params", () => {
    expect(buildApiUrl("/projects", { page: 2, pageSize: 20, q: undefined }).toString()).toBe(
      "http://localhost:4000/api/v1/projects?page=2&pageSize=20",
    );
  });

  it("adjunta el token en memoria y valida la respuesta", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { ok: true }));

    await expect(api.get("/health", { schema })).resolves.toEqual({ ok: true });

    const init = fetchMock.mock.calls[0]?.[1];
    expect(init?.credentials).toBe("include");
    expect(init?.headers).toMatchObject({ Authorization: "Bearer initial-token" });
  });

  it("hace refresh silencioso ante 401 y reintenta una sola vez", async () => {
    configureRefresh(async () => "fresh-token");
    fetchMock
      .mockResolvedValueOnce(jsonResponse(401, {}))
      .mockResolvedValueOnce(jsonResponse(200, { ok: true }));

    await expect(api.get("/me", { schema })).resolves.toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(getAccessToken()).toBe("fresh-token");
    expect(fetchMock.mock.calls[1]?.[1]?.headers).toMatchObject({
      Authorization: "Bearer fresh-token",
    });
  });

  it("expira la sesión si el refresh falla", async () => {
    const listener = vi.fn();
    const unsubscribe = onSessionExpired(listener);
    configureRefresh(async () => null);
    fetchMock.mockResolvedValueOnce(jsonResponse(401, {}));

    await expect(api.get("/me", { schema })).rejects.toMatchObject({ kind: "unauthorized" });
    expect(listener).toHaveBeenCalledOnce();
    expect(getAccessToken()).toBeNull();
    unsubscribe();
  });

  it("no reintenta un 429 de login y expone Retry-After", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(429, {}, { "retry-after": "60" }));

    const error = await api
      .post(
        "/auth/login",
        { email: "a@b.co", password: "secretos" },
        {
          schema,
          auth: false,
          rateLimitRetry: false,
        },
      )
      .catch((caught: unknown) => caught);

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(error).toMatchObject({ kind: "rate_limited", retryAfterSeconds: 60 });
  });

  it("reintenta una vez ante 429 respetando Retry-After", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(429, {}, { "retry-after": "0" }))
      .mockResolvedValueOnce(jsonResponse(200, { ok: true }));

    await expect(api.get("/projects", { schema })).resolves.toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("no revela detalles del servidor en 403", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(403, { message: "El proyecto 42 es de otro grupo" }),
    );

    const error = await api.get("/projects/42", { schema }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      kind: "forbidden",
      message: "No tienes permiso para realizar esta acción.",
    });
  });

  it("falla con invalid_response si la respuesta no cumple el schema", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { ok: "sí" }));

    await expect(api.get("/health", { schema })).rejects.toMatchObject({
      kind: "invalid_response",
    });
  });

  it("normaliza errores de red", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));

    await expect(api.get("/health", { schema })).rejects.toMatchObject({ kind: "network" });
  });
});

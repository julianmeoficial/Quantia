import { afterEach, describe, expect, it, vi } from "vitest";

import { REFRESH_COOKIE } from "./cookie";
import { handleLogin, handleLogout, handleRefresh } from "./http";

const ORIGIN = "http://localhost:3000";

function request(path: string, init?: { body?: unknown; cookie?: string; origin?: string | null }) {
  const headers = new Headers();
  if (init?.origin !== null) headers.set("origin", init?.origin ?? ORIGIN);
  if (init?.cookie) headers.set("cookie", init.cookie);
  if (init?.body !== undefined) headers.set("content-type", "application/json");
  return new Request(`${ORIGIN}${path}`, {
    method: "POST",
    headers,
    body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
  });
}

function jsonResponse(status: number, body: unknown, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });
}

describe("session transport", () => {
  const fetchMock = vi.fn<typeof fetch>();

  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
  });

  it("rechaza un origen distinto", async () => {
    const response = await handleLogin(
      request("/api/session/login", {
        origin: "https://otro.example",
        body: { email: "a@b.co", password: "secretos" },
      }),
    );
    expect(response.status).toBe(403);
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("guarda el refresh en cookie y no lo devuelve al navegador", async () => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, {
        accessToken: "access",
        refreshToken: "refresh-secreto",
        tokenType: "Bearer",
        expiresIn: 900,
      }),
    );

    const response = await handleLogin(
      request("/api/session/login", {
        body: { email: "ana@uni.edu.co", password: "secretos" },
      }),
    );

    expect(response.status).toBe(200);
    const raw = await response.text();
    expect(raw).not.toContain("refresh-secreto");
    expect(JSON.parse(raw)).toEqual({ accessToken: "access", expiresIn: 900 });
    const cookie = response.headers.get("set-cookie") ?? "";
    expect(cookie).toContain(`${REFRESH_COOKIE}=${encodeURIComponent("refresh-secreto")}`);
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Strict");
    expect(cookie).toContain("Path=/api/session");
  });

  it("reenvía 429 y Retry-After sin reintentar", async () => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockResolvedValueOnce(
      jsonResponse(429, { message: "locked" }, { "retry-after": "60" }),
    );

    const response = await handleLogin(
      request("/api/session/login", {
        body: { email: "ana@uni.edu.co", password: "secretos" },
      }),
    );

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("60");
  });

  it("rota el refresh desde la cookie", async () => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, {
        accessToken: "nuevo",
        refreshToken: "rotado",
        tokenType: "Bearer",
        expiresIn: 900,
      }),
    );

    const response = await handleRefresh(
      request("/api/session/refresh", { cookie: `${REFRESH_COOKIE}=anterior` }),
    );

    expect(response.status).toBe(200);
    const body = fetchMock.mock.calls[0]?.[1]?.body;
    expect(body).toBe(JSON.stringify({ refreshToken: "anterior" }));
    await expect(response.json()).resolves.toEqual({ accessToken: "nuevo", expiresIn: 900 });
    expect(response.headers.get("set-cookie")).toContain(encodeURIComponent("rotado"));
  });

  it("limpia la cookie al cerrar sesión aunque no haya token", async () => {
    vi.stubGlobal("fetch", fetchMock);
    const response = await handleLogout(request("/api/session/logout"));
    expect(response.status).toBe(204);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
  });
});

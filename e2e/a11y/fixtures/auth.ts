import type { UserResponse } from "@quantia/contracts";
import type { Page, Route } from "@playwright/test";

import { emptyPage, lighthouseUser, PROJECT_ID, userFor, type A11yRole } from "./users";

function json(route: Route, body: unknown, status = 200) {
  return route.fulfill({
    status,
    contentType: "application/json; charset=utf-8",
    body: JSON.stringify(body),
  });
}

function projectFixture(coordinatorId: string) {
  return {
    id: PROJECT_ID,
    title: "Proyecto accesibilidad",
    description: "Fixture e2e",
    objectives: null,
    status: "ACTIVE",
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    coordinatorId,
    createdById: coordinatorId,
    memberIds: [coordinatorId],
    syncStatus: "SYNCED",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-11-04T17:00:00.000Z",
  };
}

function apiPath(url: string): string | null {
  try {
    const parsed = new URL(url);
    const marker = "/api/v1/";
    const index = parsed.pathname.indexOf(marker);
    if (index === -1) return null;
    return parsed.pathname.slice(index).replace(/\/$/, "") || "/api/v1";
  } catch {
    return null;
  }
}

async function fulfillApi(route: Route, user: UserResponse) {
  const requestUrl = route.request().url();
  const path = apiPath(requestUrl);
  const method = route.request().method();
  if (!path) return route.continue();

  if (path === "/api/v1/users/me" && method === "GET") {
    return json(route, user);
  }

  if (path === "/api/v1/projects" && method === "GET") {
    const url = new URL(requestUrl);
    const project = projectFixture(user.id);
    const status = url.searchParams.get("status");
    const pageSize = Number(url.searchParams.get("pageSize") ?? "20");
    if (pageSize === 1) {
      const total = status === "ACTIVE" || status === null ? 1 : 0;
      return json(route, {
        data: total > 0 ? [project] : [],
        meta: { page: 1, pageSize: 1, total, totalPages: total > 0 ? 1 : 0 },
      });
    }
    return json(route, emptyPage([project]));
  }

  if (path.startsWith("/api/v1/projects/") && path.endsWith("/tasks") && method === "GET") {
    return json(route, emptyPage());
  }

  if (path.startsWith("/api/v1/projects/") && path.endsWith("/progress") && method === "GET") {
    return json(route, emptyPage());
  }

  if (path.startsWith("/api/v1/projects/") && path.endsWith("/budget") && method === "GET") {
    return json(
      route,
      {
        statusCode: 404,
        message: "Budget not found",
        path,
        timestamp: new Date().toISOString(),
      },
      404,
    );
  }

  if (path === "/api/v1/chat/general/messages" && method === "GET") {
    return json(route, {
      items: [
        {
          id: "66666666-6666-4666-8666-666666666666",
          content: "Hola, mensaje de prueba de accesibilidad.",
          clientMessageId: null,
          createdAt: "2026-11-04T16:00:00.000Z",
          author: { id: user.id, name: user.fullName, avatarUrl: null },
        },
      ],
      nextCursor: null,
      hasMore: false,
    });
  }

  if (path === "/api/v1/health" && method === "GET") {
    return json(route, { status: "ok" });
  }

  if (method === "GET") {
    return json(route, emptyPage());
  }

  return json(
    route,
    {
      statusCode: 404,
      message: "Not mocked",
      path,
      timestamp: new Date().toISOString(),
    },
    404,
  );
}

export type MockSessionOptions = {
  role?: A11yRole;
  /** Multi-role user for Lighthouse collect. */
  lighthouse?: boolean;
  /** Anonymous: refresh fails so login/public routes stay public. */
  anonymous?: boolean;
};

/** Intercept session + Quantia API + sockets so e2e never hits Railway. */
export async function mockAuthenticatedSession(page: Page, options: MockSessionOptions = {}) {
  const user = options.lighthouse ? lighthouseUser() : userFor(options.role ?? "INVESTIGADOR");

  await page.route("**/api/session/refresh", async (route) => {
    if (options.anonymous) {
      return route.fulfill({ status: 401, contentType: "application/json", body: "{}" });
    }
    return json(route, { accessToken: `e2e-${user.id}`, expiresIn: 3600 });
  });

  await page.route("**/api/session/login", async (route) => {
    if (options.anonymous) {
      return json(route, { statusCode: 401, message: "Invalid credentials" }, 401);
    }
    return json(route, { accessToken: `e2e-${user.id}`, expiresIn: 3600 });
  });

  await page.route("**/api/session/logout", async (route) => {
    return route.fulfill({ status: 204, body: "" });
  });

  // Match any API host baked into the client bundle (local, staging, production).
  await page.route("**/api/v1/**", async (route) => {
    await fulfillApi(route, user);
  });

  await page.route("**/socket.io/**", async (route) => {
    await route.abort();
  });
}

export async function setTheme(page: Page, theme: "light" | "dark") {
  await page.addInitScript((value) => {
    document.documentElement.setAttribute("data-theme", value);
  }, theme);
}

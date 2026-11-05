/**
 * LHCI puppeteerScript — mocks session + API for every Chromium target
 * so authenticated routes boot without Railway.
 *
 * @param {import('puppeteer').Browser} browser
 */
module.exports = async function setupA11yMocks(browser) {
  const user = {
    id: "44444444-4444-4444-8444-444444444444",
    email: "a11y@quantia.test",
    fullName: "Usuario Accesibilidad",
    isActive: true,
    roles: ["ADMINISTRADOR", "COORDINADOR", "INVESTIGADOR"],
    avatar: "AVATAR_01",
    avatarRequired: false,
    createdAt: "2026-11-04T17:00:00.000Z",
    updatedAt: "2026-11-04T17:00:00.000Z",
  };

  const project = {
    id: "55555555-5555-4555-8555-555555555555",
    title: "Proyecto accesibilidad",
    description: "Fixture e2e",
    objectives: null,
    status: "ACTIVE",
    startDate: "2026-01-01T05:00:00.000Z",
    endDate: "2026-12-31T05:00:00.000Z",
    coordinatorId: user.id,
    createdById: user.id,
    memberIds: [user.id],
    syncStatus: "SYNCED",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-11-04T17:00:00.000Z",
  };

  function emptyPage(data = []) {
    return {
      data,
      meta: {
        page: 1,
        pageSize: 20,
        total: data.length,
        totalPages: data.length > 0 ? 1 : 0,
      },
    };
  }

  function apiPath(url) {
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

  /**
   * @param {import('puppeteer').HTTPRequest} request
   */
  async function onRequest(request) {
    const url = request.url();
    const method = request.method();

    if (url.includes("/api/session/refresh") && method === "POST") {
      return request.respond({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ accessToken: `lhci-${user.id}`, expiresIn: 3600 }),
      });
    }

    if (url.includes("/api/session/logout")) {
      return request.respond({ status: 204, body: "" });
    }

    if (url.includes("/socket.io/")) {
      return request.abort();
    }

    const path = apiPath(url);
    if (!path) {
      return request.continue();
    }

    if (path === "/api/v1/users/me" && method === "GET") {
      return request.respond({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(user),
      });
    }

    if (path === "/api/v1/projects" && method === "GET") {
      const parsed = new URL(url);
      const pageSize = Number(parsed.searchParams.get("pageSize") || "20");
      const status = parsed.searchParams.get("status");
      if (pageSize === 1) {
        const total = status === "ACTIVE" || status === null ? 1 : 0;
        return request.respond({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: total > 0 ? [project] : [],
            meta: { page: 1, pageSize: 1, total, totalPages: total > 0 ? 1 : 0 },
          }),
        });
      }
      return request.respond({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(emptyPage([project])),
      });
    }

    if (path.endsWith("/tasks") || path.endsWith("/progress")) {
      return request.respond({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(emptyPage()),
      });
    }

    if (path.endsWith("/budget")) {
      return request.respond({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({
          statusCode: 404,
          message: "Budget not found",
          path,
          timestamp: new Date().toISOString(),
        }),
      });
    }

    if (path === "/api/v1/chat/general/state") {
      return request.respond({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          serverTime: "2026-11-04T16:05:00.000Z",
          latestSeq: 1,
          lastReadSeq: 1,
          unreadCount: 0,
          readStates: [{ userId: user.id, lastReadSeq: 1 }],
          limits: {
            messageMaxLength: 2000,
            editWindowSeconds: 172800,
            typingTtlMs: 6000,
            historyMaxLimit: 100,
          },
          reactions: ["👍", "❤️", "😂", "😮", "😢", "🙏", "🔥", "🎉"],
        }),
      });
    }

    if (path === "/api/v1/chat/general/messages") {
      return request.respond({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          items: [
            {
              id: "66666666-6666-4666-8666-666666666666",
              seq: 1,
              version: 1,
              content: "Hola, mensaje de prueba de accesibilidad.",
              clientMessageId: null,
              createdAt: "2026-11-04T16:00:00.000Z",
              updatedAt: "2026-11-04T16:00:00.000Z",
              editedAt: null,
              deletedAt: null,
              author: { id: user.id, name: user.fullName, avatar: "AVATAR_01", avatarUrl: null },
              replyTo: null,
              reactions: [],
            },
          ],
          nextCursor: null,
          hasMore: false,
        }),
      });
    }

    if (method === "GET") {
      return request.respond({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(emptyPage()),
      });
    }

    return request.continue();
  }

  /**
   * @param {import('puppeteer').Page} page
   */
  async function attach(page) {
    if (page.__quantiaA11yMocked) return;
    page.__quantiaA11yMocked = true;
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      onRequest(request).catch(() => {
        if (!request.isInterceptResolutionHandled()) {
          request.continue().catch(() => undefined);
        }
      });
    });
    await page.evaluateOnNewDocument(() => {
      document.documentElement.setAttribute("data-theme", "light");
    });
  }

  browser.on("targetcreated", async (target) => {
    const page = await target.page();
    if (page) await attach(page);
  });

  for (const page of await browser.pages()) {
    await attach(page);
  }
};

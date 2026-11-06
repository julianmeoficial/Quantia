import { expect, test, type Page } from "@playwright/test";

import { mockAuthenticatedSession, setTheme } from "../fixtures/auth";
import { PROJECT_ID, type A11yRole } from "../fixtures/users";

async function focusedTag(page: Page) {
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    if (!el || el === document.body) return { tag: "BODY", name: "" };
    const name =
      el.getAttribute("aria-label") ||
      el.getAttribute("aria-labelledby") ||
      el.textContent?.trim().slice(0, 80) ||
      el.getAttribute("name") ||
      "";
    return { tag: el.tagName, name, id: el.id || undefined };
  });
}

async function assertSkipLink(page: Page) {
  await page.keyboard.press("Tab");
  const first = await focusedTag(page);
  expect(first.name.toLowerCase()).toContain("saltar");
  await page.keyboard.press("Enter");
  await expect(page.locator("#contenido")).toBeFocused();
}

async function assertNoPageHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(() => {
    const root = document.documentElement;
    return {
      scrollWidth: root.scrollWidth,
      clientWidth: root.clientWidth,
    };
  });
  expect(
    overflow.scrollWidth,
    `horizontal overflow: scrollWidth=${overflow.scrollWidth} clientWidth=${overflow.clientWidth}`,
  ).toBeLessThanOrEqual(overflow.clientWidth + 1);
}

async function assertSingleH1(page: Page, name: string | RegExp) {
  const headings = page.getByRole("heading", { level: 1 });
  await expect(headings).toHaveCount(1);
  await expect(headings).toHaveAccessibleName(name);
}

async function openNoticesAndEsc(page: Page) {
  const trigger = page.getByRole("button", { name: /Avisos/i });
  if ((await trigger.count()) === 0) return;
  await trigger.first().click();
  await expect(page.getByRole("heading", { name: /Avisos/i })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(trigger.first()).toBeFocused();
}

async function openAccountMenuAndEsc(page: Page) {
  const trigger = page.getByRole("button", { name: /cuenta de/i });
  await trigger.click();
  await expect(page.getByRole("menuitem", { name: "Cerrar sesión" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
}

async function assertZoom200(page: Page) {
  // Simulate 200% browser zoom on a 1280 desktop by shrinking the layout viewport (WCAG 1.4.4 / 1.4.10).
  const viewport = page.viewportSize() ?? { width: 1280, height: 720 };
  await page.setViewportSize({
    width: Math.floor(viewport.width / 2),
    height: viewport.height,
  });
  await assertNoPageHorizontalScroll(page);
  await page.setViewportSize(viewport);
}

test.describe("F-01 Investigador — teclado + estructura", () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticatedSession(page, { role: "INVESTIGADOR" });
    await setTheme(page, "light");
  });

  test("login anónimo: labels y un h1", async ({ page }) => {
    await mockAuthenticatedSession(page, { anonymous: true });
    await page.goto("/login", { waitUntil: "networkidle" });
    await assertSingleH1(page, "Bienvenido de nuevo");
    await expect(page.getByLabel(/Correo/)).toBeVisible();
    await expect(page.getByLabel(/Contraseña/)).toBeVisible();
    await page.keyboard.press("Tab");
    // Login has no app skip link; first focus should land on a form control or brand link.
    const focused = await focusedTag(page);
    expect(focused.tag).not.toBe("BODY");
  });

  test("mis-tareas: skip link, h1, overlays Esc, zoom 200%", async ({ page }) => {
    await page.goto("/mis-tareas", { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { name: "Mis tareas" })).toBeVisible();
    await assertSkipLink(page);
    await assertSingleH1(page, "Mis tareas");
    await openNoticesAndEsc(page);
    await openAccountMenuAndEsc(page);
    await assertZoom200(page);
  });

  test("proyecto + chat: landmarks y h1", async ({ page }) => {
    await page.goto(`/proyectos/${PROJECT_ID}`, { waitUntil: "networkidle" });
    await expect(page.getByRole("main")).toBeVisible();
    // Workspace title or error/empty still exposes a primary heading or status.
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1.first()).toBeVisible({ timeout: 30_000 });

    await page.goto("/chat", { waitUntil: "networkidle" });
    await assertSingleH1(page, "Chat general");
    await assertSkipLink(page);
  });
});

test.describe("F-02 Coordinador — teclado + estructura", () => {
  const role: A11yRole = "COORDINADOR";

  test.beforeEach(async ({ page }) => {
    await mockAuthenticatedSession(page, { role });
    await setTheme(page, "light");
  });

  for (const route of [
    { path: "/dashboard", h1: "Dashboard del grupo" },
    { path: "/proyectos", h1: /Proyectos/i },
    { path: "/tareas", h1: /Tareas/i },
    { path: "/avances", h1: /Avances/i },
    { path: "/presupuesto", h1: /Presupuesto/i },
    { path: "/reportes", h1: /Reportes/i },
  ] as const) {
    test(`${route.path}: skip, h1, chart table si aplica`, async ({ page }) => {
      await page.goto(route.path, { waitUntil: "networkidle" });
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 30_000 });
      await assertSingleH1(page, route.h1);
      await assertSkipLink(page);

      if (route.path === "/dashboard") {
        const tableToggle = page.getByRole("button", { name: /Ver como tabla|Ver como gráfica/i });
        if ((await tableToggle.count()) > 0) {
          await tableToggle.first().focus();
          await page.keyboard.press("Enter");
          await expect(page.getByRole("table").first()).toBeVisible();
        }
      }

      await assertZoom200(page);
    });
  }
});

test.describe("F-03 Administrador — teclado + estructura", () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticatedSession(page, { role: "ADMINISTRADOR" });
    await setTheme(page, "light");
  });

  for (const route of [
    { path: "/institucional", h1: "Vista institucional" },
    { path: "/usuarios", h1: /Usuarios/i },
    { path: "/presupuesto", h1: /Presupuesto/i },
    { path: "/reportes", h1: /Reportes/i },
    { path: "/auditoria", h1: /Auditoría/i },
    { path: "/convocatorias", h1: /Convocatorias/i },
  ] as const) {
    test(`${route.path}: skip + h1`, async ({ page }) => {
      await page.goto(route.path, { waitUntil: "networkidle" });
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 30_000 });
      await assertSingleH1(page, route.h1);
      await assertSkipLink(page);
      await assertZoom200(page);
    });
  }

  test("dark theme institucional: skip + h1", async ({ page }) => {
    await setTheme(page, "dark");
    await page.goto("/institucional", { waitUntil: "networkidle" });
    await assertSingleH1(page, "Vista institucional");
    await assertSkipLink(page);
  });
});

test.describe("Color no solo — Badge presentation (DOM)", () => {
  test("dashboard badges expose text labels", async ({ page }) => {
    await mockAuthenticatedSession(page, { role: "COORDINADOR" });
    await page.goto("/dashboard", { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { name: "Dashboard del grupo" })).toBeVisible();
    // Status chips / badges must include visible Spanish labels when present.
    const badges = page.locator("[class*='Badge'], [data-tone]");
    const count = await badges.count();
    for (let i = 0; i < Math.min(count, 8); i += 1) {
      const text = (await badges.nth(i).innerText()).trim();
      if (text.length > 0) {
        expect(text.length).toBeGreaterThan(1);
      }
    }
  });
});

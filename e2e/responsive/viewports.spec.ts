import { expect, test, type Page } from "@playwright/test";
import path from "node:path";

import { mockAuthenticatedSession, setTheme } from "../a11y/fixtures/auth";
import { PROJECT_ID, type A11yRole } from "../a11y/fixtures/users";

const CAPTURE_DIR = path.join(__dirname, "captures");

const VIEWPORTS = [
  { name: "390", width: 390, height: 844 },
  { name: "768", width: 768, height: 1024 },
  { name: "1280", width: 1280, height: 800 },
  { name: "1440", width: 1440, height: 900 },
] as const;

async function assertNoPageHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(() => {
    const root = document.documentElement;
    return { scrollWidth: root.scrollWidth, clientWidth: root.clientWidth };
  });
  expect(
    overflow.scrollWidth,
    `horizontal overflow: scrollWidth=${overflow.scrollWidth} clientWidth=${overflow.clientWidth}`,
  ).toBeLessThanOrEqual(overflow.clientWidth + 1);
}

async function capture(page: Page, name: string) {
  await page.screenshot({
    path: path.join(CAPTURE_DIR, `${name}.png`),
    fullPage: false,
  });
}

async function assertMinTouchTarget(page: Page, locator: ReturnType<Page["getByRole"]>) {
  const box = await locator.boundingBox();
  expect(box, "control should be visible").not.toBeNull();
  if (!box) return;
  expect(box.height, "touch target height ≥ 44").toBeGreaterThanOrEqual(44);
  expect(box.width, "touch target width ≥ 44").toBeGreaterThanOrEqual(44);
}

test.describe("DS-132 responsive viewports", () => {
  for (const vp of VIEWPORTS) {
    test(`login — sin overflow @${vp.name}`, async ({ page }) => {
      await mockAuthenticatedSession(page, { anonymous: true });
      await setTheme(page, "light");
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/login", { waitUntil: "networkidle" });
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await assertNoPageHorizontalScroll(page);
      if (vp.name === "390" || vp.name === "768") {
        await capture(page, `login-${vp.name}`);
      }
    });
  }

  test.describe("Investigador", () => {
    test.beforeEach(async ({ page }) => {
      await mockAuthenticatedSession(page, { role: "INVESTIGADOR" });
      await setTheme(page, "light");
    });

    for (const vp of VIEWPORTS) {
      test(`mis-tareas shell + overflow @${vp.name}`, async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto("/mis-tareas", { waitUntil: "networkidle" });
        await expect(page.getByRole("heading", { name: "Mis tareas" })).toBeVisible();
        await assertNoPageHorizontalScroll(page);

        // AppShell drawer until `lg` (1280); inline rail from 1280 up.
        if (vp.width < 1280) {
          const menu = page.getByRole("button", { name: "Abrir navegación" });
          await expect(menu).toBeVisible();
          await menu.click();
          await expect(page.getByRole("navigation", { name: /secciones/i })).toBeVisible();
          await page.keyboard.press("Escape");
        } else {
          await expect(page.getByRole("button", { name: "Abrir navegación" })).toHaveCount(0);
          await expect(page.getByRole("navigation", { name: /secciones/i })).toBeVisible();
        }

        if (vp.name === "390") {
          await capture(page, "mis-tareas-390");
        }
      });
    }

    test("OVR-01 usable @390 + reduced-motion", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto("/mis-tareas", { waitUntil: "networkidle" });

      const openRegister = page.getByRole("button", { name: "Registrar avance" }).first();
      await openRegister.click();
      await expect(page.getByRole("heading", { name: "Registrar avance" })).toBeVisible();
      await assertNoPageHorizontalScroll(page);

      const save = page.getByRole("button", { name: "Guardar avance" });
      const cancel = page.getByRole("button", { name: "Cancelar" });
      await expect(save).toBeVisible();
      await expect(cancel).toBeVisible();
      await assertMinTouchTarget(page, save);
      await assertMinTouchTarget(page, cancel);

      await capture(page, "ovr-01-390");
      await page.keyboard.press("Escape");
      await expect(openRegister).toBeFocused();
    });

    test("proyecto + chat overflow @390", async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`/proyectos/${PROJECT_ID}`, { waitUntil: "networkidle" });
      await expect(page.getByRole("main")).toBeVisible({ timeout: 30_000 });
      await expect(
        page.getByRole("heading", { name: /Proyecto accesibilidad/i }).first(),
      ).toBeVisible({
        timeout: 30_000,
      });
      await assertNoPageHorizontalScroll(page);

      await page.goto("/chat", { waitUntil: "networkidle" });
      await expect(page.getByRole("heading", { name: "Chat general" })).toBeVisible();
      await assertNoPageHorizontalScroll(page);
    });
  });

  test.describe("Coordinador", () => {
    const role: A11yRole = "COORDINADOR";

    test.beforeEach(async ({ page }) => {
      await mockAuthenticatedSession(page, { role });
      await setTheme(page, "light");
    });

    for (const vp of VIEWPORTS) {
      test(`dashboard overflow @${vp.name}`, async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto("/dashboard", { waitUntil: "networkidle" });
        await expect(page.getByRole("main")).toBeVisible({ timeout: 30_000 });
        await assertNoPageHorizontalScroll(page);
        if (vp.name === "768") await capture(page, "dashboard-768");
        if (vp.name === "1440") await capture(page, "dashboard-1440");
      });
    }

    test("chart legible + tabla @768", async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto("/dashboard", { waitUntil: "networkidle" });
      await expect(page.getByRole("main")).toBeVisible({ timeout: 30_000 });

      const chartTitle = page.getByText(/Avance por proyecto/i).first();
      await expect(chartTitle).toBeVisible({ timeout: 30_000 });
      await expect(page.getByText(/trazo continuo/i).first()).toBeVisible();

      const tableToggle = page.getByRole("button", { name: "Ver como tabla" }).first();
      await tableToggle.click();
      await expect(page.getByRole("button", { name: "Ver como gráfica" }).first()).toBeVisible();
      await assertNoPageHorizontalScroll(page);
      await capture(page, "dashboard-chart-table-768");
    });

    const coordRoutes = ["/proyectos", "/tareas", "/avances", "/presupuesto", "/reportes"] as const;

    for (const route of coordRoutes) {
      test(`${route} overflow @390`, async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto(route, { waitUntil: "networkidle" });
        await expect(page.getByRole("main")).toBeVisible({ timeout: 30_000 });
        await assertNoPageHorizontalScroll(page);
      });
    }
  });

  test.describe("Administrador", () => {
    test.beforeEach(async ({ page }) => {
      await mockAuthenticatedSession(page, { role: "ADMINISTRADOR" });
      await setTheme(page, "light");
    });

    for (const vp of [
      { name: "390", width: 390, height: 844 },
      { name: "1280", width: 1280, height: 800 },
    ] as const) {
      test(`institucional overflow @${vp.name}`, async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto("/institucional", { waitUntil: "networkidle" });
        await expect(page.getByRole("main")).toBeVisible({ timeout: 30_000 });
        await assertNoPageHorizontalScroll(page);
        await capture(page, `institucional-${vp.name}`);
      });
    }

    const adminRoutes = [
      "/usuarios",
      "/presupuesto",
      "/reportes",
      "/auditoria",
      "/convocatorias",
    ] as const;

    for (const route of adminRoutes) {
      test(`${route} overflow @390 y 768`, async ({ page }) => {
        for (const width of [390, 768] as const) {
          await page.setViewportSize({ width, height: 844 });
          await page.goto(route, { waitUntil: "networkidle" });
          await expect(page.getByRole("main")).toBeVisible({ timeout: 30_000 });
          await assertNoPageHorizontalScroll(page);
        }
      });
    }
  });
});

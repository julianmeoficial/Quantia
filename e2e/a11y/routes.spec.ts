import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { mockAuthenticatedSession, setTheme } from "./fixtures/auth";
import type { A11yRole } from "./fixtures/users";

type Theme = "light" | "dark";

const ROUTES: { path: string; role: A11yRole; heading: string | RegExp }[] = [
  { path: "/mis-tareas", role: "INVESTIGADOR", heading: "Mis tareas" },
  { path: "/dashboard", role: "COORDINADOR", heading: "Dashboard del grupo" },
  { path: "/institucional", role: "ADMINISTRADOR", heading: "Vista institucional" },
  { path: "/chat", role: "INVESTIGADOR", heading: "Chat general" },
];

async function runAxe(page: Page, label: string) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  const serious = results.violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  );

  await mkdir(path.join(process.cwd(), "reports", "axe"), { recursive: true });
  const file = path.join(process.cwd(), "reports", "axe", `${label.replaceAll("/", "_")}.json`);
  await writeFile(
    file,
    JSON.stringify(
      {
        url: results.url,
        timestamp: new Date().toISOString(),
        violations: results.violations,
        passes: results.passes.length,
        incomplete: results.incomplete.length,
      },
      null,
      2,
    ),
  );

  expect(
    serious,
    serious.map((v) => `${v.id} (${v.impact}): ${v.help} — ${v.nodes.length} node(s)`).join("\n") ||
      "serious/critical axe violations",
  ).toEqual([]);
}

for (const route of ROUTES) {
  for (const theme of ["light", "dark"] as Theme[]) {
    test(`axe ${route.path} as ${route.role} (${theme})`, async ({ page }) => {
      await mockAuthenticatedSession(page, { role: route.role });
      await setTheme(page, theme);
      await page.goto(route.path, { waitUntil: "networkidle" });
      await expect(page.getByRole("heading", { name: route.heading })).toBeVisible({
        timeout: 30_000,
      });
      await runAxe(page, `${route.path}-${route.role}-${theme}`);
    });
  }
}

for (const theme of ["light", "dark"] as Theme[]) {
  test(`axe /login (${theme})`, async ({ page }) => {
    await mockAuthenticatedSession(page, { anonymous: true });
    await setTheme(page, theme);
    await page.goto("/login", { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { name: "Bienvenido de nuevo" })).toBeVisible();
    await runAxe(page, `/login-anonymous-${theme}`);
  });
}

import type { AxeResults } from "axe-core";
import { expect } from "vitest";
import { axe } from "vitest-axe";

/** Run axe and assert zero serious/critical violations (WCAG 2.1 AA tags). */
export async function expectNoSeriousAxeViolations(container: Element) {
  const results = (await axe(container, {
    runOnly: {
      type: "tag",
      values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"],
    },
  })) as AxeResults;

  const serious = results.violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  );

  expect(
    serious,
    serious.map((v) => `${v.id} (${v.impact}): ${v.help}`).join("\n") || undefined,
  ).toEqual([]);
}

export { axe };

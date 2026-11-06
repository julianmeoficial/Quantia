import { describe, expect, it } from "vitest";

import { evidenceLinksOf, normalizeEvidenceHref } from "./evidenceLinks";

describe("evidence links", () => {
  it("adds https to bare domains and keeps full URLs", () => {
    expect(normalizeEvidenceHref("drive.google.com/file/d/1")).toBe(
      "https://drive.google.com/file/d/1",
    );
    expect(normalizeEvidenceHref(" https://example.com/a ")).toBe("https://example.com/a");
  });

  it("rejects unsafe or malformed values", () => {
    expect(normalizeEvidenceHref("javascript:alert(1)")).toBeNull();
    expect(normalizeEvidenceHref("data:text/html;base64,AAA")).toBeNull();
    expect(normalizeEvidenceHref("")).toBeNull();
    expect(normalizeEvidenceHref("sin-dominio")).toBeNull();
  });

  it("lists every valid link once and numbers them when there are several", () => {
    expect(evidenceLinksOf(["https://a.com/x", "a.com/x", "b.com/y", "javascript:1"])).toEqual([
      { href: "https://a.com/x", label: "Ver evidencia 1" },
      { href: "https://b.com/y", label: "Ver evidencia 2" },
    ]);
    expect(evidenceLinksOf(["a.com"])).toEqual([
      { href: "https://a.com/", label: "Ver evidencia" },
    ]);
  });
});

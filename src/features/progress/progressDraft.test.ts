import { describe, expect, it } from "vitest";

import { draftKey, isHttpUrl, parseDraft, serializeDraft } from "./progressDraft";

describe("progressDraft", () => {
  it("round-trips draft payload", () => {
    const raw = serializeDraft({
      projectId: "p1",
      title: "Avance",
      description: "Detalle",
      taskId: "t1",
      evidenceLink: "https://example.com",
    });
    expect(parseDraft(raw)).toEqual({
      projectId: "p1",
      title: "Avance",
      description: "Detalle",
      taskId: "t1",
      evidenceLink: "https://example.com",
    });
    expect(draftKey("p1")).toBe("progress:p1");
  });

  it("validates http(s) urls", () => {
    expect(isHttpUrl("https://example.com/a")).toBe(true);
    expect(isHttpUrl("ftp://example.com")).toBe(false);
    expect(isHttpUrl("not-a-url")).toBe(false);
  });
});

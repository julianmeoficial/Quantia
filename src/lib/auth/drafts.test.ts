import { afterEach, describe, expect, it } from "vitest";

import { clearDrafts, readDraft, saveDraft } from "./drafts";

describe("drafts", () => {
  afterEach(() => {
    sessionStorage.clear();
  });

  it("conserva un borrador y lo borra solo al limpiar la sesión", () => {
    saveDraft("avance", "texto local");
    sessionStorage.setItem("otro", "no es borrador");

    expect(readDraft("avance")).toBe("texto local");
    clearDrafts();
    expect(readDraft("avance")).toBeNull();
    expect(sessionStorage.getItem("otro")).toBe("no es borrador");
  });
});

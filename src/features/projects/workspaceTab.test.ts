import { describe, expect, it } from "vitest";

import { parseWorkspaceTab } from "./workspaceTab";

describe("parseWorkspaceTab", () => {
  it("defaults invalid values to tareas", () => {
    expect(parseWorkspaceTab(null)).toBe("tareas");
    expect(parseWorkspaceTab("")).toBe("tareas");
    expect(parseWorkspaceTab("otros")).toBe("tareas");
  });

  it("accepts bitacora and documentos", () => {
    expect(parseWorkspaceTab("bitacora")).toBe("bitacora");
    expect(parseWorkspaceTab("documentos")).toBe("documentos");
    expect(parseWorkspaceTab("tareas")).toBe("tareas");
  });
});

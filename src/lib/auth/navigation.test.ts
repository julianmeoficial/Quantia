import { describe, expect, it } from "vitest";

import {
  accessFor,
  canAccess,
  isProjectContextPath,
  landing,
  navigationFor,
  projectRouteId,
  scopedHref,
} from "./index";

describe("navigation matrix", () => {
  it("lands on the highest role", () => {
    expect(landing(["INVESTIGADOR"])).toBe("/mis-tareas");
    expect(landing(["COORDINADOR", "INVESTIGADOR"])).toBe("/dashboard");
    expect(landing(["INVESTIGADOR", "ADMINISTRADOR"])).toBe("/institucional");
    expect(landing([])).toBeNull();
  });

  it("unions roles and keeps chat off by default", () => {
    const labels = navigationFor(["COORDINADOR", "ADMINISTRADOR"]).map((item) => item.label);
    expect(labels).toContain("Dashboard");
    expect(labels).toContain("Institucional");
    expect(labels).toContain("Usuarios");
    expect(labels).toContain("Tareas");
    expect(labels).toContain("Avances");
    expect(labels).not.toContain("Mis tareas");
    expect(labels).not.toContain("Chat");
  });

  it("allows administrator operational routes shared with coordinators", () => {
    expect(accessFor("/tareas", ["ADMINISTRADOR"])).toBe("allowed");
    expect(accessFor("/avances", ["ADMINISTRADOR"])).toBe("allowed");
    expect(canAccess("/tareas", ["ADMINISTRADOR"])).toBe(true);
    expect(canAccess("/avances", ["ADMINISTRADOR"])).toBe(true);
    expect(accessFor("/tareas", ["INVESTIGADOR"])).toBe("denied");
  });

  it("adds Chat when chatEnabled is on", () => {
    const labels = navigationFor(["INVESTIGADOR"], { chatEnabled: true }).map((item) => item.label);
    expect(labels).toContain("Chat");
    expect(accessFor("/chat", ["INVESTIGADOR"])).toBe("allowed");
    expect(accessFor("/chat", ["COORDINADOR"])).toBe("allowed");
    expect(accessFor("/chat", ["ADMINISTRADOR"])).toBe("allowed");
    expect(accessFor("/chat", [])).toBe("denied");
    expect(canAccess("/chat", ["INVESTIGADOR"])).toBe(true);
  });

  it("denies a known path and ignores an unknown one", () => {
    expect(accessFor("/usuarios", ["INVESTIGADOR"])).toBe("denied");
    expect(canAccess("/usuarios", ["INVESTIGADOR"])).toBe(false);
    expect(accessFor("/proyectos/123", ["COORDINADOR"])).toBe("unknown");
    expect(canAccess("/presupuesto", ["ADMINISTRADOR"])).toBe(true);
  });

  it("allows the «soon» sections only for administrators", () => {
    for (const path of ["/convocatorias", "/auditoria"]) {
      expect(accessFor(path, ["ADMINISTRADOR"])).toBe("allowed");
      expect(accessFor(path, ["COORDINADOR"])).toBe("denied");
      expect(accessFor(path, ["INVESTIGADOR"])).toBe("denied");
      expect(canAccess(path, ["COORDINADOR"])).toBe(false);
    }
    const admin = navigationFor(["ADMINISTRADOR"]);
    expect(admin.find((entry) => entry.href === "/convocatorias")?.soon).toBe(true);
    expect(admin.find((entry) => entry.href === "/auditoria")?.soon).toBe(true);
    expect(navigationFor(["COORDINADOR"]).some((entry) => entry.soon)).toBe(false);
  });

  it("keeps the open project in context for budget, reports, tasks and progress", () => {
    const id = "3f2b8c1e-4d5a-4b6c-8d7e-9a0b1c2d3e4f";
    expect(projectRouteId(`/proyectos/${id}`)).toBe(id);
    expect(projectRouteId("/proyectos/nuevo")).toBeNull();
    expect(projectRouteId("/proyectos")).toBeNull();
    expect(scopedHref("/presupuesto", id)).toBe(`/presupuesto?projectId=${id}`);
    expect(scopedHref("/reportes", id)).toBe(`/reportes?projectId=${id}`);
    expect(scopedHref("/usuarios", id)).toBe("/usuarios");
    expect(scopedHref("/presupuesto", null)).toBe("/presupuesto");
    expect(isProjectContextPath(`/proyectos/${id}`)).toBe(true);
    expect(isProjectContextPath("/presupuesto")).toBe(true);
    expect(isProjectContextPath("/dashboard")).toBe(false);
  });
});

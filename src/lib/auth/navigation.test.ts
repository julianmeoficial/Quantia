import { describe, expect, it } from "vitest";

import { accessFor, canAccess, landing, navigationFor } from "./index";

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
    expect(labels).not.toContain("Mis tareas");
    expect(labels).not.toContain("Chat");
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

  it("allows convocatoria deep links only for administrators", () => {
    expect(accessFor("/convocatorias", ["ADMINISTRADOR"])).toBe("allowed");
    expect(accessFor("/convocatorias/2026-01", ["ADMINISTRADOR"])).toBe("allowed");
    expect(canAccess("/convocatorias/2026-01", ["ADMINISTRADOR"])).toBe(true);
    expect(accessFor("/convocatorias/2026-01", ["COORDINADOR"])).toBe("denied");
    expect(accessFor("/convocatorias/2026-01", ["INVESTIGADOR"])).toBe("denied");
    expect(canAccess("/convocatorias/2026-01", ["INVESTIGADOR"])).toBe(false);
  });

  it("allows auditoría deep links only for administrators", () => {
    expect(accessFor("/auditoria", ["ADMINISTRADOR"])).toBe("allowed");
    expect(canAccess("/auditoria", ["ADMINISTRADOR"])).toBe(true);
    expect(accessFor("/auditoria", ["COORDINADOR"])).toBe("denied");
    expect(accessFor("/auditoria", ["INVESTIGADOR"])).toBe("denied");
    expect(canAccess("/auditoria", ["COORDINADOR"])).toBe(false);
  });
});

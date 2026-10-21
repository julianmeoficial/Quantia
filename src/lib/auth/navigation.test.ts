import { describe, expect, it } from "vitest";

import { accessFor, canAccess, landing, navigationFor } from "./index";

describe("navigation matrix", () => {
  it("lands on the highest role", () => {
    expect(landing(["INVESTIGADOR"])).toBe("/mis-tareas");
    expect(landing(["COORDINADOR", "INVESTIGADOR"])).toBe("/dashboard");
    expect(landing(["INVESTIGADOR", "ADMINISTRADOR"])).toBe("/institucional");
    expect(landing([])).toBeNull();
  });

  it("unions roles and keeps chat off", () => {
    const labels = navigationFor(["COORDINADOR", "ADMINISTRADOR"]).map((item) => item.label);
    expect(labels).toContain("Dashboard");
    expect(labels).toContain("Institucional");
    expect(labels).toContain("Usuarios");
    expect(labels).not.toContain("Mis tareas");
    expect(labels).not.toContain("Chat");
  });

  it("denies a known path and ignores an unknown one", () => {
    expect(accessFor("/usuarios", ["INVESTIGADOR"])).toBe("denied");
    expect(canAccess("/usuarios", ["INVESTIGADOR"])).toBe(false);
    expect(accessFor("/convocatorias", ["ADMINISTRADOR"])).toBe("unknown");
    expect(accessFor("/proyectos/123", ["COORDINADOR"])).toBe("unknown");
    expect(canAccess("/presupuesto", ["ADMINISTRADOR"])).toBe(true);
  });
});

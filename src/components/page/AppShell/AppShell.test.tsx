import { render, screen, within } from "@testing-library/react";
import type { ReactElement } from "react";
import { ThemeProvider } from "styled-components";
import { describe, expect, it } from "vitest";

import { theme } from "@/theme";

import { AppShell } from "./AppShell";

function renderWithTheme(ui: ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

function sections() {
  return within(screen.getByRole("navigation", { name: "Secciones", hidden: true }));
}

describe("AppShell", () => {
  it("hides coordinator and administrator sections from an investigator", () => {
    renderWithTheme(
      <AppShell
        identity={{ displayName: "Ana Ruiz", roles: ["INVESTIGADOR"] }}
        pathname="/mis-tareas"
      >
        <h1>Mis tareas</h1>
      </AppShell>,
    );
    expect(sections().getByRole("link", { name: "Mis tareas", hidden: true })).toBeInTheDocument();
    expect(
      sections().queryByRole("link", { name: "Presupuesto", hidden: true }),
    ).not.toBeInTheDocument();
    expect(
      sections().queryByRole("link", { name: "Usuarios", hidden: true }),
    ).not.toBeInTheDocument();
    expect(
      sections().queryByRole("link", { name: "Institucional", hidden: true }),
    ).not.toBeInTheDocument();
    expect(
      sections().queryByRole("link", { name: "Dashboard", hidden: true }),
    ).not.toBeInTheDocument();
  });

  it("hides administrator sections from a coordinator", () => {
    renderWithTheme(
      <AppShell
        identity={{ displayName: "Luis Gómez", roles: ["COORDINADOR"] }}
        pathname="/dashboard"
      />,
    );
    expect(sections().getByRole("link", { name: "Dashboard", hidden: true })).toBeInTheDocument();
    expect(
      sections().queryByRole("link", { name: "Usuarios", hidden: true }),
    ).not.toBeInTheDocument();
    expect(
      sections().queryByRole("link", { name: "Institucional", hidden: true }),
    ).not.toBeInTheDocument();
  });

  it("hides convocatorias and auditoría from an administrator", () => {
    renderWithTheme(
      <AppShell
        identity={{ displayName: "Marta Herrera", roles: ["ADMINISTRADOR"] }}
        pathname="/institucional"
      />,
    );
    expect(
      sections().getByRole("link", { name: "Institucional", hidden: true }),
    ).toBeInTheDocument();
    expect(
      sections().queryByRole("link", { name: "Convocatorias", hidden: true }),
    ).not.toBeInTheDocument();
    expect(
      sections().queryByRole("link", { name: "Auditoría", hidden: true }),
    ).not.toBeInTheDocument();
    expect(sections().getByRole("link", { name: "Usuarios", hidden: true })).toBeInTheDocument();
  });

  it("shows quantia.udc breadcrumb on convocatoria detail for an administrator", () => {
    renderWithTheme(
      <AppShell
        identity={{ displayName: "Marta Herrera", roles: ["ADMINISTRADOR"] }}
        pathname="/convocatorias/2026-01"
      >
        <h1>Convocatoria</h1>
      </AppShell>,
    );
    const crumbs = within(screen.getByRole("navigation", { name: "Migas de pan" }));
    expect(crumbs.getByRole("link", { name: "quantia.udc" })).toHaveAttribute(
      "href",
      "/institucional",
    );
    expect(crumbs.getByText("convocatorias/2026-01")).toBeInTheDocument();
  });

  it("blocks convocatoria deep links for non-administrators", () => {
    renderWithTheme(
      <AppShell
        identity={{ displayName: "Luis Gómez", roles: ["COORDINADOR"] }}
        pathname="/convocatorias/2026-01"
      >
        <h1>Convocatoria</h1>
      </AppShell>,
    );
    expect(screen.getByText("No tienes permiso para ver esta sección")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Convocatoria" })).not.toBeInTheDocument();
  });

  it("blocks auditoría deep links for non-administrators", () => {
    renderWithTheme(
      <AppShell
        identity={{ displayName: "Luis Gómez", roles: ["COORDINADOR"] }}
        pathname="/auditoria"
      >
        <h1>Auditoría</h1>
      </AppShell>,
    );
    expect(screen.getByText("No tienes permiso para ver esta sección")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Auditoría" })).not.toBeInTheDocument();
  });

  it("keeps the screen mounted when the session expires", () => {
    renderWithTheme(
      <AppShell
        identity={{ displayName: "Ana Ruiz", roles: ["INVESTIGADOR"] }}
        pathname="/mis-tareas"
        sessionExpired
      >
        <h1>Mis tareas</h1>
      </AppShell>,
    );
    expect(screen.getByRole("heading", { name: "Mis tareas", hidden: true })).toBeInTheDocument();
    expect(screen.getByText("Tu sesión expiró")).toBeInTheDocument();
    expect(sections().getByRole("link", { name: "Mis tareas", hidden: true })).toBeInTheDocument();
  });

  it("does not paint navigation without an identity", () => {
    renderWithTheme(<AppShell identity={null} pathname="/mis-tareas" />);
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
    expect(screen.getByText("Tu sesión expiró")).toBeInTheDocument();
  });

  it("shows a permission state for a forbidden catalog path and omits it from the nav", () => {
    renderWithTheme(
      <AppShell
        identity={{ displayName: "Ana Ruiz", roles: ["INVESTIGADOR"] }}
        pathname="/usuarios"
      >
        <h1>Usuarios</h1>
      </AppShell>,
    );
    expect(screen.getByText("No tienes permiso para ver esta sección")).toBeInTheDocument();
    expect(
      sections().queryByRole("link", { name: "Usuarios", hidden: true }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Usuarios" })).not.toBeInTheDocument();
  });

  it("points the skip link at the content landmark", () => {
    renderWithTheme(
      <AppShell
        identity={{ displayName: "Ana Ruiz", roles: ["INVESTIGADOR"] }}
        pathname="/mis-tareas"
      />,
    );
    expect(screen.getByRole("link", { name: "Saltar al contenido", hidden: true })).toHaveAttribute(
      "href",
      "#contenido",
    );
    expect(document.getElementById("contenido")?.tagName).toBe("MAIN");
  });
});

import { render, screen, within } from "@testing-library/react";
import type { ReactElement } from "react";
import { ThemeProvider } from "styled-components";
import { describe, expect, it, vi } from "vitest";

import { theme } from "@/theme";

import { AppShell } from "./AppShell";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}));

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
        identity={{ displayName: "Ana Ruiz", roles: ["INVESTIGADOR"], avatar: null }}
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
        identity={{ displayName: "Luis Gómez", roles: ["COORDINADOR"], avatar: null }}
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

  it("lists convocatorias and auditoría as «soon» for an administrator", () => {
    renderWithTheme(
      <AppShell
        identity={{ displayName: "Marta Herrera", roles: ["ADMINISTRADOR"], avatar: null }}
        pathname="/institucional"
      />,
    );
    expect(sections().getByRole("link", { name: /Convocatorias/, hidden: true })).toHaveAttribute(
      "href",
      "/convocatorias",
    );
    expect(sections().getByRole("link", { name: /Auditoría/, hidden: true })).toHaveAttribute(
      "href",
      "/auditoria",
    );
    expect(sections().getAllByText("Pronto", { exact: false }).length).toBeGreaterThan(0);
    expect(sections().getByRole("link", { name: "Usuarios", hidden: true })).toBeInTheDocument();
  });

  it("hides convocatorias and auditoría from coordinators", () => {
    renderWithTheme(
      <AppShell
        identity={{ displayName: "Luis Gómez", roles: ["COORDINADOR"], avatar: null }}
        pathname="/dashboard"
      />,
    );
    expect(
      sections().queryByRole("link", { name: /Convocatorias/, hidden: true }),
    ).not.toBeInTheDocument();
    expect(
      sections().queryByRole("link", { name: /Auditoría/, hidden: true }),
    ).not.toBeInTheDocument();
  });

  it("blocks convocatorias for non-administrators", () => {
    renderWithTheme(
      <AppShell
        identity={{ displayName: "Luis Gómez", roles: ["COORDINADOR"], avatar: null }}
        pathname="/convocatorias"
      >
        <h1>Convocatorias</h1>
      </AppShell>,
    );
    expect(screen.getByText("No tienes acceso")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Convocatorias" })).not.toBeInTheDocument();
  });

  it("blocks auditoría deep links for non-administrators", () => {
    renderWithTheme(
      <AppShell
        identity={{ displayName: "Luis Gómez", roles: ["COORDINADOR"], avatar: null }}
        pathname="/auditoria"
      >
        <h1>Auditoría</h1>
      </AppShell>,
    );
    expect(screen.getByText("No tienes acceso")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Volver" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Auditoría" })).not.toBeInTheDocument();
  });

  it("keeps the screen mounted when the session expires", () => {
    renderWithTheme(
      <AppShell
        identity={{ displayName: "Ana Ruiz", roles: ["INVESTIGADOR"], avatar: null }}
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
        identity={{ displayName: "Ana Ruiz", roles: ["INVESTIGADOR"], avatar: null }}
        pathname="/usuarios"
      >
        <h1>Usuarios</h1>
      </AppShell>,
    );
    expect(screen.getByText("No tienes acceso")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Volver" })).toBeInTheDocument();
    expect(
      sections().queryByRole("link", { name: "Usuarios", hidden: true }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Usuarios" })).not.toBeInTheDocument();
  });

  it("points the skip link at the content landmark", () => {
    renderWithTheme(
      <AppShell
        identity={{ displayName: "Ana Ruiz", roles: ["INVESTIGADOR"], avatar: null }}
        pathname="/mis-tareas"
      />,
    );
    expect(screen.getByRole("link", { name: "Saltar al contenido", hidden: true })).toHaveAttribute(
      "href",
      "#contenido",
    );
    expect(document.getElementById("contenido")?.tagName).toBe("MAIN");
  });

  it("surfaces ConnectionStatus in the header when the socket is down", () => {
    renderWithTheme(
      <AppShell
        identity={{ displayName: "Ana Ruiz", roles: ["INVESTIGADOR"], avatar: null }}
        pathname="/mis-tareas"
        connection="disconnected"
        onReconnect={() => undefined}
      />,
    );
    const banner = screen.getByRole("status");
    expect(banner).toHaveAttribute("aria-live", "polite");
    expect(banner).toHaveTextContent("Datos posiblemente desactualizados");
  });

  it("shows the account avatar in the header and sidebar profile", () => {
    renderWithTheme(
      <AppShell
        identity={{ displayName: "Ana Ruiz", roles: ["INVESTIGADOR"], avatar: "AVATAR_02" }}
        pathname="/mis-tareas"
      />,
    );
    const avatars = document.querySelectorAll('[data-avatar="AVATAR_02"]');
    expect(avatars.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByRole("button", { name: /cuenta de Ana Ruiz/i })).toBeInTheDocument();
  });
});

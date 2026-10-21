import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { ThemeProvider } from "styled-components";
import { describe, expect, it } from "vitest";

import { theme } from "@/theme";

import { DataTable } from "./DataTable";
import { KpiPanel } from "./KpiPanel";
import { ProgressChart } from "./ProgressChart";
import { RoleSidebar } from "./RoleSidebar";

function renderWithTheme(ui: ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

describe("page components", () => {
  it("exposes aria-sort on sortable columns", () => {
    renderWithTheme(
      <DataTable
        caption="Proyectos"
        rows={[{ id: "1", name: "GITEMOS" }]}
        getRowId={(row) => row.id}
        sort={{ columnId: "name", direction: "asc" }}
        columns={[{ id: "name", header: "Nombre", sortable: true, cell: (row) => row.name }]}
      />,
    );
    expect(screen.getByRole("columnheader", { name: "Nombre" })).toHaveAttribute(
      "aria-sort",
      "ascending",
    );
  });

  it("never renders more than four metrics", () => {
    renderWithTheme(
      <KpiPanel
        period="Octubre 2026"
        metrics={[
          { id: "1", label: "Uno", value: "1" },
          { id: "2", label: "Dos", value: "2" },
          { id: "3", label: "Tres", value: "3" },
          { id: "4", label: "Cuatro", value: "4" },
          { id: "5", label: "Cinco", value: "5" },
        ]}
      />,
    );
    expect(screen.getAllByRole("article")).toHaveLength(4);
    expect(screen.queryByText("Cinco")).not.toBeInTheDocument();
  });

  it("offers a table alternative for the chart", () => {
    renderWithTheme(
      <ProgressChart
        title="Avance"
        period="Octubre"
        series={[{ id: "real", name: "Ejecutado" }]}
        points={[{ label: "Oct", values: { real: 64 } }]}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Ver como tabla" }));
    expect(screen.getByRole("table", { name: "Avance" })).toBeInTheDocument();
  });

  it("omits navigation items the parent did not pass", () => {
    renderWithTheme(
      <RoleSidebar
        items={[
          { href: "/mis-tareas", label: "Mis tareas" },
          { href: "/grupo", label: "Grupo" },
        ]}
        currentPath="/mis-tareas"
        profileName="Ana Ruiz"
      />,
    );
    expect(screen.getByRole("link", { name: "Mis tareas" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.queryByText("Presupuesto")).not.toBeInTheDocument();
    expect(screen.queryByText("Auditoría")).not.toBeInTheDocument();
  });
});

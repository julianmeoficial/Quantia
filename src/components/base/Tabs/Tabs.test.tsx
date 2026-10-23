import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "styled-components";
import { describe, expect, it, vi } from "vitest";

import { theme } from "@/theme";

import { Tabs } from "./Tabs";

describe("Tabs", () => {
  it("renders tablist and the active panel from the controlled value", () => {
    const onValueChange = vi.fn();
    render(
      <ThemeProvider theme={theme}>
        <Tabs
          label="Secciones del proyecto"
          value="bitacora"
          onValueChange={onValueChange}
          items={[
            { value: "tareas", label: "Tareas", content: <p>Lista de tareas</p> },
            { value: "bitacora", label: "Bitácora", content: <p>Entradas de bitácora</p> },
            { value: "documentos", label: "Documentos", content: <p>Tabla de documentos</p> },
          ]}
        />
      </ThemeProvider>,
    );

    expect(screen.getByRole("tablist", { name: "Secciones del proyecto" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Bitácora" })).toHaveAttribute("data-state", "active");
    expect(screen.getByText("Entradas de bitácora")).toBeVisible();
    expect(screen.queryByText("Lista de tareas")).not.toBeInTheDocument();
  });
});

import { fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider } from "styled-components";
import { describe, expect, it, vi } from "vitest";

import { theme } from "@/theme";

import { Sheet } from "./Sheet";

describe("Sheet", () => {
  it("renders title and body when open", () => {
    render(
      <ThemeProvider theme={theme}>
        <Sheet open onOpenChange={() => undefined} title="Registrar avance" description="Contexto">
          <p>Contenido del formulario</p>
        </Sheet>
      </ThemeProvider>,
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Registrar avance")).toBeVisible();
    expect(screen.getByText("Contenido del formulario")).toBeVisible();
  });

  it("exposes a close control", () => {
    const onOpenChange = vi.fn();
    render(
      <ThemeProvider theme={theme}>
        <Sheet open onOpenChange={onOpenChange} title="Registrar avance">
          <p>Formulario</p>
        </Sheet>
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Cerrar panel" }));
    expect(onOpenChange).toHaveBeenCalled();
  });
});

import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "styled-components";
import { describe, expect, it } from "vitest";

import { theme } from "@/theme";

import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("marks no-records and no-results distinctly", () => {
    const { rerender } = render(
      <ThemeProvider theme={theme}>
        <EmptyState
          kind="no-records"
          title="Sin proyectos en esta convocatoria"
          description="Aún no hay proyectos."
        />
      </ThemeProvider>,
    );
    expect(
      screen.getByRole("heading", { name: "Sin proyectos en esta convocatoria" }),
    ).toBeInTheDocument();
    expect(document.querySelector('[data-kind="no-records"]')).toBeTruthy();

    rerender(
      <ThemeProvider theme={theme}>
        <EmptyState
          kind="no-results"
          title="No encontramos proyectos con estos filtros"
          description="Limpia los filtros."
        />
      </ThemeProvider>,
    );
    expect(document.querySelector('[data-kind="no-results"]')).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: "No encontramos proyectos con estos filtros" }),
    ).toBeInTheDocument();
  });
});

import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "styled-components";
import { describe, expect, it } from "vitest";

import { theme } from "@/theme";

import { Checkbox } from "./Checkbox";

describe("Checkbox", () => {
  it("supports the indeterminate state", () => {
    render(
      <ThemeProvider theme={theme}>
        <Checkbox label="Seleccionar filas" checked="indeterminate" />
      </ThemeProvider>,
    );
    const checkbox = screen.getByRole("checkbox", { name: "Seleccionar filas" });
    expect(checkbox).toHaveAttribute("data-state", "indeterminate");
  });
});

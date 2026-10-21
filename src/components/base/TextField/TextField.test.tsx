import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "styled-components";
import { describe, expect, it } from "vitest";

import { theme } from "@/theme";

import { TextField } from "./TextField";

describe("TextField", () => {
  it("associates the error message with the input", () => {
    render(
      <ThemeProvider theme={theme}>
        <TextField
          label="Nombre del proyecto"
          error="Ingresa un nombre con al menos 2 caracteres."
        />
      </ThemeProvider>,
    );
    const input = screen.getByLabelText("Nombre del proyecto");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Ingresa un nombre con al menos 2 caracteres.");
  });
});

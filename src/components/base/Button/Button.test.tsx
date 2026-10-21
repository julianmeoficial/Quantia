import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { ThemeProvider } from "styled-components";
import { describe, expect, it } from "vitest";

import { theme } from "@/theme";

import { Button } from "./Button";

function renderButton(ui: ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

describe("Button", () => {
  it("renders the visible label", () => {
    renderButton(<Button>Guardar avance</Button>);
    expect(screen.getByRole("button", { name: "Guardar avance" })).toBeInTheDocument();
  });

  it("exposes aria-busy while loading and keeps the label in the accessibility tree", () => {
    renderButton(<Button isLoading>Guardando</Button>);
    const button = screen.getByRole("button", { name: "Guardando" });
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).not.toBeDisabled();
  });
});

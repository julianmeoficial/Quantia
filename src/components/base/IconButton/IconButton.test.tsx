import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "styled-components";
import { describe, expect, it } from "vitest";

import { XIcon } from "@/components/base/icons";
import { theme } from "@/theme";

import { IconButton } from "./IconButton";

describe("IconButton", () => {
  it("exposes the required accessible name", () => {
    render(
      <ThemeProvider theme={theme}>
        <IconButton accessibleLabel="Abrir acciones del proyecto" icon={<XIcon />} />
      </ThemeProvider>,
    );
    expect(screen.getByRole("button", { name: "Abrir acciones del proyecto" })).toBeInTheDocument();
  });
});

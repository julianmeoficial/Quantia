import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "styled-components";
import { describe, expect, it } from "vitest";

import { theme } from "@/theme";

import { ConnectionStatus } from "./ConnectionStatus";

describe("ConnectionStatus", () => {
  it("renders nothing when connected", () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <ConnectionStatus state="connected" />
      </ThemeProvider>,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the outdated-data banner when disconnected", () => {
    render(
      <ThemeProvider theme={theme}>
        <ConnectionStatus state="disconnected" onReconnect={() => undefined} />
      </ThemeProvider>,
    );
    expect(screen.getByText("Datos posiblemente desactualizados")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reconectar" })).toBeInTheDocument();
  });
});

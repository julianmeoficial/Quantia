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
    const banner = screen.getByRole("status");
    expect(banner).toHaveAttribute("aria-live", "polite");
    expect(banner).toHaveTextContent("Datos posiblemente desactualizados");
    expect(screen.getByRole("button", { name: "Reconectar" })).toBeInTheDocument();
  });

  it("announces reconnecting politely without a reconnect button", () => {
    render(
      <ThemeProvider theme={theme}>
        <ConnectionStatus state="reconnecting" onReconnect={() => undefined} />
      </ThemeProvider>,
    );
    const banner = screen.getByRole("status");
    expect(banner).toHaveAttribute("aria-live", "polite");
    expect(banner).toHaveTextContent("Reconectando…");
    expect(screen.queryByRole("button", { name: "Reconectar" })).not.toBeInTheDocument();
  });
});

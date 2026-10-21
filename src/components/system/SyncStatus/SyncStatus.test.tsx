import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "styled-components";
import { describe, expect, it, vi } from "vitest";

import { theme } from "@/theme";

import { SyncStatus } from "./SyncStatus";

describe("SyncStatus", () => {
  it("hides retry when canRetry is false", () => {
    render(
      <ThemeProvider theme={theme}>
        <SyncStatus status="failed" persisted canRetry={false} onRetry={vi.fn()} />
      </ThemeProvider>,
    );
    expect(screen.queryByRole("button", { name: "Reintentar" })).not.toBeInTheDocument();
  });

  it("shows retry when canRetry is true", () => {
    render(
      <ThemeProvider theme={theme}>
        <SyncStatus status="failed" persisted canRetry onRetry={vi.fn()} />
      </ThemeProvider>,
    );
    expect(screen.getByRole("button", { name: "Reintentar" })).toBeInTheDocument();
  });
});

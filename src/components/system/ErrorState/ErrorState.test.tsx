import { act, render, screen } from "@testing-library/react";
import { ThemeProvider } from "styled-components";
import { describe, expect, it, vi } from "vitest";

import { theme } from "@/theme";

import { ErrorState } from "./ErrorState";

describe("ErrorState", () => {
  it("forbidden copy never reveals a resource id", () => {
    render(
      <ThemeProvider theme={theme}>
        <ErrorState variant="forbidden" />
      </ThemeProvider>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("No tienes permiso");
    expect(screen.queryByText(/[0-9a-f-]{36}/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/\/api\//i)).not.toBeInTheDocument();
  });

  it("disables retry while the rate-limit countdown runs", () => {
    vi.useFakeTimers();
    render(
      <ThemeProvider theme={theme}>
        <ErrorState variant="rate-limit" retryAfterSeconds={3} onRetry={() => undefined} />
      </ThemeProvider>,
    );
    expect(screen.getByRole("button", { name: "Reintentar" })).toBeDisabled();
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.getByRole("button", { name: "Reintentar" })).not.toBeDisabled();
    vi.useRealTimers();
  });
});

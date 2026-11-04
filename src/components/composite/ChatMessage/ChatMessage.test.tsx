import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { ThemeProvider } from "styled-components";
import { describe, expect, it, vi } from "vitest";

import { theme } from "@/theme";

import { ChatMessage } from "./ChatMessage";

function renderWithTheme(ui: ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

const baseMessage = {
  id: "m1",
  content: "Avance del viernes",
  clientMessageId: "c1",
  createdAt: "2026-11-04T20:05:00.000Z",
  author: { id: "u1", name: "Ana Pérez", avatarUrl: null },
};

describe("ChatMessage", () => {
  it("shows author, time and plain content for peer messages", () => {
    renderWithTheme(<ChatMessage message={baseMessage} isOwn={false} />);
    expect(screen.getByText("Ana Pérez")).toBeInTheDocument();
    expect(screen.getByText("Avance del viernes")).toBeInTheDocument();
    expect(screen.getByText("15:05")).toBeInTheDocument();
  });

  it("offers retry when delivery failed", () => {
    const onRetry = vi.fn();
    renderWithTheme(
      <ChatMessage message={baseMessage} isOwn deliveryState="failed" onRetry={onRetry} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});

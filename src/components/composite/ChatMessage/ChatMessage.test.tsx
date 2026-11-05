import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { ThemeProvider } from "styled-components";
import { describe, expect, it, vi } from "vitest";

import { ANA_ID, LUIS_ID, chatMessage, presenceUser } from "@/test/chatFixtures";
import { theme } from "@/theme";

import { ChatMessage } from "./ChatMessage";

function renderWithTheme(ui: ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

const baseMessage = chatMessage({
  content: "Avance del viernes",
  clientMessageId: "c1",
  createdAt: "2026-11-04T20:05:00.000Z",
  author: presenceUser({ name: "Ana Pérez" }),
});

describe("ChatMessage", () => {
  it("shows author, time and plain content for peer messages", () => {
    renderWithTheme(<ChatMessage message={baseMessage} isOwn={false} />);
    expect(screen.getByText("Ana Pérez")).toBeInTheDocument();
    expect(screen.getByText("Avance del viernes")).toBeInTheDocument();
    expect(screen.getByText("15:05")).toBeInTheDocument();
  });

  it("renders content as text, never as HTML", () => {
    const message = chatMessage({ content: "<img src=x onerror=alert(1)>" });
    const { container } = renderWithTheme(<ChatMessage message={message} />);
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByText("<img src=x onerror=alert(1)>")).toBeInTheDocument();
  });

  it("offers retry and discard when delivery failed", () => {
    const onRetry = vi.fn();
    const onDiscard = vi.fn();
    renderWithTheme(
      <ChatMessage
        message={baseMessage}
        isOwn
        deliveryState="failed"
        onRetry={onRetry}
        onDiscard={onDiscard}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));
    fireEvent.click(screen.getByRole("button", { name: "Descartar" }));
    expect(onRetry).toHaveBeenCalledOnce();
    expect(onDiscard).toHaveBeenCalledOnce();
  });

  it("shows edited mark, quote and «visto por» ticks on own messages", () => {
    const parent = chatMessage({ author: presenceUser({ id: LUIS_ID, name: "Luis" }) });
    const message = chatMessage({
      editedAt: "2026-11-04T20:06:00.000Z",
      replyTo: {
        id: parent.id,
        seq: parent.seq,
        author: parent.author,
        excerpt: "Plan",
        deleted: false,
      },
    });
    const onQuoteClick = vi.fn();
    renderWithTheme(<ChatMessage message={message} isOwn seenBy={2} onQuoteClick={onQuoteClick} />);
    expect(screen.getByText("editado")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Visto por 2 personas" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Ir al mensaje de Luis/ }));
    expect(onQuoteClick).toHaveBeenCalledWith(parent.id);
  });

  it("toggles reactions from chips and the picker", () => {
    const onReact = vi.fn();
    const message = chatMessage({
      reactions: [{ emoji: "🔥", count: 2, userIds: [ANA_ID, LUIS_ID] }],
    });
    renderWithTheme(
      <ChatMessage
        message={message}
        meId={ANA_ID}
        reactionOptions={["👍", "🔥"]}
        onReact={onReact}
      />,
    );
    const chip = screen.getByRole("button", { name: /🔥 2 reacciones, incluida la tuya/ });
    expect(chip).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(chip);
    expect(onReact).toHaveBeenLastCalledWith("🔥");

    fireEvent.click(screen.getByRole("button", { name: "Reaccionar" }));
    fireEvent.click(screen.getByRole("button", { name: "Reaccionar con 👍" }));
    expect(onReact).toHaveBeenLastCalledWith("👍");
  });

  it("only exposes edit/delete when permitted", () => {
    renderWithTheme(
      <ChatMessage
        message={baseMessage}
        isOwn
        canEdit
        onEdit={() => undefined}
        onReply={() => undefined}
      />,
    );
    expect(screen.getByRole("button", { name: "Editar mensaje" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Eliminar mensaje" })).toBeNull();
  });
});

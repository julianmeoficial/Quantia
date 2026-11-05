import { fireEvent, render, screen } from "@testing-library/react";
import { useState, type ReactElement } from "react";
import { ThemeProvider } from "styled-components";
import { describe, expect, it, vi } from "vitest";

import { theme } from "@/theme";

import { MessageComposer } from "./MessageComposer";

function renderWithTheme(ui: ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

function Harness({ onSend }: { onSend: () => void }) {
  const [value, setValue] = useState("hola");
  return <MessageComposer value={value} onChange={setValue} onSend={onSend} maxLength={2000} />;
}

describe("MessageComposer", () => {
  it("sends on Enter and keeps Shift+Enter as a newline", () => {
    const onSend = vi.fn();
    renderWithTheme(<Harness onSend={onSend} />);
    const field = screen.getByLabelText("Mensaje");

    fireEvent.keyDown(field, { key: "Enter", shiftKey: true });
    expect(onSend).not.toHaveBeenCalled();

    fireEvent.keyDown(field, { key: "Enter", shiftKey: false });
    expect(onSend).toHaveBeenCalledOnce();
  });

  it("shows the counter only near the limit", () => {
    const { rerender } = renderWithTheme(
      <MessageComposer
        value="abc"
        onChange={() => undefined}
        onSend={() => undefined}
        maxLength={10}
      />,
    );
    expect(screen.queryByText("3/10")).toBeNull();
    rerender(
      <ThemeProvider theme={theme}>
        <MessageComposer
          value="abcdefghi"
          onChange={() => undefined}
          onSend={() => undefined}
          maxLength={10}
        />
      </ThemeProvider>,
    );
    expect(screen.getByText("9/10")).toBeInTheDocument();
  });

  it("shows the reply context and cancels it with Escape", () => {
    const onCancel = vi.fn();
    renderWithTheme(
      <MessageComposer
        value=""
        onChange={() => undefined}
        onSend={() => undefined}
        maxLength={2000}
        context={{ title: "Respondiendo a Luis", excerpt: "Plan de trabajo" }}
        onCancelContext={onCancel}
      />,
    );
    expect(screen.getByText("Respondiendo a Luis")).toBeInTheDocument();
    fireEvent.keyDown(screen.getByLabelText("Mensaje"), { key: "Escape" });
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("switches to edit mode with its own primary action", () => {
    renderWithTheme(
      <MessageComposer
        value="hola"
        onChange={() => undefined}
        onSend={() => undefined}
        maxLength={2000}
        mode="edit"
        context={{ title: "Editando mensaje", excerpt: "hola" }}
        onCancelContext={() => undefined}
      />,
    );
    expect(screen.getByLabelText("Editar mensaje")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Guardar cambios" })).toBeInTheDocument();
  });
});

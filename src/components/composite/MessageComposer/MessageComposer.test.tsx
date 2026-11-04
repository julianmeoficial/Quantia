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

  it("shows the visible character counter", () => {
    renderWithTheme(
      <MessageComposer
        value="abc"
        onChange={() => undefined}
        onSend={() => undefined}
        maxLength={10}
      />,
    );
    expect(screen.getByText("3/10")).toBeInTheDocument();
  });
});

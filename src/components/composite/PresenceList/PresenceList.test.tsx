import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { ThemeProvider } from "styled-components";
import { describe, expect, it } from "vitest";

import { theme } from "@/theme";

import { PresenceList } from "./PresenceList";

function renderWithTheme(ui: ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

describe("PresenceList", () => {
  it("shows the online count and participant names", () => {
    renderWithTheme(
      <PresenceList
        connectionState="connected"
        users={[
          { id: "11111111-1111-4111-8111-111111111111", name: "Ana Pérez", avatarUrl: null },
          { id: "22222222-2222-4222-8222-222222222222", name: "Luis Gómez", avatarUrl: null },
        ]}
      />,
    );
    expect(screen.getByText("2 en línea")).toBeInTheDocument();
    expect(screen.getByText("Ana Pérez")).toBeInTheDocument();
    expect(screen.getByText("Luis Gómez")).toBeInTheDocument();
  });

  it("shows an empty copy when nobody is online", () => {
    renderWithTheme(<PresenceList connectionState="connected" users={[]} />);
    expect(screen.getByText("Nadie en línea")).toBeInTheDocument();
  });
});

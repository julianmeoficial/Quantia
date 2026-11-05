import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { ThemeProvider } from "styled-components";
import { describe, expect, it } from "vitest";

import { LUIS_ID, presenceUser } from "@/test/chatFixtures";
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
          presenceUser({ name: "Ana Pérez" }),
          presenceUser({ id: LUIS_ID, name: "Luis Gómez", avatar: "AVATAR_02" }),
        ]}
      />,
    );
    expect(screen.getByText("2 en línea")).toBeInTheDocument();
    expect(screen.getByText("Ana Pérez")).toBeInTheDocument();
    expect(screen.getByText("Luis Gómez")).toBeInTheDocument();
  });

  it("shows who is typing and who left recently", () => {
    renderWithTheme(
      <PresenceList
        connectionState="connected"
        users={[presenceUser({ name: "Ana Pérez" })]}
        typingIds={new Set([presenceUser().id])}
        recent={[
          {
            user: presenceUser({ id: LUIS_ID, name: "Luis Gómez" }),
            lastSeenAt: "2026-11-04T20:05:00.000Z",
          },
        ]}
      />,
    );
    expect(screen.getByText("escribiendo…")).toBeInTheDocument();
    expect(screen.getByText(/visto por última vez a las 15:05/)).toBeInTheDocument();
  });

  it("shows an empty copy when nobody is online", () => {
    renderWithTheme(<PresenceList connectionState="connected" users={[]} />);
    expect(screen.getByText("Nadie en línea")).toBeInTheDocument();
  });
});

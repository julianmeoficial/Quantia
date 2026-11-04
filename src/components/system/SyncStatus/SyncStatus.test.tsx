import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { ThemeProvider } from "styled-components";
import { describe, expect, it, vi } from "vitest";

import { theme } from "@/theme";

import { SyncStatus } from "./SyncStatus";

function renderStatus(ui: ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

describe("SyncStatus", () => {
  it("hides retry when canRetry is false", () => {
    renderStatus(<SyncStatus status="failed" persisted canRetry={false} onRetry={vi.fn()} />);
    expect(screen.queryByRole("button", { name: "Reintentar" })).not.toBeInTheDocument();
  });

  it("shows retry when canRetry is true", () => {
    renderStatus(<SyncStatus status="failed" persisted canRetry onRetry={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Reintentar" })).toBeInTheDocument();
  });

  it("uses entity-specific failed copy for tasks", () => {
    renderStatus(<SyncStatus status="failed" persisted entity="task" />);
    expect(
      screen.getByText("La tarea está guardada, pero no se pudo sincronizar con Notion"),
    ).toBeInTheDocument();
  });

  it("uses entity-specific failed copy for projects", () => {
    renderStatus(<SyncStatus status="failed" persisted entity="project" />);
    expect(
      screen.getByText("El proyecto está guardado, pero no se pudo sincronizar con Notion"),
    ).toBeInTheDocument();
  });

  it("shows pending label when persisted", () => {
    renderStatus(<SyncStatus status="pending" persisted />);
    expect(screen.getByText("Guardado. Sincronizando con Notion")).toBeInTheDocument();
  });

  it("hides pending when not yet persisted", () => {
    const { container } = renderStatus(<SyncStatus status="pending" persisted={false} />);
    expect(container).toBeEmptyDOMElement();
  });
});

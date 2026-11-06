import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { ThemeProvider } from "styled-components";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { theme } from "@/theme";

import { MyTasksScreen } from "./MyTasksScreen";

function renderScreen(ui: ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <ThemeProvider theme={theme}>{ui}</ThemeProvider>
    </QueryClientProvider>,
  );
}

const reload = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/features/auth/AuthProvider", () => ({
  useAuth: () => ({
    user: { id: "user-1", fullName: "Ana Ruiz", roles: ["INVESTIGADOR"] },
    identity: { displayName: "Ana Ruiz", roles: ["INVESTIGADOR"], avatar: null },
    status: "authenticated",
  }),
}));

vi.mock("./useMyTasks", () => ({
  useMyTasks: () => mockUseMyTasks(),
}));

let mockUseMyTasks: () => unknown;

describe("MyTasksScreen", () => {
  beforeEach(() => {
    reload.mockReset();
  });

  it("shows skeleton while loading", () => {
    mockUseMyTasks = () => ({
      status: "loading",
      data: null,
      error: null,
      reload,
    });
    renderScreen(<MyTasksScreen />);
    expect(screen.getAllByText("Cargando…").length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: "Mis tareas" })).toBeInTheDocument();
  });

  it("shows empty state copy from the checklist", () => {
    mockUseMyTasks = () => ({
      status: "ready",
      data: { tasks: [], monthProgressCount: 0, partialFailures: 0 },
      error: null,
      reload,
    });
    renderScreen(<MyTasksScreen />);
    expect(screen.getByText("No tienes tareas pendientes")).toBeInTheDocument();
    expect(screen.getByText("Tareas vencidas")).toBeInTheDocument();
    expect(screen.getByText("Esta semana")).toBeInTheDocument();
    expect(screen.getByText("Avances del mes")).toBeInTheDocument();
  });

  it("renders KPI values and grouped task titles", () => {
    const project = {
      id: "p1",
      title: "GITEMOS-02",
      description: null,
      objectives: null,
      status: "ACTIVE",
      startDate: null,
      endDate: null,
      coordinatorId: "coord-1",
      createdById: "coord-1",
      memberIds: ["user-1"],
      syncStatus: "SYNCED",
      createdAt: "2026-10-01T00:00:00.000Z",
      updatedAt: "2026-10-01T00:00:00.000Z",
    };
    mockUseMyTasks = () => ({
      status: "ready",
      data: {
        monthProgressCount: 4,
        partialFailures: 0,
        tasks: [
          {
            id: "t1",
            projectId: "p1",
            projectTitle: "GITEMOS-02",
            project,
            title: "Encuesta piloto",
            description: null,
            assigneeId: "user-1",
            status: "IN_PROGRESS",
            priority: "HIGH",
            dueDate: "2026-10-20T05:00:00.000Z",
            syncStatus: "SYNCED",
            createdAt: "2026-10-01T00:00:00.000Z",
            updatedAt: "2026-10-01T00:00:00.000Z",
          },
          {
            id: "t2",
            projectId: "p1",
            projectTitle: "GITEMOS-02",
            project,
            title: "Informe parcial",
            description: null,
            assigneeId: "user-1",
            status: "TODO",
            priority: "MEDIUM",
            dueDate: "2026-10-25T05:00:00.000Z",
            syncStatus: "SYNCED",
            createdAt: "2026-10-01T00:00:00.000Z",
            updatedAt: "2026-10-01T00:00:00.000Z",
          },
        ],
      },
      error: null,
      reload,
    });
    renderScreen(<MyTasksScreen />);
    expect(screen.getAllByText("Encuesta piloto").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Informe parcial").length).toBeGreaterThan(0);
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Aplicar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ver mi proyecto" })).toBeInTheDocument();
  });
});

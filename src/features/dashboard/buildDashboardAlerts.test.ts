import { describe, expect, it } from "vitest";

import { buildDashboardAlerts, taskCompletionPercent } from "./buildDashboardAlerts";

const baseProject = {
  description: null,
  objectives: null,
  startDate: null,
  endDate: null,
  coordinatorId: "coord-1",
  createdById: "coord-1",
  memberIds: [] as string[],
  syncStatus: "SYNCED" as const,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("buildDashboardAlerts", () => {
  it("ignores non-delayed projects", () => {
    const alerts = buildDashboardAlerts([
      {
        ...baseProject,
        id: "p1",
        title: "Activo",
        status: "ACTIVE",
      },
    ]);
    expect(alerts).toHaveLength(0);
  });

  it("marks critical when execution leads progress by 20 points", () => {
    const alerts = buildDashboardAlerts(
      [
        {
          ...baseProject,
          id: "p2",
          title: "Observatorio",
          status: "DELAYED",
        },
      ],
      [{ projectId: "p2", executedPercent: 78 }],
      [{ projectId: "p2", progressPercent: 45 }],
    );
    expect(alerts).toHaveLength(1);
    expect(alerts[0]?.severity).toBe("critical");
    expect(alerts[0]?.interpretation).toContain("Ejecución");
    expect(alerts[0]?.href).toBe("/proyectos/p2");
  });

  it("falls back to attention without inventing budget figures", () => {
    const alerts = buildDashboardAlerts([
      {
        ...baseProject,
        id: "p3",
        title: "Sensores",
        status: "DELAYED",
      },
    ]);
    expect(alerts[0]?.severity).toBe("attention");
    expect(alerts[0]?.interpretation).not.toMatch(/%/);
  });
});

describe("taskCompletionPercent", () => {
  it("returns null for empty totals", () => {
    expect(taskCompletionPercent(0, 0)).toBeNull();
  });

  it("rounds to one decimal", () => {
    expect(taskCompletionPercent(1, 3)).toBe(33.3);
  });
});

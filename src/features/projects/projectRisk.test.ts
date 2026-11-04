import { describe, expect, it } from "vitest";

import { buildRiskComparison, pickPriorityTask, progressFromTasks } from "./projectRisk";

const baseTask = {
  projectId: "p1",
  description: null,
  assigneeId: "u1",
  priority: "MEDIUM" as const,
  syncStatus: "SYNCED" as const,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("projectRisk", () => {
  it("builds comparison only with both measures", () => {
    expect(buildRiskComparison(null, 50)).toBeNull();
    expect(buildRiskComparison(40, 70)?.deviationPoints).toBe(30);
  });

  it("computes progress from tasks", () => {
    expect(
      progressFromTasks([
        { ...baseTask, id: "t1", title: "A", status: "DONE", dueDate: null },
        { ...baseTask, id: "t2", title: "B", status: "TODO", dueDate: null },
      ]),
    ).toBe(50);
  });

  it("prefers overdue open tasks", () => {
    const picked = pickPriorityTask(
      [
        {
          ...baseTask,
          id: "t1",
          title: "Later",
          status: "TODO",
          dueDate: "2099-01-01",
        },
        {
          ...baseTask,
          id: "t2",
          title: "Overdue",
          status: "TODO",
          dueDate: "2020-01-01",
        },
      ],
      new Date("2026-01-01T12:00:00.000Z"),
    );
    expect(picked?.id).toBe("t2");
  });
});

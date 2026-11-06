import { describe, expect, it } from "vitest";

import type { MyTaskRow } from "./fetchMyTasks";
import {
  ALL_PROJECTS,
  PENDING_STATUS,
  filterMyTasks,
  parseProjectFilter,
  parseStatusFilter,
  uniqueProjects,
} from "./myTasksFilters";

function stubProject(id: string, title: string): MyTaskRow["project"] {
  return {
    id,
    title,
    description: null,
    objectives: null,
    status: "ACTIVE",
    startDate: null,
    endDate: null,
    coordinatorId: "coord-1",
    createdById: "coord-1",
    memberIds: ["u1"],
    syncStatus: "SYNCED",
    createdAt: "2026-10-01T00:00:00.000Z",
    updatedAt: "2026-10-01T00:00:00.000Z",
  };
}

function task(
  partial: Partial<MyTaskRow> & Pick<MyTaskRow, "id" | "projectId" | "status">,
): MyTaskRow {
  const projectTitle = partial.projectTitle ?? "Proyecto";
  const projectId = partial.projectId;
  const { project: explicitProject, ...rest } = partial;
  return {
    title: "Tarea",
    description: null,
    assigneeId: "u1",
    priority: "MEDIUM",
    dueDate: null,
    syncStatus: "SYNCED",
    createdAt: "2026-10-01T00:00:00.000Z",
    updatedAt: "2026-10-01T00:00:00.000Z",
    projectTitle,
    ...rest,
    project: explicitProject ?? stubProject(projectId, projectTitle),
  };
}

describe("myTasksFilters", () => {
  it("parses project and status query values", () => {
    expect(parseProjectFilter(null)).toBe(ALL_PROJECTS);
    expect(parseProjectFilter("abc")).toBe("abc");
    expect(parseStatusFilter(null)).toBe(PENDING_STATUS);
    expect(parseStatusFilter("IN_PROGRESS")).toBe("IN_PROGRESS");
    expect(parseStatusFilter("nope")).toBe(PENDING_STATUS);
  });

  it("filters by project and status", () => {
    const rows = [
      task({ id: "1", projectId: "p1", status: "TODO", projectTitle: "A" }),
      task({ id: "2", projectId: "p2", status: "IN_PROGRESS", projectTitle: "B" }),
      task({ id: "3", projectId: "p1", status: "BLOCKED", projectTitle: "A" }),
    ];
    expect(filterMyTasks(rows, "p1", PENDING_STATUS).map((row) => row.id)).toEqual(["1", "3"]);
    expect(filterMyTasks(rows, ALL_PROJECTS, "IN_PROGRESS").map((row) => row.id)).toEqual(["2"]);
  });

  it("lists unique projects sorted by title", () => {
    const rows = [
      task({ id: "1", projectId: "p2", status: "TODO", projectTitle: "Beta" }),
      task({ id: "2", projectId: "p1", status: "TODO", projectTitle: "Alfa" }),
      task({ id: "3", projectId: "p1", status: "TODO", projectTitle: "Alfa" }),
    ];
    expect(uniqueProjects(rows)).toEqual([
      { id: "p1", title: "Alfa" },
      { id: "p2", title: "Beta" },
    ]);
  });
});

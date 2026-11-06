import type { ProjectResponse, TaskResponse, UserResponse } from "@quantia/contracts";
import { describe, expect, it } from "vitest";

import {
  canCreateProgress,
  canDeleteDocument,
  canEditTask,
  canManageProject,
  canManageUsers,
} from "./permissions";

const project: ProjectResponse = {
  id: "p1",
  title: "Proyecto",
  description: null,
  objectives: null,
  status: "ACTIVE",
  startDate: null,
  endDate: null,
  coordinatorId: "coord-1",
  createdById: "coord-1",
  memberIds: ["inv-1"],
  syncStatus: "SYNCED",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const task: TaskResponse = {
  id: "t1",
  projectId: "p1",
  title: "Tarea",
  description: null,
  assigneeId: "inv-1",
  status: "TODO",
  priority: "MEDIUM",
  dueDate: null,
  syncStatus: "SYNCED",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

function user(id: string, roles: UserResponse["roles"]): UserResponse {
  return {
    id,
    email: `${id}@example.com`,
    fullName: id,
    isActive: true,
    roles,
    avatar: null,
    avatarRequired: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

describe("project permissions", () => {
  it("lets the assignee edit their task", () => {
    expect(canEditTask(user("inv-1", ["INVESTIGADOR"]), project, task)).toBe(true);
    expect(canEditTask(user("other", ["INVESTIGADOR"]), project, task)).toBe(false);
  });

  it("lets project managers delete documents", () => {
    expect(canDeleteDocument(user("coord-1", ["COORDINADOR"]), project)).toBe(true);
    expect(canDeleteDocument(user("inv-1", ["INVESTIGADOR"]), project)).toBe(false);
    expect(canManageProject(user("admin", ["ADMINISTRADOR"]), project)).toBe(true);
  });

  it("allows progress for members", () => {
    expect(canCreateProgress(user("inv-1", ["INVESTIGADOR"]), project)).toBe(true);
    expect(canCreateProgress(user("stranger", ["INVESTIGADOR"]), project)).toBe(false);
  });
});

describe("admin-only scopes", () => {
  it("restricts user administration to Administrador", () => {
    expect(canManageUsers(user("admin", ["ADMINISTRADOR"]))).toBe(true);
    expect(canManageUsers(user("coord-1", ["COORDINADOR"]))).toBe(false);
    expect(canManageUsers(user("inv-1", ["INVESTIGADOR"]))).toBe(false);
  });

  it("restricts audit view to Administrador", () => {});
});

import { describe, expect, it } from "vitest";

import type { ProjectResponse, UserResponse } from "@quantia/contracts";

import { memberLabel, projectMemberOptions } from "./memberLabels";

const me = {
  id: "me-1",
  email: "me@example.com",
  fullName: "Ana Investigadora",
  isActive: true,
  roles: ["INVESTIGADOR"],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
} as UserResponse;

const project = {
  id: "p1",
  title: "Proyecto",
  description: null,
  objectives: null,
  status: "ACTIVE",
  startDate: null,
  endDate: null,
  coordinatorId: "coord-1",
  createdById: "coord-1",
  memberIds: ["me-1", "other-1"],
  syncStatus: "SYNCED",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
} as ProjectResponse;

describe("memberLabels", () => {
  it("labels the current user by full name", () => {
    expect(memberLabel("me-1", me)).toBe("Ana Investigadora");
  });

  it("falls back for unknown members", () => {
    expect(memberLabel("other-1", me)).toBe("Integrante del proyecto");
    expect(memberLabel(null, me)).toBe("Sin asignar");
  });

  it("uses the name map when present", () => {
    const names = new Map([["other-1", "Luis Coordinador"]]);
    expect(memberLabel("other-1", me, names)).toBe("Luis Coordinador");
    expect(projectMemberOptions(project, me, names).find((o) => o.value === "other-1")?.label).toBe(
      "Luis Coordinador",
    );
  });
});

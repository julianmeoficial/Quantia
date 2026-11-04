import {
  createProjectRequestSchema,
  listProjectsQuerySchema,
  paginatedProjectsResponseSchema,
  projectResponseSchema,
  updateProjectRequestSchema,
  type CreateProjectRequest,
  type ListProjectsQuery,
  type PaginatedProjectsResponse,
  type ProjectResponse,
  type UpdateProjectRequest,
} from "@quantia/contracts";
import { z } from "zod";

import { api } from "./client";

const MAX_PAGE_SIZE = 50;
const emptyResponseSchema = z.undefined();

function clampPageSize(pageSize: number | undefined): number {
  return Math.min(pageSize ?? 20, MAX_PAGE_SIZE);
}

export function listProjects(
  query: Partial<ListProjectsQuery> = {},
): Promise<PaginatedProjectsResponse> {
  const parsed = listProjectsQuerySchema.parse({
    ...query,
    pageSize: clampPageSize(query.pageSize),
  });
  return api.get("/projects", {
    schema: paginatedProjectsResponseSchema,
    query: parsed,
  });
}

export function getProject(projectId: string): Promise<ProjectResponse> {
  return api.get(`/projects/${projectId}`, {
    schema: projectResponseSchema,
  });
}

export function createProject(body: CreateProjectRequest): Promise<ProjectResponse> {
  const parsed = createProjectRequestSchema.parse(body);
  return api.post("/projects", parsed, {
    schema: projectResponseSchema,
  });
}

export function updateProject(
  projectId: string,
  body: UpdateProjectRequest,
): Promise<ProjectResponse> {
  const parsed = updateProjectRequestSchema.parse(body);
  return api.patch(`/projects/${projectId}`, parsed, {
    schema: projectResponseSchema,
  });
}

export function deleteProject(projectId: string): Promise<void> {
  return api.delete(`/projects/${projectId}`, {
    schema: emptyResponseSchema,
  });
}

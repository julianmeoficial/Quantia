import {
  listProjectsQuerySchema,
  paginatedProjectsResponseSchema,
  projectResponseSchema,
  type ListProjectsQuery,
  type PaginatedProjectsResponse,
  type ProjectResponse,
} from "@quantia/contracts";

import { api } from "./client";

const MAX_PAGE_SIZE = 50;

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

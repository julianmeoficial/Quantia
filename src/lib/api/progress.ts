import {
  createProgressRequestSchema,
  listProgressQuerySchema,
  paginatedProgressResponseSchema,
  progressResponseSchema,
  type CreateProgressRequest,
  type ListProgressQuery,
  type PaginatedProgressResponse,
  type ProgressResponse,
} from "@quantia/contracts";

import { api } from "./client";

const MAX_PAGE_SIZE = 50;

function clampPageSize(pageSize: number | undefined): number {
  return Math.min(pageSize ?? 20, MAX_PAGE_SIZE);
}

export function listProjectProgress(
  projectId: string,
  query: Partial<ListProgressQuery> = {},
): Promise<PaginatedProgressResponse> {
  const parsed = listProgressQuerySchema.parse({
    ...query,
    pageSize: clampPageSize(query.pageSize),
  });
  return api.get(`/projects/${projectId}/progress`, {
    schema: paginatedProgressResponseSchema,
    query: parsed,
  });
}

export function createProjectProgress(
  projectId: string,
  body: CreateProgressRequest,
): Promise<ProgressResponse> {
  const parsed = createProgressRequestSchema.parse(body);
  return api.post(`/projects/${projectId}/progress`, parsed, {
    schema: progressResponseSchema,
  });
}

export function getProjectProgress(
  projectId: string,
  progressId: string,
): Promise<ProgressResponse> {
  return api.get(`/projects/${projectId}/progress/${progressId}`, {
    schema: progressResponseSchema,
  });
}

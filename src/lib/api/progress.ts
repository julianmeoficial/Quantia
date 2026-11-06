import {
  createProgressRequestSchema,
  listProgressQuerySchema,
  paginatedProgressResponseSchema,
  progressResponseSchema,
  updateProgressRequestSchema,
  type CreateProgressRequest,
  type ListProgressQuery,
  type PaginatedProgressResponse,
  type ProgressResponse,
  type UpdateProgressRequest,
} from "@quantia/contracts";
import { z } from "zod";

import { api } from "./client";

const emptyResponseSchema = z.undefined();

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

export function updateProjectProgress(
  projectId: string,
  progressId: string,
  body: UpdateProgressRequest,
): Promise<ProgressResponse> {
  const parsed = updateProgressRequestSchema.parse(body);
  return api.patch(`/projects/${projectId}/progress/${progressId}`, parsed, {
    schema: progressResponseSchema,
  });
}

export function deleteProjectProgress(projectId: string, progressId: string): Promise<void> {
  return api.delete(`/projects/${projectId}/progress/${progressId}`, {
    schema: emptyResponseSchema,
  });
}

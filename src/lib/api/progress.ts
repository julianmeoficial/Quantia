import {
  listProgressQuerySchema,
  paginatedProgressResponseSchema,
  type ListProgressQuery,
  type PaginatedProgressResponse,
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

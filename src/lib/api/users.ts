import {
  paginatedUserDirectoryResponseSchema,
  userDirectoryQuerySchema,
  userResponseSchema,
  type PaginatedUserDirectoryResponse,
  type UserDirectoryQuery,
  type UserResponse,
} from "@quantia/contracts";

import { api } from "./client";

const MAX_PAGE_SIZE = 50;

function clampPageSize(pageSize: number | undefined): number {
  return Math.min(pageSize ?? 20, MAX_PAGE_SIZE);
}

export function getMe(options?: { refresh?: boolean }): Promise<UserResponse> {
  return api.get("/users/me", {
    schema: userResponseSchema,
    retryUnauthorized: options?.refresh ?? true,
  });
}

export function searchUserDirectory(
  query: Partial<UserDirectoryQuery> & Pick<UserDirectoryQuery, "q">,
): Promise<PaginatedUserDirectoryResponse> {
  const parsed = userDirectoryQuerySchema.parse({
    ...query,
    pageSize: clampPageSize(query.pageSize),
  });
  return api.get("/users/directory", {
    schema: paginatedUserDirectoryResponseSchema,
    query: parsed,
  });
}

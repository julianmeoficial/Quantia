import {
  avatarCatalogResponseSchema,
  createUserRequestSchema,
  paginatedUserDirectoryResponseSchema,
  paginatedUsersResponseSchema,
  paginationQuerySchema,
  updateMyAvatarRequestSchema,
  updateUserRequestSchema,
  userDirectoryQuerySchema,
  userResponseSchema,
  type CreateUserRequest,
  type PaginatedUserDirectoryResponse,
  type PaginatedUsersResponse,
  type PaginationQuery,
  type AvatarCatalogResponse,
  type AvatarKey,
  type UpdateUserRequest,
  type UserDirectoryQuery,
  type UserResponse,
} from "@quantia/contracts";
import { z } from "zod";

import { api } from "./client";

const emptyResponseSchema = z.undefined();

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

/** Catalog of the 5 predefined avatars (no photo uploads exist). */
export function listAvatars(): Promise<AvatarCatalogResponse> {
  return api.get("/users/avatars", { schema: avatarCatalogResponseSchema });
}

/** Required before using Chat General (`avatarRequired`). Emits `usuario-actualizado`. */
export function updateMyAvatar(avatar: AvatarKey): Promise<UserResponse> {
  const parsed = updateMyAvatarRequestSchema.parse({ avatar });
  return api.patch("/users/me/avatar", parsed, { schema: userResponseSchema });
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

export function listUsers(query: Partial<PaginationQuery> = {}): Promise<PaginatedUsersResponse> {
  const parsed = paginationQuerySchema.parse({
    ...query,
    pageSize: clampPageSize(query.pageSize),
  });
  return api.get("/users", {
    schema: paginatedUsersResponseSchema,
    query: parsed,
  });
}

export function getUser(userId: string): Promise<UserResponse> {
  return api.get(`/users/${userId}`, {
    schema: userResponseSchema,
  });
}

export function createUser(body: CreateUserRequest): Promise<UserResponse> {
  const parsed = createUserRequestSchema.parse(body);
  return api.post("/users", parsed, {
    schema: userResponseSchema,
  });
}

export function updateUser(userId: string, body: UpdateUserRequest): Promise<UserResponse> {
  const parsed = updateUserRequestSchema.parse(body);
  return api.patch(`/users/${userId}`, parsed, {
    schema: userResponseSchema,
  });
}

export function deleteUser(userId: string): Promise<void> {
  return api.delete(`/users/${userId}`, {
    schema: emptyResponseSchema,
  });
}

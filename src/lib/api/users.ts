import { userResponseSchema, type UserResponse } from "@quantia/contracts";

import { api } from "./client";

export function getMe(options?: { refresh?: boolean }): Promise<UserResponse> {
  return api.get("/users/me", {
    schema: userResponseSchema,
    retryUnauthorized: options?.refresh ?? true,
  });
}

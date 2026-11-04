/**
 * Provisional sync-retry client.
 * Path documented in api-integration.mdc §12; request/response schemas are not yet
 * in `@quantia/contracts` v0.7.0. Uses `SyncEntityType` from the contract for the path segment.
 */
import { syncEntityTypeSchema } from "@quantia/contracts";
import { z } from "zod";

import { api } from "./client";

const emptyResponseSchema = z.undefined();

const retryParamsSchema = z.object({
  entityType: syncEntityTypeSchema,
  id: z.string().uuid(),
});

/** Entity types the product UI may retry (excludes USER). */
export type RetryableSyncEntity = "PROJECT" | "TASK" | "PROGRESS";

/**
 * Enqueues a Notion sync retry for a project, task or progress row.
 * Expected API: `POST /api/v1/sync/:entityType/:id/retry` → 204.
 */
export async function retrySync(entityType: RetryableSyncEntity, id: string): Promise<undefined> {
  const parsed = retryParamsSchema.parse({ entityType, id });
  return api.post(`/sync/${parsed.entityType}/${parsed.id}/retry`, undefined, {
    schema: emptyResponseSchema,
  });
}

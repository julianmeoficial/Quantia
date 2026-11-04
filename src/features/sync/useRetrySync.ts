"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";

import { useAuth } from "@/features/auth/AuthProvider";
import { queryKeys, retrySync } from "@/lib/api";
import { ApiError } from "@/lib/api/errors";
import type { RetryableSyncEntity } from "@/lib/api/sync";
import { canRetrySync } from "@/lib/auth";

export type RetrySyncTarget = {
  entityType: RetryableSyncEntity;
  id: string;
  /** Project id when entity is TASK or PROGRESS (for cache invalidation). */
  projectId?: string;
};

export type UseRetrySyncResult = {
  canRetry: boolean;
  isRetrying: boolean;
  retryError: ApiError | null;
  retry: (target: RetrySyncTarget) => Promise<boolean>;
  clearError: () => void;
};

function invalidateForTarget(
  queryClient: ReturnType<typeof useQueryClient>,
  target: RetrySyncTarget,
  userId: string | undefined,
) {
  const { entityType, id, projectId } = target;

  if (entityType === "PROJECT") {
    void queryClient.invalidateQueries({ queryKey: queryKeys.project(id) });
    void queryClient.invalidateQueries({ queryKey: ["projects"] });
  }

  if (entityType === "TASK") {
    if (projectId) {
      void queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.task(projectId, id) });
    }
    if (userId) {
      void queryClient.invalidateQueries({ queryKey: queryKeys.myTasks(userId) });
    }
  }

  if (entityType === "PROGRESS") {
    if (projectId) {
      void queryClient.invalidateQueries({ queryKey: ["progress", projectId] });
    }
  }

  void queryClient.invalidateQueries({ queryKey: ["group-dashboard"] });
  void queryClient.invalidateQueries({ queryKey: ["institutional-overview"] });
}

export function useRetrySync(): UseRetrySyncResult {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryError, setRetryError] = useState<ApiError | null>(null);

  const canRetry = Boolean(user && canRetrySync(user));

  const clearError = useCallback(() => {
    setRetryError(null);
  }, []);

  const retry = useCallback(
    async (target: RetrySyncTarget): Promise<boolean> => {
      if (!user || !canRetrySync(user)) {
        return false;
      }

      setIsRetrying(true);
      setRetryError(null);
      try {
        await retrySync(target.entityType, target.id);
        invalidateForTarget(queryClient, target, user.id);
        return true;
      } catch (cause: unknown) {
        const error = cause instanceof ApiError ? cause : new ApiError("unknown", null);
        setRetryError(error);
        return false;
      } finally {
        setIsRetrying(false);
      }
    },
    [queryClient, user],
  );

  return { canRetry, isRetrying, retryError, retry, clearError };
}

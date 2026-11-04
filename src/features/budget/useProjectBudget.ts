"use client";

import type { BudgetExecutionResponse, BudgetResponse } from "@quantia/contracts";
import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/features/auth/AuthProvider";
import { getProjectBudget, listBudgetExecutions } from "@/lib/api";
import { ApiError } from "@/lib/api/errors";

type Snapshot = {
  status: "idle" | "loading" | "ready" | "error" | "empty";
  budget: BudgetResponse | null;
  executions: BudgetExecutionResponse[];
  error: ApiError | null;
  stale: boolean;
};

const INITIAL: Snapshot = {
  status: "idle",
  budget: null,
  executions: [],
  error: null,
  stale: false,
};

export function useProjectBudget(projectId: string | null) {
  const { status: authStatus } = useAuth();
  const [tick, setTick] = useState(0);
  const [snapshot, setSnapshot] = useState<Snapshot>(INITIAL);

  const reload = useCallback(() => {
    setTick((value) => value + 1);
  }, []);

  const active = authStatus === "authenticated" && Boolean(projectId);

  if (!active && snapshot.status !== "idle") {
    setSnapshot(INITIAL);
  }

  useEffect(() => {
    if (!active || !projectId) return;

    let cancelled = false;

    void (async () => {
      await Promise.resolve();
      if (cancelled) return;

      setSnapshot((prev) =>
        prev.budget
          ? { ...prev, status: "loading", error: null, stale: false }
          : { ...INITIAL, status: "loading" },
      );

      try {
        const [budget, executions] = await Promise.all([
          getProjectBudget(projectId),
          listBudgetExecutions(projectId, { page: 1, pageSize: 50 }),
        ]);
        if (cancelled) return;
        setSnapshot({
          status: "ready",
          budget,
          executions: executions.data,
          error: null,
          stale: false,
        });
      } catch (cause: unknown) {
        if (cancelled) return;
        const apiError = cause instanceof ApiError ? cause : new ApiError("unknown", null);
        if (apiError.kind === "not_found") {
          setSnapshot({
            status: "empty",
            budget: null,
            executions: [],
            error: null,
            stale: false,
          });
          return;
        }
        setSnapshot((prev) =>
          prev.budget
            ? {
                status: "ready",
                budget: prev.budget,
                executions: prev.executions,
                error: apiError,
                stale: true,
              }
            : {
                status: "error",
                budget: null,
                executions: [],
                error: apiError,
                stale: false,
              },
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [active, projectId, tick]);

  useEffect(() => {
    const onFocus = () => {
      if (document.visibilityState === "visible") reload();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [reload]);

  return {
    status: snapshot.status,
    budget: snapshot.budget,
    executions: snapshot.executions,
    error: snapshot.error,
    stale: snapshot.stale,
    reload,
  };
}

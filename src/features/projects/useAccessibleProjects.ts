"use client";

import type { ProjectResponse } from "@quantia/contracts";
import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/features/auth/AuthProvider";
import { listProjects } from "@/lib/api";
import { ApiError } from "@/lib/api/errors";

type Snapshot = {
  status: "idle" | "loading" | "ready" | "error";
  projects: ProjectResponse[];
  error: ApiError | null;
};

const INITIAL: Snapshot = { status: "idle", projects: [], error: null };

/** Loads accessible projects for selectors (TSK/PRO/BUD/REP). Caps at first pages. */
export function useAccessibleProjects() {
  const { status: authStatus } = useAuth();
  const [tick, setTick] = useState(0);
  const [snapshot, setSnapshot] = useState<Snapshot>(INITIAL);

  const reload = useCallback(() => {
    setTick((value) => value + 1);
  }, []);

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    let cancelled = false;

    void (async () => {
      await Promise.resolve();
      if (cancelled) return;
      setSnapshot((prev) => ({
        ...prev,
        status: "loading",
        error: null,
      }));

      try {
        const first = await listProjects({
          page: 1,
          pageSize: 50,
          sortBy: "title",
          sortOrder: "asc",
        });
        const pages = [first];
        const totalPages = Math.min(first.meta.totalPages, 3);
        for (let page = 2; page <= totalPages; page += 1) {
          pages.push(await listProjects({ page, pageSize: 50, sortBy: "title", sortOrder: "asc" }));
        }
        if (cancelled) return;
        setSnapshot({
          status: "ready",
          projects: pages.flatMap((page) => page.data),
          error: null,
        });
      } catch (cause: unknown) {
        if (cancelled) return;
        const apiError = cause instanceof ApiError ? cause : new ApiError("unknown", null);
        setSnapshot((prev) =>
          prev.projects.length
            ? { status: "ready", projects: prev.projects, error: apiError }
            : { status: "error", projects: [], error: apiError },
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authStatus, tick]);

  return {
    status: snapshot.status,
    projects: snapshot.projects,
    error: snapshot.error,
    reload,
    options: [
      { value: "", label: "Selecciona un proyecto" },
      ...snapshot.projects.map((project) => ({ value: project.id, label: project.title })),
    ],
  };
}

"use client";

import type {
  DocumentResponse,
  ProgressResponse,
  ProjectResponse,
  TaskResponse,
} from "@quantia/contracts";
import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/features/auth/AuthProvider";
import { listProjectDocuments, listProjectProgress, listProjectTasks } from "@/lib/api";
import { ApiError } from "@/lib/api/errors";
import { getProject } from "@/lib/api/projects";

import type { WorkspaceTab } from "./workspaceTab";

export type PanelStatus = "idle" | "loading" | "ready" | "error";

export type PanelState<T> = {
  status: PanelStatus;
  data: T | null;
  error: ApiError | null;
};

type ProjectBoot =
  | { status: "loading" }
  | { status: "ready"; project: ProjectResponse }
  | { status: "error"; error: ApiError };

const EMPTY_PANEL = <T>(): PanelState<T> => ({
  status: "idle",
  data: null,
  error: null,
});

export function useProjectWorkspace(projectId: string, tab: WorkspaceTab) {
  const { status: authStatus } = useAuth();
  const [boot, setBoot] = useState<ProjectBoot>({ status: "loading" });
  const [bootTick, setBootTick] = useState(0);

  const [tasks, setTasks] = useState<PanelState<TaskResponse[]>>(EMPTY_PANEL);
  const [tasksTick, setTasksTick] = useState(0);

  const [progress, setProgress] = useState<PanelState<ProgressResponse[]>>(EMPTY_PANEL);
  const [progressTick, setProgressTick] = useState(0);

  const [documents, setDocuments] = useState<PanelState<DocumentResponse[]>>(EMPTY_PANEL);
  const [documentsTick, setDocumentsTick] = useState(0);

  const reloadProject = useCallback(() => {
    setBootTick((value) => value + 1);
  }, []);

  const reloadTasks = useCallback(() => {
    setTasksTick((value) => value + 1);
  }, []);

  const reloadProgress = useCallback(() => {
    setProgressTick((value) => value + 1);
  }, []);

  const reloadDocuments = useCallback(() => {
    setDocumentsTick((value) => value + 1);
  }, []);

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    let cancelled = false;

    void (async () => {
      await Promise.resolve();
      if (cancelled) return;
      setBoot({ status: "loading" });
      try {
        const project = await getProject(projectId);
        if (cancelled) return;
        setBoot({ status: "ready", project });
      } catch (cause: unknown) {
        if (cancelled) return;
        const error = cause instanceof ApiError ? cause : new ApiError("unknown", null);
        setBoot({ status: "error", error });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authStatus, projectId, bootTick]);

  useEffect(() => {
    if (boot.status !== "ready") return;
    let cancelled = false;

    void (async () => {
      await Promise.resolve();
      if (cancelled) return;
      setTasks((prev) =>
        prev.data
          ? { ...prev, error: null, status: "loading" }
          : { status: "loading", data: null, error: null },
      );
      try {
        const page = await listProjectTasks(projectId, {
          page: 1,
          pageSize: 50,
          sortBy: "dueDate",
          sortOrder: "asc",
        });
        if (cancelled) return;
        setTasks({ status: "ready", data: page.data, error: null });
      } catch (cause: unknown) {
        if (cancelled) return;
        const error = cause instanceof ApiError ? cause : new ApiError("unknown", null);
        setTasks((prev) =>
          prev.data ? { ...prev, status: "ready", error } : { status: "error", data: null, error },
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [boot.status, projectId, tasksTick]);

  useEffect(() => {
    if (boot.status !== "ready" || tab !== "bitacora") return;
    let cancelled = false;

    void (async () => {
      await Promise.resolve();
      if (cancelled) return;
      setProgress((prev) =>
        prev.data
          ? { ...prev, error: null, status: "loading" }
          : { status: "loading", data: null, error: null },
      );
      try {
        const page = await listProjectProgress(projectId, {
          page: 1,
          pageSize: 50,
          sortBy: "recordedAt",
          sortOrder: "desc",
        });
        if (cancelled) return;
        setProgress({ status: "ready", data: page.data, error: null });
      } catch (cause: unknown) {
        if (cancelled) return;
        const error = cause instanceof ApiError ? cause : new ApiError("unknown", null);
        setProgress((prev) =>
          prev.data ? { ...prev, status: "ready", error } : { status: "error", data: null, error },
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [boot.status, projectId, tab, progressTick]);

  useEffect(() => {
    if (boot.status !== "ready" || tab !== "documentos") return;
    let cancelled = false;

    void (async () => {
      await Promise.resolve();
      if (cancelled) return;
      setDocuments((prev) =>
        prev.data
          ? { ...prev, error: null, status: "loading" }
          : { status: "loading", data: null, error: null },
      );
      try {
        const page = await listProjectDocuments(projectId, { page: 1, pageSize: 50 });
        if (cancelled) return;
        setDocuments({ status: "ready", data: page.data, error: null });
      } catch (cause: unknown) {
        if (cancelled) return;
        const error = cause instanceof ApiError ? cause : new ApiError("unknown", null);
        setDocuments((prev) =>
          prev.data ? { ...prev, status: "ready", error } : { status: "error", data: null, error },
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [boot.status, projectId, tab, documentsTick]);

  const replaceTask = useCallback((next: TaskResponse) => {
    setTasks((prev) => {
      if (!prev.data) return prev;
      return {
        ...prev,
        data: prev.data.map((task) => (task.id === next.id ? next : task)),
      };
    });
  }, []);

  const setTaskList = useCallback((updater: (current: TaskResponse[]) => TaskResponse[]) => {
    setTasks((prev) => {
      if (!prev.data) return prev;
      return { ...prev, data: updater(prev.data) };
    });
  }, []);

  const setDocumentList = useCallback(
    (updater: (current: DocumentResponse[]) => DocumentResponse[]) => {
      setDocuments((prev) => {
        const current = prev.data ?? [];
        return { status: "ready", data: updater(current), error: null };
      });
    },
    [],
  );

  return {
    boot,
    tasks,
    progress,
    documents,
    reloadProject,
    reloadTasks,
    reloadProgress,
    reloadDocuments,
    replaceTask,
    setTaskList,
    setDocumentList,
  };
}

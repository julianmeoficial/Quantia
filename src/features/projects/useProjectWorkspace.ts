"use client";

import type {
  DocumentResponse,
  ProgressResponse,
  ProjectResponse,
  TaskResponse,
} from "@quantia/contracts";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { useAuth } from "@/features/auth/AuthProvider";
import { listProjectDocuments, listProjectProgress, listProjectTasks } from "@/lib/api";
import { ApiError } from "@/lib/api/errors";
import { getProject } from "@/lib/api/projects";
import { queryKeys } from "@/lib/api/query-keys";

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

const WORKSPACE_TASKS_PARAMS = {
  page: 1,
  pageSize: 50,
  sortBy: "dueDate" as const,
  sortOrder: "asc" as const,
};

const WORKSPACE_PROGRESS_PARAMS = {
  page: 1,
  pageSize: 50,
  sortBy: "recordedAt" as const,
  sortOrder: "desc" as const,
};

const WORKSPACE_DOCUMENTS_PARAMS = { page: 1, pageSize: 50 };

function toApiError(cause: unknown): ApiError {
  return cause instanceof ApiError ? cause : new ApiError("unknown", null);
}

function panelFromQuery<T>(
  enabled: boolean,
  isPending: boolean,
  isFetching: boolean,
  data: T | undefined,
  error: unknown,
): PanelState<T> {
  if (!enabled) return { status: "idle", data: null, error: null };
  if (isPending && data === undefined) return { status: "loading", data: null, error: null };
  if (error && data === undefined) {
    return { status: "error", data: null, error: toApiError(error) };
  }
  if (data !== undefined) {
    return {
      status: isFetching ? "loading" : "ready",
      data,
      error: error ? toApiError(error) : null,
    };
  }
  return { status: "loading", data: null, error: null };
}

export function useProjectWorkspace(projectId: string, tab: WorkspaceTab) {
  const { status: authStatus } = useAuth();
  const queryClient = useQueryClient();
  const authenticated = authStatus === "authenticated";

  const projectQuery = useQuery({
    queryKey: queryKeys.project(projectId),
    queryFn: () => getProject(projectId),
    enabled: authenticated,
  });

  const bootReady = projectQuery.isSuccess;
  const tasksEnabled = authenticated && bootReady;
  const progressEnabled = authenticated && bootReady && tab === "bitacora";
  const documentsEnabled = authenticated && bootReady && tab === "documentos";

  const tasksQuery = useQuery({
    queryKey: queryKeys.tasks(projectId, WORKSPACE_TASKS_PARAMS),
    queryFn: async () => {
      const page = await listProjectTasks(projectId, WORKSPACE_TASKS_PARAMS);
      return page.data;
    },
    enabled: tasksEnabled,
  });

  const progressQuery = useQuery({
    queryKey: queryKeys.progress(projectId, WORKSPACE_PROGRESS_PARAMS),
    queryFn: async () => {
      const page = await listProjectProgress(projectId, WORKSPACE_PROGRESS_PARAMS);
      return page.data;
    },
    enabled: progressEnabled,
  });

  const documentsQuery = useQuery({
    queryKey: queryKeys.documents(projectId, WORKSPACE_DOCUMENTS_PARAMS),
    queryFn: async () => {
      const page = await listProjectDocuments(projectId, WORKSPACE_DOCUMENTS_PARAMS);
      return page.data;
    },
    enabled: documentsEnabled,
  });

  let boot: ProjectBoot;
  if (!authenticated || (projectQuery.isPending && !projectQuery.data)) {
    boot = { status: "loading" };
  } else if (projectQuery.isError && !projectQuery.data) {
    boot = { status: "error", error: toApiError(projectQuery.error) };
  } else if (projectQuery.data) {
    boot = { status: "ready", project: projectQuery.data };
  } else {
    boot = { status: "loading" };
  }

  const tasks = panelFromQuery(
    tasksEnabled,
    tasksQuery.isPending,
    tasksQuery.isFetching,
    tasksQuery.data,
    tasksQuery.error,
  );

  const progress = panelFromQuery(
    progressEnabled,
    progressQuery.isPending,
    progressQuery.isFetching,
    progressQuery.data,
    progressQuery.error,
  );

  const documents = panelFromQuery(
    documentsEnabled,
    documentsQuery.isPending,
    documentsQuery.isFetching,
    documentsQuery.data,
    documentsQuery.error,
  );

  const reloadProject = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.project(projectId) });
  }, [projectId, queryClient]);

  const reloadTasks = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
  }, [projectId, queryClient]);

  const reloadProgress = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["progress", projectId] });
  }, [projectId, queryClient]);

  const reloadDocuments = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["documents", projectId] });
  }, [projectId, queryClient]);

  const replaceTask = useCallback(
    (next: TaskResponse) => {
      queryClient.setQueryData<TaskResponse[]>(
        queryKeys.tasks(projectId, WORKSPACE_TASKS_PARAMS),
        (current) => current?.map((task) => (task.id === next.id ? next : task)),
      );
    },
    [projectId, queryClient],
  );

  const setTaskList = useCallback(
    (updater: (current: TaskResponse[]) => TaskResponse[]) => {
      queryClient.setQueryData<TaskResponse[]>(
        queryKeys.tasks(projectId, WORKSPACE_TASKS_PARAMS),
        (current) => (current ? updater(current) : current),
      );
    },
    [projectId, queryClient],
  );

  const setDocumentList = useCallback(
    (updater: (current: DocumentResponse[]) => DocumentResponse[]) => {
      queryClient.setQueryData<DocumentResponse[]>(
        queryKeys.documents(projectId, WORKSPACE_DOCUMENTS_PARAMS),
        (current) => updater(current ?? []),
      );
    },
    [projectId, queryClient],
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

export type { ProgressResponse };

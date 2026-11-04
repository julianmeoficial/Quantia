"use client";

import { ProjectStatus, type ProjectResponse, type UserResponse } from "@quantia/contracts";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import type { AlertListItem } from "@/components/page";
import { useAuth } from "@/features/auth/AuthProvider";
import {
  buildDashboardAlerts,
  type ProjectBudgetSnapshot,
  type ProjectProgressSnapshot,
  taskCompletionPercent,
} from "@/features/dashboard/buildDashboardAlerts";
import { ALL_STATUSES, type DashboardFilters } from "@/features/filters";
import { getProjectBudget, listProjectTasks, listProjects } from "@/lib/api";
import { ApiError } from "@/lib/api/errors";
import { queryKeys } from "@/lib/api/query-keys";
import { canViewBudgetDetail } from "@/lib/auth";

export type InstitutionalKpis = {
  active: number;
  delayed: number;
  completed: number;
  formulation: number;
};

export type InstitutionalOverviewData = {
  kpis: InstitutionalKpis;
  projects: ProjectResponse[];
  totalProjects: number;
  alerts: AlertListItem[];
};

export type InstitutionalOverviewStatus = "idle" | "loading" | "ready" | "error";

export type UseInstitutionalOverviewState = {
  status: InstitutionalOverviewStatus;
  data: InstitutionalOverviewData | null;
  error: ApiError | null;
  stale: boolean;
  reload: () => void;
};

export type InstitutionalOverviewQuery = {
  q: string;
  status: DashboardFilters["status"];
  page: number;
  pageSize: number;
};

function toApiError(cause: unknown): ApiError {
  return cause instanceof ApiError ? cause : new ApiError("unknown", null);
}

async function countByStatus(status: (typeof ProjectStatus)[keyof typeof ProjectStatus]) {
  const result = await listProjects({ page: 1, pageSize: 1, status });
  return result.meta.total;
}

async function loadBudgetSafe(projectId: string): Promise<ProjectBudgetSnapshot | null> {
  try {
    const budget = await getProjectBudget(projectId);
    return { projectId, executedPercent: budget.executedPercent };
  } catch (cause: unknown) {
    if (cause instanceof ApiError && cause.kind === "not_found") return null;
    throw cause;
  }
}

async function loadProgressSafe(projectId: string): Promise<ProjectProgressSnapshot | null> {
  try {
    const tasks = await listProjectTasks(projectId, {
      page: 1,
      pageSize: 50,
      sortBy: "dueDate",
      sortOrder: "asc",
    });
    const done = tasks.data.filter((task) => task.status === "DONE").length;
    const percent = taskCompletionPercent(done, tasks.meta.total);
    if (percent === null) return null;
    return { projectId, progressPercent: percent };
  } catch {
    return null;
  }
}

export async function fetchInstitutionalOverview(
  query: InstitutionalOverviewQuery,
  user: UserResponse,
): Promise<InstitutionalOverviewData> {
  const statusParam = query.status === ALL_STATUSES ? undefined : query.status;

  const [active, delayed, completed, formulation, list] = await Promise.all([
    countByStatus(ProjectStatus.ACTIVE),
    countByStatus(ProjectStatus.DELAYED),
    countByStatus(ProjectStatus.COMPLETED),
    countByStatus(ProjectStatus.FORMULATION),
    listProjects({
      page: query.page,
      pageSize: query.pageSize,
      q: query.q || undefined,
      status: statusParam,
      sortBy: "status",
      sortOrder: "asc",
    }),
  ]);

  const delayedProjects =
    statusParam === ProjectStatus.DELAYED || statusParam === undefined
      ? list.data.filter((project) => project.status === "DELAYED")
      : (
          await listProjects({
            page: 1,
            pageSize: 20,
            status: ProjectStatus.DELAYED,
            sortBy: "title",
            sortOrder: "asc",
          })
        ).data;

  const measureTargets = delayedProjects.slice(0, 4);
  const budgets: ProjectBudgetSnapshot[] = [];
  const progress: ProjectProgressSnapshot[] = [];

  const pairs = await Promise.all(
    measureTargets.map(async (project) => {
      const [budget, advance] = await Promise.all([
        canViewBudgetDetail(user) ? loadBudgetSafe(project.id) : Promise.resolve(null),
        loadProgressSafe(project.id),
      ]);
      return { budget, advance };
    }),
  );

  for (const pair of pairs) {
    if (pair.budget) budgets.push(pair.budget);
    if (pair.advance) progress.push(pair.advance);
  }

  return {
    kpis: { active, delayed, completed, formulation },
    projects: list.data,
    totalProjects: list.meta.total,
    alerts: buildDashboardAlerts(delayedProjects, budgets, progress),
  };
}

export function useInstitutionalOverview(
  query: InstitutionalOverviewQuery,
): UseInstitutionalOverviewState {
  const { status: authStatus, user } = useAuth();
  const queryClient = useQueryClient();
  const enabled = authStatus === "authenticated" && Boolean(user);

  const result = useQuery({
    queryKey: queryKeys.institutionalOverview(query),
    queryFn: () => fetchInstitutionalOverview(query, user!),
    enabled,
  });

  const reload = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.institutionalOverview(query) });
  }, [query, queryClient]);

  if (!enabled) {
    return { status: "idle", data: null, error: null, stale: false, reload };
  }

  if (result.isPending && !result.data) {
    return { status: "loading", data: null, error: null, stale: false, reload };
  }

  if (result.isError && !result.data) {
    return {
      status: "error",
      data: null,
      error: toApiError(result.error),
      stale: false,
      reload,
    };
  }

  return {
    status: result.isFetching && !result.isPending ? "loading" : "ready",
    data: result.data ?? null,
    error: result.error ? toApiError(result.error) : null,
    stale: Boolean(result.isError && result.data),
    reload,
  };
}

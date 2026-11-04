"use client";

import { ProjectStatus, type ProjectResponse, type UserResponse } from "@quantia/contracts";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import type { ProgressPoint } from "@/components/page";
import { useAuth } from "@/features/auth/AuthProvider";
import { ALL_STATUSES, type DashboardFilters } from "@/features/filters";
import { getProjectBudget, listProjectTasks, listProjects } from "@/lib/api";
import { ApiError } from "@/lib/api/errors";
import { queryKeys } from "@/lib/api/query-keys";
import { canViewBudgetDetail } from "@/lib/auth";

import {
  buildDashboardAlerts,
  taskCompletionPercent,
  type ProjectBudgetSnapshot,
  type ProjectProgressSnapshot,
} from "./buildDashboardAlerts";

export type DashboardKpis = {
  active: number;
  delayed: number;
  completed: number;
  formulation: number;
};

export type ComparisonMeasures = {
  projectId: string;
  projectTitle: string;
  progressPercent: number;
  executedPercent: number;
};

export type DashboardChartBundle = {
  progressPoints: ProgressPoint[];
  comparisonPoints: ProgressPoint[];
};

export type GroupDashboardData = {
  kpis: DashboardKpis;
  projects: ProjectResponse[];
  totalProjects: number;
  page: number;
  pageSize: number;
  alerts: ReturnType<typeof buildDashboardAlerts>;
  comparison: ComparisonMeasures | null;
  charts: DashboardChartBundle;
};

export type GroupDashboardStatus = "idle" | "loading" | "ready" | "error";

export type UseGroupDashboardState = {
  status: GroupDashboardStatus;
  data: GroupDashboardData | null;
  error: ApiError | null;
  stale: boolean;
  reload: () => void;
};

export type GroupDashboardQuery = {
  q: string;
  status: DashboardFilters["status"];
  page: number;
  pageSize: number;
};

const CHART_SAMPLE = 8;

function shortLabel(title: string): string {
  return title.length > 28 ? `${title.slice(0, 27)}…` : title;
}

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

export async function fetchGroupDashboard(
  query: GroupDashboardQuery,
  user: UserResponse,
): Promise<GroupDashboardData> {
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

  const chartProjects = list.data.slice(0, CHART_SAMPLE);
  const measureTargets = Array.from(
    new Map(
      [...delayedProjects.slice(0, 4), ...chartProjects].map((project) => [project.id, project]),
    ).values(),
  );

  const budgets: ProjectBudgetSnapshot[] = [];
  const progress: ProjectProgressSnapshot[] = [];

  const pairs = await Promise.all(
    measureTargets.map(async (project) => {
      const [budget, advance] = await Promise.all([
        canViewBudgetDetail(user) ? loadBudgetSafe(project.id) : Promise.resolve(null),
        loadProgressSafe(project.id),
      ]);
      return { project, budget, advance };
    }),
  );

  for (const pair of pairs) {
    if (pair.budget) budgets.push(pair.budget);
    if (pair.advance) progress.push(pair.advance);
  }

  const alerts = buildDashboardAlerts(delayedProjects, budgets, progress);

  let comparison: ComparisonMeasures | null = null;
  for (const project of delayedProjects) {
    const executed = budgets.find((item) => item.projectId === project.id)?.executedPercent;
    const advance = progress.find((item) => item.projectId === project.id)?.progressPercent;
    if (typeof executed === "number" && typeof advance === "number") {
      comparison = {
        projectId: project.id,
        projectTitle: project.title,
        progressPercent: advance,
        executedPercent: executed,
      };
      break;
    }
  }

  const progressById = new Map(progress.map((item) => [item.projectId, item.progressPercent]));
  const budgetById = new Map(budgets.map((item) => [item.projectId, item.executedPercent]));

  const progressPoints: ProgressPoint[] = [];
  const comparisonPoints: ProgressPoint[] = [];
  for (const project of chartProjects) {
    const advance = progressById.get(project.id);
    const executed = budgetById.get(project.id);
    if (typeof advance === "number") {
      progressPoints.push({
        label: shortLabel(project.title),
        values: { progress: advance },
      });
    }
    if (typeof advance === "number" && typeof executed === "number") {
      comparisonPoints.push({
        label: shortLabel(project.title),
        values: { progress: advance, executed },
      });
    }
  }

  return {
    kpis: { active, delayed, completed, formulation },
    projects: list.data,
    totalProjects: list.meta.total,
    page: list.meta.page,
    pageSize: list.meta.pageSize,
    alerts,
    comparison,
    charts: { progressPoints, comparisonPoints },
  };
}

export function useGroupDashboard(query: GroupDashboardQuery): UseGroupDashboardState {
  const { status: authStatus, user } = useAuth();
  const queryClient = useQueryClient();
  const enabled = authStatus === "authenticated" && Boolean(user);

  const result = useQuery({
    queryKey: queryKeys.groupDashboard(query),
    queryFn: () => fetchGroupDashboard(query, user!),
    enabled,
  });

  const reload = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.groupDashboard(query) });
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

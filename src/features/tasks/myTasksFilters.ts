import type { TaskStatus } from "@quantia/contracts";

import type { MyTaskRow } from "./fetchMyTasks";

export const ALL_PROJECTS = "__all__";
export const PENDING_STATUS = "pending";

const TASK_STATUSES = new Set<string>(["TODO", "IN_PROGRESS", "BLOCKED", "DONE"]);

export type MyTasksStatusFilter = typeof PENDING_STATUS | TaskStatus;

export function parseProjectFilter(raw: string | null): string {
  if (!raw || raw === ALL_PROJECTS) return ALL_PROJECTS;
  return raw;
}

export function parseStatusFilter(raw: string | null): MyTasksStatusFilter {
  if (!raw || raw === PENDING_STATUS) return PENDING_STATUS;
  if (TASK_STATUSES.has(raw)) return raw as TaskStatus;
  return PENDING_STATUS;
}

export function filterMyTasks(
  tasks: MyTaskRow[],
  projectId: string,
  status: MyTasksStatusFilter,
): MyTaskRow[] {
  return tasks.filter((task) => {
    if (projectId !== ALL_PROJECTS && task.projectId !== projectId) return false;
    if (status === PENDING_STATUS) return task.status !== "DONE";
    return task.status === status;
  });
}

export function uniqueProjects(tasks: MyTaskRow[]): { id: string; title: string }[] {
  const map = new Map<string, string>();
  for (const task of tasks) {
    if (!map.has(task.projectId)) map.set(task.projectId, task.projectTitle);
  }
  return [...map.entries()]
    .map(([id, title]) => ({ id, title }))
    .sort((a, b) => a.title.localeCompare(b.title, "es"));
}

import type { ProjectResponse, TaskResponse } from "@quantia/contracts";

import { listProjectProgress } from "@/lib/api/progress";
import { listProjects } from "@/lib/api/projects";
import { listProjectTasks } from "@/lib/api/tasks";
import { ApiError } from "@/lib/api/errors";

const MAX_PAGE_SIZE = 50;
const CONCURRENCY = 4;

export type MyTaskRow = TaskResponse & {
  projectTitle: string;
  project: ProjectResponse;
};

export type MyTasksResult = {
  tasks: MyTaskRow[];
  monthProgressCount: number | null;
  partialFailures: number;
};

async function mapPool<T, R>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;

  async function run(): Promise<void> {
    while (next < items.length) {
      const index = next;
      next += 1;
      results[index] = await worker(items[index]!);
    }
  }

  const runners = Array.from({ length: Math.min(limit, items.length) }, () => run());
  await Promise.all(runners);
  return results;
}

async function listAllProjects(): Promise<ProjectResponse[]> {
  const first = await listProjects({
    page: 1,
    pageSize: MAX_PAGE_SIZE,
    sortBy: "title",
    sortOrder: "asc",
  });
  const projects = [...first.data];
  for (let page = 2; page <= first.meta.totalPages; page += 1) {
    const next = await listProjects({
      page,
      pageSize: MAX_PAGE_SIZE,
      sortBy: "title",
      sortOrder: "asc",
    });
    projects.push(...next.data);
  }
  return projects;
}

async function listAssignedTasks(projectId: string, assigneeId: string): Promise<TaskResponse[]> {
  const first = await listProjectTasks(projectId, {
    page: 1,
    pageSize: MAX_PAGE_SIZE,
    assigneeId,
    sortBy: "dueDate",
    sortOrder: "asc",
  });
  const tasks = [...first.data];
  for (let page = 2; page <= first.meta.totalPages; page += 1) {
    const next = await listProjectTasks(projectId, {
      page,
      pageSize: MAX_PAGE_SIZE,
      assigneeId,
      sortBy: "dueDate",
      sortOrder: "asc",
    });
    tasks.push(...next.data);
  }
  return tasks;
}

function isCurrentBogotaMonth(iso: string, now: Date): boolean {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
  });
  return formatter.format(new Date(iso)) === formatter.format(now);
}

async function countMonthProgress(projectId: string, authorId: string, now: Date): Promise<number> {
  const first = await listProjectProgress(projectId, {
    page: 1,
    pageSize: MAX_PAGE_SIZE,
    authorId,
    sortBy: "recordedAt",
    sortOrder: "desc",
  });
  let count = first.data.filter((item) => isCurrentBogotaMonth(item.recordedAt, now)).length;
  for (let page = 2; page <= first.meta.totalPages; page += 1) {
    const next = await listProjectProgress(projectId, {
      page,
      pageSize: MAX_PAGE_SIZE,
      authorId,
      sortBy: "recordedAt",
      sortOrder: "desc",
    });
    count += next.data.filter((item) => isCurrentBogotaMonth(item.recordedAt, now)).length;
  }
  return count;
}

type ProjectSlice = {
  tasks: MyTaskRow[];
  monthProgress: number | null;
  failed: boolean;
};

/**
 * Composes the investigator “Mis tareas” feed:
 * GET /projects + GET /projects/:id/tasks?assigneeId=me (≤4 concurrent).
 */
export async function fetchMyTasks(
  assigneeId: string,
  now: Date = new Date(),
): Promise<MyTasksResult> {
  const projects = await listAllProjects();

  const slices = await mapPool(projects, CONCURRENCY, async (project): Promise<ProjectSlice> => {
    try {
      const [rawTasks, monthProgress] = await Promise.all([
        listAssignedTasks(project.id, assigneeId),
        countMonthProgress(project.id, assigneeId, now).catch(() => null),
      ]);
      return {
        tasks: rawTasks
          .filter((task) => task.status !== "DONE")
          .map((task) => ({ ...task, projectTitle: project.title, project })),
        monthProgress,
        failed: false,
      };
    } catch (error) {
      if (error instanceof ApiError && (error.kind === "forbidden" || error.kind === "not_found")) {
        return { tasks: [], monthProgress: null, failed: true };
      }
      throw error;
    }
  });

  const tasks: MyTaskRow[] = [];
  let monthProgressCount: number | null = 0;
  let progressKnown = true;
  let partialFailures = 0;

  for (const slice of slices) {
    if (slice.failed) {
      partialFailures += 1;
      continue;
    }
    tasks.push(...slice.tasks);
    if (slice.monthProgress === null) {
      progressKnown = false;
    } else {
      monthProgressCount = (monthProgressCount ?? 0) + slice.monthProgress;
    }
  }

  return {
    tasks,
    monthProgressCount: progressKnown ? monthProgressCount : null,
    partialFailures,
  };
}

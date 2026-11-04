import {
  createTaskRequestSchema,
  listTasksQuerySchema,
  paginatedTasksResponseSchema,
  taskResponseSchema,
  type CreateTaskRequest,
  type ListTasksQuery,
  type PaginatedTasksResponse,
  type TaskResponse,
  type UpdateTaskRequest,
  updateTaskRequestSchema,
} from "@quantia/contracts";

import { api } from "./client";

const MAX_PAGE_SIZE = 50;

function clampPageSize(pageSize: number | undefined): number {
  return Math.min(pageSize ?? 20, MAX_PAGE_SIZE);
}

export function listProjectTasks(
  projectId: string,
  query: Partial<ListTasksQuery> = {},
): Promise<PaginatedTasksResponse> {
  const parsed = listTasksQuerySchema.parse({
    ...query,
    pageSize: clampPageSize(query.pageSize),
  });
  return api.get(`/projects/${projectId}/tasks`, {
    schema: paginatedTasksResponseSchema,
    query: parsed,
  });
}

export function getProjectTask(projectId: string, taskId: string): Promise<TaskResponse> {
  return api.get(`/projects/${projectId}/tasks/${taskId}`, {
    schema: taskResponseSchema,
  });
}

export function createProjectTask(
  projectId: string,
  body: CreateTaskRequest,
): Promise<TaskResponse> {
  const parsed = createTaskRequestSchema.parse(body);
  return api.post(`/projects/${projectId}/tasks`, parsed, {
    schema: taskResponseSchema,
  });
}

export function updateProjectTask(
  projectId: string,
  taskId: string,
  body: UpdateTaskRequest,
): Promise<TaskResponse> {
  const parsed = updateTaskRequestSchema.parse(body);
  return api.patch(`/projects/${projectId}/tasks/${taskId}`, parsed, {
    schema: taskResponseSchema,
  });
}

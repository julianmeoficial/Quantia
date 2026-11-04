import {
  budgetExecutionSchema,
  budgetResponseSchema,
  createBudgetExecutionRequestSchema,
  createBudgetRequestSchema,
  paginatedResponseSchema,
  paginationQuerySchema,
  updateBudgetRequestSchema,
  type BudgetExecutionResponse,
  type BudgetResponse,
  type CreateBudgetExecutionRequest,
  type CreateBudgetRequest,
  type PaginationQuery,
  type UpdateBudgetRequest,
} from "@quantia/contracts";

import { api } from "./client";

const MAX_PAGE_SIZE = 50;

const paginatedBudgetExecutionsSchema = paginatedResponseSchema(budgetExecutionSchema);

function clampPageSize(pageSize: number | undefined): number {
  return Math.min(pageSize ?? 20, MAX_PAGE_SIZE);
}

export function getProjectBudget(projectId: string): Promise<BudgetResponse> {
  return api.get(`/projects/${projectId}/budget`, {
    schema: budgetResponseSchema,
  });
}

export function createProjectBudget(
  projectId: string,
  body: CreateBudgetRequest,
): Promise<BudgetResponse> {
  const parsed = createBudgetRequestSchema.parse(body);
  return api.post(`/projects/${projectId}/budget`, parsed, {
    schema: budgetResponseSchema,
  });
}

export function updateProjectBudget(
  projectId: string,
  body: UpdateBudgetRequest,
): Promise<BudgetResponse> {
  const parsed = updateBudgetRequestSchema.parse(body);
  return api.patch(`/projects/${projectId}/budget`, parsed, {
    schema: budgetResponseSchema,
  });
}

export function listBudgetExecutions(projectId: string, query: Partial<PaginationQuery> = {}) {
  const parsed = paginationQuerySchema.parse({
    ...query,
    pageSize: clampPageSize(query.pageSize),
  });
  return api.get(`/projects/${projectId}/budget/executions`, {
    schema: paginatedBudgetExecutionsSchema,
    query: parsed,
  });
}

export function createBudgetExecution(
  projectId: string,
  body: CreateBudgetExecutionRequest,
): Promise<BudgetExecutionResponse> {
  const parsed = createBudgetExecutionRequestSchema.parse(body);
  return api.post(`/projects/${projectId}/budget/executions`, parsed, {
    schema: budgetExecutionSchema,
  });
}

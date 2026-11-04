/** Cache keys for React Query — one place for invalidation from mutations and sockets. */

export const queryKeys = {
  me: ["me"] as const,
  projects: (params?: unknown) => ["projects", params] as const,
  project: (projectId: string) => ["projects", projectId] as const,
  tasks: (projectId: string, params?: unknown) => ["tasks", projectId, params] as const,
  task: (projectId: string, taskId: string) => ["tasks", projectId, taskId] as const,
  myTasks: (userId: string) => ["my-tasks", userId] as const,
  progress: (projectId: string, params?: unknown) => ["progress", projectId, params] as const,
  documents: (projectId: string, params?: unknown) => ["documents", projectId, params] as const,
  budget: (projectId: string) => ["budget", projectId] as const,
  budgetExecutions: (projectId: string, params?: unknown) =>
    ["budget-executions", projectId, params] as const,
  groupDashboard: (params: unknown) => ["group-dashboard", params] as const,
  institutionalOverview: (params: unknown) => ["institutional-overview", params] as const,
} as const;

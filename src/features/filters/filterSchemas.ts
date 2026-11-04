import { ProjectStatus, ReportKind, TaskPriority, TaskStatus } from "@quantia/contracts";
import { z } from "zod";

export const ALL_STATUSES = "all" as const;
export const ALL_PRIORITIES = "all" as const;

const projectStatusSchema = z.enum([
  ProjectStatus.FORMULATION,
  ProjectStatus.ACTIVE,
  ProjectStatus.DELAYED,
  ProjectStatus.COMPLETED,
  ProjectStatus.CANCELLED,
]);

const statusFilterSchema = z.union([z.literal(ALL_STATUSES), projectStatusSchema]);

const projectIdSchema = z.union([z.string().uuid(), z.literal("")]).default("");

export const dashboardFiltersSchema = z.object({
  q: z.string().default(""),
  status: statusFilterSchema.default(ALL_STATUSES),
});

export type DashboardFilters = z.infer<typeof dashboardFiltersSchema>;

export const DASHBOARD_FILTER_DEFAULTS: DashboardFilters = {
  q: "",
  status: ALL_STATUSES,
};

export const projectListFiltersSchema = z.object({
  q: z.string().default(""),
  status: statusFilterSchema.default(ALL_STATUSES),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
  sortBy: z.enum(["createdAt", "title", "status"]).default("title"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export type ProjectListFilters = z.infer<typeof projectListFiltersSchema>;

export const PROJECT_LIST_FILTER_DEFAULTS: ProjectListFilters = {
  q: "",
  status: ALL_STATUSES,
  page: 1,
  pageSize: 20,
  sortBy: "title",
  sortOrder: "asc",
};

const taskStatusFilterSchema = z.union([
  z.literal(ALL_STATUSES),
  z.enum([TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.BLOCKED, TaskStatus.DONE]),
]);

const taskPriorityFilterSchema = z.union([
  z.literal(ALL_PRIORITIES),
  z.enum([TaskPriority.LOW, TaskPriority.MEDIUM, TaskPriority.HIGH]),
]);

/** TSK-01 — project selector + listTasksQuerySchema fields. */
export const tasksListFiltersSchema = z.object({
  projectId: projectIdSchema,
  status: taskStatusFilterSchema.default(ALL_STATUSES),
  priority: taskPriorityFilterSchema.default(ALL_PRIORITIES),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
  sortBy: z.enum(["createdAt", "priority", "dueDate"]).default("dueDate"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export type TasksListFilters = z.infer<typeof tasksListFiltersSchema>;

export const TASKS_LIST_FILTER_DEFAULTS: TasksListFilters = {
  projectId: "",
  status: ALL_STATUSES,
  priority: ALL_PRIORITIES,
  page: 1,
  pageSize: 20,
  sortBy: "dueDate",
  sortOrder: "asc",
};

/** PRO-01 — project selector + listProgressQuerySchema fields. */
export const progressListFiltersSchema = z.object({
  projectId: projectIdSchema,
  taskId: z.union([z.string().uuid(), z.literal("")]).default(""),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
  sortBy: z.enum(["createdAt", "recordedAt"]).default("recordedAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type ProgressListFilters = z.infer<typeof progressListFiltersSchema>;

export const PROGRESS_LIST_FILTER_DEFAULTS: ProgressListFilters = {
  projectId: "",
  taskId: "",
  page: 1,
  pageSize: 20,
  sortBy: "recordedAt",
  sortOrder: "desc",
};

export const budgetFiltersSchema = z.object({
  projectId: projectIdSchema,
});

export type BudgetFilters = z.infer<typeof budgetFiltersSchema>;

export const BUDGET_FILTER_DEFAULTS: BudgetFilters = {
  projectId: "",
};

/** REP-01 shareable project + UI kind (POST body still only `{ kind }`). */
export const reportsFiltersSchema = z.object({
  projectId: projectIdSchema,
  kind: z
    .union([
      z.literal(""),
      z.enum([ReportKind.BUDGET_PDF, ReportKind.BUDGET_EXCEL, ReportKind.PROGRESS_PDF]),
    ])
    .default(""),
});

export type ReportsFilters = z.infer<typeof reportsFiltersSchema>;

export const REPORTS_FILTER_DEFAULTS: ReportsFilters = {
  projectId: "",
  kind: "",
};

export const PROJECT_STATUS_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: ALL_STATUSES, label: "Todos" },
  { value: ProjectStatus.FORMULATION, label: "En formulación" },
  { value: ProjectStatus.ACTIVE, label: "En curso" },
  { value: ProjectStatus.DELAYED, label: "Retrasado" },
  { value: ProjectStatus.COMPLETED, label: "Finalizado" },
  { value: ProjectStatus.CANCELLED, label: "Cancelado" },
];

export const PROJECT_SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "title:asc", label: "Título (A–Z)" },
  { value: "title:desc", label: "Título (Z–A)" },
  { value: "status:asc", label: "Estado (A–Z)" },
  { value: "status:desc", label: "Estado (Z–A)" },
  { value: "createdAt:desc", label: "Más recientes" },
  { value: "createdAt:asc", label: "Más antiguos" },
];

export const TASK_STATUS_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: ALL_STATUSES, label: "Todos" },
  { value: TaskStatus.TODO, label: "Pendiente" },
  { value: TaskStatus.IN_PROGRESS, label: "En progreso" },
  { value: TaskStatus.BLOCKED, label: "Bloqueada" },
  { value: TaskStatus.DONE, label: "Completada" },
];

export const TASK_PRIORITY_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: ALL_PRIORITIES, label: "Todas" },
  { value: TaskPriority.LOW, label: "Baja" },
  { value: TaskPriority.MEDIUM, label: "Media" },
  { value: TaskPriority.HIGH, label: "Alta" },
];

export const TASK_SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "dueDate:asc", label: "Fecha (próximas)" },
  { value: "dueDate:desc", label: "Fecha (lejanas)" },
  { value: "priority:desc", label: "Prioridad (alta primero)" },
  { value: "priority:asc", label: "Prioridad (baja primero)" },
  { value: "createdAt:desc", label: "Más recientes" },
  { value: "createdAt:asc", label: "Más antiguas" },
];

export const REPORT_KIND_OPTIONS: { value: string; label: string }[] = [
  { value: ReportKind.PROGRESS_PDF, label: "Avance (PDF)" },
  { value: ReportKind.BUDGET_PDF, label: "Presupuesto (PDF)" },
  { value: ReportKind.BUDGET_EXCEL, label: "Presupuesto (Excel)" },
];

export function statusChipLabel(status: DashboardFilters["status"]): string {
  const option = PROJECT_STATUS_FILTER_OPTIONS.find((item) => item.value === status);
  return option?.label ?? "Todos";
}

export function sortChipLabel(sortBy: string, sortOrder: string): string {
  const key = `${sortBy}:${sortOrder}`;
  const option = PROJECT_SORT_OPTIONS.find((item) => item.value === key);
  return option?.label ?? `${sortBy} ${sortOrder}`;
}

export function taskStatusChipLabel(status: TasksListFilters["status"]): string {
  const option = TASK_STATUS_FILTER_OPTIONS.find((item) => item.value === status);
  return option?.label ?? "Todos";
}

export function taskPriorityChipLabel(priority: TasksListFilters["priority"]): string {
  const option = TASK_PRIORITY_FILTER_OPTIONS.find((item) => item.value === priority);
  return option?.label ?? "Todas";
}

export function reportKindChipLabel(kind: string): string {
  const option = REPORT_KIND_OPTIONS.find((item) => item.value === kind);
  return option?.label ?? kind;
}

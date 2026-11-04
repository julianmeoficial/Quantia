import { ProjectStatus } from "@quantia/contracts";
import { z } from "zod";

export const ALL_STATUSES = "all" as const;

const projectStatusSchema = z.enum([
  ProjectStatus.FORMULATION,
  ProjectStatus.ACTIVE,
  ProjectStatus.DELAYED,
  ProjectStatus.COMPLETED,
  ProjectStatus.CANCELLED,
]);

const statusFilterSchema = z.union([z.literal(ALL_STATUSES), projectStatusSchema]);

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

/** Minimal shareable context for REP-01 until export filters exist in the contract. */
export const reportsFiltersSchema = z.object({
  projectId: z.union([z.string().uuid(), z.literal("")]).default(""),
});

export type ReportsFilters = z.infer<typeof reportsFiltersSchema>;

export const REPORTS_FILTER_DEFAULTS: ReportsFilters = {
  projectId: "",
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

export function statusChipLabel(status: DashboardFilters["status"]): string {
  const option = PROJECT_STATUS_FILTER_OPTIONS.find((item) => item.value === status);
  return option?.label ?? "Todos";
}

export function sortChipLabel(sortBy: string, sortOrder: string): string {
  const key = `${sortBy}:${sortOrder}`;
  const option = PROJECT_SORT_OPTIONS.find((item) => item.value === key);
  return option?.label ?? `${sortBy} ${sortOrder}`;
}

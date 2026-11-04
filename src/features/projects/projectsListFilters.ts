import type { DashboardFilters } from "@/features/filters";

/** Re-exports shared project list filter labels/types used outside URL schemas. */
export { ALL_STATUSES, PROJECT_STATUS_FILTER_OPTIONS } from "@/features/filters";
export type { DashboardFilters, ProjectListFilters } from "@/features/filters";

export type ProjectsStatusFilter = DashboardFilters["status"];

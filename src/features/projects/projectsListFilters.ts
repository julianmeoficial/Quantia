import { ProjectStatus, type ProjectStatus as ProjectStatusType } from "@quantia/contracts";

export const ALL_STATUSES = "all";

export type ProjectsStatusFilter = typeof ALL_STATUSES | ProjectStatusType;

const STATUS_VALUES = new Set<string>(Object.values(ProjectStatus));

export function parseStatusFilter(raw: string | null): ProjectsStatusFilter {
  if (!raw || raw === ALL_STATUSES) return ALL_STATUSES;
  if (STATUS_VALUES.has(raw)) return raw as ProjectStatusType;
  return ALL_STATUSES;
}

export function parseSearchQuery(raw: string | null): string {
  return (raw ?? "").trim();
}

export function parsePage(raw: string | null): number {
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 1) return 1;
  return Math.trunc(value);
}

export function parsePageSize(raw: string | null): number {
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 1) return 20;
  return Math.min(Math.trunc(value), 50);
}

export const PROJECT_STATUS_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: ALL_STATUSES, label: "Todos" },
  { value: ProjectStatus.FORMULATION, label: "En formulación" },
  { value: ProjectStatus.ACTIVE, label: "En curso" },
  { value: ProjectStatus.DELAYED, label: "Retrasado" },
  { value: ProjectStatus.COMPLETED, label: "Finalizado" },
  { value: ProjectStatus.CANCELLED, label: "Cancelado" },
];

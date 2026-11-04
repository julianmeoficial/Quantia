import type { ProjectResponse } from "@quantia/contracts";

import type { AlertListItem } from "@/components/page";
import { formatPercent } from "@/lib/format";

export type ProjectBudgetSnapshot = {
  projectId: string;
  executedPercent: number;
};

export type ProjectProgressSnapshot = {
  projectId: string;
  progressPercent: number;
};

/**
 * Builds severity-ordered alert items from delayed projects.
 * Budget/progress interpretation is only attached when both real measures exist.
 */
export function buildDashboardAlerts(
  projects: ProjectResponse[],
  budgets: ProjectBudgetSnapshot[] = [],
  progress: ProjectProgressSnapshot[] = [],
): AlertListItem[] {
  const budgetById = new Map(budgets.map((item) => [item.projectId, item.executedPercent]));
  const progressById = new Map(progress.map((item) => [item.projectId, item.progressPercent]));

  const delayed = projects.filter((project) => project.status === "DELAYED");

  return delayed.map((project) => {
    const executed = budgetById.get(project.id);
    const advance = progressById.get(project.id);
    const hasComparison =
      typeof executed === "number" &&
      Number.isFinite(executed) &&
      typeof advance === "number" &&
      Number.isFinite(advance);

    const interpretation = hasComparison
      ? `Ejecución ${formatPercent(executed)} frente a avance ${formatPercent(advance)}`
      : "Proyecto retrasado · requiere seguimiento del equipo.";

    const severity: AlertListItem["severity"] =
      hasComparison && executed - advance >= 20 ? "critical" : "attention";

    return {
      id: project.id,
      severity,
      title: `${project.title} requiere atención`,
      interpretation,
      href: `/proyectos/${project.id}`,
      hrefLabel: "Revisar riesgo",
    };
  });
}

export function taskCompletionPercent(doneCount: number, totalCount: number): number | null {
  if (totalCount <= 0) return null;
  return Math.round((doneCount / totalCount) * 1000) / 10;
}

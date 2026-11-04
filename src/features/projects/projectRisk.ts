import type { TaskResponse } from "@quantia/contracts";

import { taskCompletionPercent } from "@/features/dashboard/buildDashboardAlerts";

export type RiskComparison = {
  progressPercent: number;
  executedPercent: number;
  deviationPoints: number;
};

export function buildRiskComparison(
  progressPercent: number | null,
  executedPercent: number | null,
): RiskComparison | null {
  if (
    progressPercent === null ||
    executedPercent === null ||
    !Number.isFinite(progressPercent) ||
    !Number.isFinite(executedPercent)
  ) {
    return null;
  }
  return {
    progressPercent,
    executedPercent,
    deviationPoints: Math.round((executedPercent - progressPercent) * 10) / 10,
  };
}

export function progressFromTasks(tasks: TaskResponse[], totalHint?: number): number | null {
  const total = totalHint ?? tasks.length;
  const done = tasks.filter((task) => task.status === "DONE").length;
  return taskCompletionPercent(done, total);
}

/** Most urgent actionable task: overdue / blocked first, then soonest due. */
export function pickPriorityTask(tasks: TaskResponse[], now = new Date()): TaskResponse | null {
  const open = tasks.filter((task) => task.status !== "DONE");
  if (open.length === 0) return null;

  const scored = open.map((task) => {
    let score = 0;
    if (task.status === "BLOCKED") score += 200;
    if (task.dueDate) {
      const due = new Date(`${task.dueDate}T12:00:00`);
      if (!Number.isNaN(due.getTime()) && due.getTime() < now.getTime()) score += 300;
      score += Math.max(0, 100 - Math.floor((due.getTime() - now.getTime()) / 86_400_000));
    }
    if (task.priority === "HIGH") score += 50;
    if (task.priority === "MEDIUM") score += 20;
    return { task, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.task ?? null;
}

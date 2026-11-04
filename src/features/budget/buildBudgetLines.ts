import type { BudgetExecutionResponse, BudgetResponse } from "@quantia/contracts";

import type { BudgetLine } from "@/components/page";
import { rubricExecutionStatus, sumMoney } from "@/lib/format";

export type BudgetItemView = BudgetResponse["items"][number];

export function executedByItemId(
  executions: readonly BudgetExecutionResponse[],
): Map<string, string> {
  const groups = new Map<string, string[]>();
  for (const execution of executions) {
    if (!execution.itemId) continue;
    const list = groups.get(execution.itemId) ?? [];
    list.push(execution.amount);
    groups.set(execution.itemId, list);
  }

  const totals = new Map<string, string>();
  for (const [itemId, amounts] of groups) {
    totals.set(itemId, sumMoney(amounts));
  }
  return totals;
}

export function buildBudgetLines(
  budget: BudgetResponse,
  executions: readonly BudgetExecutionResponse[],
): BudgetLine[] {
  const spentByItem = executedByItemId(executions);
  return budget.items.map((item) => {
    const spent = spentByItem.get(item.id) ?? "0.00";
    return {
      id: item.id,
      rubric: item.category,
      planned: item.plannedAmount,
      spent,
      status: rubricExecutionStatus(item.plannedAmount, spent),
    };
  });
}

export function executionsForItem(
  executions: readonly BudgetExecutionResponse[],
  itemId: string,
): BudgetExecutionResponse[] {
  return executions.filter((execution) => execution.itemId === itemId);
}

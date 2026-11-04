import { Suspense } from "react";

import { Skeleton } from "@/components/system";
import { BudgetScreen } from "@/features/budget/BudgetScreen";

/** Client auth shell + searchParams block an instant static shell. */
export const instant = false;

export default function PresupuestoPage() {
  return (
    <Suspense
      fallback={
        <>
          <Skeleton variant="metric" />
          <Skeleton variant="table" />
        </>
      }
    >
      <BudgetScreen />
    </Suspense>
  );
}

import { Suspense } from "react";

import { Skeleton } from "@/components/system";
import { InstitutionalOverviewScreen } from "@/features/institutional";

/** Client auth shell + searchParams block an instant static shell. */
export const instant = false;

export default function InstitucionalPage() {
  return (
    <Suspense
      fallback={
        <>
          <Skeleton variant="metric" />
          <Skeleton variant="list" rows={3} />
        </>
      }
    >
      <InstitutionalOverviewScreen />
    </Suspense>
  );
}

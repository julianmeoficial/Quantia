import { Suspense } from "react";

import { Skeleton } from "@/components/system";
import { GroupDashboardScreen } from "@/features/dashboard";

/** Client auth shell + searchParams block an instant static shell. */
export const instant = false;

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <>
          <Skeleton variant="metric" />
          <Skeleton variant="list" rows={3} />
        </>
      }
    >
      <GroupDashboardScreen />
    </Suspense>
  );
}

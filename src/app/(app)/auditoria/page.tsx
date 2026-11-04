import { Suspense } from "react";

import { Skeleton } from "@/components/system";
import { AuditScreen } from "@/features/audit";

/** Client auth shell blocks an instant static shell. */
export const instant = false;

export default function AuditoriaPage() {
  return (
    <Suspense
      fallback={
        <>
          <Skeleton variant="list" rows={3} />
          <Skeleton variant="table" />
        </>
      }
    >
      <AuditScreen />
    </Suspense>
  );
}

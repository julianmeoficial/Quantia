import { Suspense } from "react";

import { Skeleton } from "@/components/system";
import { MyTasksScreen } from "@/features/tasks";

export default function MisTareasPage() {
  return (
    <Suspense
      fallback={
        <>
          <Skeleton variant="metric" />
          <Skeleton variant="list" rows={4} />
        </>
      }
    >
      <MyTasksScreen />
    </Suspense>
  );
}

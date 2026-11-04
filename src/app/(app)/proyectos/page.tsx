import { Suspense } from "react";

import { Skeleton } from "@/components/system";
import { ProjectsListScreen } from "@/features/projects";

/** Client auth shell + searchParams block an instant static shell. */
export const instant = false;

export default function ProyectosPage() {
  return (
    <Suspense
      fallback={
        <>
          <Skeleton variant="card" />
          <Skeleton variant="table" />
        </>
      }
    >
      <ProjectsListScreen />
    </Suspense>
  );
}

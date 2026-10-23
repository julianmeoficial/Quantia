import { Suspense } from "react";

import { Skeleton } from "@/components/system";
import { ProjectWorkspaceScreen } from "@/features/projects";

/** Client auth shell + searchParams block an instant static shell. */
export const instant = false;

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectWorkspacePage({ params }: ProjectPageProps) {
  const { id } = await params;
  return (
    <Suspense
      fallback={
        <>
          <Skeleton variant="card" />
          <Skeleton variant="list" rows={4} />
        </>
      }
    >
      <ProjectWorkspaceScreen projectId={id} />
    </Suspense>
  );
}

"use client";

import type { ProgressResponse, ProjectResponse, UserResponse } from "@quantia/contracts";
import { useCallback, useState, type ReactNode } from "react";

import { ConfirmDialog } from "@/components/system";
import { deleteProjectProgress } from "@/lib/api";
import { ApiError } from "@/lib/api/errors";
import { canEditProgress } from "@/lib/auth";

import { EditProgressPanel } from "./EditProgressPanel";

export interface ProgressEntryActions {
  /** Callbacks for an entry, or `undefined` when the person may not change it. */
  forEntry: (entry: ProgressResponse) => { onEdit: () => void; onDelete: () => void } | undefined;
  /** Mount once next to the timeline: the edit sheet and the delete confirmation. */
  dialogs: ReactNode;
}

/**
 * Edit / delete for progress entries. Same rule as the API: the author or the people who
 * manage the project. `onChanged` is called after a successful save or delete so the caller
 * can reload its list.
 */
export function useProgressEntryActions({
  user,
  project,
  onChanged,
  onNotice,
}: {
  user: UserResponse | null;
  project: ProjectResponse | null;
  onChanged: () => void;
  onNotice?: (title: string, description?: string) => void;
}): ProgressEntryActions {
  const [editing, setEditing] = useState<ProgressResponse | null>(null);
  const [deleting, setDeleting] = useState<ProgressResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const forEntry = useCallback(
    (entry: ProgressResponse) => {
      if (!user || !project || !canEditProgress(user, project, entry)) return undefined;
      return { onEdit: () => setEditing(entry), onDelete: () => setDeleting(entry) };
    },
    [project, user],
  );

  const confirmDelete = async () => {
    if (!deleting || !project) return;
    setIsDeleting(true);
    try {
      await deleteProjectProgress(project.id, deleting.id);
      setDeleting(null);
      onNotice?.("Avance eliminado");
      onChanged();
    } catch (cause: unknown) {
      const apiError = cause instanceof ApiError ? cause : new ApiError("unknown", null);
      onNotice?.(
        "No se pudo eliminar el avance",
        apiError.kind === "forbidden"
          ? "Solo quien lo registró o la coordinación del proyecto puede eliminarlo."
          : undefined,
      );
      setDeleting(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const dialogs = project ? (
    <>
      <EditProgressPanel
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
        projectId={project.id}
        entry={editing}
        onSuccess={() => {
          onNotice?.("Avance actualizado");
          onChanged();
        }}
      />
      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        title="¿Eliminar este avance?"
        description={`Se eliminará «${deleting?.title ?? ""}» de la bitácora. Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar avance"
        isLoading={isDeleting}
        onConfirm={() => void confirmDelete()}
      />
    </>
  ) : null;

  return { forEntry, dialogs };
}

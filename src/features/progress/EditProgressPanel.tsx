"use client";

import type { ProgressResponse } from "@quantia/contracts";
import { useId, useState, type RefObject } from "react";

import { Button, TextArea, TextField } from "@/components/base";
import { Sheet } from "@/components/system";
import { updateProjectProgress } from "@/lib/api";
import { ApiError } from "@/lib/api/errors";

import * as S from "../projects/CreateProjectPanel.styles";
import { normalizeEvidenceHref } from "./evidenceLinks";

export interface EditProgressPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  entry: ProgressResponse | null;
  onSuccess?: (entry: ProgressResponse) => void;
  triggerRef?: RefObject<HTMLElement | null>;
}

export function EditProgressPanel({
  open,
  onOpenChange,
  projectId,
  entry,
  onSuccess,
  triggerRef,
}: EditProgressPanelProps) {
  // Re-mount the form for each entry so its fields always start from the saved values.
  return (
    <Sheet
      open={open && entry !== null}
      onOpenChange={onOpenChange}
      title="Editar avance"
      description="Corrige el título, la descripción o los enlaces de evidencia de este avance."
      triggerRef={triggerRef}
    >
      {entry ? (
        <EditProgressForm
          key={entry.id}
          projectId={projectId}
          entry={entry}
          onClose={() => onOpenChange(false)}
          onSuccess={onSuccess}
        />
      ) : null}
    </Sheet>
  );
}

function EditProgressForm({
  projectId,
  entry,
  onClose,
  onSuccess,
}: {
  projectId: string;
  entry: ProgressResponse;
  onClose: () => void;
  onSuccess?: (entry: ProgressResponse) => void;
}) {
  const titleId = useId();
  const linksId = useId();
  const [title, setTitle] = useState(entry.title);
  const [description, setDescription] = useState(entry.description);
  const [links, setLinks] = useState(entry.evidenceLinks.join("\n"));
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("El título es obligatorio.");
      document.getElementById(titleId)?.focus();
      return;
    }
    if (!description.trim()) {
      setError("La descripción es obligatoria.");
      return;
    }
    const lines = links
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const normalized = lines.map((line) => normalizeEvidenceHref(line));
    if (normalized.some((href) => href === null)) {
      setError("Cada enlace de evidencia debe ser una URL http o https válida.");
      document.getElementById(linksId)?.focus();
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const saved = await updateProjectProgress(projectId, entry.id, {
        title: title.trim(),
        description: description.trim(),
        evidenceLinks: normalized as string[],
      });
      onClose();
      onSuccess?.(saved);
    } catch (cause: unknown) {
      const apiError = cause instanceof ApiError ? cause : new ApiError("unknown", null);
      if (apiError.kind === "forbidden") {
        setError("Solo quien registró el avance o la coordinación del proyecto puede editarlo.");
      } else if (apiError.kind === "validation") {
        setError(apiError.message || "Revisa los datos del avance.");
      } else if (apiError.kind === "rate_limited") {
        setError("Estamos procesando demasiadas solicitudes. Inténtalo de nuevo en unos segundos.");
      } else {
        setError("No pudimos guardar el avance. Inténtalo de nuevo.");
      }
      setIsSaving(false);
    }
  };

  return (
    <S.Form
      onSubmit={(event) => {
        event.preventDefault();
        void handleSubmit();
      }}
    >
      <TextField
        id={titleId}
        label="Título"
        value={title}
        maxLength={300}
        onChange={(event) => setTitle(event.target.value)}
      />
      <TextArea
        label="Descripción"
        value={description}
        maxLength={10000}
        rows={5}
        onChange={(event) => setDescription(event.target.value)}
      />
      <TextArea
        id={linksId}
        label="Enlaces de evidencia (uno por línea)"
        value={links}
        rows={3}
        placeholder="https://drive.google.com/…"
        onChange={(event) => setLinks(event.target.value)}
      />
      {error ? <S.FormError role="alert">{error}</S.FormError> : null}
      <S.FormActions>
        <Button intent="secondary" type="button" disabled={isSaving} onClick={onClose}>
          Cancelar
        </Button>
        <Button intent="primary" type="submit" isLoading={isSaving}>
          Guardar avance
        </Button>
      </S.FormActions>
    </S.Form>
  );
}

"use client";

import type { ProjectResponse } from "@quantia/contracts";
import { useId, useState, type RefObject } from "react";

import { Button, TextField } from "@/components/base";
import { Sheet } from "@/components/system";
import { createProject } from "@/lib/api";
import { ApiError } from "@/lib/api/errors";

import * as S from "./CreateProjectPanel.styles";

export interface CreateProjectPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (project: ProjectResponse) => void;
  triggerRef?: RefObject<HTMLElement | null>;
}

type FieldErrors = {
  title?: string;
  form?: string;
};

export function CreateProjectPanel({
  open,
  onOpenChange,
  onSuccess,
  triggerRef,
}: CreateProjectPanelProps) {
  const titleId = useId();
  const descriptionId = useId();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  const reset = () => {
    setTitle("");
    setDescription("");
    setErrors({});
    setIsSaving(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (isSaving) return;
    if (!next) reset();
    onOpenChange(next);
  };

  const handleSubmit = async () => {
    const nextErrors: FieldErrors = {};
    const trimmed = title.trim();
    if (!trimmed) nextErrors.title = "Ingresa el título del proyecto.";
    if (trimmed.length > 300) nextErrors.title = "El título no puede superar 300 caracteres.";
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      document.getElementById(titleId)?.focus();
      return;
    }

    setIsSaving(true);
    setErrors({});
    try {
      const project = await createProject({
        title: trimmed,
        description: description.trim() || undefined,
      });
      reset();
      onOpenChange(false);
      onSuccess?.(project);
    } catch (cause: unknown) {
      const apiError = cause instanceof ApiError ? cause : new ApiError("unknown", null);
      if (apiError.kind === "rate_limited") {
        setErrors({
          form: "Estamos procesando demasiadas solicitudes. Inténtalo de nuevo en unos segundos.",
        });
      } else if (apiError.kind === "forbidden") {
        setErrors({ form: "No tienes permiso para crear proyectos." });
      } else if (apiError.kind === "validation") {
        setErrors({ form: "Revisa los datos del formulario." });
      } else {
        setErrors({ form: "No pudimos crear el proyecto. Inténtalo de nuevo." });
      }
      setIsSaving(false);
    }
  };

  return (
    <Sheet
      open={open}
      onOpenChange={handleOpenChange}
      title="Crear proyecto"
      description="Define el título y una descripción breve. Podrás completar el resto en el detalle."
      triggerRef={triggerRef}
      footer={
        <>
          <Button
            intent="secondary"
            type="button"
            onClick={() => handleOpenChange(false)}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button
            intent="primary"
            type="button"
            onClick={() => void handleSubmit()}
            isLoading={isSaving}
          >
            Crear proyecto
          </Button>
        </>
      }
    >
      <S.Form
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit();
        }}
      >
        <TextField
          id={titleId}
          label="Título"
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          error={errors.title}
          autoComplete="off"
        />
        <TextField
          id={descriptionId}
          label="Descripción"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          autoComplete="off"
        />
        {errors.form ? <S.FormError role="alert">{errors.form}</S.FormError> : null}
      </S.Form>
    </Sheet>
  );
}

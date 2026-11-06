"use client";

import type { ProjectResponse } from "@quantia/contracts";
import { ProjectStatus } from "@quantia/contracts";
import { useId, useState, type RefObject } from "react";

import { Button, Select, TextArea, TextField } from "@/components/base";
import { DatePicker } from "@/components/composite";
import { Sheet } from "@/components/system";
import { useAuth } from "@/features/auth/AuthProvider";
import { createProject } from "@/lib/api";
import { ApiError } from "@/lib/api/errors";
import { isAdmin } from "@/lib/auth";

import { CoordinatorPicker } from "./CoordinatorPicker";
import * as S from "./CreateProjectPanel.styles";
import { useCoordinators } from "./useCoordinators";

export interface CreateProjectPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (project: ProjectResponse) => void;
  triggerRef?: RefObject<HTMLElement | null>;
}

type FieldErrors = {
  title?: string;
  coordinator?: string;
  form?: string;
};

const STATUS_OPTIONS = [
  { value: ProjectStatus.FORMULATION, label: "En formulación" },
  { value: ProjectStatus.ACTIVE, label: "En curso" },
  { value: ProjectStatus.DELAYED, label: "Retrasado" },
  { value: ProjectStatus.COMPLETED, label: "Completado" },
  { value: ProjectStatus.CANCELLED, label: "Cancelado" },
];

export function CreateProjectPanel({
  open,
  onOpenChange,
  onSuccess,
  triggerRef,
}: CreateProjectPanelProps) {
  const titleId = useId();
  const descriptionId = useId();
  const objectivesId = useId();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [objectives, setObjectives] = useState("");
  const [status, setStatus] = useState<string>(ProjectStatus.FORMULATION);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const { user } = useAuth();
  // Only administrators assign the responsible coordinator; a coordinator is always their own.
  const mustPickCoordinator = Boolean(user && isAdmin(user));
  const coordinatorsState = useCoordinators(open && mustPickCoordinator);
  const [coordinatorId, setCoordinatorId] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  const reset = () => {
    setTitle("");
    setDescription("");
    setObjectives("");
    setStatus(ProjectStatus.FORMULATION);
    setStartDate(null);
    setEndDate(null);
    setCoordinatorId(null);
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

    if (mustPickCoordinator && !coordinatorId) {
      nextErrors.coordinator = "Elige la persona coordinadora responsable del proyecto.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      if (nextErrors.title) document.getElementById(titleId)?.focus();
      return;
    }

    setIsSaving(true);
    setErrors({});
    try {
      const project = await createProject({
        title: trimmed,
        description: description.trim() || undefined,
        objectives: objectives.trim() || undefined,
        status: status as (typeof ProjectStatus)[keyof typeof ProjectStatus],
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        ...(mustPickCoordinator && coordinatorId ? { coordinatorId } : {}),
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
      description="Define los datos iniciales. Podrás añadir integrantes al editar el proyecto."
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
        <TextArea
          id={descriptionId}
          label="Descripción"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={5000}
          rows={3}
        />
        <TextArea
          id={objectivesId}
          label="Objetivos"
          value={objectives}
          onChange={(event) => setObjectives(event.target.value)}
          maxLength={5000}
          rows={3}
        />
        {mustPickCoordinator ? (
          <CoordinatorPicker
            label="Responsable del proyecto"
            required
            coordinators={coordinatorsState.coordinators}
            status={coordinatorsState.status}
            value={coordinatorId}
            onValueChange={(entry) => {
              setCoordinatorId(entry.id);
              setErrors((prev) => ({ ...prev, coordinator: undefined }));
            }}
            onRetry={coordinatorsState.reload}
            error={errors.coordinator}
            disabled={isSaving}
          />
        ) : null}
        <Select label="Estado" options={STATUS_OPTIONS} value={status} onValueChange={setStatus} />
        <DatePicker
          label="Fecha de inicio"
          value={startDate}
          onValueChange={setStartDate}
          withTime
        />
        <DatePicker label="Fecha límite" value={endDate} onValueChange={setEndDate} withTime />
        {errors.form ? <S.FormError role="alert">{errors.form}</S.FormError> : null}
      </S.Form>
    </Sheet>
  );
}

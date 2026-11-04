"use client";

import type { ProjectResponse, TaskResponse, UserResponse } from "@quantia/contracts";
import { TaskPriority, TaskStatus } from "@quantia/contracts";
import { useId, useState, type RefObject } from "react";

import { Button, Select, TextField } from "@/components/base";
import { Sheet } from "@/components/system";
import { createProjectTask } from "@/lib/api";
import { ApiError } from "@/lib/api/errors";
import { toApiDate } from "@/lib/format";

import * as S from "../projects/CreateProjectPanel.styles";

export interface CreateTaskPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: ProjectResponse;
  me: UserResponse;
  onSuccess?: (task: TaskResponse) => void;
  triggerRef?: RefObject<HTMLElement | null>;
}

function memberOptions(project: ProjectResponse, me: UserResponse) {
  const ids = Array.from(new Set([project.coordinatorId, ...project.memberIds]));
  return ids.map((id) => ({
    value: id,
    label: id === me.id ? me.fullName : "Integrante del proyecto",
  }));
}

export function CreateTaskPanel({
  open,
  onOpenChange,
  project,
  me,
  onSuccess,
  triggerRef,
}: CreateTaskPanelProps) {
  const titleId = useId();
  const dueId = useId();
  const [title, setTitle] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [priority, setPriority] = useState<string>(TaskPriority.MEDIUM);
  const [status, setStatus] = useState<string>(TaskStatus.TODO);
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const reset = () => {
    setTitle("");
    setAssigneeId("");
    setPriority(TaskPriority.MEDIUM);
    setStatus(TaskStatus.TODO);
    setDueDate("");
    setError(null);
    setIsSaving(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (isSaving) return;
    if (!next) reset();
    onOpenChange(next);
  };

  const handleSubmit = async () => {
    const trimmed = title.trim();
    if (!trimmed) {
      setError("Ingresa el título de la tarea.");
      document.getElementById(titleId)?.focus();
      return;
    }

    let apiDue: string | undefined;
    if (dueDate.trim()) {
      const parsed = toApiDate(dueDate.trim());
      if (!parsed) {
        setError("Ingresa una fecha con formato DD/MM/AAAA.");
        document.getElementById(dueId)?.focus();
        return;
      }
      apiDue = parsed;
    }

    setIsSaving(true);
    setError(null);
    try {
      const task = await createProjectTask(project.id, {
        title: trimmed,
        assigneeId: assigneeId || undefined,
        priority: priority as (typeof TaskPriority)[keyof typeof TaskPriority],
        status: status as (typeof TaskStatus)[keyof typeof TaskStatus],
        dueDate: apiDue,
      });
      reset();
      onOpenChange(false);
      onSuccess?.(task);
    } catch (cause: unknown) {
      const apiError = cause instanceof ApiError ? cause : new ApiError("unknown", null);
      if (apiError.kind === "forbidden") {
        setError("No tienes permiso para crear tareas en este proyecto.");
      } else if (apiError.kind === "rate_limited") {
        setError("Estamos procesando demasiadas solicitudes. Inténtalo de nuevo en unos segundos.");
      } else if (apiError.kind === "validation") {
        setError("Revisa los datos del formulario.");
      } else {
        setError("No pudimos crear la tarea. Inténtalo de nuevo.");
      }
      setIsSaving(false);
    }
  };

  return (
    <Sheet
      open={open}
      onOpenChange={handleOpenChange}
      title="Crear tarea"
      description="Define título, responsable, prioridad y fecha. Solo gestores del proyecto pueden crear."
      triggerRef={triggerRef}
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
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Ej.: Revisar protocolo"
        />
        <Select
          label="Responsable"
          options={[{ value: "", label: "Sin asignar" }, ...memberOptions(project, me)]}
          value={assigneeId}
          onValueChange={setAssigneeId}
        />
        <Select
          label="Prioridad"
          options={[
            { value: TaskPriority.LOW, label: "Baja" },
            { value: TaskPriority.MEDIUM, label: "Media" },
            { value: TaskPriority.HIGH, label: "Alta" },
          ]}
          value={priority}
          onValueChange={setPriority}
        />
        <Select
          label="Estado"
          options={[
            { value: TaskStatus.TODO, label: "Pendiente" },
            { value: TaskStatus.IN_PROGRESS, label: "En progreso" },
            { value: TaskStatus.BLOCKED, label: "Bloqueada" },
          ]}
          value={status}
          onValueChange={setStatus}
        />
        <TextField
          id={dueId}
          label="Fecha límite"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
          placeholder="Ej.: 15/10/2026"
        />
        {error ? <S.FormError role="alert">{error}</S.FormError> : null}
        <S.FormActions>
          <Button
            intent="secondary"
            type="button"
            disabled={isSaving}
            onClick={() => handleOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button intent="primary" type="submit" isLoading={isSaving}>
            Crear tarea
          </Button>
        </S.FormActions>
      </S.Form>
    </Sheet>
  );
}

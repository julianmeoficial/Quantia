"use client";

import type { ProjectResponse, TaskResponse, UserResponse } from "@quantia/contracts";
import { TaskPriority, TaskStatus } from "@quantia/contracts";
import { useId, useState, type RefObject } from "react";

import { Button, Select, TextArea, TextField } from "@/components/base";
import { DatePicker } from "@/components/composite";
import { Sheet } from "@/components/system";
import { createProjectTask } from "@/lib/api";
import { ApiError } from "@/lib/api/errors";

import * as S from "../projects/CreateProjectPanel.styles";
import { projectMemberOptions, type MemberNameMap } from "./memberLabels";

export interface CreateTaskPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: ProjectResponse;
  me: UserResponse;
  onSuccess?: (task: TaskResponse) => void;
  triggerRef?: RefObject<HTMLElement | null>;
  memberNames?: MemberNameMap;
}

const STATUS_OPTIONS = [
  { value: TaskStatus.TODO, label: "Por hacer" },
  { value: TaskStatus.IN_PROGRESS, label: "En curso" },
  { value: TaskStatus.BLOCKED, label: "Bloqueada" },
  { value: TaskStatus.DONE, label: "Hecha" },
];

const PRIORITY_OPTIONS = [
  { value: TaskPriority.LOW, label: "Baja" },
  { value: TaskPriority.MEDIUM, label: "Media" },
  { value: TaskPriority.HIGH, label: "Alta" },
];

export function CreateTaskPanel({
  open,
  onOpenChange,
  project,
  me,
  onSuccess,
  triggerRef,
  memberNames,
}: CreateTaskPanelProps) {
  const titleId = useId();
  const descriptionId = useId();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [priority, setPriority] = useState<string>(TaskPriority.MEDIUM);
  const [status, setStatus] = useState<string>(TaskStatus.TODO);
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const reset = () => {
    setTitle("");
    setDescription("");
    setAssigneeId("");
    setPriority(TaskPriority.MEDIUM);
    setStatus(TaskStatus.TODO);
    setDueDate(null);
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
    if (trimmed.length > 300) {
      setError("El título no puede superar 300 caracteres.");
      document.getElementById(titleId)?.focus();
      return;
    }

    const trimmedDescription = description.trim();
    if (trimmedDescription.length > 5000) {
      setError("La descripción no puede superar 5000 caracteres.");
      document.getElementById(descriptionId)?.focus();
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const task = await createProjectTask(project.id, {
        title: trimmed,
        description: trimmedDescription || undefined,
        assigneeId: assigneeId || undefined,
        priority: priority as (typeof TaskPriority)[keyof typeof TaskPriority],
        status: status as (typeof TaskStatus)[keyof typeof TaskStatus],
        dueDate: dueDate || undefined,
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
      description="Define título, descripción, responsable, prioridad, estado y fecha. Solo gestores del proyecto pueden crear."
      triggerRef={triggerRef}
      footer={
        <>
          <Button
            intent="secondary"
            type="button"
            disabled={isSaving}
            onClick={() => handleOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            intent="primary"
            type="button"
            isLoading={isSaving}
            onClick={() => void handleSubmit()}
          >
            Crear tarea
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
          placeholder="Ej.: Revisar protocolo"
          autoComplete="off"
        />
        <TextArea
          id={descriptionId}
          label="Descripción"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={5000}
          rows={4}
        />
        <Select
          label="Responsable"
          options={[
            { value: "", label: "Sin asignar" },
            ...projectMemberOptions(project, me, memberNames),
          ]}
          value={assigneeId}
          onValueChange={setAssigneeId}
        />
        <Select
          label="Prioridad"
          options={PRIORITY_OPTIONS}
          value={priority}
          onValueChange={setPriority}
        />
        <Select label="Estado" options={STATUS_OPTIONS} value={status} onValueChange={setStatus} />
        <DatePicker label="Fecha límite" value={dueDate} onValueChange={setDueDate} withTime />
        {error ? <S.FormError role="alert">{error}</S.FormError> : null}
      </S.Form>
    </Sheet>
  );
}

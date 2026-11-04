"use client";

import type { ProjectResponse, TaskResponse, UserResponse } from "@quantia/contracts";
import { useId, useState, type RefObject } from "react";

import { Button, Select, TextField } from "@/components/base";
import { Sheet } from "@/components/system";
import { updateProjectTask } from "@/lib/api";
import { ApiError } from "@/lib/api/errors";
import { formatDate, toApiDate } from "@/lib/format";

import * as S from "./CreateProjectPanel.styles";

export interface EditTaskPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: ProjectResponse;
  task: TaskResponse | null;
  me: UserResponse;
  onSuccess?: (task: TaskResponse) => void;
  triggerRef?: RefObject<HTMLElement | null>;
  focusField?: "assignee" | "dueDate";
}

function memberOptions(project: ProjectResponse, me: UserResponse) {
  const ids = Array.from(new Set([project.coordinatorId, ...project.memberIds]));
  return ids.map((id) => ({
    value: id,
    label: id === me.id ? me.fullName : "Integrante del proyecto",
  }));
}

function toDisplayDate(isoDate: string | null): string {
  if (!isoDate) return "";
  const formatted = formatDate(isoDate);
  return formatted === "—" ? "" : formatted;
}

function EditTaskForm({
  project,
  task,
  me,
  focusField,
  onOpenChange,
  onSuccess,
}: {
  project: ProjectResponse;
  task: TaskResponse;
  me: UserResponse;
  focusField: "assignee" | "dueDate";
  onOpenChange: (open: boolean) => void;
  onSuccess?: (task: TaskResponse) => void;
}) {
  const dueId = useId();
  const [assigneeId, setAssigneeId] = useState(task.assigneeId ?? "");
  const [dueDate, setDueDate] = useState(toDisplayDate(task.dueDate));
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const body: { assigneeId?: string; dueDate?: string } = {};
      if (assigneeId) body.assigneeId = assigneeId;
      if (dueDate.trim()) {
        const apiDue = toApiDate(dueDate.trim());
        if (!apiDue) {
          setError("Ingresa una fecha con formato DD/MM/AAAA.");
          setIsSaving(false);
          document.getElementById(dueId)?.focus();
          return;
        }
        body.dueDate = apiDue;
      }

      const updated = await updateProjectTask(project.id, task.id, body);
      onOpenChange(false);
      onSuccess?.(updated);
    } catch (cause: unknown) {
      const apiError = cause instanceof ApiError ? cause : new ApiError("unknown", null);
      if (apiError.kind === "forbidden") {
        setError("No tienes permiso para editar esta tarea.");
      } else if (apiError.kind === "rate_limited") {
        setError("Estamos procesando demasiadas solicitudes. Inténtalo de nuevo en unos segundos.");
      } else {
        setError("No pudimos guardar los cambios. Inténtalo de nuevo.");
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
      <Select
        label="Responsable"
        options={[{ value: "", label: "Sin asignar" }, ...memberOptions(project, me)]}
        value={assigneeId}
        onValueChange={setAssigneeId}
      />
      <TextField
        id={dueId}
        label="Fecha límite"
        value={dueDate}
        onChange={(event) => setDueDate(event.target.value)}
        placeholder="Ej.: 15/10/2026"
        autoFocus={focusField === "dueDate"}
      />
      {error ? <S.FormError role="alert">{error}</S.FormError> : null}
      <S.FormActions>
        <Button
          intent="secondary"
          type="button"
          disabled={isSaving}
          onClick={() => onOpenChange(false)}
        >
          Cancelar
        </Button>
        <Button intent="primary" type="submit" isLoading={isSaving}>
          Guardar
        </Button>
      </S.FormActions>
    </S.Form>
  );
}

export function EditTaskPanel({
  open,
  onOpenChange,
  project,
  task,
  me,
  onSuccess,
  triggerRef,
  focusField = "dueDate",
}: EditTaskPanelProps) {
  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={task ? `Editar · ${task.title}` : "Editar tarea"}
      description="Ajusta responsable o fecha límite. Los cambios se guardan en el servidor."
      triggerRef={triggerRef}
    >
      {open && task ? (
        <EditTaskForm
          key={`${task.id}-${focusField}`}
          project={project}
          task={task}
          me={me}
          focusField={focusField}
          onOpenChange={onOpenChange}
          onSuccess={onSuccess}
        />
      ) : (
        <S.FormError role="status">Selecciona una tarea para editar.</S.FormError>
      )}
    </Sheet>
  );
}

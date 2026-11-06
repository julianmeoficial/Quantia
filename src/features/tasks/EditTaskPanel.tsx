"use client";

import type {
  ProjectResponse,
  TaskResponse,
  UpdateTaskRequest,
  UserResponse,
} from "@quantia/contracts";
import { TaskPriority, TaskStatus } from "@quantia/contracts";
import { useId, useState, type RefObject } from "react";

import { Button, Select, TextArea, TextField } from "@/components/base";
import { DatePicker } from "@/components/composite";
import { ConfirmDialog, Sheet } from "@/components/system";
import { deleteProjectTask, updateProjectTask } from "@/lib/api";
import { ApiError } from "@/lib/api/errors";

import * as S from "../projects/CreateProjectPanel.styles";
import { projectMemberOptions, type MemberNameMap } from "./memberLabels";

export interface EditTaskPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: ProjectResponse;
  task: TaskResponse | null;
  me: UserResponse;
  onSuccess?: (task: TaskResponse) => void;
  onDeleted?: (taskId: string) => void;
  triggerRef?: RefObject<HTMLElement | null>;
  focusField?: "title" | "assignee" | "dueDate" | "status" | "priority";
  memberNames?: MemberNameMap;
  canDelete?: boolean;
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

function EditTaskForm({
  project,
  task,
  me,
  focusField,
  memberNames,
  canDelete,
  onOpenChange,
  onSuccess,
  onDeleted,
}: {
  project: ProjectResponse;
  task: TaskResponse;
  me: UserResponse;
  focusField: NonNullable<EditTaskPanelProps["focusField"]>;
  memberNames?: MemberNameMap;
  canDelete: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (task: TaskResponse) => void;
  onDeleted?: (taskId: string) => void;
}) {
  const titleId = useId();
  const descriptionId = useId();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [assigneeId, setAssigneeId] = useState(task.assigneeId ?? "");
  const [priority, setPriority] = useState<string>(task.priority);
  const [status, setStatus] = useState<string>(task.status);
  const [dueDate, setDueDate] = useState<string | null>(task.dueDate);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSubmit = async () => {
    setError(null);
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

    const body: UpdateTaskRequest = {
      title: trimmed,
      description: trimmedDescription || undefined,
      status: status as (typeof TaskStatus)[keyof typeof TaskStatus],
      priority: priority as (typeof TaskPriority)[keyof typeof TaskPriority],
    };
    if (assigneeId) body.assigneeId = assigneeId;
    if (dueDate) body.dueDate = dueDate;

    setIsSaving(true);
    try {
      const updated = await updateProjectTask(project.id, task.id, body);
      setIsSaving(false);
      onOpenChange(false);
      onSuccess?.(updated);
    } catch (cause: unknown) {
      const apiError = cause instanceof ApiError ? cause : new ApiError("unknown", null);
      if (apiError.kind === "forbidden") {
        setError("No tienes permiso para editar esta tarea.");
      } else if (apiError.kind === "rate_limited") {
        setError("Estamos procesando demasiadas solicitudes. Inténtalo de nuevo en unos segundos.");
      } else if (apiError.kind === "validation") {
        setError("Revisa los datos del formulario.");
      } else {
        setError("No pudimos guardar los cambios. Inténtalo de nuevo.");
      }
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await deleteProjectTask(project.id, task.id);
      setDeleteOpen(false);
      setIsDeleting(false);
      onOpenChange(false);
      onDeleted?.(task.id);
    } catch (cause: unknown) {
      const apiError = cause instanceof ApiError ? cause : new ApiError("unknown", null);
      setDeleteOpen(false);
      if (apiError.kind === "forbidden") {
        setError("No tienes permiso para eliminar esta tarea.");
      } else if (apiError.kind === "rate_limited") {
        setError("Estamos procesando demasiadas solicitudes. Inténtalo de nuevo en unos segundos.");
      } else {
        setError("No pudimos eliminar la tarea. Inténtalo de nuevo.");
      }
      setIsDeleting(false);
    }
  };

  return (
    <>
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
          autoFocus={focusField === "title"}
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
        <S.FormActions>
          {canDelete ? (
            <Button
              intent="danger"
              type="button"
              disabled={isSaving || isDeleting}
              onClick={() => setDeleteOpen(true)}
            >
              Eliminar
            </Button>
          ) : null}
          <Button
            intent="secondary"
            type="button"
            disabled={isSaving || isDeleting}
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button intent="primary" type="submit" isLoading={isSaving} disabled={isDeleting}>
            Guardar
          </Button>
        </S.FormActions>
      </S.Form>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          if (!isDeleting) setDeleteOpen(open);
        }}
        title="Eliminar tarea"
        description={`Se eliminará permanentemente «${task.title}». Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar tarea"
        intent="danger"
        isLoading={isDeleting}
        onConfirm={() => {
          void handleDelete();
        }}
      />
    </>
  );
}

export function EditTaskPanel({
  open,
  onOpenChange,
  project,
  task,
  me,
  onSuccess,
  onDeleted,
  triggerRef,
  focusField = "title",
  memberNames,
  canDelete = true,
}: EditTaskPanelProps) {
  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
  };

  return (
    <Sheet
      open={open}
      onOpenChange={handleOpenChange}
      title={task ? `Editar · ${task.title}` : "Editar tarea"}
      description="Actualiza título, descripción, responsable, estado, prioridad y fecha límite."
      triggerRef={triggerRef}
    >
      {open && task ? (
        <EditTaskForm
          key={`${task.id}-${focusField}`}
          project={project}
          task={task}
          me={me}
          focusField={focusField}
          memberNames={memberNames}
          canDelete={canDelete}
          onOpenChange={onOpenChange}
          onSuccess={onSuccess}
          onDeleted={onDeleted}
        />
      ) : (
        <S.FormError role="status">Selecciona una tarea para editar.</S.FormError>
      )}
    </Sheet>
  );
}

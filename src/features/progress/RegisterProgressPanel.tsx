"use client";

import type { ProgressResponse } from "@quantia/contracts";
import { useCallback, useEffect, useId, useRef, useState, type RefObject } from "react";

import { Button, Select, TextArea, TextField } from "@/components/base";
import { FileUploader, type UploadItem } from "@/components/composite";
import { Sheet, SyncStatus, type SyncStatusValue } from "@/components/system";
import {
  DOCUMENT_ACCEPT,
  DOCUMENT_MAX_BYTES,
  createProjectProgress,
  uploadProjectDocument,
} from "@/lib/api";
import { ApiError } from "@/lib/api/errors";
import { readDraft, saveDraft } from "@/lib/auth";

import * as S from "./RegisterProgressPanel.styles";
import { draftKey, isHttpUrl, parseDraft, serializeDraft } from "./progressDraft";

export type ProgressTaskOption = {
  value: string;
  label: string;
  projectId: string;
};

export interface RegisterProgressPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Fixed project context (PRJ-01). When omitted, project comes from the selected task. */
  projectId?: string;
  taskOptions: ProgressTaskOption[];
  initialTaskId?: string | null;
  onSuccess?: (progress: ProgressResponse) => void;
  triggerRef?: RefObject<HTMLElement | null>;
}

type FieldErrors = {
  title?: string;
  description?: string;
  taskId?: string;
  evidenceLink?: string;
  form?: string;
};

type PendingFile = {
  localId: string;
  file: File;
};

function mapSync(status: ProgressResponse["syncStatus"]): SyncStatusValue {
  if (status === "PENDING") return "pending";
  if (status === "FAILED") return "failed";
  return "synced";
}

const NONE_TASK = "__none__";

export function RegisterProgressPanel({
  open,
  onOpenChange,
  projectId: fixedProjectId,
  taskOptions,
  initialTaskId = null,
  onSuccess,
  triggerRef,
}: RegisterProgressPanelProps) {
  const formId = useId();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [taskId, setTaskId] = useState(NONE_TASK);
  const [evidenceLink, setEvidenceLink] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saved, setSaved] = useState<ProgressResponse | null>(null);
  const hydratedOpenRef = useRef(false);

  const scopedTasks = fixedProjectId
    ? taskOptions.filter((option) => option.projectId === fixedProjectId)
    : taskOptions;

  const selectedTask = scopedTasks.find((option) => option.value === taskId);
  const resolvedProjectId = fixedProjectId ?? selectedTask?.projectId ?? null;

  const hydrate = useCallback(() => {
    const draftProjectId = fixedProjectId ?? scopedTasks[0]?.projectId;
    const draft = draftProjectId ? parseDraft(readDraft(draftKey(draftProjectId))) : null;

    if (draft && (!fixedProjectId || draft.projectId === fixedProjectId)) {
      setTitle(draft.title);
      setDescription(draft.description);
      const draftTaskValid = Boolean(
        draft.taskId && scopedTasks.some((option) => option.value === draft.taskId),
      );
      setTaskId(draftTaskValid ? draft.taskId : fixedProjectId ? NONE_TASK : "");
      setEvidenceLink(draft.evidenceLink);
    } else {
      setTitle("");
      setDescription("");
      const initialValid =
        Boolean(initialTaskId) && scopedTasks.some((option) => option.value === initialTaskId);
      setTaskId(initialValid ? (initialTaskId as string) : fixedProjectId ? NONE_TASK : "");
      setEvidenceLink("");
    }
    setErrors({});
    setUploads([]);
    setPendingFiles([]);
    setSaved(null);
    setIsSubmitting(false);
  }, [fixedProjectId, initialTaskId, scopedTasks]);

  useEffect(() => {
    if (!open) {
      hydratedOpenRef.current = false;
      return;
    }
    if (hydratedOpenRef.current) return;
    hydratedOpenRef.current = true;
    hydrate();
  }, [open, hydrate]);

  const persistDraft = useCallback(
    (projectId: string) => {
      saveDraft(
        draftKey(projectId),
        serializeDraft({
          projectId,
          title,
          description,
          taskId: taskId === NONE_TASK ? "" : taskId,
          evidenceLink,
        }),
      );
    },
    [description, evidenceLink, taskId, title],
  );

  const onSelectFiles = (files: File[]) => {
    for (const file of files) {
      const localId = `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setPendingFiles((prev) => [...prev, { localId, file }]);
      setUploads((prev) => [
        ...prev,
        {
          id: localId,
          name: file.name,
          sizeBytes: file.size,
          status: "uploading",
          progress: 0,
        },
      ]);
    }
  };

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    if (!trimmedTitle) next.title = "Escribe un título para el avance.";
    else if (trimmedTitle.length > 300) next.title = "El título no puede superar 300 caracteres.";
    if (!trimmedDescription) next.description = "Describe el avance realizado.";
    else if (trimmedDescription.length > 10_000) {
      next.description = "La descripción no puede superar 10.000 caracteres.";
    }
    if (!fixedProjectId && (!taskId || !resolvedProjectId)) {
      next.taskId = "Selecciona una tarea para indicar el proyecto.";
    }
    const link = evidenceLink.trim();
    if (link && !isHttpUrl(link)) {
      next.evidenceLink = "El enlace debe ser una URL http o https válida.";
    }
    return next;
  };

  const handleSubmit = async () => {
    if (isSubmitting || saved) return;
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const projectId = resolvedProjectId;
    if (!projectId) {
      setErrors({ form: "No hay un proyecto válido para guardar el avance." });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      for (const pending of pendingFiles) {
        try {
          await uploadProjectDocument(projectId, pending.file, {
            onProgress: (ratio) => {
              setUploads((prev) =>
                prev.map((item) =>
                  item.id === pending.localId
                    ? { ...item, progress: Math.round(ratio * 100), status: "uploading" }
                    : item,
                ),
              );
            },
          });
          setUploads((prev) =>
            prev.map((item) =>
              item.id === pending.localId ? { ...item, status: "done", progress: 100 } : item,
            ),
          );
        } catch (cause: unknown) {
          const error = cause instanceof ApiError ? cause : new ApiError("unknown", null);
          setUploads((prev) =>
            prev.map((item) =>
              item.id === pending.localId
                ? { ...item, status: "error", error: error.message }
                : item,
            ),
          );
          if (error.kind === "unauthorized") persistDraft(projectId);
          setErrors({
            form:
              error.kind === "rate_limited"
                ? "Hay demasiadas solicitudes. Espera un momento e inténtalo de nuevo."
                : "No se pudieron subir todos los documentos. Corrige los archivos e inténtalo de nuevo.",
          });
          setIsSubmitting(false);
          return;
        }
      }

      const link = evidenceLink.trim();
      const progress = await createProjectProgress(projectId, {
        title: title.trim(),
        description: description.trim(),
        ...(taskId && taskId !== NONE_TASK ? { taskId } : {}),
        ...(link ? { evidenceLinks: [link] } : {}),
      });

      setSaved(progress);
      setPendingFiles([]);
      onSuccess?.(progress);
    } catch (cause: unknown) {
      const error = cause instanceof ApiError ? cause : new ApiError("unknown", null);
      if (error.kind === "unauthorized") {
        persistDraft(projectId);
        setErrors({
          form: "Tu sesión expiró. El borrador se conservó; inicia sesión de nuevo para continuar.",
        });
      } else if (error.kind === "validation") {
        setErrors({ form: error.message || "Revisa los datos del avance." });
      } else if (error.kind === "rate_limited") {
        setErrors({
          form:
            error.retryAfterSeconds !== undefined
              ? `Demasiadas solicitudes. Podrás reintentar en ${error.retryAfterSeconds} s.`
              : "Demasiadas solicitudes. Espera un momento e inténtalo de nuevo.",
        });
      } else if (error.kind === "forbidden") {
        setErrors({ form: "No tienes permiso para registrar avances en este proyecto." });
      } else {
        setErrors({ form: error.message });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const taskSelectOptions = [
    ...(fixedProjectId ? [{ value: NONE_TASK, label: "Sin tarea asociada" }] : []),
    ...scopedTasks.map((option) => ({ value: option.value, label: option.label })),
  ];

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next && !saved && resolvedProjectId && (title || description || evidenceLink)) {
          persistDraft(resolvedProjectId);
        }
        if (!next && saved) {
          setSaved(null);
          setTitle("");
          setDescription("");
          setEvidenceLink("");
          setUploads([]);
          setPendingFiles([]);
        }
        onOpenChange(next);
      }}
      title="Registrar avance"
      description="Describe el trabajo, adjunta evidencia y guarda. La sincronización con Notion no borra lo guardado en Quantia."
      triggerRef={triggerRef}
      footer={
        saved ? (
          <Button intent="primary" type="button" onClick={() => onOpenChange(false)}>
            Listo
          </Button>
        ) : (
          <>
            <Button
              intent="secondary"
              type="button"
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              intent="primary"
              type="submit"
              form={formId}
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              Guardar avance
            </Button>
          </>
        )
      }
    >
      {saved ? (
        <S.SavedStack>
          <S.SavedMessage role="status">
            Avance guardado. Puedes seguir trabajando mientras se sincroniza.
          </S.SavedMessage>
          <SyncStatus status={mapSync(saved.syncStatus)} persisted />
        </S.SavedStack>
      ) : (
        <S.Form
          id={formId}
          onSubmit={(event) => {
            event.preventDefault();
            void handleSubmit();
          }}
        >
          <TextField
            label="Título"
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            error={errors.title}
            maxLength={300}
            autoComplete="off"
          />
          <TextArea
            label="Descripción"
            required
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            error={errors.description}
            maxLength={10_000}
            rows={5}
          />
          {taskSelectOptions.length > 0 ? (
            <Select
              label={fixedProjectId ? "Tarea (opcional)" : "Tarea"}
              required={!fixedProjectId}
              options={taskSelectOptions}
              value={taskId || undefined}
              onValueChange={setTaskId}
              error={errors.taskId}
              placeholder="Selecciona una tarea"
            />
          ) : null}
          <TextField
            label="Enlace de evidencia"
            description="URL http(s) opcional. Los archivos se adjuntan aparte."
            value={evidenceLink}
            onChange={(event) => setEvidenceLink(event.target.value)}
            error={errors.evidenceLink}
            inputMode="url"
            autoComplete="off"
          />
          <FileUploader
            label="Adjuntar documento"
            accept={DOCUMENT_ACCEPT}
            maxBytes={DOCUMENT_MAX_BYTES}
            files={uploads}
            onSelect={onSelectFiles}
            disabled={isSubmitting || !resolvedProjectId}
          />
          {errors.form ? <S.FormError role="alert">{errors.form}</S.FormError> : null}
        </S.Form>
      )}
    </Sheet>
  );
}

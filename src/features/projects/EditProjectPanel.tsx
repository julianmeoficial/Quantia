"use client";

import type {
  ProjectResponse,
  UpdateProjectRequest,
  UserDirectoryEntry,
  UserResponse,
} from "@quantia/contracts";
import { ProjectStatus } from "@quantia/contracts";
import { useEffect, useId, useState, type RefObject } from "react";

import { Button, Select, TextArea, TextField } from "@/components/base";
import { DatePicker, SearchField } from "@/components/composite";
import { ConfirmDialog, Sheet } from "@/components/system";
import {
  addProjectMember,
  removeProjectMember,
  searchUserDirectory,
  updateProject,
} from "@/lib/api";
import { ApiError } from "@/lib/api/errors";
import { canManageMembers, isAdmin } from "@/lib/auth";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";

import * as S from "./CreateProjectPanel.styles";
import * as M from "./EditProjectPanel.styles";
import { CoordinatorPicker } from "./CoordinatorPicker";
import { useCoordinators } from "./useCoordinators";

export interface EditProjectPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: ProjectResponse | null;
  me: UserResponse;
  onSuccess?: (project: ProjectResponse) => void;
  triggerRef?: RefObject<HTMLElement | null>;
}

const STATUS_OPTIONS = [
  { value: ProjectStatus.FORMULATION, label: "En formulación" },
  { value: ProjectStatus.ACTIVE, label: "En curso" },
  { value: ProjectStatus.DELAYED, label: "Retrasado" },
  { value: ProjectStatus.COMPLETED, label: "Completado" },
  { value: ProjectStatus.CANCELLED, label: "Cancelado" },
];

function EditProjectForm({
  project,
  me,
  onOpenChange,
  onSuccess,
}: {
  project: ProjectResponse;
  me: UserResponse;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (project: ProjectResponse) => void;
}) {
  const titleId = useId();
  const descriptionId = useId();
  const objectivesId = useId();

  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description ?? "");
  const [objectives, setObjectives] = useState(project.objectives ?? "");
  const [status, setStatus] = useState<string>(project.status);
  const [startDate, setStartDate] = useState<string | null>(project.startDate);
  const [endDate, setEndDate] = useState<string | null>(project.endDate);
  const [coordinatorId, setCoordinatorId] = useState(project.coordinatorId);
  const [current, setCurrent] = useState(project);
  const [nameMap, setNameMap] = useState<Map<string, string>>(() => {
    const map = new Map<string, string>();
    map.set(me.id, me.fullName);
    return map;
  });

  const [memberQ, setMemberQ] = useState("");
  const debouncedMemberQ = useDebouncedValue(memberQ.trim(), 300);
  const [memberHits, setMemberHits] = useState<UserDirectoryEntry[]>([]);
  const [memberError, setMemberError] = useState<string | null>(null);
  const [memberLoading, setMemberLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [memberBusyId, setMemberBusyId] = useState<string | null>(null);
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);

  const allowMembers = canManageMembers(me, current);
  const allowCoordinatorPick = isAdmin(me);
  const coordinatorsState = useCoordinators(allowCoordinatorPick);

  useEffect(() => {
    if (!allowMembers || debouncedMemberQ.length < 2) return;

    let cancelled = false;
    void (async () => {
      await Promise.resolve();
      if (cancelled) return;
      setMemberLoading(true);
      setMemberError(null);
      try {
        const result = await searchUserDirectory({ q: debouncedMemberQ, page: 1, pageSize: 20 });
        if (cancelled) return;
        setMemberHits(result.data);
        setNameMap((prev) => {
          const next = new Map(prev);
          for (const entry of result.data) next.set(entry.id, entry.fullName);
          return next;
        });
      } catch (cause: unknown) {
        if (cancelled) return;
        const apiError = cause instanceof ApiError ? cause : new ApiError("unknown", null);
        if (apiError.kind === "forbidden") {
          setMemberError("No tienes permiso para buscar usuarios.");
        } else if (apiError.kind === "rate_limited") {
          setMemberError("Demasiadas búsquedas. Espera unos segundos.");
        } else {
          setMemberError("No pudimos buscar usuarios. Inténtalo de nuevo.");
        }
        setMemberHits([]);
      } finally {
        if (!cancelled) setMemberLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [allowMembers, debouncedMemberQ]);

  const visibleMemberHits = debouncedMemberQ.length >= 2 ? memberHits : [];

  const handleSubmit = async () => {
    setError(null);
    const trimmed = title.trim();
    if (!trimmed) {
      setError("Ingresa el título del proyecto.");
      document.getElementById(titleId)?.focus();
      return;
    }
    if (trimmed.length > 300) {
      setError("El título no puede superar 300 caracteres.");
      document.getElementById(titleId)?.focus();
      return;
    }

    const desc = description.trim();
    const objs = objectives.trim();
    if (desc.length > 5000) {
      setError("La descripción no puede superar 5000 caracteres.");
      document.getElementById(descriptionId)?.focus();
      return;
    }
    if (objs.length > 5000) {
      setError("Los objetivos no pueden superar 5000 caracteres.");
      document.getElementById(objectivesId)?.focus();
      return;
    }

    const body: UpdateProjectRequest = {
      title: trimmed,
      description: desc || undefined,
      objectives: objs || undefined,
      status: status as (typeof ProjectStatus)[keyof typeof ProjectStatus],
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    };
    if (allowCoordinatorPick && coordinatorId && coordinatorId !== current.coordinatorId) {
      body.coordinatorId = coordinatorId;
    }

    setIsSaving(true);
    try {
      const updated = await updateProject(current.id, body);
      setCurrent(updated);
      setIsSaving(false);
      onOpenChange(false);
      onSuccess?.(updated);
    } catch (cause: unknown) {
      const apiError = cause instanceof ApiError ? cause : new ApiError("unknown", null);
      if (apiError.kind === "forbidden") {
        setError("No tienes permiso para editar este proyecto.");
      } else if (apiError.kind === "rate_limited") {
        setError("Estamos procesando demasiadas solicitudes. Inténtalo de nuevo en unos segundos.");
      } else if (apiError.kind === "validation") {
        setError("Revisa los datos del formulario.");
      } else {
        setError("No pudimos guardar el proyecto. Inténtalo de nuevo.");
      }
      setIsSaving(false);
    }
  };

  const handleAddMember = async (entry: UserDirectoryEntry) => {
    if (current.memberIds.includes(entry.id) || entry.id === current.coordinatorId) return;
    setMemberBusyId(entry.id);
    setError(null);
    try {
      const updated = await addProjectMember(current.id, { userId: entry.id });
      setCurrent(updated);
      setNameMap((prev) => new Map(prev).set(entry.id, entry.fullName));
      setMemberQ("");
      setMemberHits([]);
    } catch (cause: unknown) {
      const apiError = cause instanceof ApiError ? cause : new ApiError("unknown", null);
      if (apiError.kind === "conflict") {
        setError("Esa persona ya es integrante del proyecto.");
      } else if (apiError.kind === "forbidden") {
        setError("No tienes permiso para añadir integrantes.");
      } else if (apiError.kind === "rate_limited") {
        setError("Estamos procesando demasiadas solicitudes. Inténtalo de nuevo en unos segundos.");
      } else {
        setError("No pudimos añadir al integrante. Inténtalo de nuevo.");
      }
    } finally {
      setMemberBusyId(null);
    }
  };

  const handleRemoveMember = async () => {
    if (!removeTarget) return;
    setMemberBusyId(removeTarget);
    setError(null);
    try {
      await removeProjectMember(current.id, removeTarget);
      setCurrent((prev) => ({
        ...prev,
        memberIds: prev.memberIds.filter((id) => id !== removeTarget),
      }));
      setRemoveTarget(null);
      onSuccess?.({
        ...current,
        memberIds: current.memberIds.filter((id) => id !== removeTarget),
      });
    } catch (cause: unknown) {
      const apiError = cause instanceof ApiError ? cause : new ApiError("unknown", null);
      setRemoveTarget(null);
      if (apiError.kind === "forbidden") {
        setError("No tienes permiso para quitar integrantes.");
      } else if (apiError.kind === "not_found") {
        setError("Ese integrante ya no pertenece al proyecto.");
      } else if (apiError.kind === "rate_limited") {
        setError("Estamos procesando demasiadas solicitudes. Inténtalo de nuevo en unos segundos.");
      } else {
        setError("No pudimos quitar al integrante. Inténtalo de nuevo.");
      }
    } finally {
      setMemberBusyId(null);
    }
  };

  const memberLabel = (id: string) => {
    if (id === me.id) return me.fullName;
    return nameMap.get(id) ?? "Integrante del proyecto";
  };

  const removable = current.memberIds.filter((id) => id !== current.coordinatorId);

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
        <Select label="Estado" options={STATUS_OPTIONS} value={status} onValueChange={setStatus} />
        <DatePicker
          label="Fecha de inicio"
          value={startDate}
          onValueChange={setStartDate}
          withTime
        />
        <DatePicker label="Fecha límite" value={endDate} onValueChange={setEndDate} withTime />

        {allowCoordinatorPick ? (
          <M.MembersBlock>
            <CoordinatorPicker
              label="Responsable del proyecto"
              coordinators={coordinatorsState.coordinators}
              status={coordinatorsState.status}
              value={coordinatorId}
              onValueChange={(entry) => {
                setCoordinatorId(entry.id);
                setNameMap((prev) => new Map(prev).set(entry.id, entry.fullName));
              }}
              fallbackLabel={memberLabel(coordinatorId)}
              onRetry={coordinatorsState.reload}
              disabled={isSaving}
            />
            <M.Hint>Solo pueden ser responsables las personas con rol Coordinador.</M.Hint>
          </M.MembersBlock>
        ) : (
          <M.ReadOnlyMeta>Coordinador: {memberLabel(current.coordinatorId)}</M.ReadOnlyMeta>
        )}

        {allowMembers ? (
          <M.MembersBlock>
            <M.MembersHeading>Integrantes</M.MembersHeading>
            <SearchField
              label="Buscar persona"
              value={memberQ}
              onChange={(value) => {
                setMemberQ(value);
                if (value.trim().length < 2) {
                  setMemberHits([]);
                  setMemberError(null);
                }
              }}
              onClear={() => {
                setMemberQ("");
                setMemberHits([]);
                setMemberError(null);
              }}
              placeholder="Escribe al menos 2 caracteres"
              isLoading={memberLoading}
            />
            {memberQ.trim().length > 0 && memberQ.trim().length < 2 ? (
              <M.Hint>Escribe al menos 2 caracteres</M.Hint>
            ) : null}
            {memberError ? <S.FormError role="alert">{memberError}</S.FormError> : null}
            {visibleMemberHits.length > 0 ? (
              <M.HitList role="listbox" aria-label="Resultados del directorio">
                {visibleMemberHits.map((entry) => {
                  const already =
                    current.memberIds.includes(entry.id) || entry.id === current.coordinatorId;
                  return (
                    <M.HitRow key={entry.id}>
                      <M.HitText>
                        <strong>{entry.fullName}</strong>
                        <span>{entry.email}</span>
                      </M.HitText>
                      <Button
                        intent="secondary"
                        type="button"
                        disabled={already || memberBusyId === entry.id || isSaving}
                        isLoading={memberBusyId === entry.id}
                        onClick={() => void handleAddMember(entry)}
                      >
                        {already ? "Ya es integrante" : "Añadir"}
                      </Button>
                    </M.HitRow>
                  );
                })}
              </M.HitList>
            ) : null}
            {removable.length === 0 ? (
              <M.Hint>Aún no hay integrantes adicionales.</M.Hint>
            ) : (
              <M.MemberList>
                {removable.map((id) => (
                  <M.HitRow key={id}>
                    <M.HitText>
                      <strong>{memberLabel(id)}</strong>
                    </M.HitText>
                    <Button
                      intent="danger"
                      type="button"
                      disabled={isSaving || memberBusyId === id}
                      onClick={() => setRemoveTarget(id)}
                    >
                      Quitar
                    </Button>
                  </M.HitRow>
                ))}
              </M.MemberList>
            )}
          </M.MembersBlock>
        ) : null}

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
            Guardar proyecto
          </Button>
        </S.FormActions>
      </S.Form>

      <ConfirmDialog
        open={Boolean(removeTarget)}
        onOpenChange={(open) => {
          if (!open && !memberBusyId) setRemoveTarget(null);
        }}
        title="Quitar integrante"
        description="Dejará de tener acceso a este proyecto. Podrás volver a añadirlo después."
        confirmLabel="Quitar integrante"
        intent="danger"
        isLoading={Boolean(removeTarget && memberBusyId === removeTarget)}
        onConfirm={() => {
          void handleRemoveMember();
        }}
      />
    </>
  );
}

export function EditProjectPanel({
  open,
  onOpenChange,
  project,
  me,
  onSuccess,
  triggerRef,
}: EditProjectPanelProps) {
  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={project ? `Editar · ${project.title}` : "Editar proyecto"}
      description="Actualiza datos del proyecto e integrantes. Los cambios se guardan en el servidor."
      triggerRef={triggerRef}
    >
      {open && project ? (
        <EditProjectForm
          key={project.id}
          project={project}
          me={me}
          onOpenChange={onOpenChange}
          onSuccess={onSuccess}
        />
      ) : (
        <S.FormError role="status">Selecciona un proyecto para editar.</S.FormError>
      )}
    </Sheet>
  );
}

"use client";

import type { ProgressResponse, UserResponse } from "@quantia/contracts";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Button, Select } from "@/components/base";
import { FilterBar, type FilterChip } from "@/components/composite";
import { ActivityTimeline, type ActivityItem } from "@/components/page";
import { EmptyState, ErrorState, Skeleton, Toast, ToastProvider } from "@/components/system";
import { useAuth } from "@/features/auth/AuthProvider";
import {
  PROGRESS_LIST_FILTER_DEFAULTS,
  progressListFiltersSchema,
  type ProgressListFilters,
} from "@/features/filters";
import { useAccessibleProjects } from "@/features/projects/useAccessibleProjects";
import { listProjectTasks } from "@/lib/api";
import { canAccess, canCreateProgress } from "@/lib/auth";
import type { AppRole } from "@/lib/auth/navigation";
import { useUrlFilters } from "@/lib/url";

import * as S from "../tasks/sectionPage.styles";
import { RegisterProgressPanel } from "./RegisterProgressPanel";
import { useProjectProgressList } from "./useProjectProgressList";

function actorLabel(userId: string, me: UserResponse): string {
  if (userId === me.id) return me.fullName;
  return "Integrante del proyecto";
}

function toActivityItems(entries: ProgressResponse[], me: UserResponse): ActivityItem[] {
  return entries.map((entry) => ({
    id: entry.id,
    at: entry.recordedAt,
    actor: actorLabel(entry.authorId, me),
    text: `${entry.title}: ${entry.description}`,
    evidenceHref: entry.evidenceLinks[0],
    evidenceLabel: entry.evidenceLinks[0] ? "Ver evidencia" : undefined,
    syncStatus:
      entry.syncStatus === "PENDING"
        ? "pending"
        : entry.syncStatus === "FAILED"
          ? "failed"
          : "synced",
  }));
}

export function ProgressListScreen() {
  return (
    <ToastProvider>
      <ProgressListBody />
    </ToastProvider>
  );
}

function ProgressListBody() {
  const router = useRouter();
  const { identity, user } = useAuth();
  const registerTriggerRef = useRef<HTMLSpanElement>(null);

  const { values, setFilters } = useUrlFilters({
    schema: progressListFiltersSchema,
    defaults: PROGRESS_LIST_FILTER_DEFAULTS,
    pathname: "/avances",
  });

  const projectsState = useAccessibleProjects();
  const selectedProject = useMemo(
    () => projectsState.projects.find((item) => item.id === values.projectId) ?? null,
    [projectsState.projects, values.projectId],
  );

  const query = useMemo(() => {
    if (!values.projectId) return null;
    return {
      projectId: values.projectId,
      taskId: values.taskId,
      page: values.page,
      pageSize: values.pageSize,
      sortBy: values.sortBy,
      sortOrder: values.sortOrder,
    };
  }, [values]);

  const { status, data, error, stale, reload } = useProjectProgressList(query);
  const [taskCache, setTaskCache] = useState<{
    projectId: string;
    options: { value: string; label: string }[];
  }>({ projectId: "", options: [] });
  const [registerOpen, setRegisterOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState("");
  const [toast, setToast] = useState<{ open: boolean; title: string; description?: string }>({
    open: false,
    title: "",
  });

  const taskOptions = useMemo(
    () => (taskCache.projectId === values.projectId ? taskCache.options : []),
    [taskCache.options, taskCache.projectId, values.projectId],
  );

  useEffect(() => {
    if (!values.projectId) return;
    const projectId = values.projectId;
    let cancelled = false;
    void (async () => {
      try {
        const result = await listProjectTasks(projectId, {
          page: 1,
          pageSize: 50,
          sortBy: "dueDate",
          sortOrder: "asc",
        });
        if (cancelled) return;
        setTaskCache({
          projectId,
          options: result.data.map((task) => ({ value: task.id, label: task.title })),
        });
      } catch {
        if (!cancelled) setTaskCache({ projectId, options: [] });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [values.projectId]);

  const roles = (identity?.roles ?? []) as readonly AppRole[];
  const allowed = canAccess("/avances", roles);
  const canRegister = Boolean(user && selectedProject && canCreateProgress(user, selectedProject));

  const chips = useMemo((): FilterChip[] => {
    const next: FilterChip[] = [];
    if (values.taskId) {
      const label = taskOptions.find((item) => item.value === values.taskId)?.label ?? "Tarea";
      next.push({ id: "taskId", label: `Tarea: ${label}` });
    }
    return next;
  }, [taskOptions, values.taskId]);

  if (!allowed) {
    return (
      <ErrorState
        variant="forbidden"
        onRetry={() => router.replace("/")}
        retryLabel="Ir al inicio"
      />
    );
  }

  if (status === "error" && error?.kind === "forbidden") {
    return (
      <ErrorState
        variant="forbidden"
        onRetry={() => router.replace("/")}
        retryLabel="Ir al inicio"
      />
    );
  }

  if (status === "error" && error?.kind === "rate_limited") {
    return (
      <ErrorState
        variant="rate-limit"
        retryAfterSeconds={error.retryAfterSeconds}
        onRetry={reload}
      />
    );
  }

  if (status === "error") {
    return <ErrorState variant="server" onRetry={reload} />;
  }

  const entries = data?.data ?? [];
  const filtered = localSearch.trim()
    ? entries.filter(
        (entry) =>
          entry.title.toLowerCase().includes(localSearch.trim().toLowerCase()) ||
          entry.description.toLowerCase().includes(localSearch.trim().toLowerCase()),
      )
    : entries;
  const items = user ? toActivityItems(filtered, user) : [];
  const isBootLoading =
    Boolean(values.projectId) && (status === "idle" || (status === "loading" && !data));
  const filterExtrasActive = Boolean(values.taskId);

  return (
    <S.Page>
      <S.Header>
        <S.HeaderText>
          <S.Title>Avances</S.Title>
          <S.Subtitle>Bitácora de avances del proyecto seleccionado.</S.Subtitle>
        </S.HeaderText>
        {canRegister ? (
          <S.HeaderActions>
            <span ref={registerTriggerRef}>
              <Button intent="primary" type="button" onClick={() => setRegisterOpen(true)}>
                Registrar avance
              </Button>
            </span>
          </S.HeaderActions>
        ) : null}
      </S.Header>

      <Select
        label="Proyecto"
        options={projectsState.options}
        value={values.projectId}
        onValueChange={(nextProjectId) =>
          setFilters({ projectId: nextProjectId, taskId: "", page: 1 })
        }
      />

      {values.projectId ? (
        <FilterBar
          searchLabel="Buscar en esta página"
          searchValue={localSearch}
          onSearchChange={setLocalSearch}
          chips={chips}
          onRemoveChip={(id) => {
            if (id === "taskId") setFilters({ taskId: "", page: 1 });
          }}
          onClear={
            filterExtrasActive || localSearch
              ? () => {
                  setLocalSearch("");
                  setFilters({ taskId: "", page: 1 });
                }
              : undefined
          }
          resultCount={items.length}
          isLoading={status === "loading"}
        >
          <Select
            label="Tarea"
            options={[{ value: "", label: "Todas las tareas" }, ...taskOptions]}
            value={values.taskId}
            onValueChange={(taskId) => setFilters({ taskId, page: 1 })}
          />
          <Select
            label="Orden"
            options={[
              { value: "recordedAt:desc", label: "Más recientes" },
              { value: "recordedAt:asc", label: "Más antiguos" },
              { value: "createdAt:desc", label: "Creación (reciente)" },
              { value: "createdAt:asc", label: "Creación (antigua)" },
            ]}
            value={`${values.sortBy}:${values.sortOrder}`}
            onValueChange={(value) => {
              const [sortBy, sortOrder] = value.split(":") as [
                ProgressListFilters["sortBy"],
                ProgressListFilters["sortOrder"],
              ];
              setFilters({ sortBy, sortOrder, page: 1 });
            }}
          />
        </FilterBar>
      ) : null}

      {stale ? (
        <S.StaleBanner role="status">
          <S.StaleText>Contenido desactualizado</S.StaleText>
          <Button intent="secondary" type="button" onClick={reload}>
            Reintentar
          </Button>
        </S.StaleBanner>
      ) : null}

      {!values.projectId ? (
        <S.SelectProjectHint>
          <EmptyState
            kind="no-records"
            title="Selecciona un proyecto"
            description="Elige un proyecto accesible para consultar su bitácora de avances."
          />
        </S.SelectProjectHint>
      ) : isBootLoading ? (
        <Skeleton variant="list" rows={5} />
      ) : items.length === 0 ? (
        <EmptyState
          kind={filterExtrasActive || localSearch ? "no-results" : "no-records"}
          title={
            filterExtrasActive || localSearch
              ? "Sin resultados con estos filtros"
              : "Sin avances registrados"
          }
          description={
            filterExtrasActive || localSearch
              ? "Prueba con otros filtros o limpia la búsqueda."
              : "Cuando se registren avances aparecerán en orden cronológico."
          }
          action={
            canRegister && !filterExtrasActive && !localSearch ? (
              <Button intent="primary" type="button" onClick={() => setRegisterOpen(true)}>
                Registrar avance
              </Button>
            ) : undefined
          }
        />
      ) : (
        <ActivityTimeline
          items={items}
          onLoadOlder={
            data && values.page < data.meta.totalPages
              ? () => setFilters({ page: values.page + 1 })
              : undefined
          }
        />
      )}

      {selectedProject && user ? (
        <RegisterProgressPanel
          open={registerOpen}
          onOpenChange={setRegisterOpen}
          projectId={selectedProject.id}
          taskOptions={taskOptions.map((task) => ({
            value: task.value,
            label: task.label,
            projectId: selectedProject.id,
            projectTitle: selectedProject.title,
          }))}
          triggerRef={registerTriggerRef}
          onSuccess={(progress) => {
            setToast({
              open: true,
              title: "Avance registrado",
              description: progress.title,
            });
            reload();
          }}
        />
      ) : null}

      <Toast
        open={toast.open}
        onOpenChange={(open) => setToast((prev) => ({ ...prev, open }))}
        title={toast.title}
        description={toast.description}
        tone="success"
      />
    </S.Page>
  );
}

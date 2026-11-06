"use client";

import type { TaskResponse, TaskStatus } from "@quantia/contracts";
import { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Button, Link, Select } from "@/components/base";
import { FilterBar, TaskStatusControl, type FilterChip } from "@/components/composite";
import { DataTable, type DataTableColumn } from "@/components/page";
import { EmptyState, ErrorState, Skeleton, Toast, ToastProvider } from "@/components/system";
import { useAuth } from "@/features/auth/AuthProvider";
import {
  ALL_PRIORITIES,
  ALL_STATUSES,
  TASKS_LIST_FILTER_DEFAULTS,
  TASK_PRIORITY_FILTER_OPTIONS,
  TASK_SORT_OPTIONS,
  TASK_STATUS_FILTER_OPTIONS,
  taskPriorityChipLabel,
  taskStatusChipLabel,
  tasksListFiltersSchema,
  type TasksListFilters,
} from "@/features/filters";
import { useAccessibleProjects } from "@/features/projects/useAccessibleProjects";
import { updateProjectTask } from "@/lib/api";
import { ApiError } from "@/lib/api/errors";
import { canAccess, canCreateTask, canEditTask } from "@/lib/auth";
import type { AppRole } from "@/lib/auth/navigation";
import { formatDate } from "@/lib/format";
import { useUrlFilters } from "@/lib/url";

import { CreateTaskPanel } from "./CreateTaskPanel";
import { EditTaskPanel } from "./EditTaskPanel";
import { memberLabel, projectMemberOptions } from "./memberLabels";
import * as S from "./sectionPage.styles";
import { useProjectTasksList } from "./useProjectTasksList";

const PRIORITY_LABEL: Record<TaskResponse["priority"], string> = {
  LOW: "Baja",
  MEDIUM: "Media",
  HIGH: "Alta",
};

export function TasksListScreen() {
  return (
    <ToastProvider>
      <TasksListBody />
    </ToastProvider>
  );
}

function TasksListBody() {
  const router = useRouter();
  const { identity, user } = useAuth();
  const createTriggerRef = useRef<HTMLSpanElement>(null);
  const editTriggerRef = useRef<HTMLSpanElement>(null);

  const { values, setFilters } = useUrlFilters({
    schema: tasksListFiltersSchema,
    defaults: TASKS_LIST_FILTER_DEFAULTS,
    pathname: "/tareas",
  });
  const [localSearch, setLocalSearch] = useState("");

  const projectsState = useAccessibleProjects();
  const selectedProject = useMemo(
    () => projectsState.projects.find((item) => item.id === values.projectId) ?? null,
    [projectsState.projects, values.projectId],
  );

  const query = useMemo(() => {
    if (!values.projectId) return null;
    return {
      projectId: values.projectId,
      status: values.status,
      priority: values.priority,
      assigneeId: values.assigneeId,
      page: values.page,
      pageSize: values.pageSize,
      sortBy: values.sortBy,
      sortOrder: values.sortOrder,
    };
  }, [values]);

  const { status, data, error, stale, reload } = useProjectTasksList(query);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editTask, setEditTask] = useState<TaskResponse | null>(null);
  const [toast, setToast] = useState<{ open: boolean; title: string; description?: string }>({
    open: false,
    title: "",
  });

  const roles = (identity?.roles ?? []) as readonly AppRole[];
  const allowed = canAccess("/tareas", roles);
  const canCreate = Boolean(user && selectedProject && canCreateTask(user, selectedProject));

  const assigneeOptions = useMemo(() => {
    if (!user || !selectedProject) return [{ value: "", label: "Todos los responsables" }];
    return [
      { value: "", label: "Todos los responsables" },
      ...projectMemberOptions(selectedProject, user),
    ];
  }, [selectedProject, user]);

  const chips = useMemo((): FilterChip[] => {
    const next: FilterChip[] = [];
    if (values.status !== ALL_STATUSES) {
      next.push({ id: "status", label: `Estado: ${taskStatusChipLabel(values.status)}` });
    }
    if (values.priority !== ALL_PRIORITIES) {
      next.push({ id: "priority", label: `Prioridad: ${taskPriorityChipLabel(values.priority)}` });
    }
    if (values.assigneeId && user) {
      next.push({
        id: "assigneeId",
        label: `Responsable: ${memberLabel(values.assigneeId, user)}`,
      });
    }
    return next;
  }, [user, values.assigneeId, values.priority, values.status]);

  const changeStatus = useCallback(
    async (row: TaskResponse, next: TaskStatus) => {
      if (!selectedProject) return;
      try {
        await updateProjectTask(selectedProject.id, row.id, { status: next });
        setToast({ open: true, title: "Estado actualizado", description: row.title });
        reload();
      } catch (cause: unknown) {
        const apiError = cause instanceof ApiError ? cause : new ApiError("unknown", null);
        setToast({
          open: true,
          title:
            apiError.kind === "forbidden"
              ? "No tienes permiso para cambiar el estado"
              : "No se pudo cambiar el estado",
        });
      }
    },
    [reload, selectedProject],
  );

  const columns = useMemo((): DataTableColumn<TaskResponse>[] => {
    if (!user || !selectedProject) return [];
    return [
      {
        id: "title",
        header: "Tarea",
        cell: (row) => (
          <Link href={`/proyectos/${selectedProject.id}?tab=tareas`}>{row.title}</Link>
        ),
      },
      {
        id: "status",
        header: "Estado",
        cell: (row) => (
          <TaskStatusControl
            status={row.status}
            title={row.title}
            onChange={
              canEditTask(user, selectedProject, row)
                ? (next) => void changeStatus(row, next)
                : undefined
            }
          />
        ),
      },
      {
        id: "priority",
        header: "Prioridad",
        cell: (row) => PRIORITY_LABEL[row.priority],
      },
      {
        id: "assignee",
        header: "Responsable",
        cell: (row) => memberLabel(row.assigneeId, user),
      },
      {
        id: "dueDate",
        header: "Fecha límite",
        cell: (row) => formatDate(row.dueDate),
      },
      {
        id: "actions",
        header: "Acción",
        cell: (row) =>
          canEditTask(user, selectedProject, row) ? (
            <Button
              intent="secondary"
              type="button"
              onClick={() => {
                setEditTask(row);
                setEditOpen(true);
              }}
            >
              Editar
            </Button>
          ) : (
            "—"
          ),
      },
    ];
  }, [changeStatus, selectedProject, user]);

  const rows = useMemo(() => {
    const list = data?.data ?? [];
    const needle = localSearch.trim().toLowerCase();
    if (!needle) return list;
    return list.filter((row) => row.title.toLowerCase().includes(needle));
  }, [data?.data, localSearch]);
  const total = data?.meta.total ?? 0;
  const isBootLoading =
    Boolean(values.projectId) && (status === "idle" || (status === "loading" && !data));
  const filterExtrasActive =
    values.status !== ALL_STATUSES ||
    values.priority !== ALL_PRIORITIES ||
    Boolean(values.assigneeId);

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

  return (
    <S.Page>
      <S.Header>
        <S.HeaderText>
          <S.Title>Tareas</S.Title>
          <S.Subtitle>Gestión de tareas del proyecto seleccionado.</S.Subtitle>
        </S.HeaderText>
        {canCreate ? (
          <S.HeaderActions>
            <span ref={createTriggerRef}>
              <Button intent="primary" type="button" onClick={() => setCreateOpen(true)}>
                Crear tarea
              </Button>
            </span>
          </S.HeaderActions>
        ) : null}
      </S.Header>

      <Select
        label="Proyecto"
        options={projectsState.options}
        value={values.projectId}
        onValueChange={(projectId) => setFilters({ projectId, page: 1, assigneeId: "" })}
      />

      {values.projectId ? (
        <FilterBar
          searchLabel="Buscar en esta página"
          searchValue={localSearch}
          onSearchChange={setLocalSearch}
          chips={chips}
          onRemoveChip={(id) => {
            if (id === "status") setFilters({ status: ALL_STATUSES, page: 1 });
            if (id === "priority") setFilters({ priority: ALL_PRIORITIES, page: 1 });
            if (id === "assigneeId") setFilters({ assigneeId: "", page: 1 });
          }}
          onClear={
            filterExtrasActive || localSearch
              ? () => {
                  setLocalSearch("");
                  setFilters({
                    status: ALL_STATUSES,
                    priority: ALL_PRIORITIES,
                    assigneeId: "",
                    page: 1,
                  });
                }
              : undefined
          }
          resultCount={rows.length}
          isLoading={status === "loading"}
        >
          <Select
            label="Estado"
            options={TASK_STATUS_FILTER_OPTIONS}
            value={values.status}
            onValueChange={(status) =>
              setFilters({ status: status as TasksListFilters["status"], page: 1 })
            }
          />
          <Select
            label="Prioridad"
            options={TASK_PRIORITY_FILTER_OPTIONS}
            value={values.priority}
            onValueChange={(priority) =>
              setFilters({ priority: priority as TasksListFilters["priority"], page: 1 })
            }
          />
          <Select
            label="Responsable"
            options={assigneeOptions}
            value={values.assigneeId}
            onValueChange={(assigneeId) => setFilters({ assigneeId, page: 1 })}
          />
          <Select
            label="Orden"
            options={TASK_SORT_OPTIONS}
            value={`${values.sortBy}:${values.sortOrder}`}
            onValueChange={(value) => {
              const [sortBy, sortOrder] = value.split(":") as [
                TasksListFilters["sortBy"],
                TasksListFilters["sortOrder"],
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
            description="Elige un proyecto accesible para ver y gestionar sus tareas. No se muestra una lista vacía antes de la selección."
          />
        </S.SelectProjectHint>
      ) : isBootLoading ? (
        <Skeleton variant="table" />
      ) : (
        <span ref={editTriggerRef}>
          <DataTable
            caption="Tareas del proyecto"
            columns={columns}
            rows={rows}
            getRowId={(row) => row.id}
            isLoading={status === "loading"}
            emptyState={
              <EmptyState
                kind={filterExtrasActive ? "no-results" : "no-records"}
                title={
                  filterExtrasActive
                    ? "Sin resultados con estos filtros"
                    : "Sin registros de tareas"
                }
                description={
                  filterExtrasActive
                    ? "Prueba con otros filtros o limpia la búsqueda."
                    : "Cuando existan tareas en este proyecto aparecerán aquí."
                }
                action={
                  canCreate && !filterExtrasActive ? (
                    <Button intent="primary" type="button" onClick={() => setCreateOpen(true)}>
                      Crear tarea
                    </Button>
                  ) : filterExtrasActive ? (
                    <Button
                      intent="secondary"
                      type="button"
                      onClick={() =>
                        setFilters({
                          status: ALL_STATUSES,
                          priority: ALL_PRIORITIES,
                          assigneeId: "",
                          page: 1,
                        })
                      }
                    >
                      Limpiar filtros
                    </Button>
                  ) : undefined
                }
              />
            }
            pagination={
              total > 0
                ? {
                    page: values.page,
                    pageSize: values.pageSize,
                    totalItems: total,
                    onPageChange: (page) => setFilters({ page }),
                    onPageSizeChange: (pageSize) => setFilters({ page: 1, pageSize }),
                  }
                : undefined
            }
          />
        </span>
      )}

      {user && selectedProject ? (
        <>
          <CreateTaskPanel
            open={createOpen}
            onOpenChange={setCreateOpen}
            project={selectedProject}
            me={user}
            triggerRef={createTriggerRef}
            onSuccess={(task) => {
              setToast({ open: true, title: "Tarea creada", description: task.title });
              reload();
            }}
          />
          <EditTaskPanel
            open={editOpen}
            onOpenChange={setEditOpen}
            project={selectedProject}
            task={editTask}
            me={user}
            triggerRef={editTriggerRef}
            onSuccess={(task) => {
              setToast({ open: true, title: "Tarea actualizada", description: task.title });
              reload();
            }}
            onDeleted={() => {
              setToast({ open: true, title: "Tarea eliminada" });
              setEditTask(null);
              reload();
            }}
          />
        </>
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

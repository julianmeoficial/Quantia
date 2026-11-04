"use client";

import { SyncEntityType } from "@quantia/contracts";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useRef, useState } from "react";

import { Badge, Button, Select, TASK_STATUS_PRESENTATION, Tooltip } from "@/components/base";
import { TaskRow } from "@/components/composite";
import { DataTable, KpiPanel, type DataTableColumn, type KpiMetric } from "@/components/page";
import {
  EmptyState,
  ErrorState,
  Skeleton,
  SyncStatus,
  Toast,
  ToastProvider,
} from "@/components/system";
import { useAuth } from "@/features/auth/AuthProvider";
import { RegisterProgressPanel } from "@/features/progress";
import { useRetrySync } from "@/features/sync";
import { canAccess } from "@/lib/auth";
import type { AppRole } from "@/lib/auth/navigation";
import { formatDate, formatRelativeDue } from "@/lib/format";

import type { MyTaskRow } from "./fetchMyTasks";
import * as S from "./MyTasksScreen.styles";
import {
  ALL_PROJECTS,
  PENDING_STATUS,
  filterMyTasks,
  parseProjectFilter,
  parseStatusFilter,
  uniqueProjects,
  type MyTasksStatusFilter,
} from "./myTasksFilters";
import { useMyTasks } from "./useMyTasks";
import {
  URGENCY_LABEL,
  URGENCY_ORDER,
  compareByDueDate,
  groupByUrgency,
  type UrgencyBucket,
} from "./urgency";

function DueCell({ dueDate }: { dueDate: string | null }) {
  const relative = formatRelativeDue(dueDate);
  const absolute = formatDate(dueDate);
  if (relative === "—" || absolute === "—") {
    return <span>—</span>;
  }
  return (
    <Tooltip content={absolute}>
      <S.DueTrigger type="button" aria-label={`Vence ${absolute}`}>
        {relative}
      </S.DueTrigger>
    </Tooltip>
  );
}

function StatusCell({ status }: { status: MyTaskRow["status"] }) {
  const presentation = TASK_STATUS_PRESENTATION[status];
  const Icon = presentation.icon;
  return <Badge label={presentation.label} tone={presentation.tone} icon={<Icon />} />;
}

const COLUMNS: DataTableColumn<MyTaskRow>[] = [
  {
    id: "title",
    header: "Tarea",
    cell: (row) => row.title,
  },
  {
    id: "project",
    header: "Proyecto",
    cell: (row) => row.projectTitle,
  },
  {
    id: "due",
    header: "Vence",
    cell: (row) => <DueCell dueDate={row.dueDate} />,
  },
  {
    id: "status",
    header: "Estado",
    cell: (row) => <StatusCell status={row.status} />,
  },
];

function buildMetrics(
  overdue: number,
  thisWeek: number,
  monthProgress: number | null,
): KpiMetric[] {
  return [
    {
      id: "overdue",
      label: "Tareas vencidas",
      value: String(overdue),
    },
    {
      id: "thisWeek",
      label: "Esta semana",
      value: String(thisWeek),
    },
    {
      id: "monthProgress",
      label: "Avances del mes",
      value: monthProgress === null ? "—" : String(monthProgress),
      context: monthProgress === null ? "No disponible por completo" : undefined,
    },
  ];
}

function syncFromTasks(tasks: MyTaskRow[]): "pending" | "failed" | "synced" {
  if (tasks.some((task) => task.syncStatus === "FAILED")) return "failed";
  if (tasks.some((task) => task.syncStatus === "PENDING")) return "pending";
  return "synced";
}

const STATUS_FILTER_OPTIONS = [
  { value: PENDING_STATUS, label: "Todos mis pendientes" },
  { value: "TODO", label: TASK_STATUS_PRESENTATION.TODO.label },
  { value: "IN_PROGRESS", label: TASK_STATUS_PRESENTATION.IN_PROGRESS.label },
  { value: "BLOCKED", label: TASK_STATUS_PRESENTATION.BLOCKED.label },
];

function UrgencyDesktop({ bucket, rows }: { bucket: UrgencyBucket; rows: MyTaskRow[] }) {
  if (rows.length === 0) return null;
  return (
    <S.Section aria-labelledby={`urgency-${bucket}`}>
      <S.SectionHeading>
        <S.SectionTitle id={`urgency-${bucket}`}>{URGENCY_LABEL[bucket]}</S.SectionTitle>
        {bucket === "overdue" ? (
          <Badge
            label={`${rows.length} ${rows.length === 1 ? "pendiente" : "pendientes"}`}
            tone="danger"
          />
        ) : null}
      </S.SectionHeading>
      <DataTable
        caption={`${URGENCY_LABEL[bucket]} — mis tareas`}
        columns={COLUMNS}
        rows={rows}
        getRowId={(row) => row.id}
      />
    </S.Section>
  );
}

function UrgencyMobile({
  bucket,
  rows,
  onRegister,
}: {
  bucket: UrgencyBucket;
  rows: MyTaskRow[];
  onRegister: (task: MyTaskRow) => void;
}) {
  if (rows.length === 0) return null;
  return (
    <S.Section aria-labelledby={`urgency-m-${bucket}`}>
      <S.SectionHeading>
        <S.SectionTitle id={`urgency-m-${bucket}`}>{URGENCY_LABEL[bucket]}</S.SectionTitle>
        {bucket === "overdue" ? (
          <Badge
            label={`${rows.length} ${rows.length === 1 ? "pendiente" : "pendientes"}`}
            tone="danger"
          />
        ) : null}
      </S.SectionHeading>
      <S.TaskList>
        {rows.map((row) => (
          <S.MobileTaskCard key={row.id}>
            <TaskRow
              title={row.title}
              href={`/proyectos/${row.projectId}`}
              assignee={row.projectTitle}
              status={row.status}
              due={row.dueDate}
            />
            <S.MobileTaskActions>
              <Button
                intent="secondary"
                type="button"
                onClick={() => onRegister(row)}
                aria-label={`Registrar avance para ${row.title}`}
              >
                Registrar avance
              </Button>
            </S.MobileTaskActions>
          </S.MobileTaskCard>
        ))}
      </S.TaskList>
    </S.Section>
  );
}

function TaskFilters({
  initialProjectId,
  initialStatus,
  projectOptions,
  filtersActive,
  onApply,
  onClear,
}: {
  initialProjectId: string;
  initialStatus: MyTasksStatusFilter;
  projectOptions: { value: string; label: string }[];
  filtersActive: boolean;
  onApply: (projectId: string, status: MyTasksStatusFilter) => void;
  onClear: () => void;
}) {
  const [draftProjectId, setDraftProjectId] = useState(initialProjectId);
  const [draftStatus, setDraftStatus] = useState<MyTasksStatusFilter>(initialStatus);

  return (
    <S.FilterGrid>
      <Select
        label="Proyecto"
        options={projectOptions}
        value={draftProjectId}
        onValueChange={setDraftProjectId}
      />
      <Select
        label="Estado"
        options={STATUS_FILTER_OPTIONS}
        value={draftStatus}
        onValueChange={(value) => setDraftStatus(parseStatusFilter(value))}
      />
      <S.FilterActions>
        <Button
          intent="secondary"
          type="button"
          onClick={() => onApply(draftProjectId, draftStatus)}
        >
          Aplicar
        </Button>
        {filtersActive ? (
          <Button intent="ghost" type="button" onClick={onClear}>
            Limpiar filtros
          </Button>
        ) : null}
      </S.FilterActions>
    </S.FilterGrid>
  );
}

export function MyTasksScreen() {
  return (
    <ToastProvider>
      <MyTasksBody />
    </ToastProvider>
  );
}

function MyTasksBody() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { identity } = useAuth();
  const { status, data, error, reload } = useMyTasks();
  const { canRetry, isRetrying, retry } = useRetrySync();
  const [registerOpen, setRegisterOpen] = useState(false);
  const [registerTaskId, setRegisterTaskId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ open: boolean; title: string; description?: string }>({
    open: false,
    title: "",
  });
  const registerTriggerRef = useRef<HTMLSpanElement>(null);

  const appliedProjectId = parseProjectFilter(searchParams.get("projectId"));
  const appliedStatus = parseStatusFilter(searchParams.get("status"));
  const filterKey = `${appliedProjectId}|${appliedStatus}`;

  const roles = (identity?.roles ?? []) as readonly AppRole[];
  const allowed = canAccess("/mis-tareas", roles);

  const projects = useMemo(() => uniqueProjects(data?.tasks ?? []), [data?.tasks]);

  const filteredTasks = useMemo(() => {
    const tasks = [...(data?.tasks ?? [])].sort(compareByDueDate);
    return filterMyTasks(tasks, appliedProjectId, appliedStatus);
  }, [appliedProjectId, appliedStatus, data?.tasks]);

  const grouped = useMemo(() => groupByUrgency(filteredTasks), [filteredTasks]);

  const progressTaskOptions = useMemo(
    () =>
      (data?.tasks ?? []).map((task) => ({
        value: task.id,
        label: `${task.title} · ${task.projectTitle}`,
        projectId: task.projectId,
        projectTitle: task.projectTitle,
      })),
    [data?.tasks],
  );

  const projectOptions = useMemo(
    () => [
      { value: ALL_PROJECTS, label: "Todos los proyectos" },
      ...projects.map((project) => ({ value: project.id, label: project.title })),
    ],
    [projects],
  );

  const viewProjectId =
    appliedProjectId !== ALL_PROJECTS
      ? appliedProjectId
      : projects.length === 1
        ? projects[0]!.id
        : null;

  const clearFilters = () => {
    router.replace("/mis-tareas");
  };

  const openRegister = (taskId?: string | null) => {
    if (progressTaskOptions.length === 0) {
      setToast({
        open: true,
        title: "No hay tareas para registrar avance",
        description: "Cuando tengas tareas asignadas podrás registrar un avance aquí.",
      });
      return;
    }
    setRegisterTaskId(taskId ?? null);
    setRegisterOpen(true);
  };

  if (!allowed) {
    return (
      <ErrorState
        variant="forbidden"
        onRetry={() => router.replace("/")}
        retryLabel="Volver al inicio"
      />
    );
  }

  if (status === "loading" || status === "idle") {
    return (
      <S.Page>
        <S.Header>
          <S.Title>Mis tareas</S.Title>
          <S.Subtitle>
            Lo más urgente primero. Tu trabajo, sin información institucional.
          </S.Subtitle>
        </S.Header>
        <S.LoadingStack>
          <Skeleton variant="metric" />
          <S.DesktopOnly>
            <Skeleton variant="table" rows={4} />
          </S.DesktopOnly>
          <S.MobileOnly>
            <Skeleton variant="list" rows={4} />
          </S.MobileOnly>
        </S.LoadingStack>
      </S.Page>
    );
  }

  if (status === "error" && error) {
    if (error.kind === "forbidden") {
      return (
        <ErrorState
          variant="forbidden"
          onRetry={() => router.replace("/")}
          retryLabel="Volver al inicio"
        />
      );
    }
    if (error.kind === "not_found") {
      return <ErrorState variant="not-found" onRetry={() => router.replace("/")} />;
    }
    if (error.kind === "rate_limited") {
      return (
        <ErrorState
          variant="rate-limit"
          retryAfterSeconds={error.retryAfterSeconds}
          onRetry={reload}
        />
      );
    }
    return <ErrorState variant="server" onRetry={reload} />;
  }

  const allTasks = data?.tasks ?? [];
  const isEmptyAll = allTasks.length === 0;
  const isEmptyFiltered = filteredTasks.length === 0;
  const filtersActive = appliedProjectId !== ALL_PROJECTS || appliedStatus !== PENDING_STATUS;
  const sync = syncFromTasks(allTasks);
  const failedTask = allTasks.find((task) => task.syncStatus === "FAILED");

  return (
    <S.Page>
      <S.Header>
        <S.HeaderText>
          <S.Title>Mis tareas</S.Title>
          <S.Subtitle>
            Lo más urgente primero. Tu trabajo, sin información institucional.
          </S.Subtitle>
        </S.HeaderText>
        <S.HeaderActions>
          <span ref={registerTriggerRef}>
            <Button intent="primary" type="button" onClick={() => openRegister()}>
              Registrar avance
            </Button>
          </span>
        </S.HeaderActions>
      </S.Header>

      {data && data.partialFailures > 0 ? (
        <S.PartialNotice role="status">
          Algunas tareas no se pudieron cargar. Los totales pueden estar incompletos.
        </S.PartialNotice>
      ) : null}

      {sync !== "synced" ? (
        <SyncStatus
          status={sync}
          persisted
          entity="task"
          canRetry={canRetry && sync === "failed" && Boolean(failedTask)}
          isLoading={isRetrying}
          onRetry={() => {
            if (!failedTask) return;
            void (async () => {
              const ok = await retry({
                entityType: SyncEntityType.TASK,
                id: failedTask.id,
                projectId: failedTask.projectId,
              });
              if (ok) {
                reload();
                return;
              }
              setToast({
                open: true,
                title: "No se pudo reintentar la sincronización",
                description: "Vuelve a intentarlo en unos segundos.",
              });
            })();
          }}
        />
      ) : null}

      {!isEmptyAll ? (
        <S.Toolbar>
          {viewProjectId ? (
            <Button
              intent="secondary"
              type="button"
              onClick={() => router.push(`/proyectos/${viewProjectId}`)}
            >
              Ver mi proyecto
            </Button>
          ) : null}
          <TaskFilters
            key={filterKey}
            initialProjectId={appliedProjectId}
            initialStatus={appliedStatus}
            projectOptions={projectOptions}
            filtersActive={filtersActive}
            onClear={clearFilters}
            onApply={(projectId, status) => {
              const params = new URLSearchParams();
              if (projectId !== ALL_PROJECTS) params.set("projectId", projectId);
              if (status !== PENDING_STATUS) params.set("status", status);
              const query = params.toString();
              router.replace(query ? `/mis-tareas?${query}` : "/mis-tareas");
            }}
          />
        </S.Toolbar>
      ) : null}

      <KpiPanel
        period="Personal"
        metrics={buildMetrics(
          grouped.overdue.length,
          grouped.thisWeek.length,
          data?.monthProgressCount ?? null,
        )}
      />

      {isEmptyAll ? (
        <EmptyState
          kind="no-records"
          title="No tienes tareas pendientes"
          description="Cuando te asignen trabajo en un proyecto, aparecerá aquí ordenado por urgencia."
        />
      ) : isEmptyFiltered ? (
        <EmptyState
          kind="no-results"
          title="No hay tareas con estos filtros"
          description="Prueba a cambiar el proyecto o el estado, o limpia los filtros."
          action={
            <Button intent="secondary" type="button" onClick={clearFilters}>
              Limpiar filtros
            </Button>
          }
        />
      ) : (
        <>
          <S.DesktopOnly>
            {URGENCY_ORDER.map((bucket) => (
              <UrgencyDesktop key={bucket} bucket={bucket} rows={grouped[bucket]} />
            ))}
          </S.DesktopOnly>
          <S.MobileOnly>
            {URGENCY_ORDER.map((bucket) => (
              <UrgencyMobile
                key={bucket}
                bucket={bucket}
                rows={grouped[bucket]}
                onRegister={(task) => openRegister(task.id)}
              />
            ))}
          </S.MobileOnly>
        </>
      )}

      <RegisterProgressPanel
        open={registerOpen}
        onOpenChange={(open) => {
          setRegisterOpen(open);
          if (!open) setRegisterTaskId(null);
        }}
        taskOptions={progressTaskOptions}
        initialTaskId={registerTaskId}
        triggerRef={registerTriggerRef}
        onSuccess={() => {
          reload();
        }}
      />

      <Toast
        open={toast.open}
        onOpenChange={(open) => setToast((prev) => ({ ...prev, open }))}
        title={toast.title}
        description={toast.description}
        tone="warning"
      />
    </S.Page>
  );
}

"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import { Badge, TASK_STATUS_PRESENTATION, Tooltip } from "@/components/base";
import { TaskRow } from "@/components/composite";
import { DataTable, KpiPanel, type DataTableColumn, type KpiMetric } from "@/components/page";
import { EmptyState, ErrorState, Skeleton, SyncStatus } from "@/components/system";
import { useAuth } from "@/features/auth/AuthProvider";
import { canAccess } from "@/lib/auth";
import type { AppRole } from "@/lib/auth/navigation";
import { formatDate, formatRelativeDue } from "@/lib/format";

import type { MyTaskRow } from "./fetchMyTasks";
import * as S from "./MyTasksScreen.styles";
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

function UrgencyDesktop({ bucket, rows }: { bucket: UrgencyBucket; rows: MyTaskRow[] }) {
  if (rows.length === 0) return null;
  return (
    <S.Section aria-labelledby={`urgency-${bucket}`}>
      <S.SectionTitle id={`urgency-${bucket}`}>{URGENCY_LABEL[bucket]}</S.SectionTitle>
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
  assigneeName,
}: {
  bucket: UrgencyBucket;
  rows: MyTaskRow[];
  assigneeName: string;
}) {
  if (rows.length === 0) return null;
  return (
    <S.Section aria-labelledby={`urgency-m-${bucket}`}>
      <S.SectionTitle id={`urgency-m-${bucket}`}>{URGENCY_LABEL[bucket]}</S.SectionTitle>
      <S.TaskList>
        {rows.map((row) => (
          <TaskRow
            key={row.id}
            title={row.title}
            href={`/proyectos/${row.projectId}`}
            assignee={row.projectTitle || assigneeName}
            status={row.status}
            due={row.dueDate}
          />
        ))}
      </S.TaskList>
    </S.Section>
  );
}

export function MyTasksScreen() {
  const router = useRouter();
  const { user, identity } = useAuth();
  const { status, data, error, reload } = useMyTasks();

  const roles = (identity?.roles ?? []) as readonly AppRole[];
  const allowed = canAccess("/mis-tareas", roles);

  const grouped = useMemo(() => {
    const tasks = [...(data?.tasks ?? [])].sort(compareByDueDate);
    return groupByUrgency(tasks);
  }, [data]);

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

  const tasks = data?.tasks ?? [];
  const isEmpty = tasks.length === 0;
  const sync = syncFromTasks(tasks);

  return (
    <S.Page>
      <S.Header>
        <S.Title>Mis tareas</S.Title>
        <S.Subtitle>Lo más urgente primero. Tu trabajo, sin información institucional.</S.Subtitle>
      </S.Header>

      {data && data.partialFailures > 0 ? (
        <S.PartialNotice role="status">
          Algunas tareas no se pudieron cargar. Los totales pueden estar incompletos.
        </S.PartialNotice>
      ) : null}

      {sync !== "synced" ? <SyncStatus status={sync} persisted canRetry={false} /> : null}

      <KpiPanel
        period="Personal"
        metrics={buildMetrics(
          grouped.overdue.length,
          grouped.thisWeek.length,
          data?.monthProgressCount ?? null,
        )}
      />

      {isEmpty ? (
        <EmptyState
          kind="no-records"
          title="No tienes tareas pendientes"
          description="Cuando te asignen trabajo en un proyecto, aparecerá aquí ordenado por urgencia."
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
                assigneeName={user?.fullName ?? "Tú"}
              />
            ))}
          </S.MobileOnly>
        </>
      )}
    </S.Page>
  );
}

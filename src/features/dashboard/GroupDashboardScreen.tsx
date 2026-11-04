"use client";

import type { ProjectResponse, UserResponse } from "@quantia/contracts";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Badge, Button, Link, PROJECT_STATUS_PRESENTATION, Select } from "@/components/base";
import { SearchField } from "@/components/composite";
import {
  AlertList,
  DataTable,
  KpiPanel,
  type DataTableColumn,
  type KpiMetric,
} from "@/components/page";
import { EmptyState, ErrorState, Skeleton } from "@/components/system";
import { useAuth } from "@/features/auth/AuthProvider";
import {
  ALL_STATUSES,
  PROJECT_STATUS_FILTER_OPTIONS,
  parseSearchQuery,
  parseStatusFilter,
  type ProjectsStatusFilter,
} from "@/features/projects/projectsListFilters";
import { canAccess } from "@/lib/auth";
import type { AppRole } from "@/lib/auth/navigation";
import { formatDate, formatPercent } from "@/lib/format";

import * as S from "./GroupDashboardScreen.styles";
import { useGroupDashboard } from "./useGroupDashboard";

function coordinatorLabel(project: ProjectResponse, me: UserResponse | null): string {
  if (me && project.coordinatorId === me.id) return me.fullName;
  return "Coordinador asignado";
}

function StatusCell({ status }: { status: ProjectResponse["status"] }) {
  const presentation = PROJECT_STATUS_PRESENTATION[status];
  const Icon = presentation.icon;
  return <Badge label={presentation.label} tone={presentation.tone} icon={<Icon />} />;
}

function buildKpis(counts: {
  active: number;
  delayed: number;
  completed: number;
  formulation: number;
}): KpiMetric[] {
  return [
    {
      id: "active",
      label: "Proyectos activos",
      value: String(counts.active),
      context: "En el alcance de gestión",
    },
    {
      id: "delayed",
      label: "Retrasados",
      value: String(counts.delayed),
      context: "Necesitan seguimiento",
    },
    {
      id: "completed",
      label: "Finalizados",
      value: String(counts.completed),
      context: "Cierre confirmado",
    },
    {
      id: "formulation",
      label: "En formulación",
      value: String(counts.formulation),
      context: "Pendientes de inicio",
    },
  ];
}

function buildColumns(me: UserResponse | null): DataTableColumn<ProjectResponse>[] {
  return [
    {
      id: "title",
      header: "Proyecto",
      cell: (row) => row.title,
    },
    {
      id: "status",
      header: "Estado",
      cell: (row) => <StatusCell status={row.status} />,
    },
    {
      id: "coordinator",
      header: "Responsable",
      cell: (row) => coordinatorLabel(row, me),
    },
    {
      id: "endDate",
      header: "Fecha límite",
      cell: (row) => formatDate(row.endDate),
    },
    {
      id: "action",
      header: "Acción",
      cell: (row) => <Link href={`/proyectos/${row.id}`}>ver proyecto</Link>,
    },
  ];
}

export function GroupDashboardScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { identity, user } = useAuth();

  const appliedQ = parseSearchQuery(searchParams.get("q"));
  const appliedStatus = parseStatusFilter(searchParams.get("status"));
  const query = useMemo(() => ({ q: appliedQ, status: appliedStatus }), [appliedQ, appliedStatus]);

  const { status, data, error, stale, reload } = useGroupDashboard(query);
  const [draftQ, setDraftQ] = useState(appliedQ);
  const [draftStatus, setDraftStatus] = useState<ProjectsStatusFilter>(appliedStatus);

  const roles = (identity?.roles ?? []) as readonly AppRole[];
  const allowed = canAccess("/dashboard", roles);
  const columns = useMemo(() => buildColumns(user), [user]);

  const writeParams = (next: { q?: string; status?: ProjectsStatusFilter }) => {
    const params = new URLSearchParams();
    const q = next.q ?? appliedQ;
    const statusFilter = next.status ?? appliedStatus;
    if (q) params.set("q", q);
    if (statusFilter !== ALL_STATUSES) params.set("status", statusFilter);
    const qs = params.toString();
    router.replace(qs ? `/dashboard?${qs}` : "/dashboard");
  };

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
        title="Estamos procesando demasiadas solicitudes"
        description="Espera el tiempo indicado y vuelve a cargar el dashboard."
        retryAfterSeconds={error.retryAfterSeconds}
        onRetry={reload}
      />
    );
  }

  if (status === "error") {
    return <ErrorState variant="server" onRetry={reload} />;
  }

  const isBootLoading = status === "idle" || (status === "loading" && !data);

  return (
    <S.Page>
      <S.Header>
        <S.HeaderText>
          <S.Title>Dashboard del grupo</S.Title>
          <S.Subtitle>Semillero · revisión de riesgos y prioridades.</S.Subtitle>
        </S.HeaderText>
        <S.HeaderActions>
          <Button
            intent="secondary"
            type="button"
            onClick={reload}
            isLoading={status === "loading"}
          >
            Actualizar
          </Button>
        </S.HeaderActions>
      </S.Header>

      <S.FilterGrid>
        <SearchField
          label="Buscar proyecto"
          value={draftQ}
          onChange={setDraftQ}
          placeholder="Buscar proyecto"
        />
        <Select
          label="Estado"
          options={PROJECT_STATUS_FILTER_OPTIONS}
          value={draftStatus}
          onValueChange={(value) => setDraftStatus(parseStatusFilter(value))}
        />
        <S.FilterActions>
          <Button
            intent="secondary"
            type="button"
            onClick={() => {
              writeParams({ q: draftQ.trim(), status: draftStatus });
            }}
          >
            Aplicar
          </Button>
        </S.FilterActions>
      </S.FilterGrid>

      {stale ? (
        <S.StaleBanner role="status">
          <S.StaleText>Contenido desactualizado</S.StaleText>
          <Button intent="secondary" type="button" onClick={reload}>
            Reintentar
          </Button>
        </S.StaleBanner>
      ) : null}

      {isBootLoading ? (
        <S.LoadingBlock aria-busy="true" aria-label="Cargando">
          <Skeleton variant="metric" />
          <Skeleton variant="list" rows={3} />
          <Skeleton variant="card" />
          <Skeleton variant="table" />
        </S.LoadingBlock>
      ) : data ? (
        <>
          <KpiPanel period="Alcance actual" metrics={buildKpis(data.kpis)} title="Indicadores" />

          <S.Section aria-labelledby="dashboard-alerts">
            <S.SectionTitle id="dashboard-alerts">¿Qué necesita atención hoy?</S.SectionTitle>
            <AlertList
              items={data.alerts}
              emptyTitle="Todo al día"
              emptyDescription="Sin alertas pendientes en el alcance actual."
            />
          </S.Section>

          <S.Section aria-labelledby="dashboard-comparison">
            <S.SectionTitle id="dashboard-comparison">Comparación con contexto</S.SectionTitle>
            {data.comparison ? (
              <S.ComparisonCard>
                <S.ComparisonTitle>
                  {data.comparison.projectTitle} · mismo periodo disponible
                </S.ComparisonTitle>
                <S.MetricRow>
                  <S.MetricLabelRow>
                    <S.MetricLabel>Avance de investigación</S.MetricLabel>
                    <S.MetricValue>{formatPercent(data.comparison.progressPercent)}</S.MetricValue>
                  </S.MetricLabelRow>
                  <S.Track>
                    <S.Fill $tone="primary" $percent={data.comparison.progressPercent} />
                  </S.Track>
                </S.MetricRow>
                <S.MetricRow>
                  <S.MetricLabelRow>
                    <S.MetricLabel>Presupuesto ejecutado</S.MetricLabel>
                    <S.MetricValue>{formatPercent(data.comparison.executedPercent)}</S.MetricValue>
                  </S.MetricLabelRow>
                  <S.Track>
                    <S.Fill $tone="warning" $percent={data.comparison.executedPercent} />
                  </S.Track>
                </S.MetricRow>
                <S.Footnote>
                  Comparación con medidas reales del proyecto. Nunca se sustituye un dato ausente
                  por cero.
                </S.Footnote>
                <Link href={`/proyectos/${data.comparison.projectId}`}>Ver proyecto</Link>
              </S.ComparisonCard>
            ) : (
              <S.ComparisonCard>
                <S.Footnote>
                  En producción, esta comparación solo aparece con medidas comparables y un contrato
                  disponible. Nunca se sustituye un dato ausente por cero.
                </S.Footnote>
              </S.ComparisonCard>
            )}
          </S.Section>

          <S.Section aria-labelledby="dashboard-detail">
            <S.SectionHeading>
              <S.SectionTitle id="dashboard-detail">Detalle de proyectos</S.SectionTitle>
              <Link href="/proyectos">ver todos</Link>
            </S.SectionHeading>
            <DataTable
              caption="Detalle de proyectos"
              columns={columns}
              rows={data.projects}
              getRowId={(row) => row.id}
              isLoading={status === "loading"}
              emptyState={
                <EmptyState
                  kind="no-records"
                  title="Sin proyectos en esta vista"
                  description="Ajusta los filtros o espera a que existan proyectos en el alcance."
                />
              }
            />
          </S.Section>
        </>
      ) : null}
    </S.Page>
  );
}

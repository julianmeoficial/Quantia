"use client";

import type {
  PresupuestoEjecucionBajaPayload,
  ProjectResponse,
  UserResponse,
} from "@quantia/contracts";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Badge, Button, Link, PROJECT_STATUS_PRESENTATION, Select } from "@/components/base";
import { FilterBar, type FilterChip } from "@/components/composite";
import {
  AlertList,
  DataTable,
  KpiPanel,
  type AlertListItem,
  type DataTableColumn,
  type KpiMetric,
} from "@/components/page";
import { EmptyState, ErrorState, Skeleton } from "@/components/system";
import { useAuth } from "@/features/auth/AuthProvider";
import {
  ALL_STATUSES,
  DASHBOARD_FILTER_DEFAULTS,
  PROJECT_STATUS_FILTER_OPTIONS,
  dashboardFiltersSchema,
  statusChipLabel,
} from "@/features/filters";
import { canAccess, canViewBudgetDetail } from "@/lib/auth";
import type { AppRole } from "@/lib/auth/navigation";
import { formatDate, formatPercent } from "@/lib/format";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import { useBudgetLowExecutionAlerts } from "@/lib/socket";
import { useUrlFilters } from "@/lib/url";

import * as S from "./InstitutionalOverviewScreen.styles";
import { useInstitutionalOverview } from "./useInstitutionalOverview";

const HIGHLIGHT_MS = 2000;

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
      context: "Alcance institucional",
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

function budgetLowAlert(payload: PresupuestoEjecucionBajaPayload): AlertListItem {
  return {
    id: `budget-low:${payload.projectId}:${payload.updatedAt}`,
    severity: "critical",
    title: "Ejecución presupuestal baja relativa al umbral",
    interpretation: `Ejecución ${formatPercent(payload.executedPercent)} frente a umbral ${formatPercent(payload.thresholdPercent)}.`,
    href: `/presupuesto?projectId=${payload.projectId}`,
    hrefLabel: "Ver presupuesto",
  };
}

export function InstitutionalOverviewScreen() {
  const router = useRouter();
  const { identity, user } = useAuth();
  const { values, setFilters, clearFilters, isFiltered } = useUrlFilters({
    schema: dashboardFiltersSchema,
    defaults: DASHBOARD_FILTER_DEFAULTS,
    pathname: "/institucional",
    ignoreFilteredKeys: ["page"],
  });

  const [draftQ, setDraftQ] = useState(values.q);
  const [urlQ, setUrlQ] = useState(values.q);
  if (values.q !== urlQ) {
    setUrlQ(values.q);
    setDraftQ(values.q);
  }

  const debouncedQ = useDebouncedValue(draftQ, 300);

  useEffect(() => {
    const next = debouncedQ.trim();
    if (next !== values.q) {
      setFilters({ q: next, page: 1 });
    }
  }, [debouncedQ, setFilters, values.q]);

  const query = useMemo(
    () => ({
      q: values.q,
      status: values.status,
      page: values.page,
      pageSize: values.pageSize,
    }),
    [values.page, values.pageSize, values.q, values.status],
  );
  const { status, data, error, stale, reload } = useInstitutionalOverview(query);

  const [liveAlerts, setLiveAlerts] = useState<AlertListItem[]>([]);
  const [highlightedIds, setHighlightedIds] = useState<string[]>([]);

  const onBudgetLow = useCallback(
    (payload: PresupuestoEjecucionBajaPayload) => {
      if (!user || !canViewBudgetDetail(user)) return;
      const alert = budgetLowAlert(payload);
      setLiveAlerts((prev) => {
        const without = prev.filter(
          (item) => !item.id.startsWith(`budget-low:${payload.projectId}:`),
        );
        return [alert, ...without];
      });
      setHighlightedIds((prev) => [...prev.filter((id) => id !== alert.id), alert.id]);
      window.setTimeout(() => {
        setHighlightedIds((prev) => prev.filter((id) => id !== alert.id));
      }, HIGHLIGHT_MS);
      reload();
    },
    [reload, user],
  );

  useBudgetLowExecutionAlerts(onBudgetLow);

  const roles = (identity?.roles ?? []) as readonly AppRole[];
  const allowed = canAccess("/institucional", roles);
  const columns = useMemo(() => buildColumns(user), [user]);

  const chips = useMemo((): FilterChip[] => {
    const next: FilterChip[] = [];
    if (values.q) next.push({ id: "q", label: `Búsqueda: ${values.q}` });
    if (values.status !== ALL_STATUSES) {
      next.push({ id: "status", label: `Estado: ${statusChipLabel(values.status)}` });
    }
    return next;
  }, [values.q, values.status]);

  const mergedAlerts = useMemo(() => {
    const base = data?.alerts ?? [];
    const byId = new Map<string, AlertListItem>();
    for (const item of [...liveAlerts, ...base]) {
      if (!byId.has(item.id)) byId.set(item.id, item);
    }
    return Array.from(byId.values());
  }, [data?.alerts, liveAlerts]);

  const handleRemoveChip = (id: string) => {
    if (id === "q") {
      setDraftQ("");
      setFilters({ q: "", page: 1 });
      return;
    }
    if (id === "status") {
      setFilters({ status: ALL_STATUSES, page: 1 });
    }
  };

  const handleClear = () => {
    setDraftQ("");
    clearFilters();
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
        description="Espera el tiempo indicado y vuelve a cargar la vista institucional."
        retryAfterSeconds={error.retryAfterSeconds}
        onRetry={reload}
      />
    );
  }

  if (status === "error") {
    return <ErrorState variant="server" onRetry={reload} />;
  }

  const isBootLoading = status === "idle" || (status === "loading" && !data);
  const noFilteredProjects = Boolean(data && isFiltered && data.projects.length === 0);
  const tableEmpty = (
    <EmptyState
      kind={isFiltered ? "no-results" : "no-records"}
      title={isFiltered ? "Sin resultados con estos filtros" : "Sin proyectos en esta vista"}
      description={
        isFiltered
          ? "Prueba con otros filtros o limpia la búsqueda."
          : "Aún no hay proyectos en el alcance institucional."
      }
      action={
        isFiltered ? (
          <Button intent="secondary" type="button" onClick={handleClear}>
            Limpiar filtros
          </Button>
        ) : undefined
      }
    />
  );

  return (
    <S.Page>
      <S.Header>
        <S.HeaderText>
          <S.Title>Vista institucional</S.Title>
          <S.Subtitle>Alcance institucional · proyectos del semillero.</S.Subtitle>
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

      <FilterBar
        searchLabel="Buscar proyecto"
        searchValue={draftQ}
        onSearchChange={setDraftQ}
        chips={chips}
        onRemoveChip={handleRemoveChip}
        onClear={isFiltered ? handleClear : undefined}
        resultCount={data?.totalProjects}
        isLoading={status === "loading"}
      >
        <Select
          label="Estado"
          options={PROJECT_STATUS_FILTER_OPTIONS}
          value={values.status}
          onValueChange={(value) => {
            const option = PROJECT_STATUS_FILTER_OPTIONS.find((item) => item.value === value);
            setFilters({
              status: option ? (option.value as typeof values.status) : ALL_STATUSES,
              page: 1,
            });
          }}
        />
      </FilterBar>

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
          <KpiPanel
            period="Alcance institucional"
            metrics={buildKpis(data.kpis)}
            title="Indicadores"
          />

          <S.Section aria-labelledby="institutional-detail">
            <S.SectionHeading>
              <S.SectionTitle id="institutional-detail">Proyectos institucionales</S.SectionTitle>
              <Link href="/proyectos">ver todos</Link>
            </S.SectionHeading>
            <DataTable
              caption="Proyectos institucionales"
              columns={columns}
              rows={data.projects}
              getRowId={(row) => row.id}
              isLoading={status === "loading"}
              emptyState={tableEmpty}
              pagination={
                data.totalProjects > 0
                  ? {
                      page: values.page,
                      pageSize: values.pageSize,
                      totalItems: data.totalProjects,
                      onPageChange: (page) => setFilters({ page }),
                      onPageSizeChange: (pageSize) => setFilters({ page: 1, pageSize }),
                    }
                  : undefined
              }
            />
          </S.Section>

          <S.Section aria-labelledby="institutional-alerts">
            <S.SectionTitle id="institutional-alerts">¿Qué necesita atención hoy?</S.SectionTitle>
            <AlertList
              items={noFilteredProjects ? [] : mergedAlerts}
              highlightedIds={highlightedIds}
              emptyTitle={noFilteredProjects ? "Sin resultados con estos filtros" : "Todo al día"}
              emptyDescription={
                noFilteredProjects
                  ? "Prueba con otros filtros o limpia la búsqueda."
                  : "Sin alertas pendientes en el alcance institucional."
              }
            />
          </S.Section>
        </>
      ) : null}
    </S.Page>
  );
}

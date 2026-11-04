"use client";

import type { ProjectResponse, UserResponse } from "@quantia/contracts";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Badge, Button, Link, PROJECT_STATUS_PRESENTATION, Select } from "@/components/base";
import { FilterBar, type FilterChip } from "@/components/composite";
import { DataTable, type DataTableColumn } from "@/components/page";
import { EmptyState, ErrorState, Skeleton, Toast, ToastProvider } from "@/components/system";
import { useAuth } from "@/features/auth/AuthProvider";
import {
  ALL_STATUSES,
  PROJECT_LIST_FILTER_DEFAULTS,
  PROJECT_SORT_OPTIONS,
  PROJECT_STATUS_FILTER_OPTIONS,
  projectListFiltersSchema,
  sortChipLabel,
  statusChipLabel,
  type ProjectListFilters,
} from "@/features/filters";
import { canAccess, isAdmin, isCoordinator } from "@/lib/auth";
import type { AppRole } from "@/lib/auth/navigation";
import { formatDate } from "@/lib/format";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import { useUrlFilters } from "@/lib/url";

import { CreateProjectPanel } from "./CreateProjectPanel";
import * as S from "./ProjectsListScreen.styles";
import { useProjectsList } from "./useProjectsList";

function coordinatorLabel(project: ProjectResponse, me: UserResponse | null): string {
  if (me && project.coordinatorId === me.id) return me.fullName;
  return "Coordinador asignado";
}

function StatusCell({ status }: { status: ProjectResponse["status"] }) {
  const presentation = PROJECT_STATUS_PRESENTATION[status];
  const Icon = presentation.icon;
  return <Badge label={presentation.label} tone={presentation.tone} icon={<Icon />} />;
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

export function ProjectsListScreen() {
  return (
    <ToastProvider>
      <ProjectsListBody />
    </ToastProvider>
  );
}

function ProjectsListBody() {
  const router = useRouter();
  const { identity, user } = useAuth();
  const createTriggerRef = useRef<HTMLSpanElement>(null);

  const { values, setFilters, clearFilters, isFiltered } = useUrlFilters({
    schema: projectListFiltersSchema,
    defaults: PROJECT_LIST_FILTER_DEFAULTS,
    pathname: "/proyectos",
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
      sortBy: values.sortBy,
      sortOrder: values.sortOrder,
    }),
    [values.page, values.pageSize, values.q, values.sortBy, values.sortOrder, values.status],
  );

  const { status, data, error, stale, reload } = useProjectsList(query);
  const [createOpen, setCreateOpen] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; title: string; description?: string }>({
    open: false,
    title: "",
  });

  const roles = (identity?.roles ?? []) as readonly AppRole[];
  const allowed = canAccess("/proyectos", roles);
  const canCreate = Boolean(user && (isAdmin(user) || isCoordinator(user)));
  const columns = useMemo(() => buildColumns(user), [user]);

  const sortValue = `${values.sortBy}:${values.sortOrder}`;
  const sortIsDefault =
    values.sortBy === PROJECT_LIST_FILTER_DEFAULTS.sortBy &&
    values.sortOrder === PROJECT_LIST_FILTER_DEFAULTS.sortOrder;

  const chips = useMemo((): FilterChip[] => {
    const next: FilterChip[] = [];
    if (values.q) next.push({ id: "q", label: `Búsqueda: ${values.q}` });
    if (values.status !== ALL_STATUSES) {
      next.push({ id: "status", label: `Estado: ${statusChipLabel(values.status)}` });
    }
    if (!sortIsDefault) {
      next.push({
        id: "sort",
        label: `Orden: ${sortChipLabel(values.sortBy, values.sortOrder)}`,
      });
    }
    return next;
  }, [sortIsDefault, values.q, values.sortBy, values.sortOrder, values.status]);

  const handleRemoveChip = (id: string) => {
    if (id === "q") {
      setDraftQ("");
      setFilters({ q: "", page: 1 });
      return;
    }
    if (id === "status") {
      setFilters({ status: ALL_STATUSES, page: 1 });
      return;
    }
    if (id === "sort") {
      setFilters({
        sortBy: PROJECT_LIST_FILTER_DEFAULTS.sortBy,
        sortOrder: PROJECT_LIST_FILTER_DEFAULTS.sortOrder,
        page: 1,
      });
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
        retryAfterSeconds={error.retryAfterSeconds}
        onRetry={reload}
      />
    );
  }

  if (status === "error") {
    return <ErrorState variant="server" onRetry={reload} />;
  }

  const rows = data?.data ?? [];
  const total = data?.meta.total ?? 0;
  const isBootLoading = status === "idle" || (status === "loading" && !data);

  return (
    <S.Page>
      <S.Header>
        <S.HeaderText>
          <S.Title>Proyectos</S.Title>
          <S.Subtitle>Cartera accesible para coordinación y administración.</S.Subtitle>
        </S.HeaderText>
        {canCreate ? (
          <S.HeaderActions>
            <span ref={createTriggerRef}>
              <Button intent="primary" type="button" onClick={() => setCreateOpen(true)}>
                Crear proyecto
              </Button>
            </span>
          </S.HeaderActions>
        ) : null}
      </S.Header>

      <FilterBar
        searchLabel="Buscar proyecto"
        searchValue={draftQ}
        onSearchChange={setDraftQ}
        chips={chips}
        onRemoveChip={handleRemoveChip}
        onClear={isFiltered ? handleClear : undefined}
        resultCount={data?.meta.total}
        isLoading={status === "loading"}
      >
        <Select
          label="Estado"
          options={PROJECT_STATUS_FILTER_OPTIONS}
          value={values.status}
          onValueChange={(value) => {
            const option = PROJECT_STATUS_FILTER_OPTIONS.find((item) => item.value === value);
            setFilters({
              status: option ? (option.value as ProjectListFilters["status"]) : ALL_STATUSES,
              page: 1,
            });
          }}
        />
        <Select
          label="Orden"
          options={PROJECT_SORT_OPTIONS}
          value={sortValue}
          onValueChange={(value) => {
            const [sortBy, sortOrder] = value.split(":") as [
              ProjectListFilters["sortBy"],
              ProjectListFilters["sortOrder"],
            ];
            setFilters({ sortBy, sortOrder, page: 1 });
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
        <Skeleton variant="table" />
      ) : (
        <DataTable
          caption="Proyectos"
          columns={columns}
          rows={rows}
          getRowId={(row) => row.id}
          isLoading={status === "loading"}
          emptyState={
            <EmptyState
              kind={isFiltered ? "no-results" : "no-records"}
              title={
                isFiltered ? "Sin resultados con estos filtros" : "Sin proyectos en esta vista"
              }
              description={
                isFiltered
                  ? "Prueba con otros filtros o limpia la búsqueda."
                  : "Cuando existan proyectos accesibles aparecerán aquí."
              }
              action={
                isFiltered ? (
                  <Button intent="secondary" type="button" onClick={handleClear}>
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
      )}

      {canCreate ? (
        <CreateProjectPanel
          open={createOpen}
          onOpenChange={setCreateOpen}
          triggerRef={createTriggerRef}
          onSuccess={(project) => {
            setToast({
              open: true,
              title: "Proyecto creado",
              description: project.title,
            });
            reload();
            router.push(`/proyectos/${project.id}`);
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

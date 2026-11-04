"use client";

import type { ProjectResponse, UserResponse } from "@quantia/contracts";
import { useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Badge, Button, Link, PROJECT_STATUS_PRESENTATION, Select } from "@/components/base";
import { SearchField } from "@/components/composite";
import { DataTable, type DataTableColumn } from "@/components/page";
import { EmptyState, ErrorState, Skeleton, Toast, ToastProvider } from "@/components/system";
import { useAuth } from "@/features/auth/AuthProvider";
import { canAccess, isAdmin, isCoordinator } from "@/lib/auth";
import type { AppRole } from "@/lib/auth/navigation";
import { formatDate } from "@/lib/format";

import { CreateProjectPanel } from "./CreateProjectPanel";
import * as S from "./ProjectsListScreen.styles";
import {
  ALL_STATUSES,
  PROJECT_STATUS_FILTER_OPTIONS,
  parsePage,
  parsePageSize,
  parseSearchQuery,
  parseStatusFilter,
  type ProjectsStatusFilter,
} from "./projectsListFilters";
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
  const searchParams = useSearchParams();
  const { identity, user } = useAuth();
  const createTriggerRef = useRef<HTMLSpanElement>(null);

  const appliedQ = parseSearchQuery(searchParams.get("q"));
  const appliedStatus = parseStatusFilter(searchParams.get("status"));
  const appliedPage = parsePage(searchParams.get("page"));
  const appliedPageSize = parsePageSize(searchParams.get("pageSize"));

  const query = useMemo(
    () => ({
      q: appliedQ,
      status: appliedStatus,
      page: appliedPage,
      pageSize: appliedPageSize,
    }),
    [appliedPage, appliedPageSize, appliedQ, appliedStatus],
  );

  const { status, data, error, stale, reload } = useProjectsList(query);
  const [draftQ, setDraftQ] = useState(appliedQ);
  const [draftStatus, setDraftStatus] = useState<ProjectsStatusFilter>(appliedStatus);
  const [createOpen, setCreateOpen] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; title: string; description?: string }>({
    open: false,
    title: "",
  });

  const roles = (identity?.roles ?? []) as readonly AppRole[];
  const allowed = canAccess("/proyectos", roles);
  const canCreate = Boolean(user && (isAdmin(user) || isCoordinator(user)));
  const filtersActive = appliedQ !== "" || appliedStatus !== ALL_STATUSES;
  const columns = useMemo(() => buildColumns(user), [user]);

  const writeParams = (next: {
    q?: string;
    status?: ProjectsStatusFilter;
    page?: number;
    pageSize?: number;
  }) => {
    const params = new URLSearchParams();
    const q = next.q ?? appliedQ;
    const statusFilter = next.status ?? appliedStatus;
    const page = next.page ?? appliedPage;
    const pageSize = next.pageSize ?? appliedPageSize;
    if (q) params.set("q", q);
    if (statusFilter !== ALL_STATUSES) params.set("status", statusFilter);
    if (page > 1) params.set("page", String(page));
    if (pageSize !== 20) params.set("pageSize", String(pageSize));
    const qs = params.toString();
    router.replace(qs ? `/proyectos?${qs}` : "/proyectos");
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
  const emptyKind = filtersActive ? "no-results" : "no-records";

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

      <S.FilterGrid>
        <SearchField
          label="Buscar proyecto"
          value={draftQ}
          onChange={setDraftQ}
          placeholder="Ej.: Observatorio"
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
              setDraftQ(draftQ.trim());
              writeParams({
                q: draftQ.trim(),
                status: draftStatus,
                page: 1,
              });
            }}
          >
            Buscar
          </Button>
          {filtersActive ? (
            <Button
              intent="ghost"
              type="button"
              onClick={() => {
                setDraftQ("");
                setDraftStatus(ALL_STATUSES);
                writeParams({ q: "", status: ALL_STATUSES, page: 1 });
              }}
            >
              Limpiar filtros
            </Button>
          ) : null}
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
              kind={emptyKind}
              title="Sin proyectos en esta vista"
              description={
                filtersActive
                  ? "Prueba con otros filtros o limpia la búsqueda."
                  : "Cuando existan proyectos accesibles aparecerán aquí."
              }
              action={
                filtersActive ? (
                  <Button
                    intent="secondary"
                    type="button"
                    onClick={() => {
                      setDraftQ("");
                      setDraftStatus(ALL_STATUSES);
                      writeParams({ q: "", status: ALL_STATUSES, page: 1 });
                    }}
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
                  page: appliedPage,
                  pageSize: appliedPageSize,
                  totalItems: total,
                  onPageChange: (page) => writeParams({ page }),
                  onPageSizeChange: (pageSize) => writeParams({ page: 1, pageSize }),
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

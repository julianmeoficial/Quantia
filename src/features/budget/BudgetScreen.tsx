"use client";

import type { BudgetExecutionResponse } from "@quantia/contracts";
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Button, Select } from "@/components/base";
import { BudgetPanel, DataTable, type DataTableColumn } from "@/components/page";
import { EmptyState, ErrorState, Skeleton, Toast, ToastProvider } from "@/components/system";
import { useAuth } from "@/features/auth/AuthProvider";
import { BUDGET_FILTER_DEFAULTS, budgetFiltersSchema } from "@/features/filters";
import { useAccessibleProjects } from "@/features/projects/useAccessibleProjects";
import { canAccess, canManageBudget, canViewBudgetDetail } from "@/lib/auth";
import type { AppRole } from "@/lib/auth/navigation";
import { formatCOP, formatDate } from "@/lib/format";
import { useUrlFilters } from "@/lib/url";

import { CreateBudgetPanel } from "./CreateBudgetPanel";
import * as S from "../tasks/sectionPage.styles";
import { useProjectBudget } from "./useProjectBudget";

const EXECUTION_KIND_LABEL: Record<BudgetExecutionResponse["kind"], string> = {
  COMMITMENT: "Compromiso",
  PAYMENT: "Pago",
  ADJUSTMENT: "Ajuste",
};

export function BudgetScreen() {
  return (
    <ToastProvider>
      <BudgetBody />
    </ToastProvider>
  );
}

function BudgetBody() {
  const router = useRouter();
  const { identity, user } = useAuth();
  const createTriggerRef = useRef<HTMLSpanElement>(null);

  const { values, setFilters } = useUrlFilters({
    schema: budgetFiltersSchema,
    defaults: BUDGET_FILTER_DEFAULTS,
    pathname: "/presupuesto",
  });

  const projectsState = useAccessibleProjects();
  const selectedProject = useMemo(
    () => projectsState.projects.find((item) => item.id === values.projectId) ?? null,
    [projectsState.projects, values.projectId],
  );

  const { status, budget, executions, error, stale, reload } = useProjectBudget(
    values.projectId || null,
  );

  const [createOpen, setCreateOpen] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; title: string; description?: string }>({
    open: false,
    title: "",
  });

  const roles = (identity?.roles ?? []) as readonly AppRole[];
  const allowed = canAccess("/presupuesto", roles);
  const canView = Boolean(user && canViewBudgetDetail(user));
  const canManage = Boolean(user && selectedProject && canManageBudget(user, selectedProject));

  const executionColumns = useMemo(
    (): DataTableColumn<BudgetExecutionResponse>[] => [
      {
        id: "kind",
        header: "Tipo",
        cell: (row) => EXECUTION_KIND_LABEL[row.kind],
      },
      {
        id: "amount",
        header: "Monto",
        align: "end",
        cell: (row) => formatCOP(row.amount),
      },
      {
        id: "occurredAt",
        header: "Fecha",
        cell: (row) => formatDate(row.occurredAt),
      },
      {
        id: "note",
        header: "Nota",
        cell: (row) => row.note ?? "—",
      },
    ],
    [],
  );

  if (!allowed || !canView) {
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

  const isBootLoading =
    Boolean(values.projectId) && (status === "idle" || status === "loading") && !budget;

  return (
    <S.Page>
      <S.Header>
        <S.HeaderText>
          <S.Title>Presupuesto</S.Title>
          <S.Subtitle>Asignación, rúbricas y ejecuciones del proyecto seleccionado.</S.Subtitle>
        </S.HeaderText>
        {canManage && status === "empty" ? (
          <S.HeaderActions>
            <span ref={createTriggerRef}>
              <Button intent="primary" type="button" onClick={() => setCreateOpen(true)}>
                Crear presupuesto
              </Button>
            </span>
          </S.HeaderActions>
        ) : null}
      </S.Header>

      <Select
        label="Proyecto"
        options={projectsState.options}
        value={values.projectId}
        onValueChange={(projectId) => setFilters({ projectId })}
      />

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
            description="Elige un proyecto para revisar su presupuesto. No se inventan totales institucionales."
          />
        </S.SelectProjectHint>
      ) : isBootLoading ? (
        <Skeleton variant="card" />
      ) : status === "empty" ? (
        <EmptyState
          kind="no-records"
          title="Sin presupuesto"
          description="Este proyecto aún no tiene presupuesto registrado."
          action={
            canManage ? (
              <Button intent="primary" type="button" onClick={() => setCreateOpen(true)}>
                Crear presupuesto
              </Button>
            ) : undefined
          }
        />
      ) : budget ? (
        <>
          <BudgetPanel
            assigned={budget.totalAmount}
            executed={budget.executedAmount}
            executedPercent={budget.executedPercent}
            canEdit={false}
            lines={budget.items.map((item) => ({
              id: item.id,
              rubric: item.category,
              planned: item.plannedAmount,
              spent: "0",
            }))}
          />

          <S.Title as="h2">Ejecuciones</S.Title>
          <DataTable
            caption="Ejecuciones presupuestales"
            columns={executionColumns}
            rows={executions}
            getRowId={(row) => row.id}
            emptyState={
              <EmptyState
                kind="no-records"
                title="Sin ejecuciones"
                description="Cuando se registren compromisos o pagos aparecerán aquí."
              />
            }
          />
        </>
      ) : null}

      {selectedProject ? (
        <CreateBudgetPanel
          open={createOpen}
          onOpenChange={setCreateOpen}
          project={selectedProject}
          triggerRef={createTriggerRef}
          onSuccess={() => {
            setToast({ open: true, title: "Presupuesto creado" });
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

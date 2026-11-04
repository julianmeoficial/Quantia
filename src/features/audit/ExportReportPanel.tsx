"use client";

import { ReportKind, type ReportKind as ReportKindType } from "@quantia/contracts";
import { useState } from "react";

import { Button, Select } from "@/components/base";
import { Sheet, Toast } from "@/components/system";
import { useAuth } from "@/features/auth/AuthProvider";
import { useAccessibleProjects } from "@/features/projects/useAccessibleProjects";
import { useSessionReports, type ReportToastState } from "@/features/reports/useSessionReports";
import { canGenerateReport } from "@/lib/auth";

import * as S from "../projects/CreateProjectPanel.styles";

export type ExportReportKind = typeof ReportKind.BUDGET_PDF | typeof ReportKind.BUDGET_EXCEL;

export interface ExportReportPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kind: ExportReportKind;
}

const KIND_LABEL: Record<ExportReportKind, string> = {
  [ReportKind.BUDGET_PDF]: "Exportar PDF",
  [ReportKind.BUDGET_EXCEL]: "Exportar Excel",
};

const EMPTY_TOAST: ReportToastState = { open: false, title: "" };

export function ExportReportPanel({ open, onOpenChange, kind }: ExportReportPanelProps) {
  const { user } = useAuth();
  const projectsState = useAccessibleProjects();
  const [projectId, setProjectId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<ReportToastState>(EMPTY_TOAST);
  const { enqueue, isBusy } = useSessionReports(setToast);

  const selected = projectsState.projects.find((item) => item.id === projectId) ?? null;
  const busy = Boolean(selected && isBusy(selected.id, kind));

  const handleClose = () => {
    if (isSubmitting) return;
    setProjectId("");
    setError(null);
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    setError(null);
    if (!selected) {
      setError("Selecciona un proyecto.");
      return;
    }
    if (!user || !canGenerateReport(user, kind as ReportKindType)) {
      setError("No tienes permiso para generar este tipo de reporte.");
      return;
    }
    if (busy) {
      setError("Ya hay un reporte de este tipo en curso para el proyecto.");
      return;
    }

    setIsSubmitting(true);
    const result = await enqueue({
      projectId: selected.id,
      projectTitle: selected.title,
      kind,
    });
    setIsSubmitting(false);

    if (!result.ok) {
      if (result.error.kind === "forbidden") {
        setError("No tienes permiso para generar reportes en este proyecto.");
      } else if (result.error.kind === "rate_limited") {
        setError("Estamos procesando demasiadas solicitudes. Inténtalo de nuevo en unos segundos.");
      } else if (result.error.kind === "conflict") {
        setError("Ya hay un reporte de este tipo en curso para el proyecto.");
      } else {
        setError("No pudimos iniciar el reporte. Inténtalo de nuevo.");
      }
      return;
    }

    handleClose();
  };

  return (
    <>
      {open ? (
        <Sheet
          open
          onOpenChange={(next) => {
            if (!next) handleClose();
          }}
          title={KIND_LABEL[kind]}
          description="Informe del proyecto seleccionado. La exportación institucional agregada (Vicerrectoría / MinCiencias) aún no tiene contrato; solo kinds BUDGET_PDF y BUDGET_EXCEL del proyecto."
          footer={
            <S.FormActions>
              <Button
                intent="secondary"
                type="button"
                disabled={isSubmitting}
                onClick={handleClose}
              >
                Cancelar
              </Button>
              <Button
                intent="primary"
                type="button"
                isLoading={isSubmitting}
                disabled={busy}
                onClick={() => {
                  void handleSubmit();
                }}
              >
                Generar
              </Button>
            </S.FormActions>
          }
        >
          <S.Form
            onSubmit={(event) => {
              event.preventDefault();
              void handleSubmit();
            }}
          >
            <Select
              label="Proyecto"
              options={projectsState.options}
              value={projectId}
              onValueChange={setProjectId}
            />
            {error ? <S.FormError role="alert">{error}</S.FormError> : null}
          </S.Form>
        </Sheet>
      ) : null}

      <Toast
        open={toast.open}
        onOpenChange={(next) => setToast((prev) => ({ ...prev, open: next }))}
        title={toast.title}
        description={toast.description}
        tone={toast.tone ?? "neutral"}
        action={toast.action}
      />
    </>
  );
}

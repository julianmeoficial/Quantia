"use client";

import { ReportKind, type ReportKind as ReportKindType } from "@quantia/contracts";
import { useCallback, useState } from "react";

import { Button, Select } from "@/components/base";
import { Sheet, Toast } from "@/components/system";
import { useAccessibleProjects } from "@/features/projects/useAccessibleProjects";
import {
  fromReportResponse,
  upsertSessionReport,
  type SessionReportJob,
} from "@/features/reports/sessionReportsStore";
import { createProjectReport, getProjectReport } from "@/lib/api";
import { ApiError } from "@/lib/api/errors";
import { pollWithBackoff } from "@/lib/async/pollWithBackoff";
import { canGenerateReport } from "@/lib/auth";
import { useAuth } from "@/features/auth/AuthProvider";

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

export function ExportReportPanel({ open, onOpenChange, kind }: ExportReportPanelProps) {
  const { user } = useAuth();
  const projectsState = useAccessibleProjects();
  const [projectId, setProjectId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; title: string; description?: string }>({
    open: false,
    title: "",
  });

  const selected = projectsState.projects.find((item) => item.id === projectId) ?? null;

  const pollJob = useCallback(async (pid: string, reportId: string, projectTitle: string) => {
    const result = await pollWithBackoff({
      fetch: () => getProjectReport(pid, reportId),
      isDone: (report) => report.status === "READY" || report.status === "FAILED",
      onUpdate: (report) => {
        upsertSessionReport(fromReportResponse(report, projectTitle));
      },
    });
    if (result) {
      const job = upsertSessionReport(fromReportResponse(result, projectTitle)).find(
        (item) => item.reportId === result.id,
      );
      if (job?.status === "READY" && job.downloadUrl) {
        setToast({
          open: true,
          title: "Reporte listo",
          description: "Descarga disponible desde Reportes de esta sesión.",
        });
        window.open(job.downloadUrl, "_blank", "noopener,noreferrer");
      } else if (job?.status === "FAILED") {
        setToast({
          open: true,
          title: "No se pudo generar el reporte",
          description: "Revisa Reportes e inténtalo de nuevo.",
        });
      }
    }
  }, []);

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

    setIsSubmitting(true);
    try {
      const accepted = await createProjectReport(selected.id, { kind });
      const placeholder: SessionReportJob = {
        reportId: accepted.reportId,
        projectId: selected.id,
        projectTitle: selected.title,
        kind,
        status: accepted.status,
        errorMessage: null,
        downloadUrl: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      upsertSessionReport(placeholder);
      setToast({
        open: true,
        title: "Generando reporte",
        description: KIND_LABEL[kind],
      });
      void pollJob(selected.id, accepted.reportId, selected.title);
      handleClose();
    } catch (cause: unknown) {
      const apiError = cause instanceof ApiError ? cause : new ApiError("unknown", null);
      if (apiError.kind === "forbidden") {
        setError("No tienes permiso para generar reportes en este proyecto.");
      } else if (apiError.kind === "rate_limited") {
        setError("Estamos procesando demasiadas solicitudes. Inténtalo de nuevo en unos segundos.");
      } else {
        setError("No pudimos iniciar el reporte. Inténtalo de nuevo.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <Sheet
        open
        onOpenChange={(next) => {
          if (!next) handleClose();
        }}
        title={KIND_LABEL[kind]}
        description="Informe del proyecto seleccionado. La exportación institucional agregada (Vicerrectoría / MinCiencias) aún no tiene contrato; solo kinds BUDGET_PDF y BUDGET_EXCEL del proyecto."
        footer={
          <S.FormActions>
            <Button intent="secondary" type="button" disabled={isSubmitting} onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              intent="primary"
              type="button"
              isLoading={isSubmitting}
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

      <Toast
        open={toast.open}
        onOpenChange={(next) => setToast((prev) => ({ ...prev, open: next }))}
        title={toast.title}
        description={toast.description}
        tone="success"
      />
    </>
  );
}

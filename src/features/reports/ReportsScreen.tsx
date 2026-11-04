"use client";

import { ReportKind, type ReportKind as ReportKindType } from "@quantia/contracts";
import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button, Select } from "@/components/base";
import { FilterBar, type FilterChip } from "@/components/composite";
import { EmptyState, ErrorState, Skeleton, Toast, ToastProvider } from "@/components/system";
import { useAuth } from "@/features/auth/AuthProvider";
import {
  REPORTS_FILTER_DEFAULTS,
  REPORT_KIND_OPTIONS,
  reportKindChipLabel,
  reportsFiltersSchema,
  type ReportsFilters,
} from "@/features/filters";
import { useAccessibleProjects } from "@/features/projects/useAccessibleProjects";
import { createProjectReport, getProjectReport } from "@/lib/api";
import { ApiError } from "@/lib/api/errors";
import { pollWithBackoff } from "@/lib/async/pollWithBackoff";
import { canAccess, canGenerateReport } from "@/lib/auth";
import type { AppRole } from "@/lib/auth/navigation";
import { formatDate } from "@/lib/format";
import { useUrlFilters } from "@/lib/url";

import * as S from "../tasks/sectionPage.styles";
import {
  fromReportResponse,
  readSessionReports,
  upsertSessionReport,
  type SessionReportJob,
} from "./sessionReportsStore";

const STATUS_LABEL: Record<SessionReportJob["status"], string> = {
  QUEUED: "En cola",
  PROCESSING: "Generando reporte",
  READY: "Listo",
  FAILED: "Fallido",
};

export function ReportsScreen() {
  return (
    <ToastProvider>
      <ReportsBody />
    </ToastProvider>
  );
}

function ReportsBody() {
  const router = useRouter();
  const { identity, user } = useAuth();

  const { values, setFilters } = useUrlFilters({
    schema: reportsFiltersSchema,
    defaults: REPORTS_FILTER_DEFAULTS,
    pathname: "/reportes",
  });

  const projectsState = useAccessibleProjects();
  const selectedProject = useMemo(
    () => projectsState.projects.find((item) => item.id === values.projectId) ?? null,
    [projectsState.projects, values.projectId],
  );

  const [jobs, setJobs] = useState<SessionReportJob[]>(() => readSessionReports());
  const [jobQuery, setJobQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ open: boolean; title: string; description?: string }>({
    open: false,
    title: "",
  });

  const visibleJobs = useMemo(() => {
    const needle = jobQuery.trim().toLowerCase();
    if (!needle) return jobs;
    return jobs.filter(
      (job) =>
        job.projectTitle.toLowerCase().includes(needle) ||
        reportKindChipLabel(job.kind).toLowerCase().includes(needle),
    );
  }, [jobQuery, jobs]);

  const roles = (identity?.roles ?? []) as readonly AppRole[];
  const allowed = canAccess("/reportes", roles);

  const kindOptions = useMemo(() => {
    if (!user) return [];
    return REPORT_KIND_OPTIONS.filter((option) =>
      canGenerateReport(user, option.value as ReportKindType),
    );
  }, [user]);

  const chips = useMemo((): FilterChip[] => {
    const next: FilterChip[] = [];
    if (selectedProject) {
      next.push({ id: "project", label: `Proyecto: ${selectedProject.title}` });
    }
    if (values.kind) {
      next.push({ id: "kind", label: `Tipo: ${reportKindChipLabel(values.kind)}` });
    }
    return next;
  }, [selectedProject, values.kind]);

  const pollJob = useCallback(async (projectId: string, reportId: string, projectTitle: string) => {
    const result = await pollWithBackoff({
      fetch: () => getProjectReport(projectId, reportId),
      isDone: (report) => report.status === "READY" || report.status === "FAILED",
      onUpdate: (report) => {
        setJobs(upsertSessionReport(fromReportResponse(report, projectTitle)));
      },
    });
    if (result) {
      setJobs(upsertSessionReport(fromReportResponse(result, projectTitle)));
    }
  }, []);

  const handleGenerate = async () => {
    setFormError(null);
    if (!values.projectId || !selectedProject) {
      setFormError("Selecciona un proyecto.");
      return;
    }
    if (!values.kind) {
      setFormError("Selecciona el tipo de reporte.");
      return;
    }
    if (!user || !canGenerateReport(user, values.kind as ReportKindType)) {
      setFormError("No tienes permiso para generar este tipo de reporte.");
      return;
    }

    setIsSubmitting(true);
    try {
      const accepted = await createProjectReport(selectedProject.id, {
        kind: values.kind as ReportKindType,
      });
      const placeholder: SessionReportJob = {
        reportId: accepted.reportId,
        projectId: selectedProject.id,
        projectTitle: selectedProject.title,
        kind: values.kind as ReportKindType,
        status: accepted.status,
        errorMessage: null,
        downloadUrl: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setJobs(upsertSessionReport(placeholder));
      setToast({
        open: true,
        title: "Generando reporte",
        description: reportKindChipLabel(values.kind),
      });
      void pollJob(selectedProject.id, accepted.reportId, selectedProject.title);
    } catch (cause: unknown) {
      const apiError = cause instanceof ApiError ? cause : new ApiError("unknown", null);
      if (apiError.kind === "forbidden") {
        setFormError("No tienes permiso para generar reportes en este proyecto.");
      } else if (apiError.kind === "rate_limited") {
        setFormError(
          "Estamos procesando demasiadas solicitudes. Inténtalo de nuevo en unos segundos.",
        );
      } else {
        setFormError("No pudimos iniciar el reporte. Inténtalo de nuevo.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = async (job: SessionReportJob) => {
    setFormError(null);
    setIsSubmitting(true);
    try {
      const accepted = await createProjectReport(job.projectId, { kind: job.kind });
      const placeholder: SessionReportJob = {
        ...job,
        reportId: accepted.reportId,
        status: accepted.status,
        errorMessage: null,
        downloadUrl: null,
        updatedAt: new Date().toISOString(),
      };
      setJobs(upsertSessionReport(placeholder));
      void pollJob(job.projectId, accepted.reportId, job.projectTitle);
    } catch (cause: unknown) {
      const apiError = cause instanceof ApiError ? cause : new ApiError("unknown", null);
      setFormError(
        apiError.kind === "forbidden"
          ? "No tienes permiso para reintentar este reporte."
          : "No pudimos reintentar el reporte.",
      );
    } finally {
      setIsSubmitting(false);
    }
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

  const defaultKind = kindOptions[0]?.value ?? ReportKind.PROGRESS_PDF;

  return (
    <S.Page>
      <S.Header>
        <S.HeaderText>
          <S.Title>Reportes</S.Title>
          <S.Subtitle>
            Genera PDF o Excel del proyecto seleccionado. La lista es de esta sesión, no un archivo
            histórico del servidor.
          </S.Subtitle>
        </S.HeaderText>
        <S.HeaderActions>
          <Button
            intent="primary"
            type="button"
            isLoading={isSubmitting}
            disabled={!values.projectId || !values.kind}
            onClick={() => {
              void handleGenerate();
            }}
          >
            Generar reporte
          </Button>
        </S.HeaderActions>
      </S.Header>

      <Select
        label="Proyecto"
        options={projectsState.options}
        value={values.projectId}
        onValueChange={(projectId) =>
          setFilters({
            projectId,
            kind: (values.kind || defaultKind) as ReportsFilters["kind"],
          })
        }
      />

      {values.projectId ? (
        <>
          <Select
            label="Tipo de reporte"
            options={kindOptions}
            value={values.kind || defaultKind}
            onValueChange={(kind) => setFilters({ kind: kind as ReportsFilters["kind"] })}
          />
          <FilterBar
            searchLabel="Filtrar trabajos de esta sesión"
            searchValue={jobQuery}
            onSearchChange={setJobQuery}
            chips={chips}
            onRemoveChip={(id) => {
              if (id === "project") setFilters({ projectId: "", kind: "" });
              if (id === "kind") setFilters({ kind: "" });
            }}
            onClear={
              values.projectId || values.kind || jobQuery
                ? () => {
                    setJobQuery("");
                    setFilters({ projectId: "", kind: "" });
                  }
                : undefined
            }
            resultCount={visibleJobs.length}
          />
        </>
      ) : null}

      {formError ? (
        <S.StaleBanner role="alert">
          <S.StaleText>{formError}</S.StaleText>
        </S.StaleBanner>
      ) : null}

      {!values.projectId ? (
        <S.SelectProjectHint>
          <EmptyState
            kind="no-records"
            title="Selecciona un proyecto"
            description="Elige un proyecto y un tipo de reporte permitido. No se envían filtros inventados (convocatoria, grupo, financiación)."
          />
        </S.SelectProjectHint>
      ) : projectsState.status === "loading" && projectsState.projects.length === 0 ? (
        <Skeleton variant="list" rows={3} />
      ) : visibleJobs.length === 0 ? (
        <EmptyState
          kind={jobs.length > 0 ? "no-results" : "no-records"}
          title={
            jobs.length > 0 ? "Sin resultados con estos filtros" : "Sin reportes en esta sesión"
          }
          description={
            jobs.length > 0
              ? "Prueba con otra búsqueda o limpia los filtros."
              : "Al generar un reporte aparecerá aquí con su estado. Esta lista no es un archivo histórico."
          }
        />
      ) : (
        <S.JobList>
          {visibleJobs.map((job) => (
            <S.JobCard key={job.reportId}>
              <S.JobTitle>
                {reportKindChipLabel(job.kind)} · {job.projectTitle}
              </S.JobTitle>
              <S.JobMeta>
                {STATUS_LABEL[job.status]} · {formatDate(job.createdAt)}
                {job.errorMessage ? ` · ${job.errorMessage}` : ""}
              </S.JobMeta>
              <S.JobActions>
                {job.status === "READY" && job.downloadUrl ? (
                  <Button
                    intent="primary"
                    type="button"
                    onClick={() => {
                      window.open(job.downloadUrl ?? undefined, "_blank", "noopener,noreferrer");
                    }}
                  >
                    Descargar
                  </Button>
                ) : null}
                {job.status === "FAILED" ? (
                  <Button
                    intent="secondary"
                    type="button"
                    isLoading={isSubmitting}
                    onClick={() => {
                      void handleRetry(job);
                    }}
                  >
                    Reintentar
                  </Button>
                ) : null}
                {job.status === "QUEUED" || job.status === "PROCESSING" ? (
                  <S.JobMeta>Generando reporte…</S.JobMeta>
                ) : null}
              </S.JobActions>
            </S.JobCard>
          ))}
        </S.JobList>
      )}

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

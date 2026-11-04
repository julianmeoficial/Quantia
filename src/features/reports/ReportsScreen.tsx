"use client";

import { ReportKind, type ReportKind as ReportKindType } from "@quantia/contracts";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

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
import { canAccess, canGenerateReport } from "@/lib/auth";
import type { AppRole } from "@/lib/auth/navigation";
import { formatDate } from "@/lib/format";
import { useUrlFilters } from "@/lib/url";

import * as S from "../tasks/sectionPage.styles";
import type { SessionReportJob } from "./sessionReportsStore";
import { useSessionReports, type ReportToastState } from "./useSessionReports";

const STATUS_LABEL: Record<SessionReportJob["status"], string> = {
  QUEUED: "En cola",
  PROCESSING: "Generando reporte",
  READY: "Listo",
  FAILED: "Fallido",
};

const EMPTY_TOAST: ReportToastState = { open: false, title: "" };

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

  const [jobQuery, setJobQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [rateLimited, setRateLimited] = useState(false);
  const [toast, setToast] = useState<ReportToastState>(EMPTY_TOAST);

  const { jobs, enqueue, retryFailed, download, isBusy } = useSessionReports(setToast);

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

  const selectedKind = (values.kind || kindOptions[0]?.value || "") as ReportKindType | "";
  const busy =
    Boolean(values.projectId && selectedKind) &&
    isBusy(values.projectId, selectedKind as ReportKindType);

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
    if (busy) {
      setFormError("Ya hay un reporte de este tipo en curso para el proyecto.");
      return;
    }
    if (rateLimited) {
      setFormError("Estamos procesando demasiadas solicitudes. Espera un momento.");
      return;
    }

    setIsSubmitting(true);
    const result = await enqueue({
      projectId: selectedProject.id,
      projectTitle: selectedProject.title,
      kind: values.kind as ReportKindType,
    });
    setIsSubmitting(false);

    if (!result.ok) {
      if (result.error.kind === "forbidden") {
        setFormError("No tienes permiso para generar reportes en este proyecto.");
      } else if (result.error.kind === "rate_limited") {
        const waitSec = result.error.retryAfterSeconds ?? 5;
        setRateLimited(true);
        window.setTimeout(() => setRateLimited(false), waitSec * 1000);
        setFormError(
          `Estamos procesando demasiadas solicitudes. Vuelve a intentarlo en ${waitSec} s.`,
        );
      } else if (result.error.kind === "conflict") {
        setFormError("Ya hay un reporte de este tipo en curso para el proyecto.");
      } else {
        setFormError("No pudimos iniciar el reporte. Inténtalo de nuevo.");
      }
    }
  };

  const handleRetry = async (job: SessionReportJob) => {
    setFormError(null);
    setIsSubmitting(true);
    const result = await retryFailed(job);
    setIsSubmitting(false);
    if (!result.ok) {
      setFormError(
        result.error.kind === "forbidden"
          ? "No tienes permiso para reintentar este reporte."
          : result.error.kind === "rate_limited"
            ? "Estamos procesando demasiadas solicitudes. Inténtalo de nuevo en unos segundos."
            : "No pudimos reintentar el reporte.",
      );
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
            disabled={!values.projectId || !values.kind || busy || rateLimited}
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
              </S.JobMeta>
              <S.JobActions>
                {job.status === "READY" ? (
                  <Button
                    intent="primary"
                    type="button"
                    onClick={() => {
                      void download(job);
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
        tone={toast.tone ?? "neutral"}
        action={toast.action}
      />
    </S.Page>
  );
}

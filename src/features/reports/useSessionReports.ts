"use client";

import type { ReportKind } from "@quantia/contracts";
import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";

import { createProjectReport, getProjectReport } from "@/lib/api";
import { ApiError } from "@/lib/api/errors";
import { pollWithBackoff } from "@/lib/async/pollWithBackoff";
import { noticeFromReportReady, pushSessionNotice } from "@/lib/socket";

import {
  fromReportResponse,
  isDownloadExpired,
  isJobInFlight,
  readSessionReports,
  subscribeSessionReports,
  upsertSessionReport,
  type SessionReportJob,
} from "./sessionReportsStore";

export type ReportToastState = {
  open: boolean;
  title: string;
  description?: string;
  tone?: "success" | "danger" | "neutral";
  action?: {
    label: string;
    altText: string;
    onClick: () => void;
  };
};

type EnqueueInput = {
  projectId: string;
  projectTitle: string;
  kind: ReportKind;
};

type ToastSetter = (toast: ReportToastState) => void;

const activePolls = new Map<string, AbortController>();

function stopPoll(reportId: string) {
  const controller = activePolls.get(reportId);
  if (!controller) return;
  controller.abort();
  activePolls.delete(reportId);
}

async function runPoll(
  job: Pick<SessionReportJob, "projectId" | "reportId" | "projectTitle">,
  onReady: (job: SessionReportJob) => void,
  onFailed: (job: SessionReportJob) => void,
) {
  stopPoll(job.reportId);
  const controller = new AbortController();
  activePolls.set(job.reportId, controller);

  try {
    const result = await pollWithBackoff({
      fetch: () => getProjectReport(job.projectId, job.reportId),
      isDone: (report) => report.status === "READY" || report.status === "FAILED",
      signal: controller.signal,
      onUpdate: (report) => {
        upsertSessionReport(fromReportResponse(report, job.projectTitle));
      },
    });

    if (!result || controller.signal.aborted) return;

    const next = fromReportResponse(result, job.projectTitle);
    upsertSessionReport(next);

    if (next.status === "READY") onReady(next);
    else if (next.status === "FAILED") onFailed(next);
  } finally {
    if (activePolls.get(job.reportId) === controller) {
      activePolls.delete(job.reportId);
    }
  }
}

function announceReady(
  job: SessionReportJob,
  setToast: ToastSetter,
  download: (job: SessionReportJob) => Promise<void>,
) {
  pushSessionNotice(
    noticeFromReportReady({
      reportId: job.reportId,
      projectTitle: job.projectTitle,
      href: "/reportes",
      createdAt: job.updatedAt || job.createdAt,
    }),
  );
  setToast({
    open: true,
    title: "Reporte listo",
    description: job.projectTitle,
    tone: "success",
    action: {
      label: "Descargar",
      altText: "Descargar reporte listo",
      onClick: () => {
        void download(job);
      },
    },
  });
}

function announceFailed(setToast: ToastSetter) {
  setToast({
    open: true,
    title: "No se pudo generar el reporte",
    description: "Puedes reintentarlo desde la bandeja de reportes de esta sesión.",
    tone: "danger",
  });
}

export function useSessionReports(setToast: ToastSetter) {
  const jobs = useSyncExternalStore(
    subscribeSessionReports,
    readSessionReports,
    readSessionReports,
  );
  const setToastRef = useRef(setToast);
  useEffect(() => {
    setToastRef.current = setToast;
  }, [setToast]);

  const download = useCallback(async (job: SessionReportJob) => {
    let current = job;
    if (isDownloadExpired(current)) {
      const fresh = await getProjectReport(job.projectId, job.reportId);
      current = fromReportResponse(fresh, job.projectTitle);
      upsertSessionReport(current);
    }
    if (!current.downloadUrl) {
      setToastRef.current({
        open: true,
        title: "Descarga no disponible",
        description: "Genera el reporte de nuevo o espera a que esté listo.",
        tone: "danger",
      });
      return;
    }
    window.open(current.downloadUrl, "_blank", "noopener,noreferrer");
  }, []);

  const startPoll = useCallback(
    (job: SessionReportJob) => {
      void runPoll(
        job,
        (ready) => announceReady(ready, setToastRef.current, download),
        () => announceFailed(setToastRef.current),
      );
    },
    [download],
  );

  useEffect(() => {
    for (const job of readSessionReports()) {
      if (isJobInFlight(job) && !activePolls.has(job.reportId)) {
        startPoll(job);
      }
    }
    return () => {
      // Keep polls alive across unmount so SPA navigation does not abort them.
    };
  }, [startPoll]);

  const isBusy = useCallback(
    (projectId: string, kind: ReportKind) =>
      jobs.some((job) => job.projectId === projectId && job.kind === kind && isJobInFlight(job)),
    [jobs],
  );

  const enqueue = useCallback(
    async (input: EnqueueInput): Promise<{ ok: true } | { ok: false; error: ApiError }> => {
      if (isBusy(input.projectId, input.kind)) {
        return {
          ok: false,
          error: new ApiError("conflict", 409),
        };
      }

      try {
        const accepted = await createProjectReport(input.projectId, { kind: input.kind });
        const placeholder: SessionReportJob = {
          reportId: accepted.reportId,
          projectId: input.projectId,
          projectTitle: input.projectTitle,
          kind: input.kind,
          status: accepted.status,
          errorMessage: null,
          downloadUrl: null,
          expiresInSeconds: null,
          downloadFetchedAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        upsertSessionReport(placeholder);
        setToastRef.current({
          open: true,
          title: "Generando reporte",
          description: input.projectTitle,
          tone: "neutral",
        });
        startPoll(placeholder);
        return { ok: true };
      } catch (cause: unknown) {
        const error = cause instanceof ApiError ? cause : new ApiError("unknown", null);
        return { ok: false, error };
      }
    },
    [isBusy, startPoll],
  );

  const retryFailed = useCallback(
    async (job: SessionReportJob) => {
      stopPoll(job.reportId);
      return enqueue({
        projectId: job.projectId,
        projectTitle: job.projectTitle,
        kind: job.kind,
      });
    },
    [enqueue],
  );

  return {
    jobs,
    enqueue,
    retryFailed,
    download,
    isBusy,
  };
}

export function stopAllReportPollsForTests() {
  for (const id of [...activePolls.keys()]) stopPoll(id);
}

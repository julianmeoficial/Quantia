import type { ReportKind, ReportResponse, ReportStatus } from "@quantia/contracts";

export type SessionReportJob = {
  reportId: string;
  projectId: string;
  projectTitle: string;
  kind: ReportKind;
  status: ReportStatus;
  errorMessage: string | null;
  downloadUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

/** In-memory session jobs (REP-01). Survives SPA navigations; not a server archive. */
let memoryJobs: SessionReportJob[] = [];

export function readSessionReports(): SessionReportJob[] {
  return [...memoryJobs];
}

export function writeSessionReports(jobs: SessionReportJob[]): void {
  memoryJobs = [...jobs];
}

export function upsertSessionReport(job: SessionReportJob): SessionReportJob[] {
  const index = memoryJobs.findIndex((item) => item.reportId === job.reportId);
  memoryJobs =
    index >= 0 ? memoryJobs.map((item, i) => (i === index ? job : item)) : [job, ...memoryJobs];
  return readSessionReports();
}

export function fromReportResponse(report: ReportResponse, projectTitle: string): SessionReportJob {
  return {
    reportId: report.id,
    projectId: report.projectId,
    projectTitle,
    kind: report.kind,
    status: report.status,
    errorMessage: report.errorMessage,
    downloadUrl: report.downloadUrl,
    createdAt: report.createdAt,
    updatedAt: report.updatedAt,
  };
}

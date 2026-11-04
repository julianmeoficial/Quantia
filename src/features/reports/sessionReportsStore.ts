import type { ReportKind, ReportResponse, ReportStatus } from "@quantia/contracts";

export type SessionReportJob = {
  reportId: string;
  projectId: string;
  projectTitle: string;
  kind: ReportKind;
  status: ReportStatus;
  errorMessage: string | null;
  downloadUrl: string | null;
  /** Seconds until downloadUrl expires from the moment it was last fetched; null when unknown. */
  expiresInSeconds: number | null;
  /** Wall-clock ms when downloadUrl was last refreshed (client-side). */
  downloadFetchedAt: number | null;
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = "quantia.sessionReports.v1";

type Listener = () => void;

let memoryJobs: SessionReportJob[] = [];
/** Stable snapshot for useSyncExternalStore — must not allocate on every read. */
let snapshot: SessionReportJob[] = [];
const listeners = new Set<Listener>();
let hydrated = false;

function publish() {
  snapshot = [...memoryJobs];
  for (const listener of listeners) listener();
}

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

function persist() {
  if (!canUseStorage()) return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(memoryJobs));
  } catch {
    // Quota / private mode — keep memory only.
  }
}

function hydrateFromStorage() {
  if (hydrated || !canUseStorage()) {
    hydrated = true;
    return;
  }
  hydrated = true;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return;
    memoryJobs = parsed.filter(isSessionReportJob);
    snapshot = [...memoryJobs];
  } catch {
    memoryJobs = [];
    snapshot = [];
  }
}

function isSessionReportJob(value: unknown): value is SessionReportJob {
  if (!value || typeof value !== "object") return false;
  const job = value as Record<string, unknown>;
  return (
    typeof job.reportId === "string" &&
    typeof job.projectId === "string" &&
    typeof job.projectTitle === "string" &&
    typeof job.kind === "string" &&
    typeof job.status === "string" &&
    typeof job.createdAt === "string" &&
    typeof job.updatedAt === "string"
  );
}

export function subscribeSessionReports(listener: Listener): () => void {
  hydrateFromStorage();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function readSessionReports(): SessionReportJob[] {
  hydrateFromStorage();
  return snapshot;
}

export function writeSessionReports(jobs: SessionReportJob[]): void {
  hydrateFromStorage();
  memoryJobs = [...jobs];
  persist();
  publish();
}

export function upsertSessionReport(job: SessionReportJob): SessionReportJob[] {
  hydrateFromStorage();
  const index = memoryJobs.findIndex((item) => item.reportId === job.reportId);
  memoryJobs =
    index >= 0 ? memoryJobs.map((item, i) => (i === index ? job : item)) : [job, ...memoryJobs];
  persist();
  publish();
  return readSessionReports();
}

export function clearSessionReports(): void {
  memoryJobs = [];
  if (canUseStorage()) {
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }
  publish();
}

export function fromReportResponse(report: ReportResponse, projectTitle: string): SessionReportJob {
  const hasUrl = Boolean(report.downloadUrl);
  return {
    reportId: report.id,
    projectId: report.projectId,
    projectTitle,
    kind: report.kind,
    status: report.status,
    errorMessage: report.errorMessage,
    downloadUrl: report.downloadUrl,
    expiresInSeconds: report.expiresInSeconds,
    downloadFetchedAt: hasUrl ? Date.now() : null,
    createdAt: report.createdAt,
    updatedAt: report.updatedAt,
  };
}

export function isDownloadExpired(job: SessionReportJob, now = Date.now()): boolean {
  if (!job.downloadUrl || job.expiresInSeconds == null || job.downloadFetchedAt == null) {
    return !job.downloadUrl;
  }
  const expiresAt = job.downloadFetchedAt + job.expiresInSeconds * 1000;
  // Refresh a few seconds early to avoid racing expiry.
  return now >= expiresAt - 5_000;
}

export function isJobInFlight(job: SessionReportJob): boolean {
  return job.status === "QUEUED" || job.status === "PROCESSING";
}

/** @internal test helper */
export function resetSessionReportsStoreForTests() {
  memoryJobs = [];
  snapshot = [];
  hydrated = false;
  listeners.clear();
  if (canUseStorage()) {
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }
}

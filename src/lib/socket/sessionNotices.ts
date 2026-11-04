import type { PresupuestoEjecucionBajaPayload } from "@quantia/contracts";

export type SessionNoticeKind = "budget-low" | "report-ready";

export type SessionNotice = {
  id: string;
  kind: SessionNoticeKind;
  title: string;
  description: string;
  href?: string;
  hrefLabel?: string;
  createdAt: string;
  /** Dedupe key for budget-low events (`projectId + updatedAt`). */
  dedupeKey?: string;
  read: boolean;
};

type Listener = () => void;

let notices: SessionNotice[] = [];
const listeners = new Set<Listener>();
const seenDedupe = new Set<string>();

function emit() {
  for (const listener of listeners) listener();
}

export function subscribeSessionNotices(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSessionNotices(): SessionNotice[] {
  return notices;
}

export function getUnreadNoticeCount(): number {
  return notices.filter((item) => !item.read).length;
}

export function markAllNoticesRead() {
  if (!notices.some((item) => !item.read)) return;
  notices = notices.map((item) => (item.read ? item : { ...item, read: true }));
  emit();
}

export function clearSessionNotices() {
  notices = [];
  seenDedupe.clear();
  emit();
}

export function pushSessionNotice(notice: Omit<SessionNotice, "read">): boolean {
  if (notice.dedupeKey) {
    if (seenDedupe.has(notice.dedupeKey)) return false;
    seenDedupe.add(notice.dedupeKey);
  }
  notices = [{ ...notice, read: false }, ...notices].slice(0, 50);
  emit();
  return true;
}

export function budgetLowDedupeKey(payload: PresupuestoEjecucionBajaPayload): string {
  return `${payload.projectId}:${payload.updatedAt}`;
}

export function noticeFromBudgetLow(
  payload: PresupuestoEjecucionBajaPayload,
  href: string,
): Omit<SessionNotice, "read"> {
  const executed = payload.executedPercent.toLocaleString("es-CO", {
    maximumFractionDigits: 1,
  });
  const threshold = payload.thresholdPercent.toLocaleString("es-CO", {
    maximumFractionDigits: 1,
  });
  return {
    id: `budget-low-${payload.projectId}-${payload.updatedAt}`,
    kind: "budget-low",
    title: "Ejecución de presupuesto baja",
    description: `Ejecución al ${executed} % (umbral ${threshold} %).`,
    href,
    hrefLabel: "Ver presupuesto",
    createdAt: payload.updatedAt,
    dedupeKey: budgetLowDedupeKey(payload),
  };
}

export function noticeFromReportReady(input: {
  reportId: string;
  projectTitle: string;
  href: string;
  createdAt: string;
}): Omit<SessionNotice, "read"> {
  return {
    id: `report-ready-${input.reportId}`,
    kind: "report-ready",
    title: "Reporte listo",
    description: input.projectTitle,
    href: input.href,
    hrefLabel: "Ir a reportes",
    createdAt: input.createdAt,
    dedupeKey: `report:${input.reportId}`,
  };
}

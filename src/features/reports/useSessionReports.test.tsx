import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { ApiError } from "@/lib/api/errors";

import {
  readSessionReports,
  resetSessionReportsStoreForTests,
  type SessionReportJob,
} from "./sessionReportsStore";
import {
  stopAllReportPollsForTests,
  useSessionReports,
  type ReportToastState,
} from "./useSessionReports";

const { createProjectReport, getProjectReport, pushSessionNotice, noticeFromReportReady } =
  vi.hoisted(() => ({
    createProjectReport: vi.fn(),
    getProjectReport: vi.fn(),
    pushSessionNotice: vi.fn(() => true),
    noticeFromReportReady: vi.fn((input: { reportId: string }) => ({
      id: `report-ready:${input.reportId}`,
      kind: "report_ready" as const,
      title: "Reporte listo",
      body: "listo",
      href: "/reportes",
      createdAt: "2026-11-04T12:00:00.000Z",
    })),
  }));

vi.mock("@/lib/api", () => ({
  createProjectReport,
  getProjectReport,
}));

vi.mock("@/lib/socket", () => ({
  pushSessionNotice,
  noticeFromReportReady,
}));

vi.mock("@/lib/async/pollWithBackoff", () => ({
  pollWithBackoff: async (options: {
    fetch: () => Promise<unknown>;
    isDone: (value: unknown) => boolean;
    onUpdate?: (value: unknown) => void;
    signal?: AbortSignal;
  }) => {
    while (!options.signal?.aborted) {
      const value = await options.fetch();
      options.onUpdate?.(value);
      if (options.isDone(value)) return value;
      await new Promise((resolve) => {
        window.setTimeout(resolve, 5);
      });
    }
    return null;
  },
}));

const PROJECT_ID = "22222222-2222-4222-8222-222222222222";
const REPORT_ID = "11111111-1111-4111-8111-111111111111";

function readyReport(overrides: Record<string, unknown> = {}) {
  return {
    id: REPORT_ID,
    projectId: PROJECT_ID,
    requestedById: "33333333-3333-4333-8333-333333333333",
    kind: "PROGRESS_PDF",
    status: "READY",
    errorMessage: null,
    downloadUrl: "https://example.com/report.pdf",
    expiresInSeconds: 300,
    createdAt: "2026-11-04T12:00:00.000Z",
    updatedAt: "2026-11-04T12:01:00.000Z",
    ...overrides,
  };
}

afterEach(() => {
  stopAllReportPollsForTests();
  resetSessionReportsStoreForTests();
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

beforeEach(() => {
  vi.stubGlobal("open", vi.fn());
});

describe("useSessionReports", () => {
  it("enqueues, polls to READY, toasts with Descargar and pushes session notice", async () => {
    createProjectReport.mockResolvedValueOnce({
      reportId: REPORT_ID,
      status: "QUEUED",
    });
    getProjectReport.mockResolvedValueOnce(readyReport());

    let toast: ReportToastState = { open: false, title: "" };
    const setToast = vi.fn((next: ReportToastState) => {
      toast = next;
    });

    const { result } = renderHook(() => useSessionReports(setToast));

    await act(async () => {
      const outcome = await result.current.enqueue({
        projectId: PROJECT_ID,
        projectTitle: "Proyecto demo",
        kind: "PROGRESS_PDF",
      });
      expect(outcome.ok).toBe(true);
    });

    await waitFor(() => {
      expect(toast.open).toBe(true);
      expect(toast.title).toBe("Reporte listo");
      expect(toast.action?.label).toBe("Descargar");
    });

    expect(pushSessionNotice).toHaveBeenCalled();
    expect(noticeFromReportReady).toHaveBeenCalledWith(
      expect.objectContaining({
        reportId: REPORT_ID,
        projectTitle: "Proyecto demo",
        href: "/reportes",
      }),
    );
    expect(readSessionReports()[0]?.status).toBe("READY");
  });

  it("marks FAILED without exposing raw errorMessage and allows retry", async () => {
    createProjectReport
      .mockResolvedValueOnce({ reportId: REPORT_ID, status: "QUEUED" })
      .mockResolvedValueOnce({
        reportId: "44444444-4444-4444-8444-444444444444",
        status: "QUEUED",
      });
    getProjectReport
      .mockResolvedValueOnce(
        readyReport({
          status: "FAILED",
          downloadUrl: null,
          expiresInSeconds: null,
          errorMessage: "stacktrace secreto",
        }),
      )
      .mockResolvedValueOnce(
        readyReport({
          id: "44444444-4444-4444-8444-444444444444",
          status: "READY",
        }),
      );

    let toast: ReportToastState = { open: false, title: "" };
    const setToast = vi.fn((next: ReportToastState) => {
      toast = next;
    });

    const { result } = renderHook(() => useSessionReports(setToast));

    await act(async () => {
      await result.current.enqueue({
        projectId: PROJECT_ID,
        projectTitle: "Proyecto demo",
        kind: "PROGRESS_PDF",
      });
    });

    await waitFor(() => {
      expect(toast.title).toBe("No se pudo generar el reporte");
      expect(toast.description).not.toContain("stacktrace");
    });

    const failed = readSessionReports()[0] as SessionReportJob;
    expect(failed.status).toBe("FAILED");

    await act(async () => {
      await result.current.retryFailed(failed);
    });

    await waitFor(() => {
      expect(createProjectReport).toHaveBeenCalledTimes(2);
    });
  });

  it("download re-GETs when the signed URL is expired", async () => {
    getProjectReport.mockResolvedValueOnce(
      readyReport({ downloadUrl: "https://example.com/fresh.pdf", expiresInSeconds: 60 }),
    );

    const setToast = vi.fn();
    const { result } = renderHook(() => useSessionReports(setToast));

    const expiredJob: SessionReportJob = {
      reportId: REPORT_ID,
      projectId: PROJECT_ID,
      projectTitle: "Proyecto demo",
      kind: "PROGRESS_PDF",
      status: "READY",
      errorMessage: null,
      downloadUrl: "https://example.com/stale.pdf",
      expiresInSeconds: 30,
      downloadFetchedAt: Date.now() - 60_000,
      createdAt: "2026-11-04T12:00:00.000Z",
      updatedAt: "2026-11-04T12:00:00.000Z",
    };

    await act(async () => {
      await result.current.download(expiredJob);
    });

    expect(getProjectReport).toHaveBeenCalledWith(PROJECT_ID, REPORT_ID);
    expect(window.open).toHaveBeenCalledWith(
      "https://example.com/fresh.pdf",
      "_blank",
      "noopener,noreferrer",
    );
  });

  it("isBusy blocks a second enqueue for the same project and kind", async () => {
    createProjectReport.mockResolvedValueOnce({ reportId: REPORT_ID, status: "QUEUED" });
    getProjectReport.mockResolvedValue(
      readyReport({
        status: "PROCESSING",
        downloadUrl: null,
        expiresInSeconds: null,
      }),
    );

    const setToast = vi.fn();
    const { result } = renderHook(() => useSessionReports(setToast));

    await act(async () => {
      await result.current.enqueue({
        projectId: PROJECT_ID,
        projectTitle: "Proyecto demo",
        kind: "PROGRESS_PDF",
      });
    });

    await waitFor(() => {
      expect(result.current.isBusy(PROJECT_ID, "PROGRESS_PDF")).toBe(true);
    });

    let second: { ok: boolean; error?: ApiError } = { ok: true };
    await act(async () => {
      second = await result.current.enqueue({
        projectId: PROJECT_ID,
        projectTitle: "Proyecto demo",
        kind: "PROGRESS_PDF",
      });
    });

    expect(second.ok).toBe(false);
    expect(second.error?.kind).toBe("conflict");
    expect(createProjectReport).toHaveBeenCalledTimes(1);
  });
});

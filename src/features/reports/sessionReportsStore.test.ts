import { afterEach, describe, expect, it } from "vitest";

import {
  clearSessionReports,
  fromReportResponse,
  isDownloadExpired,
  readSessionReports,
  resetSessionReportsStoreForTests,
  upsertSessionReport,
  type SessionReportJob,
} from "./sessionReportsStore";

function sampleJob(overrides: Partial<SessionReportJob> = {}): SessionReportJob {
  return {
    reportId: "11111111-1111-4111-8111-111111111111",
    projectId: "22222222-2222-4222-8222-222222222222",
    projectTitle: "Proyecto demo",
    kind: "PROGRESS_PDF",
    status: "QUEUED",
    errorMessage: null,
    downloadUrl: null,
    expiresInSeconds: null,
    downloadFetchedAt: null,
    createdAt: "2026-11-04T12:00:00.000Z",
    updatedAt: "2026-11-04T12:00:00.000Z",
    ...overrides,
  };
}

afterEach(() => {
  resetSessionReportsStoreForTests();
});

describe("sessionReportsStore", () => {
  it("upserts and persists across read after clear of memory via storage hydrate", () => {
    upsertSessionReport(sampleJob());
    expect(readSessionReports()).toHaveLength(1);

    resetSessionReportsStoreForTests();
    // Simulate new module consumers by writing storage then reading
    window.sessionStorage.setItem(
      "quantia.sessionReports.v1",
      JSON.stringify([sampleJob({ status: "READY", downloadUrl: "https://example.com/r.pdf" })]),
    );
    expect(readSessionReports()[0]?.status).toBe("READY");
  });

  it("clearSessionReports empties memory and storage", () => {
    upsertSessionReport(sampleJob());
    clearSessionReports();
    expect(readSessionReports()).toHaveLength(0);
    expect(window.sessionStorage.getItem("quantia.sessionReports.v1")).toBeNull();
  });

  it("fromReportResponse stamps downloadFetchedAt when url is present", () => {
    const job = fromReportResponse(
      {
        id: "11111111-1111-4111-8111-111111111111",
        projectId: "22222222-2222-4222-8222-222222222222",
        requestedById: "33333333-3333-4333-8333-333333333333",
        kind: "BUDGET_PDF",
        status: "READY",
        errorMessage: null,
        downloadUrl: "https://example.com/file.pdf",
        expiresInSeconds: 300,
        createdAt: "2026-11-04T12:00:00.000Z",
        updatedAt: "2026-11-04T12:00:00.000Z",
      },
      "Proyecto",
    );
    expect(job.downloadFetchedAt).not.toBeNull();
    expect(isDownloadExpired({ ...job, downloadFetchedAt: Date.now() })).toBe(false);
    expect(
      isDownloadExpired({
        ...job,
        downloadFetchedAt: Date.now() - 400_000,
        expiresInSeconds: 300,
      }),
    ).toBe(true);
  });
});

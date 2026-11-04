import {
  createReportRequestSchema,
  reportAcceptedResponseSchema,
  reportResponseSchema,
  type CreateReportRequest,
  type ReportAcceptedResponse,
  type ReportResponse,
} from "@quantia/contracts";

import { api } from "./client";

export function createProjectReport(
  projectId: string,
  body: CreateReportRequest,
): Promise<ReportAcceptedResponse> {
  const parsed = createReportRequestSchema.parse(body);
  return api.post(`/projects/${projectId}/reports`, parsed, {
    schema: reportAcceptedResponseSchema,
  });
}

export function getProjectReport(projectId: string, reportId: string): Promise<ReportResponse> {
  return api.get(`/projects/${projectId}/reports/${reportId}`, {
    schema: reportResponseSchema,
  });
}

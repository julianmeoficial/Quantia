import {
  documentDownloadResponseSchema,
  documentResponseSchema,
  listDocumentsQuerySchema,
  paginatedDocumentsSchema,
  type DocumentDownloadResponse,
  type DocumentResponse,
  type ListDocumentsQuery,
} from "@quantia/contracts";
import { z } from "zod";

type PaginatedDocumentsResponse = z.infer<typeof paginatedDocumentsSchema>;

import { api, buildApiUrl } from "./client";
import { ApiError, toApiError } from "./errors";
import { expireSession, getAccessToken, refreshAccessToken } from "./session";

const MAX_PAGE_SIZE = 50;
/** Contract / API hard limit (25 MB). */
export const DOCUMENT_MAX_BYTES = 26_214_400;
export const DOCUMENT_ACCEPT =
  "application/pdf,image/png,image/jpeg,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.pdf,.png,.jpg,.jpeg,.xlsx";

const emptyResponseSchema = z.undefined();

function clampPageSize(pageSize: number | undefined): number {
  return Math.min(pageSize ?? 20, MAX_PAGE_SIZE);
}

export function listProjectDocuments(
  projectId: string,
  query: Partial<ListDocumentsQuery> = {},
): Promise<PaginatedDocumentsResponse> {
  const parsed = listDocumentsQuerySchema.parse({
    ...query,
    pageSize: clampPageSize(query.pageSize),
  });
  return api.get(`/projects/${projectId}/documents`, {
    schema: paginatedDocumentsSchema,
    query: parsed,
  });
}

export function getDocumentDownload(
  projectId: string,
  documentId: string,
): Promise<DocumentDownloadResponse> {
  return api.get(`/projects/${projectId}/documents/${documentId}/download`, {
    schema: documentDownloadResponseSchema,
  });
}

export function deleteProjectDocument(projectId: string, documentId: string): Promise<void> {
  return api.delete(`/projects/${projectId}/documents/${documentId}`, {
    schema: emptyResponseSchema,
  });
}

export type UploadDocumentOptions = {
  onProgress?: (ratio: number) => void;
  signal?: AbortSignal;
};

/**
 * Multipart upload with progress. XHR is the only non-fetch transport allowed
 * (api-integration §3.6) so `upload.onprogress` can drive FileUploader.
 */
export function uploadProjectDocument(
  projectId: string,
  file: File,
  options: UploadDocumentOptions = {},
): Promise<DocumentResponse> {
  const form = new FormData();
  form.append("file", file);

  const send = (token: string | null) =>
    new Promise<DocumentResponse>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const url = buildApiUrl(`/projects/${projectId}/documents`);
      xhr.open("POST", url.toString());
      xhr.setRequestHeader("Accept", "application/json");
      if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      xhr.withCredentials = true;

      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable || !options.onProgress) return;
        options.onProgress(event.loaded / event.total);
      };

      const onAbort = () => {
        xhr.abort();
        reject(new DOMException("Aborted", "AbortError"));
      };
      options.signal?.addEventListener("abort", onAbort, { once: true });

      xhr.onerror = () => {
        options.signal?.removeEventListener("abort", onAbort);
        reject(new ApiError("network", null));
      };

      xhr.onload = () => {
        options.signal?.removeEventListener("abort", onAbort);
        const status = xhr.status;
        let body: unknown;
        try {
          body = xhr.responseText ? JSON.parse(xhr.responseText) : undefined;
        } catch {
          body = undefined;
        }

        if (status === 401) {
          reject(toApiError(401, body, readRetryAfterSecondsFromXhr(xhr)));
          return;
        }
        if (status < 200 || status >= 300) {
          reject(toApiError(status, body, readRetryAfterSecondsFromXhr(xhr)));
          return;
        }

        const parsed = documentResponseSchema.safeParse(body);
        if (!parsed.success) {
          reject(new ApiError("invalid_response", status, undefined, parsed.error.issues));
          return;
        }
        resolve(parsed.data);
      };

      xhr.send(form);
    });

  return send(getAccessToken()).catch(async (error) => {
    if (!(error instanceof ApiError) || error.kind !== "unauthorized") throw error;
    const token = await refreshAccessToken();
    if (!token) {
      expireSession();
      throw error;
    }
    return send(token);
  });
}

function readRetryAfterSecondsFromXhr(xhr: XMLHttpRequest): number | undefined {
  const header = xhr.getResponseHeader("Retry-After");
  if (!header) return undefined;
  const seconds = Number(header);
  if (!Number.isFinite(seconds) || seconds < 0) return undefined;
  return Math.trunc(seconds);
}

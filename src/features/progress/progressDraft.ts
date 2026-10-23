export type ProgressDraftPayload = {
  projectId: string;
  title: string;
  description: string;
  taskId: string;
  evidenceLink: string;
};

export function draftKey(projectId: string): string {
  return `progress:${projectId}`;
}

export function serializeDraft(payload: ProgressDraftPayload): string {
  return JSON.stringify(payload);
}

export function parseDraft(raw: string | null): ProgressDraftPayload | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as unknown;
    if (!value || typeof value !== "object") return null;
    const record = value as Record<string, unknown>;
    if (typeof record.projectId !== "string" || typeof record.title !== "string") return null;
    if (typeof record.description !== "string") return null;
    return {
      projectId: record.projectId,
      title: record.title,
      description: record.description,
      taskId: typeof record.taskId === "string" ? record.taskId : "",
      evidenceLink: typeof record.evidenceLink === "string" ? record.evidenceLink : "",
    };
  } catch {
    return null;
  }
}

export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

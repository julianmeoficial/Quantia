export type AuditOrigin = "app" | "notion";

export type AuditEntry = {
  id: string;
  actorName: string;
  action: string;
  entity: string;
  occurredAt: string;
  origin: AuditOrigin;
};

export const ORIGIN_LABEL: Record<AuditOrigin, string> = {
  app: "App",
  notion: "Notion",
};

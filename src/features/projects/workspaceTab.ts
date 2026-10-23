export const WORKSPACE_TABS = ["tareas", "bitacora", "documentos"] as const;

export type WorkspaceTab = (typeof WORKSPACE_TABS)[number];

export function parseWorkspaceTab(raw: string | null | undefined): WorkspaceTab {
  if (raw === "bitacora" || raw === "documentos") return raw;
  return "tareas";
}

export const WORKSPACE_TAB_LABEL: Record<WorkspaceTab, string> = {
  tareas: "Tareas",
  bitacora: "Bitácora",
  documentos: "Documentos",
};

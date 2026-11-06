import type { AvatarKey } from "@quantia/contracts";

/** UI role names from SCREENS.md. Not a stand-in for the API contract. */
export type AppRole = "INVESTIGADOR" | "COORDINADOR" | "ADMINISTRADOR";

export interface NavEntry {
  href: string;
  label: string;
  roles: readonly AppRole[];
  /** Section without an API contract yet: listed with a «Pronto» tag and a placeholder page. */
  soon?: boolean;
}

/**
 * Sections a person may see. An item is omitted unless one of their roles allows it.
 * Convocatorias and Auditoría are listed as «soon» (no API contract yet). Bitácoras, Documentos
 * and a notifications section stay out.
 * Chat stays out until the product turns `chatEnabled` on.
 */
export const NAV_CATALOG: readonly NavEntry[] = [
  { href: "/mis-tareas", label: "Mis tareas", roles: ["INVESTIGADOR"] },
  { href: "/dashboard", label: "Dashboard", roles: ["COORDINADOR"] },
  { href: "/institucional", label: "Institucional", roles: ["ADMINISTRADOR"] },
  { href: "/proyectos", label: "Proyectos", roles: ["COORDINADOR", "ADMINISTRADOR"] },
  { href: "/tareas", label: "Tareas", roles: ["COORDINADOR", "ADMINISTRADOR"] },
  { href: "/avances", label: "Avances", roles: ["COORDINADOR", "ADMINISTRADOR"] },
  { href: "/presupuesto", label: "Presupuesto", roles: ["COORDINADOR", "ADMINISTRADOR"] },
  { href: "/usuarios", label: "Usuarios", roles: ["ADMINISTRADOR"] },
  { href: "/reportes", label: "Reportes", roles: ["COORDINADOR", "ADMINISTRADOR"] },
  { href: "/convocatorias", label: "Convocatorias", roles: ["ADMINISTRADOR"], soon: true },
  { href: "/auditoria", label: "Auditoría", roles: ["ADMINISTRADOR"], soon: true },
];

const ROLE_PRIORITY: readonly AppRole[] = ["ADMINISTRADOR", "COORDINADOR", "INVESTIGADOR"];

const LANDING: Record<AppRole, string> = {
  ADMINISTRADOR: "/institucional",
  COORDINADOR: "/dashboard",
  INVESTIGADOR: "/mis-tareas",
};

export const ROLE_LABEL: Record<AppRole, string> = {
  INVESTIGADOR: "Investigador",
  COORDINADOR: "Coordinador",
  ADMINISTRADOR: "Administrador",
};

export interface SessionIdentity {
  displayName: string;
  roles: readonly AppRole[];
  /** Account profile avatar (`AVATAR_01`…`05`); null until the user picks one. */
  avatar: AvatarKey | null;
}

export function navigationFor(
  roles: readonly AppRole[],
  options?: { chatEnabled?: boolean },
): NavEntry[] {
  const granted = new Set(roles);
  const items = NAV_CATALOG.filter((entry) => entry.roles.some((role) => granted.has(role)));
  if (options?.chatEnabled) {
    return [...items, { href: "/chat", label: "Chat", roles }];
  }
  return items;
}

export function primaryRole(roles: readonly AppRole[]): AppRole | null {
  return ROLE_PRIORITY.find((role) => roles.includes(role)) ?? null;
}

/** Highest role wins. Empty identity has no landing. */
export function landing(roles: readonly AppRole[]): string | null {
  const role = primaryRole(roles);
  return role ? LANDING[role] : null;
}

export function sectionLabel(pathname: string): string | null {
  const path = normalizePath(pathname);
  if (isChatPath(path)) return "Chat";
  return NAV_CATALOG.find((entry) => entry.href === path)?.label ?? null;
}

/** Shared chat route — shown in nav only when `chatEnabled` is on. */
export function isChatPath(pathname: string): boolean {
  return normalizePath(pathname) === "/chat";
}

export type RouteAccess = "allowed" | "denied" | "unknown";

/** Sections that filter by `?projectId=` and keep the project the person was working on. */
const PROJECT_SCOPED_HREFS: readonly string[] = [
  "/tareas",
  "/avances",
  "/presupuesto",
  "/reportes",
];

const PROJECT_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Segment after `/proyectos/`, or null when the path is not a project workspace URL. */
export function projectRouteId(pathname: string): string | null {
  const match = /^\/proyectos\/([^/]+)$/.exec(normalizePath(pathname));
  const id = match?.[1] ?? null;
  return id && PROJECT_ID.test(id) ? id : null;
}

/** True for pages that stay inside a project's context (its workspace and filtered sections). */
export function isProjectContextPath(pathname: string): boolean {
  const path = normalizePath(pathname);
  return projectRouteId(path) !== null || PROJECT_SCOPED_HREFS.includes(path);
}

/** `/presupuesto` becomes `/presupuesto?projectId=…` while a project is in context. */
export function scopedHref(href: string, projectId: string | null | undefined): string {
  if (!projectId || !PROJECT_SCOPED_HREFS.includes(href)) return href;
  return `${href}?projectId=${encodeURIComponent(projectId)}`;
}

export function accessFor(pathname: string, roles: readonly AppRole[]): RouteAccess {
  const path = normalizePath(pathname);
  const entry = NAV_CATALOG.find((item) => item.href === path);
  if (entry) {
    return entry.roles.some((role) => roles.includes(role)) ? "allowed" : "denied";
  }
  if (isChatPath(path)) {
    return roles.length > 0 ? "allowed" : "denied";
  }
  return "unknown";
}

function normalizePath(pathname: string): string {
  const bare = pathname.split("?")[0]?.split("#")[0] ?? "/";
  if (bare.length > 1 && bare.endsWith("/")) return bare.slice(0, -1);
  return bare;
}

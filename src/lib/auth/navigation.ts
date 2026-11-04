/** UI role names from SCREENS.md. Not a stand-in for the API contract. */
export type AppRole = "INVESTIGADOR" | "COORDINADOR" | "ADMINISTRADOR";

export interface NavEntry {
  href: string;
  label: string;
  roles: readonly AppRole[];
}

/**
 * Sections a person may see. An item is omitted unless one of their roles allows it.
 * Convocatorias, Auditoría, Bitácoras, Documentos and a notifications section stay out.
 * Chat stays out until the product turns `chatEnabled` on.
 */
export const NAV_CATALOG: readonly NavEntry[] = [
  { href: "/mis-tareas", label: "Mis tareas", roles: ["INVESTIGADOR"] },
  { href: "/dashboard", label: "Dashboard", roles: ["COORDINADOR"] },
  { href: "/institucional", label: "Institucional", roles: ["ADMINISTRADOR"] },
  { href: "/proyectos", label: "Proyectos", roles: ["COORDINADOR", "ADMINISTRADOR"] },
  { href: "/tareas", label: "Tareas", roles: ["COORDINADOR"] },
  { href: "/avances", label: "Avances", roles: ["COORDINADOR"] },
  { href: "/presupuesto", label: "Presupuesto", roles: ["COORDINADOR", "ADMINISTRADOR"] },
  { href: "/usuarios", label: "Usuarios", roles: ["ADMINISTRADOR"] },
  { href: "/reportes", label: "Reportes", roles: ["COORDINADOR", "ADMINISTRADOR"] },
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

/** Deep-link route for ADM-02; not listed in NAV_CATALOG until the call contract exists. */
export function isConvocatoriasPath(pathname: string): boolean {
  const path = normalizePath(pathname);
  return path === "/convocatorias" || path.startsWith("/convocatorias/");
}

/** Deep-link route for ADM-03; hidden from nav until the audit contract exists. */
export function isAuditoriaPath(pathname: string): boolean {
  const path = normalizePath(pathname);
  return path === "/auditoria" || path.startsWith("/auditoria/");
}

/** Segment after `/convocatorias/`, or null when the path is not a call detail URL. */
export function callRouteId(pathname: string): string | null {
  const path = normalizePath(pathname);
  const match = /^\/convocatorias\/([^/]+)$/.exec(path);
  return match?.[1] ?? null;
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
  if (isConvocatoriasPath(path) || isAuditoriaPath(path)) {
    return roles.includes("ADMINISTRADOR") ? "allowed" : "denied";
  }
  return "unknown";
}

function normalizePath(pathname: string): string {
  const bare = pathname.split("?")[0]?.split("#")[0] ?? "/";
  if (bare.length > 1 && bare.endsWith("/")) return bare.slice(0, -1);
  return bare;
}

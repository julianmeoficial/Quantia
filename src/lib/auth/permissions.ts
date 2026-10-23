import type {
  ProgressResponse,
  ProjectResponse,
  ReportKind,
  TaskResponse,
  UserResponse,
} from "@quantia/contracts";

import type { AppRole } from "./navigation";
import { accessFor, landing, primaryRole } from "./navigation";

export { landing, primaryRole };

/** True only when the catalog lists the path and the roles include it. */
export function canAccess(pathname: string, roles: readonly AppRole[]): boolean {
  return accessFor(pathname, roles) === "allowed";
}

export function isAdmin(me: UserResponse): boolean {
  return me.roles.includes("ADMINISTRADOR");
}

export function isCoordinator(me: UserResponse): boolean {
  return me.roles.includes("COORDINADOR");
}

export function canSearchUsers(me: UserResponse): boolean {
  return isAdmin(me) || isCoordinator(me);
}

export function canManageUsers(me: UserResponse): boolean {
  return isAdmin(me);
}

export function hasProjectAccess(me: UserResponse, project: ProjectResponse): boolean {
  return isAdmin(me) || project.coordinatorId === me.id || project.memberIds.includes(me.id);
}

export function canManageProject(me: UserResponse, project: ProjectResponse): boolean {
  return isAdmin(me) || project.coordinatorId === me.id;
}

export function canManageMembers(me: UserResponse, project: ProjectResponse): boolean {
  return canManageProject(me, project);
}

export function canCreateTask(me: UserResponse, project: ProjectResponse): boolean {
  return canManageProject(me, project);
}

export function canEditTask(
  me: UserResponse,
  project: ProjectResponse,
  task: Pick<TaskResponse, "assigneeId">,
): boolean {
  return canManageProject(me, project) || task.assigneeId === me.id;
}

export function canCreateProgress(me: UserResponse, project: ProjectResponse): boolean {
  return hasProjectAccess(me, project);
}

export function canEditProgress(
  me: UserResponse,
  project: ProjectResponse,
  progress: Pick<ProgressResponse, "authorId">,
): boolean {
  return canManageProject(me, project) || progress.authorId === me.id;
}

export function canDeleteDocument(me: UserResponse, project: ProjectResponse): boolean {
  return canManageProject(me, project);
}

export function canViewBudgetDetail(me: UserResponse): boolean {
  return isAdmin(me) || isCoordinator(me);
}

export function canManageBudget(me: UserResponse, project: ProjectResponse): boolean {
  return (isAdmin(me) || isCoordinator(me)) && canManageProject(me, project);
}

export function canGenerateReport(me: UserResponse, kind: ReportKind): boolean {
  if (kind === "PROGRESS_PDF") return true;
  if (kind === "BUDGET_PDF" || kind === "BUDGET_EXCEL") return canViewBudgetDetail(me);
  return false;
}

export function canViewAudit(me: UserResponse): boolean {
  return isAdmin(me);
}

export function canRetrySync(me: UserResponse): boolean {
  return isAdmin(me);
}

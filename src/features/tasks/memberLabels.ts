import type { ProjectResponse, UserResponse } from "@quantia/contracts";

export type MemberNameMap = ReadonlyMap<string, string>;

/** Label for a project member/coordinator id. Prefer nameMap, then me, then fallback. */
export function memberLabel(
  userId: string | null | undefined,
  me: UserResponse,
  nameMap?: MemberNameMap,
  emptyLabel = "Sin asignar",
): string {
  if (!userId) return emptyLabel;
  if (userId === me.id) return me.fullName;
  const known = nameMap?.get(userId);
  if (known) return known;
  return "Integrante del proyecto";
}

export function projectMemberOptions(
  project: ProjectResponse,
  me: UserResponse,
  nameMap?: MemberNameMap,
): { value: string; label: string }[] {
  const ids = Array.from(new Set([project.coordinatorId, ...project.memberIds]));
  return ids.map((id) => ({
    value: id,
    label: memberLabel(id, me, nameMap, "Integrante del proyecto"),
  }));
}

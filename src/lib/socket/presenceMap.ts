import type { PresenceUser } from "@quantia/contracts";

/** Upsert / remove helpers for Chat General presence (one row per userId). */
export function replacePresenceUsers(users: readonly PresenceUser[]): PresenceUser[] {
  const map = new Map<string, PresenceUser>();
  for (const user of users) {
    map.set(user.id, user);
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, "es"));
}

export function upsertPresenceUser(
  users: readonly PresenceUser[],
  user: PresenceUser,
): PresenceUser[] {
  const map = new Map(users.map((entry) => [entry.id, entry]));
  map.set(user.id, user);
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, "es"));
}

export function removePresenceUser(users: readonly PresenceUser[], userId: string): PresenceUser[] {
  return users.filter((user) => user.id !== userId);
}

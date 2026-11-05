import type { RoleName, UserResponse } from "@quantia/contracts";

const NOW = "2026-11-04T17:00:00.000Z";

export type A11yRole = Extract<RoleName, "INVESTIGADOR" | "COORDINADOR" | "ADMINISTRADOR">;

const BASE = {
  email: "a11y@quantia.test",
  fullName: "Usuario Accesibilidad",
  isActive: true,
  avatar: "AVATAR_01",
  avatarRequired: false,
  createdAt: NOW,
  updatedAt: NOW,
} as const;

export function userFor(role: A11yRole): UserResponse {
  const ids: Record<A11yRole, string> = {
    INVESTIGADOR: "11111111-1111-4111-8111-111111111111",
    COORDINADOR: "22222222-2222-4222-8222-222222222222",
    ADMINISTRADOR: "33333333-3333-4333-8333-333333333333",
  };
  return {
    ...BASE,
    id: ids[role],
    roles: [role],
  };
}

/** Multi-role fixture for Lighthouse (one session covers every gated route). */
export function lighthouseUser(): UserResponse {
  return {
    ...BASE,
    id: "44444444-4444-4444-8444-444444444444",
    roles: ["ADMINISTRADOR", "COORDINADOR", "INVESTIGADOR"],
  };
}

export const PROJECT_ID = "55555555-5555-4555-8555-555555555555";

export function emptyPage<T>(data: T[] = []) {
  return {
    data,
    meta: {
      page: 1,
      pageSize: 20,
      total: data.length,
      totalPages: data.length > 0 ? 1 : 0,
    },
  };
}

import type { GeneralChatMessageDto, PresenceUser } from "@quantia/contracts";

/** Shared Chat General fixtures for unit/component tests (contracts 0.8.0 shapes). */
export const ANA_ID = "11111111-1111-4111-8111-111111111111";
export const LUIS_ID = "22222222-2222-4222-8222-222222222222";

export function presenceUser(partial: Partial<PresenceUser> = {}): PresenceUser {
  return { id: ANA_ID, name: "Ana", avatar: "AVATAR_01", avatarUrl: null, ...partial };
}

let counter = 0;

export function chatMessage(partial: Partial<GeneralChatMessageDto> = {}): GeneralChatMessageDto {
  counter += 1;
  const seq = partial.seq ?? counter;
  const id = partial.id ?? `00000000-0000-4000-8000-${String(seq).padStart(12, "0")}`;
  return {
    id,
    seq,
    version: 1,
    content: "Hola",
    clientMessageId: null,
    createdAt: "2026-11-04T15:00:00.000Z",
    updatedAt: "2026-11-04T15:00:00.000Z",
    editedAt: null,
    deletedAt: null,
    author: presenceUser(),
    replyTo: null,
    reactions: [],
    ...partial,
  };
}

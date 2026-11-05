import {
  CHAT_GENERAL_MESSAGE_HARD_MAX,
  createGeneralChatMessageSchema,
  editGeneralChatMessageSchema,
  generalChatHistoryQuerySchema,
  generalChatHistoryResponseSchema,
  generalChatMessageEnvelopeSchema,
  generalChatStateResponseSchema,
  generalChatUpdatesQuerySchema,
  generalChatUpdatesResponseSchema,
  markGeneralChatReadResponseSchema,
  markGeneralChatReadSchema,
  setGeneralChatReactionSchema,
  type ChatGeneralReaction,
  type CreateGeneralChatMessage,
  type GeneralChatHistoryQuery,
  type GeneralChatHistoryResponse,
  type GeneralChatMessageDto,
  type GeneralChatStateResponse,
  type GeneralChatUpdatesQuery,
  type GeneralChatUpdatesResponse,
  type MarkGeneralChatReadResponse,
} from "@quantia/contracts";
import { z } from "zod";

import { api } from "./client";

/**
 * Fallback when `GET /chat/general/state` is not loaded yet. The real limit comes from
 * `state.limits.messageMaxLength` (service env); the contract hard max is 4000.
 */
export const GENERAL_CHAT_MESSAGE_MAX = 2000;
const DEFAULT_HISTORY_LIMIT = 30;
const MAX_LIMIT = 100;

const emptyResponseSchema = z.undefined();

function clampLimit(limit: number | undefined, fallback = DEFAULT_HISTORY_LIMIT): number {
  return Math.min(Math.max(limit ?? fallback, 1), MAX_LIMIT);
}

function clampContent(content: string, maxLength: number): string {
  return content.trim().slice(0, Math.min(maxLength, CHAT_GENERAL_MESSAGE_HARD_MAX));
}

const messagePath = (messageId: string) =>
  `/chat/general/messages/${encodeURIComponent(messageId)}`;

/** Bootstrap: unread count, read pointers, limits and reaction allowlist. */
export function getGeneralChatState(): Promise<GeneralChatStateResponse> {
  return api.get("/chat/general/state", { schema: generalChatStateResponseSchema });
}

/** Cursor history, newest first (`seq desc`), without tombstones. */
export function listGeneralChatMessages(
  query: Partial<GeneralChatHistoryQuery> = {},
): Promise<GeneralChatHistoryResponse> {
  const parsed = generalChatHistoryQuerySchema.parse({
    ...query,
    limit: clampLimit(query.limit),
  });
  return api.get("/chat/general/messages", {
    schema: generalChatHistoryResponseSchema,
    query: parsed,
  });
}

/** Change feed (`updatedAt asc`) with tombstones — used to catch up after a reconnect. */
export function listGeneralChatUpdates(
  query: Partial<GeneralChatUpdatesQuery>,
): Promise<GeneralChatUpdatesResponse> {
  const parsed = generalChatUpdatesQuerySchema.parse({
    ...query,
    limit: clampLimit(query.limit, MAX_LIMIT),
  });
  return api.get("/chat/general/updates", {
    schema: generalChatUpdatesResponseSchema,
    query: parsed,
  });
}

export type SendGeneralChatMessageInput = CreateGeneralChatMessage & { maxLength?: number };

/**
 * `POST` is idempotent per `clientMessageId` (201 new · 200 replay). The 429 reaches the
 * composer (no silent retry) so it can show the `Retry-After` countdown.
 */
export function createGeneralChatMessage({
  maxLength = GENERAL_CHAT_MESSAGE_MAX,
  ...body
}: SendGeneralChatMessageInput): Promise<GeneralChatMessageDto> {
  const parsed = createGeneralChatMessageSchema.parse({
    content: clampContent(body.content, maxLength),
    clientMessageId: body.clientMessageId,
    replyToId: body.replyToId,
  });
  return api
    .post("/chat/general/messages", parsed, {
      schema: generalChatMessageEnvelopeSchema,
      rateLimitRetry: false,
    })
    .then((response) => response.message);
}

/** Author only, within `limits.editWindowSeconds`. */
export function editGeneralChatMessage(
  messageId: string,
  content: string,
  maxLength = GENERAL_CHAT_MESSAGE_MAX,
): Promise<GeneralChatMessageDto> {
  const parsed = editGeneralChatMessageSchema.parse({ content: clampContent(content, maxLength) });
  return api
    .patch(messagePath(messageId), parsed, {
      schema: generalChatMessageEnvelopeSchema,
      rateLimitRetry: false,
    })
    .then((response) => response.message);
}

/** Author or ADMINISTRADOR. 204 and idempotent (tombstone propagates by socket/feed). */
export function deleteGeneralChatMessage(messageId: string): Promise<void> {
  return api.delete(messagePath(messageId), {
    schema: emptyResponseSchema,
    rateLimitRetry: false,
  });
}

/** One reaction per user and message; a new emoji replaces the previous one. */
export function setGeneralChatReaction(
  messageId: string,
  emoji: ChatGeneralReaction,
): Promise<GeneralChatMessageDto> {
  const parsed = setGeneralChatReactionSchema.parse({ emoji });
  return api
    .put(`${messagePath(messageId)}/reaction`, parsed, {
      schema: generalChatMessageEnvelopeSchema,
    })
    .then((response) => response.message);
}

export function removeGeneralChatReaction(messageId: string): Promise<GeneralChatMessageDto> {
  return api
    .delete(`${messagePath(messageId)}/reaction`, {
      schema: generalChatMessageEnvelopeSchema,
    })
    .then((response) => response.message);
}

/** Monotonic read pointer (server clamps to the latest `seq`). */
export function markGeneralChatRead(lastReadSeq: number): Promise<MarkGeneralChatReadResponse> {
  const parsed = markGeneralChatReadSchema.parse({ lastReadSeq });
  return api.put("/chat/general/read", parsed, {
    schema: markGeneralChatReadResponseSchema,
  });
}

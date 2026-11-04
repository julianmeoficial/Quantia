import {
  createGeneralChatMessageSchema,
  generalChatHistoryQuerySchema,
  generalChatHistoryResponseSchema,
  generalChatMessageSchema,
  type CreateGeneralChatMessage,
  type GeneralChatHistoryQuery,
  type GeneralChatHistoryResponse,
  type GeneralChatMessageDto,
} from "@quantia/contracts";
import { z } from "zod";

import { api } from "./client";

/** Documented service limit (contract hard max is 4000). */
export const GENERAL_CHAT_MESSAGE_MAX = 2000;
const MAX_HISTORY_LIMIT = 100;
const DEFAULT_HISTORY_LIMIT = 30;

const createGeneralChatMessageResponseSchema = z.object({
  message: generalChatMessageSchema,
});

export type CreateGeneralChatMessageResponse = z.infer<
  typeof createGeneralChatMessageResponseSchema
>;

function clampLimit(limit: number | undefined): number {
  return Math.min(limit ?? DEFAULT_HISTORY_LIMIT, MAX_HISTORY_LIMIT);
}

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

export function createGeneralChatMessage(
  body: CreateGeneralChatMessage,
): Promise<GeneralChatMessageDto> {
  const content = body.content.trim().slice(0, GENERAL_CHAT_MESSAGE_MAX);
  const parsed = createGeneralChatMessageSchema.parse({
    content,
    clientMessageId: body.clientMessageId,
  });
  return api
    .post("/chat/general/messages", parsed, {
      schema: createGeneralChatMessageResponseSchema,
      /** Surface 429 to the composer for visible Retry-After countdown. */
      rateLimitRetry: false,
    })
    .then((response) => response.message);
}

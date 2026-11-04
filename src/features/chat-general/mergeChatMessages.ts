import type { GeneralChatMessageDto } from "@quantia/contracts";

import type { ChatDeliveryState } from "@/components/composite";

export type OptimisticChatMessage = {
  message: GeneralChatMessageDto;
  deliveryState: ChatDeliveryState;
};

/**
 * Merges server history (newest-first pages already flattened oldest→newest)
 * with optimistic locals. Dedupes by `id` and `clientMessageId`.
 */
export function mergeChatMessages(
  serverMessages: readonly GeneralChatMessageDto[],
  optimistic: readonly OptimisticChatMessage[],
): OptimisticChatMessage[] {
  const byId = new Map<string, OptimisticChatMessage>();
  const byClientId = new Map<string, string>();

  for (const message of serverMessages) {
    byId.set(message.id, { message, deliveryState: "sent" });
    if (message.clientMessageId) {
      byClientId.set(message.clientMessageId, message.id);
    }
  }

  for (const entry of optimistic) {
    const clientId = entry.message.clientMessageId;
    if (clientId && byClientId.has(clientId)) {
      // Server already confirmed this client id — drop the optimistic duplicate.
      continue;
    }
    if (byId.has(entry.message.id)) {
      continue;
    }
    byId.set(entry.message.id, entry);
    if (clientId) byClientId.set(clientId, entry.message.id);
  }

  return [...byId.values()].sort((a, b) => {
    const byTime = a.message.createdAt.localeCompare(b.message.createdAt);
    if (byTime !== 0) return byTime;
    return a.message.id.localeCompare(b.message.id);
  });
}

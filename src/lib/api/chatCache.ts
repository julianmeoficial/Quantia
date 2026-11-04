import type { GeneralChatMessageDto } from "@quantia/contracts";
import type { QueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/api/query-keys";

type HistoryData = {
  pages: {
    items: GeneralChatMessageDto[];
    nextCursor: string | null;
    hasMore: boolean;
  }[];
  pageParams: unknown[];
};

function alreadyPresent(
  items: readonly GeneralChatMessageDto[],
  message: GeneralChatMessageDto,
): boolean {
  return items.some(
    (item) =>
      item.id === message.id ||
      (message.clientMessageId != null &&
        message.clientMessageId !== "" &&
        item.clientMessageId === message.clientMessageId),
  );
}

/** Inserts a confirmed message into the newest page. Returns true when it was new. */
export function insertChatMessageInCache(
  queryClient: QueryClient,
  message: GeneralChatMessageDto,
): boolean {
  let inserted = false;

  queryClient.setQueryData(queryKeys.chatGeneralHistory, (current: unknown) => {
    if (!current || typeof current !== "object" || !("pages" in current)) {
      inserted = true;
      return {
        pages: [{ items: [message], nextCursor: null, hasMore: false }],
        pageParams: [undefined],
      } satisfies HistoryData;
    }

    const data = current as HistoryData;
    const pages = data.pages.map((page, index) => {
      if (index !== 0) return page;
      if (alreadyPresent(page.items, message)) return page;
      inserted = true;
      return { ...page, items: [message, ...page.items] };
    });

    if (!inserted && data.pages.length === 0) {
      inserted = true;
      return {
        pages: [{ items: [message], nextCursor: null, hasMore: false }],
        pageParams: data.pageParams.length ? data.pageParams : [undefined],
      } satisfies HistoryData;
    }

    return { ...data, pages };
  });

  return inserted;
}

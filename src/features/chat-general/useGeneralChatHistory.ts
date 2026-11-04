"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { useAuth } from "@/features/auth/AuthProvider";
import { listGeneralChatMessages } from "@/lib/api/chat";
import { ApiError } from "@/lib/api/errors";
import { queryKeys } from "@/lib/api/query-keys";
import type { GeneralChatMessageDto } from "@quantia/contracts";

export type UseGeneralChatHistoryState = {
  status: "idle" | "loading" | "ready" | "error";
  messages: GeneralChatMessageDto[];
  hasMore: boolean;
  isFetchingOlder: boolean;
  error: ApiError | null;
  loadOlder: () => void;
  reload: () => void;
};

function toApiError(cause: unknown): ApiError {
  return cause instanceof ApiError ? cause : new ApiError("unknown", null);
}

/** API returns newest-first; reverse each page and prepend older pages chronologically. */
function flattenHistory(
  pages: { items: GeneralChatMessageDto[] }[] | undefined,
): GeneralChatMessageDto[] {
  if (!pages?.length) return [];
  const seen = new Set<string>();
  const chronological: GeneralChatMessageDto[] = [];

  // pages[0] = newest page; pages[n] = older. Build oldest → newest.
  for (let pageIndex = pages.length - 1; pageIndex >= 0; pageIndex -= 1) {
    const page = pages[pageIndex];
    if (!page) continue;
    const oldestFirst = [...page.items].reverse();
    for (const message of oldestFirst) {
      if (seen.has(message.id)) continue;
      if (message.clientMessageId && seen.has(`c:${message.clientMessageId}`)) continue;
      seen.add(message.id);
      if (message.clientMessageId) seen.add(`c:${message.clientMessageId}`);
      chronological.push(message);
    }
  }

  return chronological;
}

export function useGeneralChatHistory(): UseGeneralChatHistoryState {
  const { status: authStatus } = useAuth();
  const enabled = authStatus === "authenticated";

  const query = useInfiniteQuery({
    queryKey: queryKeys.chatGeneralHistory,
    enabled,
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      listGeneralChatMessages({
        cursor: pageParam,
        limit: 30,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore && lastPage.nextCursor ? lastPage.nextCursor : undefined,
  });

  const messages = useMemo(() => flattenHistory(query.data?.pages), [query.data?.pages]);

  const reload = () => {
    void query.refetch();
  };

  const loadOlder = () => {
    if (!query.hasNextPage || query.isFetchingNextPage) return;
    void query.fetchNextPage();
  };

  if (!enabled) {
    return {
      status: "idle",
      messages: [],
      hasMore: false,
      isFetchingOlder: false,
      error: null,
      loadOlder,
      reload,
    };
  }

  if (query.isPending && !query.data) {
    return {
      status: "loading",
      messages: [],
      hasMore: false,
      isFetchingOlder: false,
      error: null,
      loadOlder,
      reload,
    };
  }

  if (query.isError && !query.data) {
    return {
      status: "error",
      messages: [],
      hasMore: false,
      isFetchingOlder: false,
      error: toApiError(query.error),
      loadOlder,
      reload,
    };
  }

  return {
    status: "ready",
    messages,
    hasMore: Boolean(query.hasNextPage),
    isFetchingOlder: query.isFetchingNextPage,
    error: query.isError ? toApiError(query.error) : null,
    loadOlder,
    reload,
  };
}

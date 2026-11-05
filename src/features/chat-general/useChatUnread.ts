"use client";

import { ChatGeneralErrorCode } from "@quantia/contracts";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/features/auth/AuthProvider";
import { getGeneralChatState } from "@/lib/api/chat";
import { ApiError } from "@/lib/api/errors";
import { queryKeys } from "@/lib/api/query-keys";

export type ChatUnreadState = {
  /** Unread messages for the nav badge (0 while unknown). */
  unreadCount: number;
  /** `false` only when the API confirms the kill switch (404 `CHAT_DISABLED`). */
  chatEnabled: boolean;
};

const POLL_MS = 60_000;

/**
 * Shell-level unread badge for «Chat». Polls the bootstrap endpoint (no socket outside
 * `/chat`, so the 10-connection budget is untouched). Skipped while the user must still
 * pick an avatar (the API would answer 403 `AVATAR_REQUIRED`) and while on `/chat`.
 */
export function useChatUnread(onChatRoute: boolean): ChatUnreadState {
  const { status, user } = useAuth();
  const enabled = status === "authenticated" && Boolean(user) && !user?.avatarRequired;

  const query = useQuery({
    queryKey: queryKeys.chatGeneralState,
    queryFn: getGeneralChatState,
    enabled: enabled && !onChatRoute,
    refetchInterval: POLL_MS,
    refetchOnWindowFocus: true,
    retry: false,
    staleTime: 15_000,
  });

  const disabled =
    query.error instanceof ApiError &&
    (query.error.code === ChatGeneralErrorCode.CHAT_DISABLED ||
      (query.error.kind === "not_found" && !query.error.code));

  return {
    unreadCount: onChatRoute ? 0 : (query.data?.unreadCount ?? 0),
    chatEnabled: !disabled,
  };
}

"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { AppShell } from "@/components/page/AppShell";
import { useAuth } from "@/features/auth/AuthProvider";
import { NavBoot } from "@/features/auth/NavBoot";
import { useChatUnread } from "@/features/chat-general/useChatUnread";
import { buildLoginHref, isChatPath } from "@/lib/auth";
import { useSocketContext } from "@/lib/socket";

function currentHref(pathname: string): string {
  if (typeof window === "undefined") return pathname;
  const search = window.location.search;
  return search ? `${pathname}${search}` : pathname;
}

/** Product shell. Identity comes from GET /users/me. The JWT is never read. */
export function AppFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { status, identity, logout, endExpiredSession } = useAuth();
  const { connection, connectionPaused, reconnect, notices, unreadCount, markNoticesRead } =
    useSocketContext();
  const chatUnread = useChatUnread(isChatPath(pathname));

  useEffect(() => {
    if (status === "anonymous") router.replace(buildLoginHref(currentHref(pathname)));
  }, [status, router, pathname]);

  if (status === "booting" || status === "anonymous" || !identity) {
    return <NavBoot />;
  }

  return (
    <AppShell
      identity={identity}
      pathname={pathname}
      chatEnabled={chatUnread.chatEnabled}
      navBadges={{ "/chat": chatUnread.unreadCount }}
      connection={connection}
      connectionPaused={connectionPaused}
      onReconnect={reconnect}
      notices={notices.map((notice) => ({
        id: notice.id,
        title: notice.title,
        description: notice.description,
        createdAt: notice.createdAt,
        href: notice.href,
        hrefLabel: notice.hrefLabel,
      }))}
      unreadCount={unreadCount}
      onNoticesOpenChange={(open) => {
        if (open) markNoticesRead();
      }}
      onLogout={() => {
        void logout();
      }}
      sessionExpired={status === "sessionExpired"}
      onSessionAction={() => {
        void endExpiredSession(currentHref(pathname));
      }}
    >
      {children}
    </AppShell>
  );
}

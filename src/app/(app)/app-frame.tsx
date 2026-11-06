"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, type ReactNode } from "react";

import { AppShell } from "@/components/page/AppShell";
import { useAuth } from "@/features/auth/AuthProvider";
import { NavBoot } from "@/features/auth/NavBoot";
import { useChatUnread } from "@/features/chat-general/useChatUnread";
import { buildLoginHref, isChatPath, isProjectContextPath, projectRouteId } from "@/lib/auth";
import { useSocketContext } from "@/lib/socket";

function currentHref(pathname: string): string {
  if (typeof window === "undefined") return pathname;
  const search = window.location.search;
  return search ? `${pathname}${search}` : pathname;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Mirrors `?projectId=` into the menu scope when the person switches project with a filter. */
function ProjectScopeFromQuery({ onProject }: { onProject: (id: string) => void }) {
  const params = useSearchParams();
  const projectId = params.get("projectId");
  useEffect(() => {
    if (projectId && UUID.test(projectId)) onProject(projectId);
  }, [projectId, onProject]);
  return null;
}

/** Product shell. Identity comes from GET /users/me. The JWT is never read. */
export function AppFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { status, identity, logout, endExpiredSession } = useAuth();
  const { connection, connectionPaused, reconnect, notices, unreadCount, markNoticesRead } =
    useSocketContext();
  const chatUnread = useChatUnread(isChatPath(pathname));

  // Remember the open project while the person moves between its workspace and the
  // filtered sections, so the menu never drops them on the unfiltered list.
  const [projectScopeId, setProjectScopeId] = useState<string | null>(null);
  const routeProjectId = projectRouteId(pathname);
  if (routeProjectId && routeProjectId !== projectScopeId) {
    setProjectScopeId(routeProjectId);
  } else if (!routeProjectId && projectScopeId && !isProjectContextPath(pathname)) {
    setProjectScopeId(null);
  }

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
      projectScopeId={projectScopeId}
      fillViewport={isChatPath(pathname)}
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
      {isProjectContextPath(pathname) ? (
        <Suspense fallback={null}>
          <ProjectScopeFromQuery onProject={setProjectScopeId} />
        </Suspense>
      ) : null}
      {children}
    </AppShell>
  );
}

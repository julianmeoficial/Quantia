"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import styled from "styled-components";

import { IconButton } from "@/components/base";
import { AppHeader, type AppHeaderCrumb, type AppHeaderNotice } from "@/components/page/AppHeader";
import { RoleSidebar } from "@/components/page/RoleSidebar";
import { ErrorState } from "@/components/system";
import type { ConnectionState } from "@/components/system";
import {
  accessFor,
  callRouteId,
  landing,
  navigationFor,
  primaryRole,
  ROLE_LABEL,
  sectionLabel,
} from "@/lib/auth";
import type { SessionIdentity } from "@/lib/auth";

import { MenuIcon, iconForHref } from "./nav-icons";

function crumbsFor(pathname: string, home: string | null, denied: boolean): AppHeaderCrumb[] {
  const callId = callRouteId(pathname);
  if (callId && !denied) {
    return [{ label: "quantia.udc", href: "/institucional" }, { label: `convocatorias/${callId}` }];
  }

  const section = sectionLabel(pathname);
  return [
    { label: "Quantia", href: home ?? undefined },
    ...(section && !denied ? [{ label: section }] : []),
  ];
}

const Frame = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-width: 0;
  max-width: 100%;
  background: ${({ theme }) => theme.colors.bg.canvas};
`;

const Skip = styled.a`
  position: absolute;
  left: ${({ theme }) => theme.space[16]};
  top: ${({ theme }) => theme.space[16]};
  z-index: ${({ theme }) => theme.zIndices.modal};
  transform: translateY(-200%);
  padding: ${({ theme }) => theme.space[8]} ${({ theme }) => theme.space[12]};
  border-radius: ${({ theme }) => theme.radii.control};
  background: ${({ theme }) => theme.colors.bg.surface};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.label.fontSize};

  &:focus {
    outline: none;
  }

  &:focus-visible {
    transform: translateY(0);
    outline: ${({ theme }) => theme.borderWidths.thick} solid
      ${({ theme }) => theme.colors.focus.ring};
    outline-offset: ${({ theme }) => theme.borderWidths.thick};
  }
`;

const Body = styled.div`
  display: flex;
  flex: 1;
  align-items: stretch;
  gap: ${({ theme }) => theme.space[24]};
  min-width: 0;
  max-width: 100%;
  padding: ${({ theme }) => theme.space[16]};
`;

const InlineNav = styled.div`
  display: none;

  ${({ theme }) => theme.media.up("md")} {
    display: block;
  }
`;

const MenuSlot = styled.div`
  display: flex;

  ${({ theme }) => theme.media.up("md")} {
    display: none;
  }
`;

const Main = styled.main`
  flex: 1;
  min-width: 0;
  max-width: ${({ theme }) => theme.sizes.containerMax};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[16]};
  padding: ${({ theme }) => theme.space[16]};

  ${({ theme }) => theme.media.up("md")} {
    padding: ${({ theme }) => theme.space[24]};
  }

  ${({ theme }) => theme.media.up("lg")} {
    padding: ${({ theme }) => theme.space[32]};
  }

  h1 {
    margin: 0;
    font-size: ${({ theme }) => theme.typography.headingLarge.fontSize};
    line-height: ${({ theme }) => theme.typography.headingLarge.lineHeight};
    font-weight: ${({ theme }) => theme.typography.headingLarge.fontWeight};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.text.secondary};
    font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
    line-height: ${({ theme }) => theme.typography.bodyMedium.lineHeight};
  }
`;

export interface AppShellProps {
  identity: SessionIdentity | null;
  pathname: string;
  children?: ReactNode;
  connection?: ConnectionState;
  onReconnect?: () => void;
  onLogout?: () => void;
  onSessionAction?: () => void;
  /** Modal de sesión encima de la vista, sin desmontarla. */
  sessionExpired?: boolean;
  notices?: AppHeaderNotice[];
  unreadCount?: number;
  onNoticesOpenChange?: (open: boolean) => void;
  connectionPaused?: boolean;
  /** Hide «Chat» only when the API confirms it is disabled. */
  chatEnabled?: boolean;
  /** Unread counters per nav href (e.g. `{ "/chat": 3 }`). */
  navBadges?: Readonly<Record<string, number>>;
}

export function AppShell({
  identity,
  pathname,
  children,
  connection = "connected",
  onReconnect,
  onLogout,
  onSessionAction,
  sessionExpired = false,
  notices = [],
  unreadCount = 0,
  onNoticesOpenChange,
  connectionPaused = false,
  chatEnabled = true,
  navBadges,
}: AppShellProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!identity) {
    return (
      <ErrorState
        variant="session"
        onSessionAction={onSessionAction}
        onOpenChange={() => undefined}
      />
    );
  }

  const items = navigationFor(identity.roles, { chatEnabled }).map((entry) => ({
    ...entry,
    icon: iconForHref(entry.href),
    badge: navBadges?.[entry.href] ?? 0,
  }));
  const home = landing(identity.roles);
  const role = primaryRole(identity.roles);
  const denied = accessFor(pathname, identity.roles) === "denied";
  const crumbs = crumbsFor(pathname, home, denied);

  return (
    <Frame>
      <Skip href="#contenido">Saltar al contenido</Skip>
      <AppHeader
        crumbs={crumbs}
        connection={connection}
        onReconnect={onReconnect}
        userName={identity.displayName}
        roleLabel={role ? ROLE_LABEL[role] : undefined}
        onLogout={onLogout}
        notices={notices}
        unreadCount={unreadCount}
        onNoticesOpenChange={onNoticesOpenChange}
        connectionPausedMessage={connectionPaused ? "Tiempo real pausado en esta pestaña" : null}
        menu={
          <MenuSlot>
            <IconButton
              accessibleLabel="Abrir navegación"
              icon={<MenuIcon />}
              onClick={() => setMenuOpen(true)}
            />
          </MenuSlot>
        }
      />
      <Body>
        <InlineNav>
          <RoleSidebar items={items} currentPath={pathname} profileName={identity.displayName} />
        </InlineNav>
        {menuOpen ? (
          <RoleSidebar
            variant="drawer"
            open
            onOpenChange={setMenuOpen}
            items={items}
            currentPath={pathname}
            profileName={identity.displayName}
          />
        ) : null}
        <Main id="contenido" tabIndex={-1}>
          {denied ? (
            <ErrorState
              variant="forbidden"
              title="No tienes acceso"
              onRetry={() => {
                if (home) router.replace(home);
                else router.replace("/");
              }}
              retryLabel="Volver"
            />
          ) : (
            children
          )}
        </Main>
      </Body>
      {sessionExpired ? (
        <ErrorState
          variant="session"
          open
          onSessionAction={onSessionAction}
          onOpenChange={() => undefined}
        />
      ) : null}
    </Frame>
  );
}

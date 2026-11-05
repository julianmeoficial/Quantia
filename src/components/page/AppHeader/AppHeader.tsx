"use client";

import type { ReactNode } from "react";
import { DropdownMenu as DropdownMenuPrimitive, Popover as PopoverPrimitive } from "radix-ui";
import styled, { css, keyframes } from "styled-components";

import { Avatar, initialsFromName, Link } from "@/components/base";
import { focusRing } from "@/components/base/shared/focus";
import { ConnectionStatus } from "@/components/system";
import type { ConnectionState } from "@/components/system";
import { formatDate } from "@/lib/format";

const Header = styled.header`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.space[12]};
  width: 100%;
  max-width: 100%;
  min-width: 0;
  min-height: ${({ theme }) => theme.layout.header};
  padding: 0 ${({ theme }) => theme.space[16]};
  background: ${({ theme }) => theme.colors.bg.surface};
  border-bottom: ${({ theme }) => theme.borderWidths.thin} solid
    ${({ theme }) => theme.colors.border.subtle};
`;

const Crumbs = styled.ol`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.space[8]};
  margin: 0;
  padding: 0;
  list-style: none;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.bodySmall.fontSize};
`;

const Current = styled.span`
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Tools = styled.div`
  display: flex;
  flex: 1 1 auto;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.space[8]};
  min-width: 0;
  max-width: 100%;
`;

const StatusSlot = styled.div`
  flex: 1 1 ${({ theme }) => `calc(${theme.space[64]} * 2)`};
  min-width: 0;
  max-width: 100%;
`;

const Role = styled.span`
  display: none;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.bodySmall.fontSize};

  ${({ theme }) => theme.media.up("md")} {
    display: inline;
  }
`;

const AccountButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: ${({ theme }) => theme.sizes.control};
  min-height: ${({ theme }) => theme.sizes.control};
  padding: 0;
  border: 0;
  border-radius: ${({ theme }) => theme.radii.full};
  background: transparent;
  cursor: pointer;
  ${focusRing}
`;

const floatIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-0.25rem) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const badgePop = keyframes`
  0% {
    transform: scale(0.4);
    opacity: 0;
  }
  60% {
    transform: scale(1.12);
    opacity: 1;
  }
  100% {
    transform: scale(1);
  }
`;

/** Radix popovers/menus: 150 ms rise from their own transform origin; static if reduced. */
const floatingMotion = css`
  transform-origin: var(
    --radix-popover-content-transform-origin,
    var(--radix-dropdown-menu-content-transform-origin, top right)
  );

  &[data-state="open"] {
    animation: ${floatIn} ${({ theme }) => theme.motion.duration.fast}
      ${({ theme }) => theme.motion.easing.standard};
  }

  ${({ theme }) => theme.media.reducedMotion} {
    &[data-state="open"] {
      animation: none;
    }
  }
`;

const Panel = styled(PopoverPrimitive.Content)`
  ${floatingMotion}
  z-index: ${({ theme }) => theme.zIndices.overlay};
  width: calc(${({ theme }) => theme.layout.sidebar} + ${({ theme }) => theme.space[32]});
  max-height: min(70vh, 28rem);
  overflow: auto;
  padding: ${({ theme }) => theme.space[16]};
  background: ${({ theme }) => theme.colors.bg.surface};
  border: ${({ theme }) => theme.borderWidths.thin} solid
    ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radii.card};
  box-shadow: ${({ theme }) => theme.elevation.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.bodySmall.fontSize};
`;

const PanelTitle = styled.h2`
  margin: 0 0 ${({ theme }) => theme.space[12]};
  font-size: ${({ theme }) => theme.typography.label.fontSize};
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const NoticeList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[12]};
  margin: 0;
  padding: 0;
  list-style: none;
`;

const NoticeItem = styled.li`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[4]};
  padding-bottom: ${({ theme }) => theme.space[12]};
  border-bottom: ${({ theme }) => theme.borderWidths.thin} solid
    ${({ theme }) => theme.colors.border.subtle};

  &:last-child {
    border-bottom: 0;
    padding-bottom: 0;
  }
`;

const NoticeTitle = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.bodySmall.fontSize};
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;

const NoticeBody = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const NoticeTime = styled.time`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
`;

const Empty = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Menu = styled(DropdownMenuPrimitive.Content)`
  ${floatingMotion}
  z-index: ${({ theme }) => theme.zIndices.overlay};
  min-width: ${({ theme }) => theme.layout.sidebar};
  padding: ${({ theme }) => theme.space[8]};
  background: ${({ theme }) => theme.colors.bg.surface};
  border: ${({ theme }) => theme.borderWidths.thin} solid
    ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radii.control};
  box-shadow: ${({ theme }) => theme.elevation.sm};
`;

const MenuLabel = styled.p`
  margin: 0;
  padding: ${({ theme }) => theme.space[8]} ${({ theme }) => theme.space[12]};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.bodySmall.fontSize};
`;

const MenuItem = styled(DropdownMenuPrimitive.Item)`
  display: flex;
  align-items: center;
  min-height: ${({ theme }) => theme.sizes.control};
  padding: 0 ${({ theme }) => theme.space[12]};
  border-radius: ${({ theme }) => theme.radii.control};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  ${focusRing}
`;

const NoticeButton = styled.button`
  position: relative;
  min-height: ${({ theme }) => theme.sizes.control};
  padding: 0 ${({ theme }) => theme.space[12]};
  border: ${({ theme }) => theme.borderWidths.thin} solid
    ${({ theme }) => theme.colors.border.control};
  border-radius: ${({ theme }) => theme.radii.control};
  background: ${({ theme }) => theme.colors.bg.surface};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.label.fontSize};
  cursor: pointer;
  ${focusRing}
`;

const CountBadge = styled.span`
  position: absolute;
  top: ${({ theme }) => theme.space[4]};
  right: ${({ theme }) => theme.space[4]};
  min-width: ${({ theme }) => theme.space[16]};
  height: ${({ theme }) => theme.space[16]};
  padding: 0 ${({ theme }) => theme.space[4]};
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.status.error.text};
  color: ${({ theme }) => theme.colors.brand.onPrimary};
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  line-height: ${({ theme }) => theme.space[16]};
  text-align: center;
  animation: ${badgePop} ${({ theme }) => theme.motion.duration.slow}
    ${({ theme }) => theme.motion.easing.standard};

  ${({ theme }) => theme.media.reducedMotion} {
    animation: none;
  }
`;

const LiveRegion = styled.div`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

export interface AppHeaderCrumb {
  label: string;
  href?: string;
}

export interface AppHeaderNotice {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  href?: string;
  hrefLabel?: string;
}

export interface AppHeaderProps {
  crumbs: AppHeaderCrumb[];
  connection: ConnectionState;
  onReconnect?: () => void;
  userName: string;
  roleLabel?: string;
  menu?: ReactNode;
  onLogout?: () => void;
  notices?: AppHeaderNotice[];
  unreadCount?: number;
  onNoticesOpenChange?: (open: boolean) => void;
  connectionPausedMessage?: string | null;
}

export function AppHeader({
  crumbs,
  connection,
  onReconnect,
  userName,
  roleLabel,
  menu,
  onLogout,
  notices = [],
  unreadCount = 0,
  onNoticesOpenChange,
  connectionPausedMessage = null,
}: AppHeaderProps) {
  const badgeLabel =
    unreadCount > 0 ? `Avisos, ${unreadCount} sin revisar` : "Avisos de esta sesión";

  return (
    <Header>
      {menu}
      <nav aria-label="Migas de pan">
        <Crumbs>
          {crumbs.map((crumb, index) => {
            const last = index === crumbs.length - 1;
            return (
              <li key={`${crumb.label}-${index}`}>
                {crumb.href && !last ? (
                  <Link href={crumb.href}>{crumb.label}</Link>
                ) : (
                  <Current>{crumb.label}</Current>
                )}
              </li>
            );
          })}
        </Crumbs>
      </nav>
      <Tools>
        <StatusSlot>
          <ConnectionStatus state={connection} onReconnect={onReconnect} />
          {connectionPausedMessage ? <Role role="status">{connectionPausedMessage}</Role> : null}
        </StatusSlot>
        <PopoverPrimitive.Root
          onOpenChange={(open) => {
            onNoticesOpenChange?.(open);
          }}
        >
          <PopoverPrimitive.Trigger asChild>
            <NoticeButton type="button" aria-label={badgeLabel}>
              Avisos
              {unreadCount > 0 ? (
                <CountBadge key={unreadCount} aria-hidden>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </CountBadge>
              ) : null}
            </NoticeButton>
          </PopoverPrimitive.Trigger>
          <PopoverPrimitive.Portal>
            <Panel>
              <PanelTitle>Avisos de esta sesión</PanelTitle>
              {notices.length === 0 ? (
                <Empty>Sin avisos en esta sesión.</Empty>
              ) : (
                <NoticeList>
                  {notices.map((notice) => (
                    <NoticeItem key={notice.id}>
                      <NoticeTitle>{notice.title}</NoticeTitle>
                      <NoticeBody>{notice.description}</NoticeBody>
                      <NoticeTime dateTime={notice.createdAt}>
                        {formatDate(notice.createdAt, { withTime: true })}
                      </NoticeTime>
                      {notice.href && notice.hrefLabel ? (
                        <Link href={notice.href}>{notice.hrefLabel}</Link>
                      ) : null}
                    </NoticeItem>
                  ))}
                </NoticeList>
              )}
            </Panel>
          </PopoverPrimitive.Portal>
        </PopoverPrimitive.Root>
        <LiveRegion aria-live="polite" aria-atomic="true">
          {unreadCount > 0 ? `${unreadCount} avisos nuevos` : ""}
        </LiveRegion>
        {roleLabel ? <Role>{roleLabel}</Role> : null}
        <DropdownMenuPrimitive.Root>
          <DropdownMenuPrimitive.Trigger asChild>
            <AccountButton
              type="button"
              aria-label={`${initialsFromName(userName)}, cuenta de ${userName}`}
            >
              <Avatar name={userName} announceName={false} />
            </AccountButton>
          </DropdownMenuPrimitive.Trigger>
          <DropdownMenuPrimitive.Portal>
            <Menu>
              <MenuLabel>{userName}</MenuLabel>
              {onLogout ? <MenuItem onSelect={onLogout}>Cerrar sesión</MenuItem> : null}
            </Menu>
          </DropdownMenuPrimitive.Portal>
        </DropdownMenuPrimitive.Root>
      </Tools>
    </Header>
  );
}

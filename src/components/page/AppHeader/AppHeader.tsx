"use client";

import type { AvatarKey } from "@quantia/contracts";
import type { ReactNode } from "react";
import { DropdownMenu as DropdownMenuPrimitive, Popover as PopoverPrimitive } from "radix-ui";
import styled, { css, keyframes } from "styled-components";

import { Avatar, initialsFromName, Link } from "@/components/base";
import { BellIcon } from "@/components/base/icons";
import { focusRing } from "@/components/base/shared/focus";
import { ConnectionStatus } from "@/components/system";
import type { ConnectionState } from "@/components/system";
import { formatDate } from "@/lib/format";

/**
 * One row at every width (never wraps into a second line on phones). Sticky and translucent
 * with a backdrop blur, so content scrolls under it the way iOS/macOS bars behave.
 */
const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: ${({ theme }) => theme.zIndices.sticky};
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: ${({ theme }) => theme.space[8]};
  width: 100%;
  max-width: 100%;
  min-width: 0;
  height: ${({ theme }) => theme.layout.header};
  flex: none;
  padding: 0 ${({ theme }) => theme.space[8]} 0 ${({ theme }) => theme.space[8]};
  background: ${({ theme }) => theme.colors.bg.surface};
  border-bottom: ${({ theme }) => theme.borderWidths.thin} solid
    ${({ theme }) => theme.colors.border.subtle};

  @supports (backdrop-filter: blur(1rem)) {
    background: color-mix(in srgb, ${({ theme }) => theme.colors.bg.surface} 82%, transparent);
    backdrop-filter: saturate(1.6) blur(0.75rem);
  }

  ${({ theme }) => theme.media.up("md")} {
    gap: ${({ theme }) => theme.space[12]};
    padding: 0 ${({ theme }) => theme.space[16]};
  }
`;

const CrumbNav = styled.nav`
  flex: 1 1 auto;
  min-width: 0;
`;

/** Phones show only the current section; tablets and desktops show the full trail. */
const Crumbs = styled.ol`
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: ${({ theme }) => theme.space[8]};
  min-width: 0;
  margin: 0;
  padding: 0;
  list-style: none;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.bodySmall.fontSize};

  li {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.space[8]};
    min-width: 0;
  }

  li + li::before {
    content: "/";
    color: ${({ theme }) => theme.colors.border.control};
  }

  li:not(:last-child) {
    display: none;
  }

  ${({ theme }) => theme.media.up("md")} {
    li:not(:last-child) {
      display: flex;
    }
  }
`;

const Current = styled.span`
  overflow: hidden;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.bodyStrong.fontSize};
  font-weight: ${({ theme }) => theme.typography.bodyStrong.fontWeight};
  text-overflow: ellipsis;
  white-space: nowrap;

  ${({ theme }) => theme.media.up("md")} {
    font-size: ${({ theme }) => theme.typography.bodySmall.fontSize};
    font-weight: ${({ theme }) => theme.typography.label.fontWeight};
  }
`;

const Tools = styled.div`
  display: flex;
  flex: 0 0 auto;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.space[4]};
  min-width: 0;

  ${({ theme }) => theme.media.up("md")} {
    gap: ${({ theme }) => theme.space[8]};
  }
`;

const StatusSlot = styled.div`
  flex: 0 1 auto;
  min-width: 0;
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
  z-index: ${({ theme }) => theme.zIndices.dropdown};
  width: calc(${({ theme }) => theme.layout.sidebar} + ${({ theme }) => theme.space[32]});
  max-width: calc(100vw - ${({ theme }) => theme.space[16]});
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
  z-index: ${({ theme }) => theme.zIndices.dropdown};
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

/** Bell icon on phones (44 px target); icon + «Avisos» from `md`. */
const NoticeButton = styled.button`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.space[8]};
  min-width: ${({ theme }) => theme.sizes.control};
  min-height: ${({ theme }) => theme.sizes.control};
  padding: 0;
  border: 0;
  border-radius: ${({ theme }) => theme.radii.full};
  background: transparent;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.label.fontSize};
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
  cursor: pointer;
  transition:
    background ${({ theme }) => theme.motion.duration.fast}
      ${({ theme }) => theme.motion.easing.standard},
    transform ${({ theme }) => theme.motion.duration.fast}
      ${({ theme }) => theme.motion.easing.standard};
  ${focusRing}

  @media (hover: hover) {
    &:hover {
      background: ${({ theme }) => theme.colors.bg.subtle};
    }
  }

  &:active {
    transform: scale(0.94);
  }

  ${({ theme }) => theme.media.up("md")} {
    padding: 0 ${({ theme }) => theme.space[12]};
    border-radius: ${({ theme }) => theme.radii.control};
  }
`;

const NoticeLabel = styled.span`
  display: none;

  ${({ theme }) => theme.media.up("md")} {
    display: inline;
  }
`;

const NoticeGlyph = styled.span`
  display: inline-flex;
  font-size: ${({ theme }) => theme.typography.headingSmall.fontSize};
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
  /** Account profile avatar; falls back to initials when null. */
  avatarKey?: AvatarKey | null;
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
  avatarKey = null,
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
      <CrumbNav aria-label="Migas de pan">
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
      </CrumbNav>
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
              <NoticeGlyph aria-hidden>
                <BellIcon />
              </NoticeGlyph>
              <NoticeLabel>Avisos</NoticeLabel>
              {unreadCount > 0 ? (
                <CountBadge key={unreadCount} aria-hidden>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </CountBadge>
              ) : null}
            </NoticeButton>
          </PopoverPrimitive.Trigger>
          <PopoverPrimitive.Portal>
            <Panel align="end" sideOffset={8} collisionPadding={8}>
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
              <Avatar name={userName} avatarKey={avatarKey} announceName={false} />
            </AccountButton>
          </DropdownMenuPrimitive.Trigger>
          <DropdownMenuPrimitive.Portal>
            <Menu align="end" sideOffset={8} collisionPadding={8}>
              <MenuLabel>{userName}</MenuLabel>
              {onLogout ? <MenuItem onSelect={onLogout}>Cerrar sesión</MenuItem> : null}
            </Menu>
          </DropdownMenuPrimitive.Portal>
        </DropdownMenuPrimitive.Root>
      </Tools>
    </Header>
  );
}

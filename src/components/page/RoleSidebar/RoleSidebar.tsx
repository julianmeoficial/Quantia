"use client";

import type { AvatarKey } from "@quantia/contracts";
import { LayoutGroup } from "motion/react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { useId, type ReactNode } from "react";

import { Avatar, Link } from "@/components/base";
import { transitions } from "@/lib/motion";

import * as S from "./RoleSidebar.styles";

export interface RoleNavItem {
  /** Section path, used to mark the active item. */
  href: string;
  /** Where the link goes when it differs from `href` (e.g. with `?projectId=`). */
  to?: string;
  label: string;
  icon?: ReactNode;
  /** Section still being built: shows a «Pronto» tag next to the label. */
  soon?: boolean;
  /** Unread counter (e.g. Chat). Announced in the link name; 0 hides it. */
  badge?: number;
}

export interface RoleSidebarProps {
  label?: string;
  items: RoleNavItem[];
  currentPath: string;
  profileName: string;
  /** Account profile avatar; falls back to initials when null. */
  avatarKey?: AvatarKey | null;
  variant?: "inline" | "drawer";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/** Section match: `/proyectos/123` keeps «Proyectos» selected. */
function isActiveHref(href: string, currentPath: string): boolean {
  return currentPath === href || currentPath.startsWith(`${href}/`);
}

function Navigation({
  label,
  items,
  currentPath,
  profileName,
  avatarKey = null,
  fill = false,
}: Required<Pick<RoleSidebarProps, "label" | "items" | "currentPath" | "profileName">> & {
  avatarKey?: AvatarKey | null;
  fill?: boolean;
}) {
  // One LayoutGroup per instance so the inline rail and the drawer never share the pill.
  const groupId = useId();
  return (
    <S.Shell aria-label={label} $fill={fill}>
      <LayoutGroup id={groupId}>
        <S.List>
          {items.map((item) => {
            const active = isActiveHref(item.href, currentPath);
            return (
              <S.Item key={item.href} $active={active}>
                {active ? (
                  <S.ActivePill layoutId="role-sidebar-active" transition={transitions.layout} />
                ) : null}
                <Link href={item.to ?? item.href} ariaCurrent={active ? "page" : undefined}>
                  {item.icon}
                  {item.label}
                  {item.soon ? <S.SoonTag>Pronto</S.SoonTag> : null}
                  {item.badge ? (
                    <S.NavBadge key={item.badge}>
                      <S.VisuallyHidden>, </S.VisuallyHidden>
                      {item.badge > 99 ? "99+" : item.badge}
                      <S.VisuallyHidden> sin leer</S.VisuallyHidden>
                    </S.NavBadge>
                  ) : null}
                </Link>
              </S.Item>
            );
          })}
        </S.List>
      </LayoutGroup>
      <S.Profile>
        <Avatar name={profileName} avatarKey={avatarKey} announceName={false} />
        <span>{profileName}</span>
      </S.Profile>
    </S.Shell>
  );
}

export function RoleSidebar({
  label = "Secciones",
  items,
  currentPath,
  profileName,
  avatarKey = null,
  variant = "inline",
  open = false,
  onOpenChange,
}: RoleSidebarProps) {
  if (variant === "drawer") {
    return (
      <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
        <DialogPrimitive.Portal>
          <S.Overlay />
          <S.Drawer>
            <S.DialogTitle>Secciones</S.DialogTitle>
            <S.DialogDescription>Navegación disponible para este rol.</S.DialogDescription>
            <Navigation
              label={label}
              items={items}
              currentPath={currentPath}
              profileName={profileName}
              avatarKey={avatarKey}
              fill
            />
          </S.Drawer>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    );
  }

  return (
    <Navigation
      label={label}
      items={items}
      currentPath={currentPath}
      profileName={profileName}
      avatarKey={avatarKey}
    />
  );
}

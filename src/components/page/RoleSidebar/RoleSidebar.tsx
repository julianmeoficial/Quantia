"use client";

import type { ReactNode } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";

import { Avatar, Link } from "@/components/base";

import * as S from "./RoleSidebar.styles";

export interface RoleNavItem {
  href: string;
  label: string;
  icon?: ReactNode;
}

export interface RoleSidebarProps {
  label?: string;
  items: RoleNavItem[];
  currentPath: string;
  profileName: string;
  variant?: "inline" | "drawer";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function Navigation({
  label,
  items,
  currentPath,
  profileName,
  fill = false,
}: Required<Pick<RoleSidebarProps, "label" | "items" | "currentPath" | "profileName">> & {
  fill?: boolean;
}) {
  return (
    <S.Shell aria-label={label} $fill={fill}>
      <S.List>
        {items.map((item) => (
          <S.Item key={item.href}>
            <Link href={item.href} ariaCurrent={item.href === currentPath ? "page" : undefined}>
              {item.icon}
              {item.label}
            </Link>
          </S.Item>
        ))}
      </S.List>
      <S.Profile>
        <Avatar name={profileName} announceName={false} />
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
              fill
            />
          </S.Drawer>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    );
  }

  return (
    <Navigation label={label} items={items} currentPath={currentPath} profileName={profileName} />
  );
}

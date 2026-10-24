"use client";

import type { ControlSize } from "@/components/base/shared/types";

import * as S from "./Avatar.styles";

export interface AvatarProps {
  name: string;
  src?: string;
  /** Override initials; never pass an email. */
  fallback?: string;
  size?: ControlSize;
  /** When true, image is announced; when name is shown beside, keep false. */
  announceName?: boolean;
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) {
    const first = parts[0] ?? "";
    return first.slice(0, 2).toUpperCase();
  }
  const first = parts[0]?.[0] ?? "";
  const last = parts[parts.length - 1]?.[0] ?? "";
  return `${first}${last}`.toUpperCase();
}

export function Avatar({ name, src, fallback, size = "md", announceName = true }: AvatarProps) {
  const initials = fallback ?? initialsFromName(name);

  return (
    <S.Root $size={size}>
      {src ? <S.Image src={src} alt={announceName ? name : ""} /> : null}
      {/* delayMs must stay 0 without src — a positive delay mismatches SSR/client HTML. */}
      <S.Fallback delayMs={0} aria-hidden={!announceName}>
        {initials}
      </S.Fallback>
    </S.Root>
  );
}

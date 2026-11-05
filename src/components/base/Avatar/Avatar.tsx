"use client";

import type { AvatarKey } from "@quantia/contracts";

import type { ControlSize } from "@/components/base/shared/types";

import * as S from "./Avatar.styles";
import { AvatarGlyph, avatarOption } from "./avatarArt";

export interface AvatarProps {
  name: string;
  src?: string;
  /** Override initials; never pass an email. */
  fallback?: string;
  size?: ControlSize;
  /** When true, image is announced; when name is shown beside, keep false. */
  announceName?: boolean;
  /**
   * Predefined Chat General avatar (`AVATAR_01`…`AVATAR_05`). The glyph is bundled by the
   * frontend; the catalog color from `@quantia/contracts` tints the ring. `null` → initials.
   */
  avatarKey?: AvatarKey | null;
}

/** Shared with account triggers so the aria-label includes visible initials (WCAG 2.5.3). */
export function initialsFromName(name: string): string {
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

export function Avatar({
  name,
  src,
  fallback,
  size = "md",
  announceName = true,
  avatarKey,
}: AvatarProps) {
  const initials = fallback ?? initialsFromName(name);
  const option = avatarKey ? avatarOption(avatarKey) : undefined;

  if (avatarKey && option) {
    return (
      <S.Art
        $size={size}
        $tint={option.color}
        role={announceName ? "img" : undefined}
        aria-label={announceName ? name : undefined}
        aria-hidden={announceName ? undefined : true}
        data-avatar={avatarKey}
      >
        <AvatarGlyph avatarKey={avatarKey} />
      </S.Art>
    );
  }

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

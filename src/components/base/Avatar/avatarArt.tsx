import { AVATAR_CATALOG, AvatarKey, type AvatarOption } from "@quantia/contracts";
import type { ReactNode } from "react";

/**
 * Original outline glyphs for the 5 predefined Chat General avatars (bundled by the
 * frontend as the API only stores the key). Same research-notebook family as the
 * product illustrations: rounded strokes, no fills, `currentColor` ink.
 */
const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const GLYPHS: Record<AvatarKey, ReactNode> = {
  [AvatarKey.AVATAR_01]: (
    <>
      <circle cx="12" cy="12" r="1.6" fill="currentColor" />
      <ellipse cx="12" cy="12" rx="8" ry="3.2" {...stroke} />
      <ellipse cx="12" cy="12" rx="8" ry="3.2" transform="rotate(60 12 12)" {...stroke} />
      <ellipse cx="12" cy="12" rx="8" ry="3.2" transform="rotate(-60 12 12)" {...stroke} />
    </>
  ),
  [AvatarKey.AVATAR_02]: (
    <>
      <path d="M9.5 4.5h3l-.5 3h-2z" {...stroke} />
      <path d="M11 7.5v4.2a2.3 2.3 0 0 0 2.3 2.3" {...stroke} />
      <path d="M13.5 9.2a5 5 0 0 1 1.9 8.3" {...stroke} />
      <path d="M6 19.5h12M8.5 17h5" {...stroke} />
    </>
  ),
  [AvatarKey.AVATAR_03]: (
    <>
      <path d="M5.5 18.5c0-7.5 5-12.5 13-13-.3 8-5.3 13-13 13Z" {...stroke} />
      <path d="M5.5 18.5 13 11" {...stroke} />
      <path d="M9.6 14.4h3.2M11.8 12.2V9.6" {...stroke} />
    </>
  ),
  [AvatarKey.AVATAR_04]: (
    <>
      <path d="M12 3.8c2.6 1.9 3.9 4.6 3.9 8v3.4h-7.8v-3.4c0-3.4 1.3-6.1 3.9-8Z" {...stroke} />
      <circle cx="12" cy="10" r="1.4" {...stroke} />
      <path d="m8.1 12.8-2.3 2.4v2.2l2.3-1.2M15.9 12.8l2.3 2.4v2.2l-2.3-1.2" {...stroke} />
      <path d="M10.6 18.2 12 20.4l1.4-2.2" {...stroke} />
    </>
  ),
  [AvatarKey.AVATAR_05]: (
    <>
      <path
        d="M8.4 14.6a5.2 5.2 0 1 1 7.2 0c-.8.8-1.2 1.6-1.2 2.6h-4.8c0-1-.4-1.8-1.2-2.6Z"
        {...stroke}
      />
      <path d="M9.8 19.6h4.4" {...stroke} />
      <path d="M12 9.3v3.2M10.6 11.2 12 12.5l1.4-1.3" {...stroke} />
    </>
  ),
};

const BY_KEY = new Map<AvatarKey, AvatarOption>(
  AVATAR_CATALOG.map((option) => [option.key, option]),
);

/** Catalog entry (label + suggested color) shipped in `@quantia/contracts`. */
export function avatarOption(key: AvatarKey): AvatarOption | undefined {
  return BY_KEY.get(key);
}

export function AvatarGlyph({ avatarKey }: { avatarKey: AvatarKey }) {
  return (
    <svg viewBox="0 0 24 24" width="62%" height="62%" aria-hidden focusable="false">
      {GLYPHS[avatarKey]}
    </svg>
  );
}

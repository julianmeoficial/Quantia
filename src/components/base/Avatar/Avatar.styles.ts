import { Avatar as AvatarPrimitive } from "radix-ui";
import styled from "styled-components";

import type { ControlSize } from "@/components/base/shared/types";

export const Root = styled(AvatarPrimitive.Root)<{ $size: ControlSize }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
  overflow: hidden;
  user-select: none;
  width: ${({ theme, $size }) =>
    $size === "lg" ? `calc(${theme.space[32]} + ${theme.space[8]})` : theme.space[32]};
  height: ${({ theme, $size }) =>
    $size === "lg" ? `calc(${theme.space[32]} + ${theme.space[8]})` : theme.space[32]};
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.selection.bg};
  color: ${({ theme }) => theme.colors.selection.text};
  font-size: ${({ theme, $size }) =>
    $size === "lg" ? theme.typography.label.fontSize : theme.typography.caption.fontSize};
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;

export const Image = styled(AvatarPrimitive.Image)`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: inherit;
`;

export const Fallback = styled(AvatarPrimitive.Fallback)`
  width: 100%;
  height: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

/**
 * Predefined avatar: soft tinted disc + outline glyph. `$tint` is the catalog color shipped
 * in `@quantia/contracts` (data, not a hardcoded token); it is mixed with theme surfaces so
 * the disc adapts to light/dark without per-component dark styles.
 */
export const Art = styled.span<{ $size: ControlSize; $tint: string }>`
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
  width: ${({ theme, $size }) =>
    $size === "lg" ? `calc(${theme.space[32]} + ${theme.space[8]})` : theme.space[32]};
  height: ${({ theme, $size }) =>
    $size === "lg" ? `calc(${theme.space[32]} + ${theme.space[8]})` : theme.space[32]};
  border-radius: ${({ theme }) => theme.radii.full};
  background: color-mix(
    in srgb,
    ${({ $tint }) => $tint} 16%,
    ${({ theme }) => theme.colors.bg.surface}
  );
  box-shadow: inset 0 0 0 ${({ theme }) => theme.borderWidths.thin}
    color-mix(in srgb, ${({ $tint }) => $tint} 45%, transparent);
  color: color-mix(
    in srgb,
    ${({ $tint }) => $tint} 80%,
    ${({ theme }) => theme.colors.text.primary}
  );
  user-select: none;
`;

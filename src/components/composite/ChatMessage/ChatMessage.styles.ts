import { motion } from "motion/react";
import styled, { css } from "styled-components";

import { focusRing } from "@/components/base/shared/focus";

import type { ChatGroupPosition } from "./ChatMessage";

type Own = { $own: boolean };

export const Root = styled(motion.article)<Own & { $group: ChatGroupPosition }>`
  position: relative;
  display: flex;
  flex-direction: ${({ $own }) => ($own ? "row-reverse" : "row")};
  align-items: flex-end;
  gap: ${({ theme }) => theme.space[8]};
  padding-top: ${({ theme, $group }) =>
    $group === "first" || $group === "single" ? theme.space[8] : "0"};
`;

export const AvatarSlot = styled.div`
  flex: none;
  width: ${({ theme }) => theme.space[32]};
  align-self: flex-start;
  padding-top: ${({ theme }) => theme.space[24]};
`;

export const Body = styled.div<Own>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[4]};
  min-width: 0;
  max-width: min(100%, 40rem);
  align-items: ${({ $own }) => ($own ? "flex-end" : "flex-start")};
`;

export const Author = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.label.fontSize};
  line-height: ${({ theme }) => theme.typography.label.lineHeight};
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
  padding-inline: ${({ theme }) => theme.space[4]};
`;

export const BubbleRow = styled.div<Own>`
  position: relative;
  display: flex;
  flex-direction: ${({ $own }) => ($own ? "row-reverse" : "row")};
  align-items: center;
  gap: ${({ theme }) => theme.space[4]};
  min-width: 0;
  max-width: 100%;
`;

const groupedCorners = (group: ChatGroupPosition, own: boolean) => {
  // The corner next to the avatar side tightens inside a group (Telegram-like stacks).
  const side = own ? "right" : "left";
  const tight = (corner: "top" | "bottom") => css`
    border-${corner}-${side}-radius: ${({ theme }) => theme.radii.control};
  `;
  if (group === "first") return tight("bottom");
  if (group === "middle")
    return css`
      ${tight("top")}${tight("bottom")}
    `;
  if (group === "last") return tight("top");
  return css``;
};

export const Bubble = styled.div<
  Own & { $group: ChatGroupPosition; $editing: boolean; $sending: boolean }
>`
  position: relative;
  min-width: 0;
  max-width: 100%;
  padding: ${({ theme }) => theme.space[8]} ${({ theme }) => theme.space[12]};
  border-radius: ${({ theme }) => theme.radii.featured};
  ${({ $group, $own }) => groupedCorners($group, $own)}
  background: ${({ theme, $own }) => ($own ? theme.colors.selection.bg : theme.colors.bg.subtle)};
  color: ${({ theme }) => theme.colors.text.primary};
  box-shadow: ${({ theme, $editing }) =>
    $editing ? `0 0 0 ${theme.borderWidths.thick} ${theme.colors.focus.ring}` : "none"};
  opacity: ${({ $sending }) => ($sending ? 0.72 : 1)};
  overflow: hidden;
  transition: opacity ${({ theme }) => theme.motion.duration.base}
    ${({ theme }) => theme.motion.easing.standard};
`;

/** Locate highlight (quote jump): opacity-only overlay, 1–2 s, no layout change. */
export const Highlight = styled(motion.span)`
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: ${({ theme }) => theme.colors.status.info.bg};
  box-shadow: inset 0 0 0 ${({ theme }) => theme.borderWidths.thick}
    ${({ theme }) => theme.colors.status.info.icon};
  pointer-events: none;
`;

export const Quote = styled.button<Own>`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0;
  width: 100%;
  margin-bottom: ${({ theme }) => theme.space[4]};
  padding: ${({ theme }) => theme.space[4]} ${({ theme }) => theme.space[8]};
  border: 0;
  border-left: ${({ theme }) => theme.borderWidths.thick} solid
    ${({ theme }) => theme.colors.brand.primary};
  border-radius: ${({ theme }) => theme.radii.control};
  background: ${({ theme }) => theme.colors.bg.surface};
  text-align: left;
  cursor: pointer;
  ${focusRing}

  &:disabled {
    cursor: default;
  }
`;

export const QuoteAuthor = styled.span`
  color: ${({ theme }) => theme.colors.brand.primary};
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  line-height: ${({ theme }) => theme.typography.caption.lineHeight};
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;

export const QuoteText = styled.span<{ $deleted: boolean }>`
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.bodySmall.fontSize};
  line-height: ${({ theme }) => theme.typography.bodySmall.lineHeight};
  font-style: ${({ $deleted }) => ($deleted ? "italic" : "normal")};
`;

export const Content = styled(motion.p)`
  position: relative;
  margin: 0;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
  line-height: ${({ theme }) => theme.typography.bodyMedium.lineHeight};
`;

export const Meta = styled.span<Own>`
  position: relative;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: ${({ theme }) => theme.space[4]};
  margin-top: ${({ theme }) => theme.space[4]};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  line-height: ${({ theme }) => theme.typography.caption.lineHeight};
  font-variant-numeric: tabular-nums;
`;

export const Edited = styled.span`
  font-style: italic;
`;

export const Time = styled.time``;

export const Delivery = styled.span<{ $seen: boolean }>`
  display: inline-flex;
  align-items: center;
  color: ${({ theme, $seen }) => ($seen ? theme.colors.brand.primary : theme.colors.text.secondary)};
  font-size: ${({ theme }) => theme.typography.bodySmall.fontSize};
  transition: color ${({ theme }) => theme.motion.duration.base}
    ${({ theme }) => theme.motion.easing.standard};
`;

/**
 * Message actions float over the bubble's top corner instead of sitting beside it, so they
 * never steal width on narrow screens. Mouse/trackpad: revealed by hover or keyboard focus.
 * Touch: revealed by tapping the message (`data-actions="open"`); hover never sticks.
 */
export const Toolbar = styled.div<Own>`
  position: absolute;
  top: 0;
  ${({ $own }) => ($own ? "right" : "left")}: ${({ theme }) => theme.space[8]};
  z-index: ${({ theme }) => theme.zIndices.sticky};
  display: flex;
  align-items: center;
  padding: ${({ theme }) => theme.space[4]};
  border: ${({ theme }) => theme.borderWidths.thin} solid
    ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.bg.surface};
  box-shadow: ${({ theme }) => theme.elevation.sm};
  opacity: 0;
  transform: translateY(-40%) scale(0.96);
  pointer-events: none;
  transition:
    opacity ${({ theme }) => theme.motion.duration.fast}
      ${({ theme }) => theme.motion.easing.standard},
    transform ${({ theme }) => theme.motion.duration.fast}
      ${({ theme }) => theme.motion.easing.standard};

  ${Root}:focus-within &,
  ${Root}[data-actions="open"] & {
    opacity: 1;
    transform: translateY(-50%) scale(1);
    pointer-events: auto;
  }

  @media (hover: hover) {
    ${Root}:hover & {
      opacity: 1;
      transform: translateY(-50%) scale(1);
      pointer-events: auto;
    }
  }

  ${({ theme }) => theme.media.reducedMotion} {
    transform: translateY(-50%);
  }
`;

/** Reply glyph revealed behind the message while swiping on touch. */
export const SwipeHint = styled(motion.span)`
  position: absolute;
  top: 50%;
  right: ${({ theme }) => theme.space[8]};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${({ theme }) => theme.space[32]};
  height: ${({ theme }) => theme.space[32]};
  margin-top: -${({ theme }) => theme.space[16]};
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.selection.bg};
  color: ${({ theme }) => theme.colors.brand.primary};
  pointer-events: none;
`;

export const Tray = styled(motion.div)<Own>`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.space[4]};
  padding: ${({ theme }) => theme.space[4]};
  border: ${({ theme }) => theme.borderWidths.thin} solid
    ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.bg.surface};
  box-shadow: ${({ theme }) => theme.elevation.md};
  transform-origin: ${({ $own }) => ($own ? "top right" : "top left")};
`;

export const TrayEmoji = styled(motion.button)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${({ theme }) => theme.sizes.touchTarget};
  height: ${({ theme }) => theme.sizes.touchTarget};
  border: 0;
  border-radius: ${({ theme }) => theme.radii.full};
  background: transparent;
  font-size: ${({ theme }) => theme.typography.headingSmall.fontSize};
  line-height: 1;
  cursor: pointer;
  ${focusRing}

  &:hover,
  &[aria-pressed="true"] {
    background: ${({ theme }) => theme.colors.selection.bg};
  }
`;

export const Reactions = styled.div<Own>`
  display: flex;
  flex-wrap: wrap;
  justify-content: ${({ $own }) => ($own ? "flex-end" : "flex-start")};
  gap: ${({ theme }) => theme.space[4]};
`;

export const Chip = styled(motion.button)<{ $mine: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.space[4]};
  min-height: ${({ theme }) => theme.space[32]};
  padding: 0 ${({ theme }) => theme.space[8]};
  border: ${({ theme }) => theme.borderWidths.thin} solid
    ${({ theme, $mine }) => ($mine ? theme.colors.brand.primary : theme.colors.border.subtle)};
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme, $mine }) => ($mine ? theme.colors.selection.bg : theme.colors.bg.surface)};
  color: ${({ theme, $mine }) => ($mine ? theme.colors.selection.text : theme.colors.text.primary)};
  font-size: ${({ theme }) => theme.typography.bodySmall.fontSize};
  line-height: ${({ theme }) => theme.typography.bodySmall.lineHeight};
  font-variant-numeric: tabular-nums;
  cursor: pointer;
  ${focusRing}

  &:disabled {
    cursor: default;
  }

  /* Expand the hit area to 44 px without changing the visual chip. */
  position: relative;
  &::after {
    content: "";
    position: absolute;
    inset: -${({ theme }) => theme.space[8]} -${({ theme }) => theme.space[4]};
  }
`;

export const ChipCount = styled.span`
  position: relative;
  display: inline-flex;
  overflow: hidden;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;

export const FailedRow = styled.div<Own>`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: ${({ $own }) => ($own ? "flex-end" : "flex-start")};
  gap: ${({ theme }) => theme.space[4]};
`;

export const FailedText = styled.span`
  color: ${({ theme }) => theme.colors.status.error.text};
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  line-height: ${({ theme }) => theme.typography.caption.lineHeight};
`;

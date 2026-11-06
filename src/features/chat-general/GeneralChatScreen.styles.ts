import { motion } from "motion/react";
import styled from "styled-components";

import { focusRing } from "@/components/base/shared/focus";

export const Screen = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[8]};
  flex: 1;
  min-height: 0;
  /* The shell is locked to the viewport on this route: the log scrolls, never the page. */
  height: 100%;
  /* Small enough to fit above an open phone keyboard (layout viewport shrinks). */
  min-height: calc(${({ theme }) => theme.space[64]} * 4);

  ${({ theme }) => theme.media.up("md")} {
    gap: ${({ theme }) => theme.space[16]};
  }
`;

/** Phones: one compact row (title + presence + avatar). Desktop: title, lead and actions. */
export const Header = styled.header`
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.space[8]};
  min-width: 0;

  h1 {
    overflow: hidden;
    font-size: ${({ theme }) => theme.typography.headingSmall.fontSize};
    line-height: ${({ theme }) => theme.typography.headingSmall.lineHeight};
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  ${({ theme }) => theme.media.up("md")} {
    flex-wrap: wrap;
    align-items: flex-end;
    gap: ${({ theme }) => theme.space[12]};

    h1 {
      font-size: ${({ theme }) => theme.typography.headingLarge.fontSize};
      line-height: ${({ theme }) => theme.typography.headingLarge.lineHeight};
      white-space: normal;
    }
  }
`;

export const HideOnPhone = styled.span`
  display: none;

  ${({ theme }) => theme.media.up("md")} {
    display: inline;
  }
`;

export const HeaderText = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[4]};
  min-width: 0;
`;

export const Lead = styled.p`
  display: none;
  margin: 0;

  ${({ theme }) => theme.media.up("md")} {
    display: block;
  }

  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
  line-height: ${({ theme }) => theme.typography.bodyMedium.lineHeight};
`;

export const HeaderActions = styled.div`
  display: flex;
  flex: none;
  flex-wrap: nowrap;
  align-items: center;
  gap: ${({ theme }) => theme.space[8]};
`;

export const Faces = styled.span`
  display: inline-flex;
  align-items: center;

  & > * + * {
    margin-left: -${({ theme }) => theme.space[8]};
  }
`;

export const FaceRing = styled(motion.span)`
  display: inline-flex;
  border-radius: ${({ theme }) => theme.radii.full};
  box-shadow: 0 0 0 ${({ theme }) => theme.borderWidths.thick}
    ${({ theme }) => theme.colors.bg.canvas};
`;

export const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: ${({ theme }) => theme.space[16]};
  min-height: 0;
  flex: 1;

  ${({ theme }) => theme.media.up("lg")} {
    grid-template-columns: minmax(0, 1fr) calc(${({ theme }) => theme.space[64]} * 4);
  }
`;

/** Phones: edge to edge, no card (every pixel goes to the conversation). `md`+: a card. */
export const Panel = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 0;
  flex: 1;
  margin: 0 calc(${({ theme }) => theme.space[16]} * -1)
    calc(${({ theme }) => theme.space[16]} * -1);
  background: ${({ theme }) => theme.colors.bg.surface};
  border-top: ${({ theme }) => theme.borderWidths.thin} solid
    ${({ theme }) => theme.colors.border.subtle};
  overflow: hidden;

  ${({ theme }) => theme.media.up("md")} {
    margin: 0;
    border: ${({ theme }) => theme.borderWidths.thin} solid
      ${({ theme }) => theme.colors.border.subtle};
    border-radius: ${({ theme }) => theme.radii.featured};
  }
`;

/** Messages + typing + «new messages» pill; the pill floats above the composer, never on it. */
export const LogArea = styled.div`
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
`;

export const Rail = styled.aside`
  display: none;
  min-height: 0;
  padding: ${({ theme }) => theme.space[16]};
  background: ${({ theme }) => theme.colors.bg.surface};
  border: ${({ theme }) => theme.borderWidths.thin} solid
    ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radii.featured};
  overflow: auto;

  ${({ theme }) => theme.media.up("lg")} {
    display: block;
  }
`;

export const CompactOnly = styled.div`
  display: inline-flex;

  ${({ theme }) => theme.media.up("lg")} {
    display: none;
  }
`;

export const Scroller = styled.div`
  position: relative;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  /* Never chain the scroll to the page; block the Mac two-finger "back" swipe over messages. */
  overscroll-behavior-y: contain;
  overscroll-behavior-x: none;
  /* Vertical pan belongs to the list; horizontal drags are reserved for swipe-to-reply. */
  touch-action: pan-y;
  -webkit-overflow-scrolling: touch;
  scroll-behavior: auto;
  overflow-anchor: none;
  scrollbar-gutter: stable;
  padding: ${({ theme }) => theme.space[8]} ${({ theme }) => theme.space[16]}
    ${({ theme }) => theme.space[16]};
  ${focusRing}
`;

export const Rows = styled.ol`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[4]};
  margin: 0;
  padding: 0;
  list-style: none;
`;

export const Row = styled(motion.li)`
  list-style: none;
  transform-origin: bottom left;

  &[data-own="true"] {
    transform-origin: bottom right;
  }
`;

export const DaySeparator = styled.li`
  position: sticky;
  top: 0;
  z-index: ${({ theme }) => theme.zIndices.sticky};
  display: flex;
  justify-content: center;
  padding: ${({ theme }) => theme.space[8]} 0;
  pointer-events: none;
`;

export const DayLabel = styled.span`
  padding: ${({ theme }) => theme.space[4]} ${({ theme }) => theme.space[12]};
  border: ${({ theme }) => theme.borderWidths.thin} solid
    ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.bg.surface};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  line-height: ${({ theme }) => theme.typography.caption.lineHeight};
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
  box-shadow: ${({ theme }) => theme.elevation.sm};
`;

export const UnreadDivider = styled(motion.li)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space[12]};
  padding: ${({ theme }) => theme.space[8]} 0;
  color: ${({ theme }) => theme.colors.brand.primary};
  font-size: ${({ theme }) => theme.typography.label.fontSize};
  line-height: ${({ theme }) => theme.typography.label.lineHeight};
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
  transform-origin: center;

  &::before,
  &::after {
    content: "";
    flex: 1;
    height: ${({ theme }) => theme.borderWidths.thin};
    background: ${({ theme }) => theme.colors.brand.primary};
    opacity: 0.4;
  }
`;

export const OlderStatus = styled.li`
  display: flex;
  justify-content: center;
  padding: ${({ theme }) => theme.space[8]} 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  line-height: ${({ theme }) => theme.typography.caption.lineHeight};
`;

export const Sentinel = styled.li`
  height: ${({ theme }) => theme.borderWidths.thin};
`;

export const EmptyWrap = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.space[24]};
`;

export const ComposerSlot = styled.div`
  display: flex;
  flex: none;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[4]};

  ${({ theme }) => theme.media.up("md")} {
    padding: 0 ${({ theme }) => theme.space[12]} ${({ theme }) => theme.space[12]};
  }
`;

export const Notice = styled(motion.div)<{ $tone: "error" | "info" }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.space[8]};
  padding: ${({ theme }) => theme.space[4]} ${({ theme }) => theme.space[4]}
    ${({ theme }) => theme.space[4]} ${({ theme }) => theme.space[12]};
  border-radius: ${({ theme }) => theme.radii.control};
  background: ${({ theme, $tone }) =>
    $tone === "error" ? theme.colors.status.error.bg : theme.colors.status.info.bg};
  color: ${({ theme, $tone }) =>
    $tone === "error" ? theme.colors.status.error.text : theme.colors.status.info.text};
  font-size: ${({ theme }) => theme.typography.bodySmall.fontSize};
  line-height: ${({ theme }) => theme.typography.bodySmall.lineHeight};
`;

export const PillSlot = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: ${({ theme }) => theme.space[12]};
  z-index: ${({ theme }) => theme.zIndices.sticky};
  display: flex;
  justify-content: center;
  pointer-events: none;
`;

export const NewMessagesPill = styled(motion.button)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.space[8]};
  min-height: ${({ theme }) => theme.sizes.touchTarget};
  padding: 0 ${({ theme }) => theme.space[16]};
  border: ${({ theme }) => theme.borderWidths.thin} solid
    ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.bg.surface};
  color: ${({ theme }) => theme.colors.text.primary};
  box-shadow: ${({ theme }) => theme.elevation.md};
  font-size: ${({ theme }) => theme.typography.label.fontSize};
  line-height: ${({ theme }) => theme.typography.label.lineHeight};
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
  cursor: pointer;
  pointer-events: auto;
  ${focusRing}
`;

export const PillCount = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: ${({ theme }) => theme.space[24]};
  height: ${({ theme }) => theme.space[24]};
  padding: 0 ${({ theme }) => theme.space[4]};
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.brand.primary};
  color: ${({ theme }) => theme.colors.brand.onPrimary};
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  font-variant-numeric: tabular-nums;
`;

export const LiveRegion = styled.div`
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

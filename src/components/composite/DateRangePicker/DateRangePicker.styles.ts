import { Popover as PopoverPrimitive } from "radix-ui";
import styled, { keyframes } from "styled-components";

import { focusRing } from "@/components/base/shared/focus";

export const Root = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[8]};
`;

export const Label = styled.span`
  font-size: ${({ theme }) => theme.typography.label.fontSize};
  line-height: ${({ theme }) => theme.typography.label.lineHeight};
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const Trigger = styled(PopoverPrimitive.Trigger)`
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.space[8]};
  min-height: ${({ theme }) => theme.sizes.control};
  padding: 0 ${({ theme }) => theme.space[12]};
  border: ${({ theme }) => theme.borderWidths.thin} solid
    ${({ theme }) => theme.colors.border.control};
  border-radius: ${({ theme }) => theme.radii.control};
  background: ${({ theme }) => theme.colors.bg.surface};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
  text-align: left;
  cursor: pointer;
  ${focusRing}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const rise = keyframes`
  from {
    opacity: 0;
    transform: translateY(-0.25rem) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

/** Above the Sheet/Dialog (modal) so the calendar never opens behind a form panel. */
export const Panel = styled(PopoverPrimitive.Content)`
  z-index: ${({ theme }) => theme.zIndices.dropdown};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[16]};
  box-sizing: border-box;
  width: 19rem;
  max-width: calc(100vw - ${({ theme }) => theme.space[32]});
  max-height: var(--radix-popover-content-available-height);
  overflow-y: auto;
  padding: ${({ theme }) => theme.space[16]};
  background: ${({ theme }) => theme.colors.bg.surface};
  border: ${({ theme }) => theme.borderWidths.thin} solid
    ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radii.card};
  box-shadow: ${({ theme }) => theme.elevation.md};
  transform-origin: var(--radix-popover-content-transform-origin);

  &[data-state="open"] {
    animation: ${rise} ${({ theme }) => theme.motion.duration.fast}
      ${({ theme }) => theme.motion.easing.standard};
  }

  ${({ theme }) => theme.media.reducedMotion} {
    &[data-state="open"] {
      animation: none;
    }
  }
`;

export const MonthBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.space[8]};
`;

export const MonthLabel = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.bodyStrong.fontSize};
  font-weight: ${({ theme }) => theme.typography.bodyStrong.fontWeight};
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: ${({ theme }) => theme.space[4]};
`;

export const Weekday = styled.span`
  text-align: center;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  line-height: ${({ theme }) => theme.typography.caption.lineHeight};
`;

export const Day = styled.button<{ $inRange?: boolean }>`
  min-height: ${({ theme }) => theme.sizes.control};
  border: ${({ theme }) => theme.borderWidths.thin} solid transparent;
  border-radius: ${({ theme }) => theme.radii.control};
  background: ${({ theme, $inRange }) => ($inRange ? theme.colors.bg.subtle : "transparent")};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  ${focusRing}

  &:disabled {
    color: ${({ theme }) => theme.colors.text.secondary};
    background: ${({ theme }) => theme.colors.bg.subtle};
    cursor: not-allowed;
  }

  @media (hover: hover) {
    &:hover:not(:disabled):not([aria-pressed="true"]) {
      background: ${({ theme }) => theme.colors.selection.bg};
    }
  }

  /* Today: an outline, so it stays visible without being mistaken for the selection. */
  &[aria-current="date"]:not([aria-pressed="true"]) {
    border-color: ${({ theme }) => theme.colors.brand.primary};
    font-weight: ${({ theme }) => theme.typography.label.fontWeight};
  }

  &[aria-pressed="true"] {
    background: ${({ theme }) => theme.colors.brand.primary};
    color: ${({ theme }) => theme.colors.brand.onPrimary};
  }
`;

export const Fields = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.space[12]};
`;

export const ErrorText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.status.error.text};
  font-size: ${({ theme }) => theme.typography.bodySmall.fontSize};
`;

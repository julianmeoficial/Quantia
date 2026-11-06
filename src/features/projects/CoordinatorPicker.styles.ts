import { Popover as PopoverPrimitive } from "radix-ui";
import styled, { keyframes } from "styled-components";

import { focusRing } from "@/components/base/shared/focus";

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

export const Root = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[8]};
`;

export const Label = styled.span`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.label.fontSize};
  line-height: ${({ theme }) => theme.typography.label.lineHeight};
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;

export const Trigger = styled(PopoverPrimitive.Trigger)<{ $invalid?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.space[8]};
  width: 100%;
  min-height: ${({ theme }) => theme.sizes.control};
  padding: 0 ${({ theme }) => theme.space[12]};
  border: ${({ theme }) => theme.borderWidths.thin} solid
    ${({ theme, $invalid }) =>
      $invalid ? theme.colors.status.error.icon : theme.colors.border.control};
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

export const TriggerText = styled.span`
  display: flex;
  flex-direction: column;
  min-width: 0;

  strong,
  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  span {
    color: ${({ theme }) => theme.colors.text.secondary};
    font-size: ${({ theme }) => theme.typography.bodySmall.fontSize};
  }
`;

export const Placeholder = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const Chevron = styled.span`
  display: inline-flex;
  flex: none;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

/** Above the Sheet (modal) so the list never opens behind the form panel. */
export const Panel = styled(PopoverPrimitive.Content)`
  z-index: ${({ theme }) => theme.zIndices.dropdown};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[12]};
  width: var(--radix-popover-trigger-width);
  min-width: 16rem;
  max-width: calc(100vw - ${({ theme }) => theme.space[32]});
  max-height: min(24rem, var(--radix-popover-content-available-height));
  padding: ${({ theme }) => theme.space[12]};
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

export const List = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[4]};
  margin: 0;
  padding: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  list-style: none;
`;

export const Option = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.space[8]};
  width: 100%;
  min-height: ${({ theme }) => theme.sizes.control};
  padding: ${({ theme }) => theme.space[8]} ${({ theme }) => theme.space[12]};
  border: 0;
  border-radius: ${({ theme }) => theme.radii.control};
  background: transparent;
  color: ${({ theme }) => theme.colors.text.primary};
  font: inherit;
  text-align: left;
  cursor: pointer;
  ${focusRing}

  @media (hover: hover) {
    &:hover {
      background: ${({ theme }) => theme.colors.bg.subtle};
    }
  }

  &[aria-selected="true"] {
    background: ${({ theme }) => theme.colors.selection.bg};
  }
`;

export const Hint = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.bodySmall.fontSize};
`;

export const ErrorText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.status.error.text};
  font-size: ${({ theme }) => theme.typography.bodySmall.fontSize};
`;

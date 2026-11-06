import { DropdownMenu } from "radix-ui";
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

export const Trigger = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.space[4]};
  min-height: ${({ theme }) => theme.sizes.control};
  padding: 0 ${({ theme }) => theme.space[4]};
  border: 0;
  border-radius: ${({ theme }) => theme.radii.full};
  background: transparent;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  ${focusRing}

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.bg.subtle};
  }

  &:disabled {
    cursor: progress;
    opacity: 0.7;
  }
`;

export const Chevron = styled.span`
  display: inline-flex;
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
`;

export const Content = styled(DropdownMenu.Content)`
  z-index: ${({ theme }) => theme.zIndices.dropdown};
  min-width: 11rem;
  padding: ${({ theme }) => theme.space[4]};
  border: ${({ theme }) => theme.borderWidths.thin} solid
    ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radii.card};
  background: ${({ theme }) => theme.colors.bg.surface};
  box-shadow: ${({ theme }) => theme.elevation.sm};
  transform-origin: var(--radix-dropdown-menu-content-transform-origin);

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

export const Item = styled(DropdownMenu.Item)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space[8]};
  min-height: ${({ theme }) => theme.sizes.control};
  padding: 0 ${({ theme }) => theme.space[12]};
  border-radius: ${({ theme }) => theme.radii.control};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
  cursor: pointer;
  outline: none;

  &[data-highlighted] {
    background: ${({ theme }) => theme.colors.bg.subtle};
  }

  &[data-disabled] {
    color: ${({ theme }) => theme.colors.text.secondary};
    cursor: default;
  }
`;

export const ItemIcon = styled.span`
  display: inline-flex;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const Check = styled.span`
  display: inline-flex;
  margin-left: auto;
  color: ${({ theme }) => theme.colors.brand.primary};
`;

export const Settle = styled.span`
  display: inline-flex;
  transform-origin: center;
`;

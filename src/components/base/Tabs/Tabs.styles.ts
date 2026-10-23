import { Tabs as TabsPrimitive } from "radix-ui";
import styled from "styled-components";

import { focusRing } from "@/components/base/shared/focus";

export const Root = styled(TabsPrimitive.Root)`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[24]};
  width: 100%;
`;

export const List = styled(TabsPrimitive.List)`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.space[24]};
  border-bottom: ${({ theme }) => theme.borderWidths.thin} solid
    ${({ theme }) => theme.colors.border.subtle};
`;

export const Trigger = styled(TabsPrimitive.Trigger)`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: ${({ theme }) => theme.sizes.touchTarget};
  padding: ${({ theme }) => `${theme.space[8]} 0`};
  margin-bottom: calc(-1 * ${({ theme }) => theme.borderWidths.thin});
  border: 0;
  border-bottom: ${({ theme }) => theme.borderWidths.thick} solid transparent;
  background: transparent;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-family: ${({ theme }) => theme.fonts.sans};
  font-size: ${({ theme }) => theme.typography.label.fontSize};
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
  line-height: ${({ theme }) => theme.typography.label.lineHeight};
  cursor: pointer;
  transition:
    color ${({ theme }) => theme.motion.duration.fast}
      ${({ theme }) => theme.motion.easing.standard},
    border-color ${({ theme }) => theme.motion.duration.fast}
      ${({ theme }) => theme.motion.easing.standard},
    opacity ${({ theme }) => theme.motion.duration.fast}
      ${({ theme }) => theme.motion.easing.standard};

  ${focusRing}

  &:hover:not([data-disabled]):not([data-state="active"]) {
    color: ${({ theme }) => theme.colors.text.primary};
  }

  &[data-state="active"] {
    color: ${({ theme }) => theme.colors.brand.primary};
    border-bottom-color: ${({ theme }) => theme.colors.brand.primary};
  }

  &[data-disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

export const Content = styled(TabsPrimitive.Content)`
  outline: none;

  ${focusRing}

  &[data-state="inactive"] {
    display: none;
  }
`;

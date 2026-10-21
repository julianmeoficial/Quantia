import { Switch as SwitchPrimitive } from "radix-ui";
import styled from "styled-components";

import { focusRing } from "@/components/base/shared/focus";

export const Root = styled.label`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.space[12]};
  min-height: ${({ theme }) => theme.sizes.control};
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};

  &[data-disabled="true"] {
    color: ${({ theme }) => theme.colors.text.secondary};
    cursor: not-allowed;
  }
`;

export const Control = styled(SwitchPrimitive.Root)`
  all: unset;
  box-sizing: border-box;
  width: ${({ theme }) => theme.space[48]};
  height: ${({ theme }) => theme.space[24]};
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.border.control};
  position: relative;
  flex-shrink: 0;

  &[data-state="checked"] {
    background: ${({ theme }) => theme.colors.brand.primary};
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.bg.subtle};
  }

  ${focusRing}
`;

export const Thumb = styled(SwitchPrimitive.Thumb)`
  display: block;
  width: ${({ theme }) => theme.space[16]};
  height: ${({ theme }) => theme.space[16]};
  background: ${({ theme }) => theme.colors.bg.surface};
  border-radius: ${({ theme }) => theme.radii.full};
  transform: translateX(${({ theme }) => theme.space[4]});
  transition: transform ${({ theme }) => theme.motion.duration.fast}
    ${({ theme }) => theme.motion.easing.standard};
  will-change: transform;

  &[data-state="checked"] {
    transform: translateX(${({ theme }) => theme.space[24]});
  }

  ${({ theme }) => theme.media.reducedMotion} {
    transition: none;
  }
`;

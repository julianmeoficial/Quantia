import styled, { css } from "styled-components";

import { focusRing } from "@/components/base/shared/focus";
import type { ButtonIntent, ControlSize } from "@/components/base/shared/types";

export const Root = styled.button<{
  $intent: ButtonIntent;
  $size: ControlSize;
  $isLoading: boolean;
}>`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.space[8]};
  min-height: ${({ theme, $size }) => ($size === "lg" ? theme.space[48] : theme.sizes.control)};
  min-width: ${({ theme, $size }) => ($size === "lg" ? theme.space[48] : theme.sizes.control)};
  padding-inline: ${({ theme, $size }) => ($size === "lg" ? theme.space[24] : theme.space[16])};
  border-radius: ${({ theme }) => theme.radii.control};
  border: ${({ theme }) => theme.borderWidths.thin} solid transparent;
  font-family: ${({ theme }) => theme.fonts.sans};
  font-size: ${({ theme }) => theme.typography.button.fontSize};
  line-height: ${({ theme }) => theme.typography.button.lineHeight};
  font-weight: ${({ theme }) => theme.typography.button.fontWeight};
  cursor: pointer;
  transition:
    background-color ${({ theme }) => theme.motion.duration.fast}
      ${({ theme }) => theme.motion.easing.standard},
    border-color ${({ theme }) => theme.motion.duration.fast}
      ${({ theme }) => theme.motion.easing.standard},
    color ${({ theme }) => theme.motion.duration.fast}
      ${({ theme }) => theme.motion.easing.standard},
    transform ${({ theme }) => theme.motion.duration.fast}
      ${({ theme }) => theme.motion.easing.standard};

  ${({ $intent }) => intentStyles[$intent]}

  ${focusRing}

  &:active:not(:disabled) {
    transform: translateY(0.0625rem);
  }

  &:disabled {
    cursor: not-allowed;
    background: ${({ theme }) => theme.colors.bg.subtle};
    color: ${({ theme }) => theme.colors.text.secondary};
    border-color: ${({ theme }) => theme.colors.border.subtle};
  }

  ${({ $isLoading }) =>
    $isLoading &&
    css`
      cursor: progress;
      pointer-events: none;
    `}

  ${({ theme }) => theme.media.reducedMotion} {
    transition: none;

    &:active:not(:disabled) {
      transform: none;
    }
  }
`;

const intentStyles = {
  primary: css`
    background: ${({ theme }) => theme.colors.brand.primary};
    color: ${({ theme }) => theme.colors.brand.onPrimary};

    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.brand.hover};
    }

    &:active:not(:disabled) {
      background: ${({ theme }) => theme.colors.brand.pressed};
    }
  `,
  secondary: css`
    background: ${({ theme }) => theme.colors.bg.surface};
    color: ${({ theme }) => theme.colors.text.primary};
    border-color: ${({ theme }) => theme.colors.border.control};

    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.bg.subtle};
      border-color: ${({ theme }) => theme.colors.brand.primary};
    }

    &:active:not(:disabled) {
      background: ${({ theme }) => theme.colors.selection.bg};
    }
  `,
  ghost: css`
    background: transparent;
    color: ${({ theme }) => theme.colors.text.primary};

    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.bg.subtle};
    }

    &:active:not(:disabled) {
      background: ${({ theme }) => theme.colors.selection.bg};
    }
  `,
  danger: css`
    background: ${({ theme }) => theme.colors.status.error.text};
    color: ${({ theme }) => theme.colors.bg.surface};

    &:hover:not(:disabled) {
      filter: brightness(0.95);
    }

    &:active:not(:disabled) {
      filter: brightness(0.9);
    }

    &:disabled {
      filter: none;
    }
  `,
} as const;

export const Label = styled.span<{ $hidden: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.space[8]};
  /* opacity keeps the label in the accessibility name while loading */
  opacity: ${({ $hidden }) => ($hidden ? 0 : 1)};
`;

export const SpinnerSlot = styled.span`
  position: absolute;
  inset: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ theme }) => theme.typography.bodySmall.fontSize};
`;

export const LeadingIcon = styled.span`
  display: inline-flex;
  font-size: ${({ theme }) => theme.typography.bodySmall.fontSize};
`;

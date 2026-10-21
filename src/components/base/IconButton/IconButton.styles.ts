import styled, { css } from "styled-components";

import { focusRing } from "@/components/base/shared/focus";
import type { ControlSize, IconButtonIntent } from "@/components/base/shared/types";

export const Root = styled.button<{
  $intent: IconButtonIntent;
  $size: ControlSize;
  $isLoading: boolean;
}>`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${({ theme, $size }) => ($size === "lg" ? theme.space[48] : theme.sizes.control)};
  height: ${({ theme, $size }) => ($size === "lg" ? theme.space[48] : theme.sizes.control)};
  border-radius: ${({ theme }) => theme.radii.control};
  border: ${({ theme }) => theme.borderWidths.thin} solid transparent;
  font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
  cursor: pointer;
  transition:
    background-color ${({ theme }) => theme.motion.duration.fast}
      ${({ theme }) => theme.motion.easing.standard},
    border-color ${({ theme }) => theme.motion.duration.fast}
      ${({ theme }) => theme.motion.easing.standard},
    color ${({ theme }) => theme.motion.duration.fast}
      ${({ theme }) => theme.motion.easing.standard};

  ${({ $intent }) => intentStyles[$intent]}

  ${focusRing}

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
  }
`;

const intentStyles = {
  secondary: css`
    background: ${({ theme }) => theme.colors.bg.surface};
    color: ${({ theme }) => theme.colors.text.primary};
    border-color: ${({ theme }) => theme.colors.border.control};

    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.bg.subtle};
    }
  `,
  ghost: css`
    background: transparent;
    color: ${({ theme }) => theme.colors.text.primary};

    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.bg.subtle};
    }
  `,
  danger: css`
    background: ${({ theme }) => theme.colors.status.error.bg};
    color: ${({ theme }) => theme.colors.status.error.text};

    &:hover:not(:disabled) {
      border-color: ${({ theme }) => theme.colors.status.error.text};
    }
  `,
} as const;

export const Glyph = styled.span<{ $hidden: boolean }>`
  display: inline-flex;
  opacity: ${({ $hidden }) => ($hidden ? 0 : 1)};
`;

export const SpinnerSlot = styled.span`
  position: absolute;
  inset: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

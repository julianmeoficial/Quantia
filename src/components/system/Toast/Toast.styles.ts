import { Toast as ToastPrimitive } from "radix-ui";
import styled, { css, keyframes } from "styled-components";

import type { BadgeTone } from "@/components/base/shared/types";

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(0.5rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const Viewport = styled(ToastPrimitive.Viewport)`
  position: fixed;
  right: ${({ theme }) => theme.space[16]};
  bottom: ${({ theme }) => theme.space[16]};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[12]};
  width: min(24rem, calc(100vw - ${({ theme }) => theme.space[32]}));
  max-width: 100vw;
  margin: 0;
  padding: 0;
  list-style: none;
  z-index: ${({ theme }) => theme.zIndices.toast};
  outline: none;
`;

export const Root = styled(ToastPrimitive.Root)<{ $tone: BadgeTone }>`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: ${({ theme }) => theme.space[8]} ${({ theme }) => theme.space[12]};
  padding: ${({ theme }) => theme.space[16]};
  border-radius: ${({ theme }) => theme.radii.card};
  border: ${({ theme }) => theme.borderWidths.thin} solid transparent;
  box-shadow: ${({ theme }) => theme.elevation.md};
  animation: ${slideIn} ${({ theme }) => theme.motion.duration.base}
    ${({ theme }) => theme.motion.easing.standard};

  ${({ $tone }) => toneStyles[$tone]}

  ${({ theme }) => theme.media.reducedMotion} {
    animation: none;
  }
`;

const toneStyles = {
  neutral: css`
    background: ${({ theme }) => theme.colors.status.neutral.bg};
    color: ${({ theme }) => theme.colors.status.neutral.text};
    border-color: ${({ theme }) => theme.colors.border.subtle};
  `,
  info: css`
    background: ${({ theme }) => theme.colors.status.info.bg};
    color: ${({ theme }) => theme.colors.status.info.text};
  `,
  success: css`
    background: ${({ theme }) => theme.colors.status.success.bg};
    color: ${({ theme }) => theme.colors.status.success.text};
  `,
  warning: css`
    background: ${({ theme }) => theme.colors.status.warning.bg};
    color: ${({ theme }) => theme.colors.status.warning.text};
  `,
  danger: css`
    background: ${({ theme }) => theme.colors.status.error.bg};
    color: ${({ theme }) => theme.colors.status.error.text};
  `,
} as const;

export const Title = styled(ToastPrimitive.Title)`
  grid-column: 1;
  font-size: ${({ theme }) => theme.typography.label.fontSize};
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;

export const Description = styled(ToastPrimitive.Description)`
  grid-column: 1;
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  line-height: ${({ theme }) => theme.typography.caption.lineHeight};
`;

export const Action = styled(ToastPrimitive.Action)`
  grid-column: 1;
  justify-self: start;
  margin-top: ${({ theme }) => theme.space[4]};
`;

export const Close = styled(ToastPrimitive.Close)`
  grid-column: 2;
  grid-row: 1;
  all: unset;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${({ theme }) => theme.sizes.control};
  height: ${({ theme }) => theme.sizes.control};
  border-radius: ${({ theme }) => theme.radii.control};
  cursor: pointer;
  color: inherit;

  &:focus-visible {
    outline: ${({ theme }) => theme.borderWidths.thick} solid
      ${({ theme }) => theme.colors.focus.ring};
    outline-offset: ${({ theme }) => theme.borderWidths.thick};
  }
`;

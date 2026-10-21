import styled, { css } from "styled-components";

import type { BadgeTone } from "@/components/base/shared/types";

export const Root = styled.span<{ $tone: BadgeTone }>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.space[4]};
  min-height: ${({ theme }) => theme.space[24]};
  padding-inline: ${({ theme }) => theme.space[8]};
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  line-height: ${({ theme }) => theme.typography.caption.lineHeight};
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
  ${({ $tone }) => toneStyles[$tone]}
`;

const toneStyles = {
  neutral: css`
    background: ${({ theme }) => theme.colors.status.neutral.bg};
    color: ${({ theme }) => theme.colors.status.neutral.text};
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

export const IconSlot = styled.span`
  display: inline-flex;
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
`;

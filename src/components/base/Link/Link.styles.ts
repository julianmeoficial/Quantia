import NextLink from "next/link";
import styled, { css } from "styled-components";

import { focusRing } from "@/components/base/shared/focus";

const linkStyles = css`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.space[4]};
  color: ${({ theme }) => theme.colors.brand.primary};
  font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
  line-height: ${({ theme }) => theme.typography.bodyMedium.lineHeight};
  text-decoration: underline;
  text-underline-offset: ${({ theme }) => theme.space[4]};
  border-radius: ${({ theme }) => theme.radii.control};
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colors.brand.hover};
  }

  &:active {
    color: ${({ theme }) => theme.colors.brand.pressed};
  }

  ${focusRing}
`;

export const Internal = styled(NextLink)`
  ${linkStyles}
`;

export const External = styled.a`
  ${linkStyles}
`;

export const ExternalHint = styled.span`
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

export const IconSlot = styled.span`
  display: inline-flex;
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
`;

import { Dialog as DialogPrimitive } from "radix-ui";
import styled from "styled-components";

import { overlayStyles } from "@/components/system/shared/overlay";

export const Overlay = styled(DialogPrimitive.Overlay)`
  ${overlayStyles}
`;

export const Content = styled(DialogPrimitive.Content)`
  position: fixed;
  z-index: ${({ theme }) => theme.zIndices.modal};
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.bg.surface};
  box-shadow: ${({ theme }) => theme.elevation.md};
  will-change: transform, opacity;

  /* Compact: bottom sheet */
  inset: auto 0 0 0;
  width: 100%;
  max-height: 90vh;
  border-radius: ${({ theme }) => `${theme.radii.featured} ${theme.radii.featured} 0 0`};

  ${({ theme }) => theme.media.up("md")} {
    /* Wide: right drawer */
    inset: 0 0 0 auto;
    width: min(28rem, 100vw);
    max-height: none;
    height: 100%;
    border-radius: 0;
  }

  &:focus {
    outline: none;
  }

  &:focus-visible {
    outline: ${({ theme }) => theme.borderWidths.thick} solid
      ${({ theme }) => theme.colors.focus.ring};
    outline-offset: ${({ theme }) => theme.borderWidths.thick};
  }
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.space[12]};
  flex-shrink: 0;
  padding: ${({ theme }) => `${theme.space[16]} ${theme.space[16]} ${theme.space[12]}`};
  border-bottom: ${({ theme }) => theme.borderWidths.thin} solid
    ${({ theme }) => theme.colors.border.subtle};
`;

export const HeaderText = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[8]};
  min-width: 0;
  flex: 1;
`;

export const Title = styled(DialogPrimitive.Title)`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.headingSmall.fontSize};
  font-weight: ${({ theme }) => theme.typography.headingSmall.fontWeight};
  line-height: ${({ theme }) => theme.typography.headingSmall.lineHeight};
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const Description = styled(DialogPrimitive.Description)`
  margin: 0;
  padding: ${({ theme }) => `${theme.space[12]} ${theme.space[16]} 0`};
  text-align: center;
  font-size: ${({ theme }) => theme.typography.bodySmall.fontSize};
  line-height: ${({ theme }) => theme.typography.bodySmall.lineHeight};
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const Body = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: ${({ theme }) => theme.space[16]};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[16]};
`;

export const Footer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: ${({ theme }) => theme.space[24]};
  flex-shrink: 0;
  padding: ${({ theme }) => `${theme.space[12]} ${theme.space[16]} ${theme.space[16]}`};
  border-top: ${({ theme }) => theme.borderWidths.thin} solid
    ${({ theme }) => theme.colors.border.subtle};
  background: ${({ theme }) => theme.colors.bg.surface};

  & > * {
    min-width: 10rem;
  }
`;

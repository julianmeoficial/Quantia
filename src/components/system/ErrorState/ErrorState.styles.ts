import { Dialog as DialogPrimitive } from "radix-ui";
import styled from "styled-components";

import { overlayStyles, panelEnterStyles } from "@/components/system/shared/overlay";

export const Panel = styled.section`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${({ theme }) => theme.space[16]};
  padding: ${({ theme }) => theme.space[24]};
  background: ${({ theme }) => theme.colors.bg.surface};
  border: ${({ theme }) => theme.borderWidths.thin} solid
    ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radii.card};
  max-width: 28rem;
  width: 100%;
`;

export const IconSlot = styled.div`
  display: inline-flex;
  color: ${({ theme }) => theme.colors.status.error.text};
  font-size: ${({ theme }) => theme.space[32]};
`;

export const Title = styled.h2`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.headingSmall.fontSize};
  line-height: ${({ theme }) => theme.typography.headingSmall.lineHeight};
  font-weight: ${({ theme }) => theme.typography.headingSmall.fontWeight};
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const Description = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
  line-height: ${({ theme }) => theme.typography.bodyMedium.lineHeight};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.space[12]};
  margin-top: ${({ theme }) => theme.space[8]};
`;

export const Countdown = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.label.fontSize};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const Overlay = styled(DialogPrimitive.Overlay)`
  ${overlayStyles}
`;

export const DialogContent = styled(DialogPrimitive.Content)`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: min(28rem, calc(100vw - ${({ theme }) => theme.space[32]}));
  padding: ${({ theme }) => theme.space[24]};
  background: ${({ theme }) => theme.colors.bg.surface};
  border-radius: ${({ theme }) => theme.radii.card};
  box-shadow: ${({ theme }) => theme.elevation.md};
  z-index: ${({ theme }) => theme.zIndices.modal};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[16]};
  ${panelEnterStyles}

  &:focus {
    outline: none;
  }

  &:focus-visible {
    outline: ${({ theme }) => theme.borderWidths.thick} solid
      ${({ theme }) => theme.colors.focus.ring};
    outline-offset: ${({ theme }) => theme.borderWidths.thick};
  }
`;

export const DialogTitle = styled(DialogPrimitive.Title)`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.headingSmall.fontSize};
  font-weight: ${({ theme }) => theme.typography.headingSmall.fontWeight};
`;

export const DialogDescription = styled(DialogPrimitive.Description)`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
  line-height: ${({ theme }) => theme.typography.bodyMedium.lineHeight};
`;

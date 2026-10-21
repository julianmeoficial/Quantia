import { AlertDialog as AlertDialogPrimitive } from "radix-ui";
import styled from "styled-components";

import { overlayStyles, panelEnterStyles } from "@/components/system/shared/overlay";

export const Overlay = styled(AlertDialogPrimitive.Overlay)`
  ${overlayStyles}
`;

export const Content = styled(AlertDialogPrimitive.Content)`
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

export const Title = styled(AlertDialogPrimitive.Title)`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.headingSmall.fontSize};
  font-weight: ${({ theme }) => theme.typography.headingSmall.fontWeight};
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const Description = styled(AlertDialogPrimitive.Description)`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
  line-height: ${({ theme }) => theme.typography.bodyMedium.lineHeight};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.space[12]};
  margin-top: ${({ theme }) => theme.space[8]};
`;

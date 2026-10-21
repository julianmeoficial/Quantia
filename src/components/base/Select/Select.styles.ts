import { Select as SelectPrimitive } from "radix-ui";
import styled from "styled-components";

import { focusRing } from "@/components/base/shared/focus";
import type { ControlSize } from "@/components/base/shared/types";

export const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[8]};
  width: 100%;
`;

export const Label = styled.label`
  font-size: ${({ theme }) => theme.typography.label.fontSize};
  line-height: ${({ theme }) => theme.typography.label.lineHeight};
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const Trigger = styled(SelectPrimitive.Trigger)<{
  $size: ControlSize;
  $invalid: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.space[8]};
  width: 100%;
  min-height: ${({ theme, $size }) => ($size === "lg" ? theme.space[48] : theme.sizes.control)};
  padding-inline: ${({ theme }) => theme.space[12]};
  border: ${({ theme }) => theme.borderWidths.thin} solid
    ${({ theme, $invalid }) =>
      $invalid ? theme.colors.status.error.text : theme.colors.border.control};
  border-radius: ${({ theme }) => theme.radii.control};
  background: ${({ theme }) => theme.colors.bg.surface};
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.fonts.sans};
  font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
  text-align: left;
  cursor: pointer;

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.brand.primary};
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.bg.subtle};
    color: ${({ theme }) => theme.colors.text.secondary};
    border-color: ${({ theme }) => theme.colors.border.subtle};
    cursor: not-allowed;
  }

  ${focusRing}
`;

export const Value = styled(SelectPrimitive.Value)`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const Icon = styled(SelectPrimitive.Icon)`
  display: inline-flex;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const Content = styled(SelectPrimitive.Content)`
  overflow: hidden;
  min-width: var(--radix-select-trigger-width);
  background: ${({ theme }) => theme.colors.bg.surface};
  border: ${({ theme }) => theme.borderWidths.thin} solid
    ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radii.control};
  box-shadow: ${({ theme }) => theme.elevation.md};
  z-index: ${({ theme }) => theme.zIndices.overlay};
`;

export const Viewport = styled(SelectPrimitive.Viewport)`
  padding: ${({ theme }) => theme.space[4]};
`;

export const Item = styled(SelectPrimitive.Item)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space[8]};
  min-height: ${({ theme }) => theme.sizes.control};
  padding-inline: ${({ theme }) => theme.space[12]};
  border-radius: ${({ theme }) => theme.radii.control};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
  outline: none;
  cursor: pointer;

  &[data-highlighted] {
    background: ${({ theme }) => theme.colors.selection.bg};
    color: ${({ theme }) => theme.colors.selection.text};
  }

  &[data-disabled] {
    color: ${({ theme }) => theme.colors.text.secondary};
    pointer-events: none;
  }
`;

export const ItemIndicator = styled(SelectPrimitive.ItemIndicator)`
  display: inline-flex;
  color: ${({ theme }) => theme.colors.brand.primary};
`;

export const Hint = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const ErrorText = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  color: ${({ theme }) => theme.colors.status.error.text};
`;

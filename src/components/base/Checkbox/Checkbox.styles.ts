import { Checkbox as CheckboxPrimitive } from "radix-ui";
import styled from "styled-components";

import { focusRing } from "@/components/base/shared/focus";

export const Root = styled.label<{ $compact?: boolean }>`
  display: inline-flex;
  align-items: flex-start;
  gap: ${({ theme, $compact }) => ($compact ? 0 : theme.space[8])};
  min-height: ${({ theme }) => theme.sizes.control};
  min-width: 0;
  max-width: 100%;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
  line-height: ${({ theme }) => theme.typography.bodyMedium.lineHeight};

  ${({ $compact }) =>
    $compact &&
    `
    position: relative;
  `}

  &[data-disabled="true"] {
    color: ${({ theme }) => theme.colors.text.secondary};
    cursor: not-allowed;
  }
`;

export const Control = styled(CheckboxPrimitive.Root)`
  all: unset;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${({ theme }) => theme.space[24]};
  height: ${({ theme }) => theme.space[24]};
  margin-block: ${({ theme }) => theme.space[8]};
  border: ${({ theme }) => theme.borderWidths.thin} solid
    ${({ theme }) => theme.colors.border.control};
  border-radius: ${({ theme }) => theme.radii.control};
  background: ${({ theme }) => theme.colors.bg.surface};
  color: ${({ theme }) => theme.colors.brand.onPrimary};
  flex-shrink: 0;

  &[data-state="checked"],
  &[data-state="indeterminate"] {
    background: ${({ theme }) => theme.colors.brand.primary};
    border-color: ${({ theme }) => theme.colors.brand.primary};
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.bg.subtle};
    border-color: ${({ theme }) => theme.colors.border.subtle};
    color: ${({ theme }) => theme.colors.text.secondary};
  }

  ${focusRing}
`;

export const Indicator = styled(CheckboxPrimitive.Indicator)`
  display: inline-flex;
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
`;

export const Text = styled.span<{ $visuallyHidden?: boolean }>`
  padding-block: ${({ theme }) => theme.space[8]};
  min-width: 0;

  ${({ $visuallyHidden }) =>
    $visuallyHidden &&
    `
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  `}
`;

export const Help = styled.span`
  display: block;
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

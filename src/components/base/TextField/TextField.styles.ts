import styled from "styled-components";

import { fieldControl } from "@/components/base/shared/field";
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

export const Required = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: ${({ theme }) => theme.typography.bodyMedium.fontWeight};
`;

export const ControlRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space[8]};
  width: 100%;

  > input {
    flex: 1;
    min-width: 0;
    width: auto;
  }
`;

export const Input = styled.input<{ $size: ControlSize }>`
  ${fieldControl}
  min-height: ${({ theme, $size }) => ($size === "lg" ? theme.space[48] : theme.sizes.control)};
`;

export const Hint = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  line-height: ${({ theme }) => theme.typography.caption.lineHeight};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const ErrorText = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  line-height: ${({ theme }) => theme.typography.caption.lineHeight};
  color: ${({ theme }) => theme.colors.status.error.text};
`;

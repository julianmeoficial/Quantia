import styled from "styled-components";

import { fieldControl } from "@/components/base/shared/field";

export const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[8]};
  width: 100%;
`;

export const Label = styled.label<{ $hidden?: boolean }>`
  ${({ $hidden }) =>
    $hidden
      ? `position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
         overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;`
      : ""}
  font-size: ${({ theme }) => theme.typography.label.fontSize};
  line-height: ${({ theme }) => theme.typography.label.lineHeight};
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const Required = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: ${({ theme }) => theme.typography.bodyMedium.fontWeight};
`;

export const Control = styled.textarea`
  ${fieldControl}
  min-height: ${({ theme }) => theme.space[48]};
  resize: vertical;
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

export const Counter = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  line-height: ${({ theme }) => theme.typography.caption.lineHeight};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: right;
`;

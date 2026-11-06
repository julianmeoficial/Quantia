import styled from "styled-components";

import { focusRing } from "@/components/base/shared/focus";

export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.space[8]};
`;

export const TimeRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[8]};
`;

export const TimeLabel = styled.label`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.label.fontSize};
  line-height: ${({ theme }) => theme.typography.label.lineHeight};
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;

/** Native time control: wheel on phones, typed/arrow entry with a keyboard. 24 h, Bogotá. */
export const TimeInput = styled.input`
  box-sizing: border-box;
  width: 100%;
  min-height: ${({ theme }) => theme.sizes.control};
  padding: 0 ${({ theme }) => theme.space[12]};
  border: ${({ theme }) => theme.borderWidths.thin} solid
    ${({ theme }) => theme.colors.border.control};
  border-radius: ${({ theme }) => theme.radii.control};
  background: ${({ theme }) => theme.colors.bg.surface};
  color: ${({ theme }) => theme.colors.text.primary};
  font: inherit;
  font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
  ${focusRing}
`;

export const TimeHint = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  line-height: ${({ theme }) => theme.typography.caption.lineHeight};
`;

export const RequiredMark = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;

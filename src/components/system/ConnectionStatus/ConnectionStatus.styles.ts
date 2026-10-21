import styled from "styled-components";

export const Banner = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.space[12]};
  width: 100%;
  min-height: ${({ theme }) => theme.sizes.control};
  padding-block: ${({ theme }) => theme.space[8]};
  padding-inline: ${({ theme }) => theme.space[16]};
  background: ${({ theme }) => theme.colors.status.warning.bg};
  color: ${({ theme }) => theme.colors.status.warning.text};
  border-bottom: ${({ theme }) => theme.borderWidths.thin} solid
    ${({ theme }) => theme.colors.border.subtle};
  font-size: ${({ theme }) => theme.typography.bodySmall.fontSize};
`;

export const IconSlot = styled.span`
  display: inline-flex;
  font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
`;

export const Label = styled.span`
  flex: 1;
`;

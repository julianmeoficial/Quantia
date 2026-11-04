import styled from "styled-components";

export const Banner = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.space[8]};
  width: 100%;
  max-width: 100%;
  min-width: 0;
  min-height: ${({ theme }) => theme.sizes.control};
  padding-block: ${({ theme }) => theme.space[8]};
  padding-inline: ${({ theme }) => theme.space[12]};
  background: ${({ theme }) => theme.colors.status.warning.bg};
  color: ${({ theme }) => theme.colors.status.warning.text};
  border-radius: ${({ theme }) => theme.radii.control};
  font-size: ${({ theme }) => theme.typography.bodySmall.fontSize};
`;

export const IconSlot = styled.span`
  display: inline-flex;
  flex-shrink: 0;
  font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
`;

export const Label = styled.span`
  flex: 1 1 ${({ theme }) => theme.space[64]};
  min-width: 0;
`;

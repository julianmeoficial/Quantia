import styled from "styled-components";

export const Root = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.space[8]};
  min-height: ${({ theme }) => theme.sizes.control};
  padding-inline: ${({ theme }) => theme.space[12]};
  border-radius: ${({ theme }) => theme.radii.control};
  background: ${({ theme }) => theme.colors.bg.subtle};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.bodySmall.fontSize};
  line-height: ${({ theme }) => theme.typography.bodySmall.lineHeight};
`;

export const IconSlot = styled.span`
  display: inline-flex;
  font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
  color: ${({ theme }) => theme.colors.text.secondary};

  &[data-tone="success"] {
    color: ${({ theme }) => theme.colors.status.success.text};
  }

  &[data-tone="danger"] {
    color: ${({ theme }) => theme.colors.status.error.text};
  }

  &[data-tone="info"] {
    color: ${({ theme }) => theme.colors.status.info.text};
  }
`;

export const Label = styled.span`
  flex: 1;
`;

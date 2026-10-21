import styled from "styled-components";

export const Root = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.space[16]};
  padding: ${({ theme }) => theme.space[32]};
  text-align: center;
  background: ${({ theme }) => theme.colors.bg.surface};
  border: ${({ theme }) => theme.borderWidths.thin} solid
    ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radii.card};
`;

export const Art = styled.div`
  display: flex;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.space[48]};
  pointer-events: none;
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
  max-width: 28rem;
  font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
  line-height: ${({ theme }) => theme.typography.bodyMedium.lineHeight};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: ${({ theme }) => theme.space[12]};
  margin-top: ${({ theme }) => theme.space[8]};
`;

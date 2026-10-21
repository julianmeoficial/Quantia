import styled from "styled-components";

export const Panel = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[16]};
`;

export const Period = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.bodySmall.fontSize};
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme }) => theme.space[16]};

  ${({ theme }) => theme.media.up("md")} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  ${({ theme }) => theme.media.up("xl")} {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`;

export const Item = styled.article`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[8]};
  padding: ${({ theme }) => theme.space[24]};
  background: ${({ theme }) => theme.colors.bg.surface};
  border: ${({ theme }) => theme.borderWidths.thin} solid
    ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radii.card};
`;

export const Value = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.metric.fontSize};
  line-height: ${({ theme }) => theme.typography.metric.lineHeight};
  font-weight: ${({ theme }) => theme.typography.metric.fontWeight};
  letter-spacing: ${({ theme }) => theme.typography.metric.letterSpacing};
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const Label = styled.h3`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.label.fontSize};
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const Context = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.bodySmall.fontSize};
`;

export const Delta = styled.p`
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.space[8]};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.bodySmall.fontSize};
`;

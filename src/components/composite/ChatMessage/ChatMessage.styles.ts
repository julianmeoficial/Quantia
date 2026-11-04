import styled from "styled-components";

export const Root = styled.article<{ $own: boolean; $sending: boolean }>`
  display: flex;
  flex-direction: ${({ $own }) => ($own ? "row-reverse" : "row")};
  align-items: flex-start;
  gap: ${({ theme }) => theme.space[12]};
  opacity: ${({ $sending }) => ($sending ? 0.7 : 1)};
`;

export const Body = styled.div<{ $own: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[4]};
  width: fit-content;
  max-width: 100%;
  min-width: 0;
  align-items: ${({ $own }) => ($own ? "flex-end" : "flex-start")};
`;

export const Author = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.label.fontSize};
  line-height: ${({ theme }) => theme.typography.label.lineHeight};
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;

export const Bubble = styled.div<{ $own: boolean }>`
  padding: ${({ theme }) => theme.space[12]} ${({ theme }) => theme.space[16]};
  border-radius: ${({ theme }) => theme.radii.card};
  background: ${({ theme, $own }) => ($own ? theme.colors.status.info.bg : theme.colors.bg.subtle)};
  border: ${({ theme }) => theme.borderWidths.thin} solid
    ${({ theme, $own }) => ($own ? theme.colors.status.info.text : theme.colors.border.subtle)};
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const Content = styled.p`
  margin: 0;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
  line-height: ${({ theme }) => theme.typography.bodyMedium.lineHeight};
`;

export const Meta = styled.div<{ $own: boolean }>`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.space[8]};
  justify-content: ${({ $own }) => ($own ? "flex-end" : "flex-start")};
`;

export const Time = styled.time`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  line-height: ${({ theme }) => theme.typography.caption.lineHeight};
`;

export const Delivery = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  line-height: ${({ theme }) => theme.typography.caption.lineHeight};
`;

export const FailedRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.space[8]};
`;

export const FailedText = styled.span`
  color: ${({ theme }) => theme.colors.status.error.text};
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  line-height: ${({ theme }) => theme.typography.caption.lineHeight};
`;

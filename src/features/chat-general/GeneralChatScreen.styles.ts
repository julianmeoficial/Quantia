import styled from "styled-components";

export const Screen = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[16]};
  min-height: 0;
  flex: 1;
  height: min(70vh, calc(100vh - ${({ theme }) => theme.space[64]} * 2));
`;

export const Header = styled.header`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[4]};
`;

export const Lead = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
  line-height: ${({ theme }) => theme.typography.bodyMedium.lineHeight};
`;

export const Panel = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 0;
  flex: 1;
  background: ${({ theme }) => theme.colors.bg.surface};
  border: ${({ theme }) => theme.borderWidths.thin} solid
    ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radii.card};
  overflow: hidden;
`;

export const Log = styled.div`
  flex: 1;
  min-height: ${({ theme }) => theme.space[64]};
  position: relative;
`;

export const DaySeparator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.space[12]};
  padding: ${({ theme }) => theme.space[12]} 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.label.fontSize};
  line-height: ${({ theme }) => theme.typography.label.lineHeight};

  &::before,
  &::after {
    content: "";
    flex: 1;
    height: ${({ theme }) => theme.borderWidths.thin};
    background: ${({ theme }) => theme.colors.border.subtle};
  }
`;

export const MessagePad = styled.div`
  padding: ${({ theme }) => theme.space[12]} ${({ theme }) => theme.space[16]};
`;

export const EmptyWrap = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.space[24]};
`;

export const OlderHint = styled.p`
  margin: 0;
  padding: ${({ theme }) => theme.space[8]};
  text-align: center;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
`;

export const ComposerSlot = styled.div`
  padding: ${({ theme }) => theme.space[12]} ${({ theme }) => theme.space[16]}
    ${({ theme }) => theme.space[16]};
  border-top: ${({ theme }) => theme.borderWidths.thin} solid
    ${({ theme }) => theme.colors.border.subtle};
`;

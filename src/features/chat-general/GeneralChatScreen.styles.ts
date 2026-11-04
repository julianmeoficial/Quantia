import styled from "styled-components";

import { focusRing } from "@/components/base/shared/focus";

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
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.space[12]};
`;

export const HeaderText = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[4]};
  min-width: 0;
`;

export const Lead = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
  line-height: ${({ theme }) => theme.typography.bodyMedium.lineHeight};
`;

export const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: ${({ theme }) => theme.space[16]};
  min-height: 0;
  flex: 1;

  ${({ theme }) => theme.media.up("md")} {
    grid-template-columns: minmax(0, 1fr) ${({ theme }) => theme.space[64]};
  }

  ${({ theme }) => theme.media.up("lg")} {
    grid-template-columns: minmax(0, 1fr) calc(${({ theme }) => theme.space[64]} * 3);
  }
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

export const Rail = styled.aside`
  display: none;
  min-height: 0;
  padding: ${({ theme }) => theme.space[16]};
  background: ${({ theme }) => theme.colors.bg.surface};
  border: ${({ theme }) => theme.borderWidths.thin} solid
    ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radii.card};
  overflow: auto;

  ${({ theme }) => theme.media.up("md")} {
    display: block;
  }
`;

export const MobilePresence = styled.div`
  display: inline-flex;

  ${({ theme }) => theme.media.up("md")} {
    display: none;
  }
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

export const NewMessagesPill = styled.button`
  position: absolute;
  left: 50%;
  bottom: ${({ theme }) => theme.space[16]};
  z-index: ${({ theme }) => theme.zIndices.overlay};
  transform: translateX(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: ${({ theme }) => theme.sizes.touchTarget};
  padding: 0 ${({ theme }) => theme.space[16]};
  border: ${({ theme }) => theme.borderWidths.thin} solid
    ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.bg.surface};
  color: ${({ theme }) => theme.colors.text.primary};
  box-shadow: ${({ theme }) => theme.elevation.sm};
  font-size: ${({ theme }) => theme.typography.label.fontSize};
  line-height: ${({ theme }) => theme.typography.label.lineHeight};
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
  cursor: pointer;
  ${focusRing}
`;

export const LiveRegion = styled.div`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

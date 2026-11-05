import { motion } from "motion/react";
import styled from "styled-components";

export const Root = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[12]};
  min-width: 0;
`;

export const Heading = styled.h2`
  margin: 0;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.typography.headingSmall.fontSize};
  line-height: ${({ theme }) => theme.typography.headingSmall.lineHeight};
  font-weight: ${({ theme }) => theme.typography.headingSmall.fontWeight};
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const Subheading = styled.h3`
  margin: ${({ theme }) => theme.space[8]} 0 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.label.fontSize};
  line-height: ${({ theme }) => theme.typography.label.lineHeight};
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;

export const Count = styled.p`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space[8]};
  margin: 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.bodySmall.fontSize};
  line-height: ${({ theme }) => theme.typography.bodySmall.lineHeight};
`;

export const Dot = styled.span<{ $live: boolean }>`
  width: ${({ theme }) => theme.space[8]};
  height: ${({ theme }) => theme.space[8]};
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme, $live }) =>
    $live ? theme.colors.status.success.icon : theme.colors.status.neutral.icon};
`;

export const List = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[4]};
  margin: 0;
  padding: 0;
  list-style: none;
  max-height: ${({ theme }) => `calc(${theme.space[64]} * 6)`};
  overflow-y: auto;
`;

export const Row = styled(motion.li)<{ $muted?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space[12]};
  min-height: ${({ theme }) => theme.sizes.touchTarget};
  opacity: ${({ $muted }) => ($muted ? 0.78 : 1)};
`;

export const AvatarWrap = styled.span`
  position: relative;
  display: inline-flex;
  flex: none;
`;

/** Restrained online marker (no neon/glow): solid success dot with a surface ring. */
export const OnlineBadge = styled.span`
  position: absolute;
  right: 0;
  bottom: 0;
  width: ${({ theme }) => theme.space[8]};
  height: ${({ theme }) => theme.space[8]};
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.status.success.icon};
  box-shadow: 0 0 0 ${({ theme }) => theme.borderWidths.thick}
    ${({ theme }) => theme.colors.bg.surface};
`;

export const Identity = styled.span`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

export const Name = styled.span`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
  line-height: ${({ theme }) => theme.typography.bodyMedium.lineHeight};
  overflow-wrap: anywhere;
`;

export const Me = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const Typing = styled(motion.span)`
  color: ${({ theme }) => theme.colors.brand.primary};
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  line-height: ${({ theme }) => theme.typography.caption.lineHeight};
  font-style: italic;
`;

export const LastSeen = styled.time`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  line-height: ${({ theme }) => theme.typography.caption.lineHeight};
`;

export const Empty = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.bodySmall.fontSize};
`;

export const ConnectionSlot = styled.div`
  margin-top: ${({ theme }) => theme.space[8]};
`;

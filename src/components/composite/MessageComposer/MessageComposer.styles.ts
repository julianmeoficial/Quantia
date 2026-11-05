import { motion } from "motion/react";
import styled from "styled-components";

export const Root = styled.form<{ $editing: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[8]};
  padding: ${({ theme }) => theme.space[12]};
  background: ${({ theme }) => theme.colors.bg.surface};
  border: ${({ theme }) => theme.borderWidths.thin} solid
    ${({ theme, $editing }) => ($editing ? theme.colors.focus.ring : theme.colors.border.subtle)};
  border-radius: ${({ theme }) => theme.radii.featured};
  box-shadow: ${({ theme }) => theme.elevation.sm};
  transition: border-color ${({ theme }) => theme.motion.duration.base}
    ${({ theme }) => theme.motion.easing.standard};

  &:focus-within {
    border-color: ${({ theme }) => theme.colors.border.control};
  }
`;

export const Context = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space[8]};
  min-width: 0;
  padding: ${({ theme }) => theme.space[4]} ${({ theme }) => theme.space[4]}
    ${({ theme }) => theme.space[4]} ${({ theme }) => theme.space[12]};
  border-left: ${({ theme }) => theme.borderWidths.thick} solid
    ${({ theme }) => theme.colors.brand.primary};
  border-radius: ${({ theme }) => theme.radii.control};
  background: ${({ theme }) => theme.colors.selection.bg};
`;

export const ContextIcon = styled.span`
  display: inline-flex;
  flex: none;
  color: ${({ theme }) => theme.colors.brand.primary};
`;

export const ContextText = styled.span`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
`;

export const ContextTitle = styled.span`
  color: ${({ theme }) => theme.colors.selection.text};
  font-size: ${({ theme }) => theme.typography.label.fontSize};
  line-height: ${({ theme }) => theme.typography.label.lineHeight};
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;

export const ContextExcerpt = styled.span`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.bodySmall.fontSize};
  line-height: ${({ theme }) => theme.typography.bodySmall.lineHeight};
`;

export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.space[8]};
`;

export const ActionGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space[8]};
  margin-left: auto;
`;

export const Hint = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  line-height: ${({ theme }) => theme.typography.caption.lineHeight};
`;

export const Counter = styled(motion.span)<{ $over: boolean }>`
  color: ${({ theme, $over }) => ($over ? theme.colors.status.error.text : theme.colors.status.warning.text)};
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  line-height: ${({ theme }) => theme.typography.caption.lineHeight};
  font-variant-numeric: tabular-nums;
`;

export const SendGlyph = styled(motion.span)`
  display: inline-flex;
`;

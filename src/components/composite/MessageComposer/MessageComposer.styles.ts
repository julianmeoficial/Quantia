import { motion } from "motion/react";
import styled from "styled-components";

/**
 * Phones: a flat bar docked to the bottom of the chat (top hairline, no card).
 * `md`+: a floating card. The field row is a pill + round send button in both.
 */
export const Root = styled.form<{ $editing: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[8]};
  padding: ${({ theme }) => theme.space[8]};
  padding-bottom: calc(${({ theme }) => theme.space[8]} + env(safe-area-inset-bottom, 0));
  background: ${({ theme }) => theme.colors.bg.surface};
  border-top: ${({ theme }) => theme.borderWidths.thin} solid
    ${({ theme, $editing }) => ($editing ? theme.colors.focus.ring : theme.colors.border.subtle)};

  ${({ theme }) => theme.media.up("md")} {
    padding: ${({ theme }) => theme.space[12]};
    border: ${({ theme }) => theme.borderWidths.thin} solid
      ${({ theme, $editing }) => ($editing ? theme.colors.focus.ring : theme.colors.border.subtle)};
    border-radius: ${({ theme }) => theme.radii.featured};
    box-shadow: ${({ theme }) => theme.elevation.sm};
    transition: border-color ${({ theme }) => theme.motion.duration.base}
      ${({ theme }) => theme.motion.easing.standard};

    &:focus-within {
      border-color: ${({ theme }) => theme.colors.border.control};
    }
  }
`;

export const FieldRow = styled.div`
  display: flex;
  align-items: flex-end;
  gap: ${({ theme }) => theme.space[8]};
  min-width: 0;
`;

/** The textarea as a pill: one line when empty, grows with content up to ~6 lines. */
export const InputSlot = styled.div`
  flex: 1 1 auto;
  min-width: 0;

  textarea {
    box-sizing: border-box;
    min-height: ${({ theme }) => theme.sizes.control};
    max-height: calc(
      ${({ theme }) => theme.typography.bodyMedium.lineHeight} * 6 +
        ${({ theme }) => theme.space[24]}
    );
    padding: ${({ theme }) => theme.space[8]} ${({ theme }) => theme.space[16]};
    border-radius: calc(${({ theme }) => theme.sizes.control} / 2);
    resize: none;
    field-sizing: content;
    overflow-y: auto;
    overscroll-behavior: contain;
    /* 16 px+ keeps iOS from zooming the page when the field gets focus. */
    font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
    line-height: ${({ theme }) => theme.typography.bodyMedium.lineHeight};
  }
`;

export const SendButton = styled(motion.button)`
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: ${({ theme }) => theme.sizes.control};
  height: ${({ theme }) => theme.sizes.control};
  padding: 0;
  border: 0;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.brand.primary};
  color: ${({ theme }) => theme.colors.brand.onPrimary};
  cursor: pointer;
  transition:
    background ${({ theme }) => theme.motion.duration.fast}
      ${({ theme }) => theme.motion.easing.standard},
    opacity ${({ theme }) => theme.motion.duration.fast}
      ${({ theme }) => theme.motion.easing.standard};
  -webkit-tap-highlight-color: transparent;

  &:focus-visible {
    outline: ${({ theme }) => theme.borderWidths.thick} solid
      ${({ theme }) => theme.colors.focus.ring};
    outline-offset: ${({ theme }) => theme.borderWidths.thick};
  }

  @media (hover: hover) {
    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.brand.hover};
    }
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.bg.subtle};
    color: ${({ theme }) => theme.colors.text.secondary};
    cursor: default;
  }

  svg {
    font-size: ${({ theme }) => theme.typography.headingSmall.fontSize};
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
  padding: 0 ${({ theme }) => theme.space[8]};

  &:empty {
    display: none;
  }
`;

export const ActionGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space[8]};
  margin-left: auto;
`;

/** Keyboard help: only useful with a hardware keyboard (fine pointer). */
export const Hint = styled.p`
  display: none;
  margin: 0;

  @media (pointer: fine) {
    display: block;
  }

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

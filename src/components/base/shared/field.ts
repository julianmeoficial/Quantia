import { css } from "styled-components";

import { focusRing } from "./focus";

export const fieldControl = css`
  width: 100%;
  min-height: ${({ theme }) => theme.sizes.control};
  padding-block: ${({ theme }) => theme.space[8]};
  padding-inline: ${({ theme }) => theme.space[12]};
  border: ${({ theme }) => theme.borderWidths.thin} solid
    ${({ theme }) => theme.colors.border.control};
  border-radius: ${({ theme }) => theme.radii.control};
  background: ${({ theme }) => theme.colors.bg.surface};
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.fonts.sans};
  font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
  line-height: ${({ theme }) => theme.typography.bodyMedium.lineHeight};
  transition:
    border-color ${({ theme }) => theme.motion.duration.fast}
      ${({ theme }) => theme.motion.easing.standard},
    background-color ${({ theme }) => theme.motion.duration.fast}
      ${({ theme }) => theme.motion.easing.standard};

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.secondary};
  }

  &:hover:not(:disabled):not([readonly]) {
    border-color: ${({ theme }) => theme.colors.brand.primary};
  }

  ${focusRing}

  &:disabled {
    background: ${({ theme }) => theme.colors.bg.subtle};
    color: ${({ theme }) => theme.colors.text.secondary};
    border-color: ${({ theme }) => theme.colors.border.subtle};
    cursor: not-allowed;
  }

  &[readonly] {
    background: ${({ theme }) => theme.colors.bg.subtle};
  }

  &[aria-invalid="true"] {
    border-color: ${({ theme }) => theme.colors.status.error.text};
  }

  ${({ theme }) => theme.media.reducedMotion} {
    transition: none;
  }
`;

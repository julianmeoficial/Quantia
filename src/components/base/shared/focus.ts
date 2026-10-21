import { css } from "styled-components";

/** Canonical focus-visible ring — never replace with outline: none alone. */
export const focusRing = css`
  &:focus {
    outline: none;
  }

  &:focus-visible {
    outline: ${({ theme }) => theme.borderWidths.thick} solid
      ${({ theme }) => theme.colors.focus.ring};
    outline-offset: ${({ theme }) => theme.borderWidths.thick};
  }
`;

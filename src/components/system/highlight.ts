import { css, keyframes } from "styled-components";

const pulseOutline = keyframes`
  0% {
    outline-color: transparent;
  }
  15% {
    outline-color: var(--q-highlight-color);
  }
  100% {
    outline-color: transparent;
  }
`;

/**
 * Live-update highlight (DESIGN §11.5): 1.5 s outline on the row.
 * Under prefers-reduced-motion the outline stays static while the class is present.
 */
export const liveUpdateHighlight = css`
  --q-highlight-color: ${({ theme }) => theme.colors.focus.ring};
  outline: ${({ theme }) => theme.borderWidths.thick} solid transparent;
  outline-offset: ${({ theme }) => theme.borderWidths.thin};
  border-radius: ${({ theme }) => theme.radii.control};

  &[data-highlighted="true"] {
    animation: ${pulseOutline} 1.5s ${({ theme }) => theme.motion.easing.standard} forwards;
  }

  ${({ theme }) => theme.media.reducedMotion} {
    &[data-highlighted="true"] {
      animation: none;
      outline-color: ${({ theme }) => theme.colors.focus.ring};
    }
  }
`;

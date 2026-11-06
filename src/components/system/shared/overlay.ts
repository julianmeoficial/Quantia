import { css, keyframes } from "styled-components";

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const panelEnter = keyframes`
  from {
    opacity: 0;
    transform: translateY(0.25rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

/**
 * Scrim that always darkens: light mode tints with text.primary (dark ink); dark mode uses the
 * canvas token, because there text.primary is light and would wash the page out in grey.
 */
const darkScrim = css`
  background: color-mix(in srgb, ${({ theme }) => theme.colors.bg.canvas} 72%, transparent);
`;

export const overlayStyles = css`
  position: fixed;
  inset: 0;
  background: color-mix(in srgb, ${({ theme }) => theme.colors.text.primary} 40%, transparent);

  :root[data-theme="dark"] & {
    ${darkScrim}
  }

  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) & {
      ${darkScrim}
    }
  }

  z-index: ${({ theme }) => theme.zIndices.overlay};
  animation: ${fadeIn} ${({ theme }) => theme.motion.duration.base}
    ${({ theme }) => theme.motion.easing.standard};

  ${({ theme }) => theme.media.reducedMotion} {
    animation: none;
  }
`;

export const panelEnterStyles = css`
  animation: ${panelEnter} ${({ theme }) => theme.motion.duration.base}
    ${({ theme }) => theme.motion.easing.standard};

  ${({ theme }) => theme.media.reducedMotion} {
    animation: none;
  }
`;

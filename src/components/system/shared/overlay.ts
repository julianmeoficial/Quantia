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

/** Overlay uses the text.primary token at 40% via color-mix — no free hex. */
export const overlayStyles = css`
  position: fixed;
  inset: 0;
  background: color-mix(in srgb, ${({ theme }) => theme.colors.text.primary} 40%, transparent);
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

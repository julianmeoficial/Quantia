import { Tooltip as TooltipPrimitive } from "radix-ui";
import styled, { keyframes } from "styled-components";

const fade = keyframes`
  from {
    opacity: 0;
    transform: translateY(0.125rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const Content = styled(TooltipPrimitive.Content)`
  max-width: ${({ theme }) => theme.space[64]};
  padding-block: ${({ theme }) => theme.space[8]};
  padding-inline: ${({ theme }) => theme.space[12]};
  border-radius: ${({ theme }) => theme.radii.control};
  background: ${({ theme }) => theme.colors.text.primary};
  color: ${({ theme }) => theme.colors.bg.surface};
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  line-height: ${({ theme }) => theme.typography.caption.lineHeight};
  box-shadow: ${({ theme }) => theme.elevation.md};
  z-index: ${({ theme }) => theme.zIndices.overlay};
  animation: ${fade} ${({ theme }) => theme.motion.duration.fast}
    ${({ theme }) => theme.motion.easing.standard};

  ${({ theme }) => theme.media.reducedMotion} {
    animation: none;
  }
`;

export const Arrow = styled(TooltipPrimitive.Arrow)`
  fill: ${({ theme }) => theme.colors.text.primary};
`;

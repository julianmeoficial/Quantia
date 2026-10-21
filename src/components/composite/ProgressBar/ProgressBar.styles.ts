import { Progress as ProgressPrimitive } from "radix-ui";
import styled from "styled-components";

import type { BadgeTone } from "@/components/base/shared/types";

export const Root = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[8]};
  width: 100%;
`;

export const Label = styled.span`
  font-size: ${({ theme }) => theme.typography.label.fontSize};
  line-height: ${({ theme }) => theme.typography.label.lineHeight};
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const Track = styled(ProgressPrimitive.Root)`
  position: relative;
  overflow: hidden;
  height: ${({ theme }) => theme.space[8]};
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.bg.subtle};
`;

export const Indicator = styled(ProgressPrimitive.Indicator)<{
  $tone: BadgeTone | "brand";
  $indeterminate: boolean;
}>`
  height: 100%;
  width: 100%;
  transform-origin: left center;
  background: ${({ theme, $tone }) => {
    if ($tone === "brand") return theme.colors.brand.primary;
    const status = $tone === "danger" ? "error" : $tone;
    return theme.colors.status[status].text;
  }};
  transition: transform ${({ theme }) => theme.motion.duration.base}
    ${({ theme }) => theme.motion.easing.standard};

  ${({ $indeterminate }) =>
    $indeterminate &&
    `
      transform: scaleX(0.35);
      animation: q-progress-slide 1.2s ease-in-out infinite alternate;
    `}

  @keyframes q-progress-slide {
    from {
      transform: translateX(-60%) scaleX(0.35);
    }
    to {
      transform: translateX(160%) scaleX(0.35);
    }
  }

  ${({ theme }) => theme.media.reducedMotion} {
    transition: none;
    animation: none;
  }
`;

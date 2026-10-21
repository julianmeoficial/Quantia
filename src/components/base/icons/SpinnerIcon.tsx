import styled, { keyframes } from "styled-components";

import { Icon, type IconProps } from "./Icon";

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const Spinning = styled(Icon)`
  animation: ${spin} 0.7s linear infinite;

  ${({ theme }) => theme.media.reducedMotion} {
    animation: none;
  }
`;

export function SpinnerIcon(props: IconProps) {
  return (
    <Spinning {...props}>
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.25" />
      <path
        d="M13.5 8A5.5 5.5 0 0 0 8 2.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Spinning>
  );
}

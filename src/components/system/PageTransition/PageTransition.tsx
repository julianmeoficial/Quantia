"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import styled from "styled-components";

import { transitions } from "@/lib/motion";

const Root = styled(motion.div)`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[16]};
  min-width: 0;
  min-height: 0;
`;

export interface PageTransitionProps {
  children: ReactNode;
}

/**
 * Route-level entrance: 200 ms opacity + 8 px rise, transform/opacity only. It never delays
 * navigation or data (content is interactive immediately); reduced motion → opacity only
 * via the global `MotionConfig reducedMotion="user"`.
 */
export function PageTransition({ children }: PageTransitionProps) {
  return (
    <Root
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transitions.base}
    >
      {children}
    </Root>
  );
}

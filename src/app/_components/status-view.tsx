"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import styled from "styled-components";

import { theme } from "@/theme";

export interface StatusViewProps {
  title: string;
  description: string;
  action?: ReactNode;
}

const Wrapper = styled(motion.section)`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.space[4]};
  padding: ${({ theme }) => theme.space[6]};
  text-align: center;
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.headingLarge.fontSize};
  line-height: ${({ theme }) => theme.typography.headingLarge.lineHeight};
  font-weight: ${({ theme }) => theme.typography.headingLarge.fontWeight};
  letter-spacing: ${({ theme }) => theme.typography.headingLarge.letterSpacing};
`;

const Description = styled.p`
  max-width: 40rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.bodyLarge.fontSize};
  line-height: ${({ theme }) => theme.typography.bodyLarge.lineHeight};
`;

/** Vista provisional para inicio, 404 y error hasta que existan los componentes de DESIGN.md. */
export function StatusView({ title, description, action }: StatusViewProps) {
  return (
    <Wrapper
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: theme.motion.durationSeconds.slow, ease: "easeOut" }}
    >
      <Title>{title}</Title>
      <Description>{description}</Description>
      {action}
    </Wrapper>
  );
}

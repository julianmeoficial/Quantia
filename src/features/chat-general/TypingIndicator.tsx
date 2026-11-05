"use client";

import type { PresenceUser } from "@quantia/contracts";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import styled from "styled-components";

import { Avatar } from "@/components/base";
import { transitions } from "@/lib/motion";

export function typingLabel(users: readonly PresenceUser[]): string {
  const names = users.map((user) => user.name.split(/\s+/)[0] ?? user.name);
  if (names.length === 0) return "";
  if (names.length === 1) return `${names[0]} está escribiendo`;
  if (names.length === 2) return `${names[0]} y ${names[1]} están escribiendo`;
  return `${names[0]}, ${names[1]} y ${names.length - 2} más están escribiendo`;
}

const Root = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space[8]};
  padding: ${({ theme }) => theme.space[4]} ${({ theme }) => theme.space[16]};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  line-height: ${({ theme }) => theme.typography.caption.lineHeight};
`;

const Faces = styled.span`
  display: inline-flex;

  & > * + * {
    margin-left: -${({ theme }) => theme.space[8]};
  }
`;

const Bubble = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.space[4]};
  height: ${({ theme }) => theme.space[24]};
  padding: 0 ${({ theme }) => theme.space[8]};
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.bg.subtle};
`;

const Dot = styled(motion.span)`
  width: ${({ theme }) => theme.space[4]};
  height: ${({ theme }) => theme.space[4]};
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.text.secondary};
`;

export interface TypingIndicatorProps {
  users: readonly PresenceUser[];
}

/** «Ana está escribiendo…» with three soft dots; static under reduced motion. */
export function TypingIndicator({ users }: TypingIndicatorProps) {
  const reduce = useReducedMotion();
  const visible = users.slice(0, 3);

  return (
    <AnimatePresence>
      {users.length > 0 ? (
        <Root
          key="typing"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={transitions.base}
          aria-hidden
        >
          <Faces>
            <AnimatePresence initial={false}>
              {visible.map((user) => (
                <motion.span
                  key={user.id}
                  layout
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={transitions.layout}
                  style={{ display: "inline-flex" }}
                >
                  <Avatar name={user.name} avatarKey={user.avatar} announceName={false} />
                </motion.span>
              ))}
            </AnimatePresence>
          </Faces>
          <Bubble>
            {[0, 1, 2].map((index) => (
              <Dot
                key={index}
                animate={reduce ? { opacity: 0.7 } : { y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
                transition={
                  reduce
                    ? { duration: 0 }
                    : { duration: 0.9, repeat: Infinity, ease: "easeInOut", delay: index * 0.15 }
                }
              />
            ))}
          </Bubble>
          <span>{typingLabel(users)}…</span>
        </Root>
      ) : null}
    </AnimatePresence>
  );
}

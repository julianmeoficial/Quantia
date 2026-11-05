"use client";

import type { PresenceUser } from "@quantia/contracts";
import { AnimatePresence } from "motion/react";

import { Avatar } from "@/components/base";
import { ConnectionStatus, type ConnectionState } from "@/components/system";
import { formatTime } from "@/lib/format";
import { transitions } from "@/lib/motion";

import * as S from "./PresenceList.styles";

export interface PresenceListRecent {
  user: PresenceUser;
  lastSeenAt: string;
}

export interface PresenceListProps {
  users: readonly PresenceUser[];
  connectionState: ConnectionState;
  onReconnect?: () => void;
  headingId?: string;
  /** Users currently typing (server `escribiendo`), shown inline under their name. */
  typingIds?: ReadonlySet<string>;
  /** Marks the current user as «Tú». */
  meId?: string;
  /** Left during this session («visto por última vez»). */
  recent?: readonly PresenceListRecent[];
}

const rowMotion = {
  layout: true,
  initial: { opacity: 0, x: -8 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 8 },
  transition: transitions.layout,
} as const;

export function PresenceList({
  users,
  connectionState,
  onReconnect,
  headingId = "presence-heading",
  typingIds,
  meId,
  recent = [],
}: PresenceListProps) {
  const count = users.length;
  const countLabel =
    count === 0 ? "Nadie en línea" : count === 1 ? "1 en línea" : `${count} en línea`;

  return (
    <S.Root aria-labelledby={headingId}>
      <S.Heading id={headingId}>En línea</S.Heading>
      <S.Count>
        <S.Dot aria-hidden $live={count > 0} />
        {countLabel}
      </S.Count>
      {count === 0 ? (
        <S.Empty>Cuando alguien entre al chat, aparecerá aquí.</S.Empty>
      ) : (
        <S.List>
          <AnimatePresence initial={false}>
            {users.map((user) => {
              const typing = typingIds?.has(user.id) ?? false;
              return (
                <S.Row key={user.id} {...rowMotion}>
                  <S.AvatarWrap>
                    <Avatar
                      name={user.name}
                      avatarKey={user.avatar}
                      size="md"
                      announceName={false}
                    />
                    <S.OnlineBadge aria-hidden />
                  </S.AvatarWrap>
                  <S.Identity>
                    <S.Name>
                      {user.name}
                      {user.id === meId ? <S.Me> (tú)</S.Me> : null}
                    </S.Name>
                    <AnimatePresence initial={false}>
                      {typing ? (
                        <S.Typing
                          key="typing"
                          initial={{ opacity: 0, y: -2 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -2 }}
                          transition={transitions.fast}
                        >
                          escribiendo…
                        </S.Typing>
                      ) : null}
                    </AnimatePresence>
                  </S.Identity>
                </S.Row>
              );
            })}
          </AnimatePresence>
        </S.List>
      )}

      {recent.length > 0 ? (
        <>
          <S.Subheading>Recientemente</S.Subheading>
          <S.List aria-label="Conectados recientemente">
            <AnimatePresence initial={false}>
              {recent.map(({ user, lastSeenAt }) => (
                <S.Row key={user.id} {...rowMotion} $muted>
                  <Avatar name={user.name} avatarKey={user.avatar} size="md" announceName={false} />
                  <S.Identity>
                    <S.Name>{user.name}</S.Name>
                    <S.LastSeen dateTime={lastSeenAt}>
                      visto por última vez a las {formatTime(lastSeenAt)}
                    </S.LastSeen>
                  </S.Identity>
                </S.Row>
              ))}
            </AnimatePresence>
          </S.List>
        </>
      ) : null}

      <S.ConnectionSlot>
        <ConnectionStatus state={connectionState} onReconnect={onReconnect} />
      </S.ConnectionSlot>
    </S.Root>
  );
}

"use client";

import type { PresenceUser } from "@quantia/contracts";

import { Avatar } from "@/components/base";
import { ConnectionStatus, type ConnectionState } from "@/components/system";

import * as S from "./PresenceList.styles";

export interface PresenceListProps {
  users: readonly PresenceUser[];
  connectionState: ConnectionState;
  onReconnect?: () => void;
  headingId?: string;
}

export function PresenceList({
  users,
  connectionState,
  onReconnect,
  headingId = "presence-heading",
}: PresenceListProps) {
  const count = users.length;
  const countLabel =
    count === 0 ? "Nadie en línea" : count === 1 ? "1 en línea" : `${count} en línea`;

  return (
    <S.Root aria-labelledby={headingId}>
      <S.Heading id={headingId}>En línea</S.Heading>
      <S.Count>{countLabel}</S.Count>
      {count === 0 ? (
        <S.Empty>Cuando alguien entre al chat, aparecerá aquí.</S.Empty>
      ) : (
        <S.List>
          {users.map((user) => (
            <S.Row key={user.id}>
              <Avatar
                name={user.name}
                src={user.avatarUrl ?? undefined}
                size="md"
                announceName={false}
              />
              <S.Name>{user.name}</S.Name>
            </S.Row>
          ))}
        </S.List>
      )}
      <S.ConnectionSlot>
        <ConnectionStatus state={connectionState} onReconnect={onReconnect} />
      </S.ConnectionSlot>
    </S.Root>
  );
}

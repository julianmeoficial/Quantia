"use client";

import styled from "styled-components";

import { Avatar, Button, Link } from "@/components/base";
import { SyncStatus, type SyncStatusValue } from "@/components/system";
import { formatDate } from "@/lib/format";

const List = styled.ol`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[16]};
  margin: 0;
  padding: 0;
  list-style: none;
`;

const Item = styled.li`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: ${({ theme }) => theme.space[12]};
  padding-bottom: ${({ theme }) => theme.space[16]};
  border-bottom: ${({ theme }) => theme.borderWidths.thin} solid
    ${({ theme }) => theme.colors.border.subtle};
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${({ theme }) => theme.space[8]};
`;

const MetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.space[12]};
`;

const Text = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
`;

const Time = styled.time`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.bodySmall.fontSize};
`;

export interface ActivityItem {
  id: string;
  at: string;
  actor: string;
  text: string;
  evidenceHref?: string;
  evidenceLabel?: string;
  /** When set, renders SyncStatus for the entry (Notion sync). */
  syncStatus?: SyncStatusValue;
}

export interface ActivityTimelineProps {
  items: ActivityItem[];
  onLoadOlder?: () => void;
  isLoadingOlder?: boolean;
}

export function ActivityTimeline({
  items,
  onLoadOlder,
  isLoadingOlder = false,
}: ActivityTimelineProps) {
  return (
    <div>
      {onLoadOlder ? (
        <Button type="button" intent="ghost" onClick={onLoadOlder} isLoading={isLoadingOlder}>
          Cargar anteriores
        </Button>
      ) : null}
      <List>
        {items.map((item) => (
          <Item key={item.id}>
            <Avatar name={item.actor} announceName={false} />
            <Body>
              <Text>
                <strong>{item.actor}.</strong> {item.text}
              </Text>
              <MetaRow>
                <Time dateTime={item.at}>{formatDate(item.at, { withTime: true })}</Time>
                {item.syncStatus ? <SyncStatus status={item.syncStatus} persisted /> : null}
              </MetaRow>
              {item.evidenceHref && item.evidenceLabel ? (
                <Link href={item.evidenceHref} external>
                  {item.evidenceLabel}
                </Link>
              ) : null}
            </Body>
          </Item>
        ))}
      </List>
    </div>
  );
}

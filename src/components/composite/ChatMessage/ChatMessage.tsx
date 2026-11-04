"use client";

import type { GeneralChatMessageDto } from "@quantia/contracts";

import { Avatar, Button } from "@/components/base";
import { formatTime } from "@/lib/format";

import * as S from "./ChatMessage.styles";

export type ChatDeliveryState = "sending" | "sent" | "failed";

export interface ChatMessageProps {
  message: GeneralChatMessageDto;
  deliveryState?: ChatDeliveryState;
  isOwn?: boolean;
  onRetry?: () => void;
}

export function ChatMessage({
  message,
  deliveryState = "sent",
  isOwn = false,
  onRetry,
}: ChatMessageProps) {
  const timeLabel = formatTime(message.createdAt);
  const sending = deliveryState === "sending";
  const failed = deliveryState === "failed";

  return (
    <S.Root $own={isOwn} $sending={sending} data-delivery={deliveryState}>
      <Avatar
        name={message.author.name}
        src={message.author.avatarUrl ?? undefined}
        size="md"
        announceName={!isOwn}
      />
      <S.Body $own={isOwn}>
        {!isOwn ? <S.Author>{message.author.name}</S.Author> : null}
        <S.Bubble $own={isOwn}>
          <S.Content>{message.content}</S.Content>
        </S.Bubble>
        <S.Meta $own={isOwn}>
          <S.Time dateTime={message.createdAt}>{timeLabel}</S.Time>
          {sending ? <S.Delivery>Enviando…</S.Delivery> : null}
          {failed ? (
            <S.FailedRow>
              <S.FailedText>No se envió</S.FailedText>
              {onRetry ? (
                <Button intent="ghost" size="md" type="button" onClick={onRetry}>
                  Reintentar
                </Button>
              ) : null}
            </S.FailedRow>
          ) : null}
        </S.Meta>
      </S.Body>
    </S.Root>
  );
}

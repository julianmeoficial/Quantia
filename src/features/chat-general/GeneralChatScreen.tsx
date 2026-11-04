"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Virtuoso } from "react-virtuoso";

import { ChatMessage, MessageComposer } from "@/components/composite";
import { EmptyState, ErrorState, Skeleton } from "@/components/system";
import { useAuth } from "@/features/auth/AuthProvider";
import { GENERAL_CHAT_MESSAGE_MAX } from "@/lib/api/chat";
import { errorStatePropsFromApiError } from "@/lib/api/errorUi";

import * as S from "./GeneralChatScreen.styles";
import { groupMessagesByDay, type ChatListRow, type ChatRowMessage } from "./groupMessagesByDay";
import { mergeChatMessages } from "./mergeChatMessages";
import { useGeneralChatHistory } from "./useGeneralChatHistory";
import { useSendGeneralChatMessage } from "./useSendGeneralChatMessage";

const VIRTUOSO_START = 10_000_000;

export function GeneralChatScreen() {
  const { user } = useAuth();
  const history = useGeneralChatHistory();
  const sendState = useSendGeneralChatMessage();
  const [firstItemIndex, setFirstItemIndex] = useState(VIRTUOSO_START);
  const [nowMs, setNowMs] = useState(0);
  const wasFetchingOlder = useRef(false);
  const rowsBeforeOlderFetch = useRef(0);

  useEffect(() => {
    const tick = () => setNowMs(Date.now());
    tick();
    if (!sendState.rateLimitedUntil) return;
    const remaining = sendState.rateLimitedUntil - Date.now();
    if (remaining <= 0) return;
    const timer = window.setInterval(tick, 1000);
    const stop = window.setTimeout(() => {
      window.clearInterval(timer);
      tick();
    }, remaining + 50);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(stop);
    };
  }, [sendState.rateLimitedUntil]);

  const merged = useMemo(
    () => mergeChatMessages(history.messages, sendState.optimistic),
    [history.messages, sendState.optimistic],
  );

  const messageRows: ChatRowMessage[] = useMemo(
    () =>
      merged.map((entry) => ({
        kind: "message" as const,
        key: entry.message.clientMessageId ?? entry.message.id,
        message: entry.message,
        deliveryState: entry.deliveryState,
        isOwn: Boolean(user && entry.message.author.id === user.id),
      })),
    [merged, user],
  );

  const rows: ChatListRow[] = useMemo(() => groupMessagesByDay(messageRows), [messageRows]);

  useEffect(() => {
    if (history.isFetchingOlder && !wasFetchingOlder.current) {
      rowsBeforeOlderFetch.current = rows.length;
    }
    if (!history.isFetchingOlder && wasFetchingOlder.current) {
      const added = rows.length - rowsBeforeOlderFetch.current;
      if (added > 0) {
        setFirstItemIndex((index) => index - added);
      }
    }
    wasFetchingOlder.current = history.isFetchingOlder;
  }, [history.isFetchingOlder, rows.length]);

  const rateLimited = sendState.rateLimitedUntil !== null && sendState.rateLimitedUntil > nowMs;
  const rateLimitSeconds = rateLimited
    ? Math.max(1, Math.ceil((sendState.rateLimitedUntil! - nowMs) / 1000))
    : 0;

  const composerHelp = rateLimited
    ? `Espera ${rateLimitSeconds}s antes de enviar otro mensaje`
    : undefined;

  if (history.status === "loading" || history.status === "idle") {
    return (
      <S.Screen aria-labelledby="chat-general-title">
        <S.Header>
          <h1 id="chat-general-title">Chat general</h1>
          <S.Lead>Conversación del semillero INNOVATEK&apos;S / GITEMOS.</S.Lead>
        </S.Header>
        <Skeleton variant="list" rows={6} />
      </S.Screen>
    );
  }

  if (history.status === "error" && history.error) {
    const ui = errorStatePropsFromApiError(history.error);
    const chatDisabled = history.error.kind === "not_found";
    return (
      <S.Screen aria-labelledby="chat-general-title">
        <S.Header>
          <h1 id="chat-general-title">Chat general</h1>
        </S.Header>
        <ErrorState
          variant={ui.variant}
          title={chatDisabled ? "Chat general no disponible" : ui.title}
          description={
            chatDisabled ? "Esta conversación no está habilitada en este entorno." : ui.description
          }
          retryAfterSeconds={ui.retryAfterSeconds}
          onRetry={chatDisabled ? undefined : history.reload}
          retryLabel="Reintentar"
        />
      </S.Screen>
    );
  }

  const empty = rows.length === 0;

  return (
    <S.Screen aria-labelledby="chat-general-title">
      <S.Header>
        <h1 id="chat-general-title">Chat general</h1>
        <S.Lead>Conversación del semillero INNOVATEK&apos;S / GITEMOS.</S.Lead>
      </S.Header>

      <S.Panel>
        {empty ? (
          <S.EmptyWrap>
            <EmptyState
              kind="no-records"
              title="Aún no hay mensajes"
              description="Sé la primera persona en escribir en el chat del semillero."
            />
          </S.EmptyWrap>
        ) : (
          <S.Log
            role="log"
            aria-relevant="additions"
            aria-busy={history.isFetchingOlder || undefined}
          >
            {history.isFetchingOlder ? (
              <S.OlderHint>Cargando mensajes anteriores…</S.OlderHint>
            ) : null}
            <Virtuoso
              style={{ height: "100%" }}
              data={rows}
              firstItemIndex={firstItemIndex}
              initialTopMostItemIndex={rows.length - 1}
              startReached={() => {
                if (history.hasMore) history.loadOlder();
              }}
              followOutput={(isAtBottom) => (isAtBottom ? "smooth" : false)}
              increaseViewportBy={{ top: 200, bottom: 200 }}
              itemContent={(_index, row) => {
                if (row.kind === "separator") {
                  return <S.DaySeparator>{row.label}</S.DaySeparator>;
                }
                return (
                  <S.MessagePad>
                    <ChatMessage
                      message={row.message}
                      deliveryState={row.deliveryState}
                      isOwn={row.isOwn}
                      onRetry={
                        row.deliveryState === "failed" && row.message.clientMessageId
                          ? () => sendState.retry(row.message.clientMessageId!)
                          : undefined
                      }
                    />
                  </S.MessagePad>
                );
              }}
            />
          </S.Log>
        )}

        <S.ComposerSlot>
          <MessageComposer
            value={sendState.draft}
            onChange={sendState.setDraft}
            onSend={sendState.send}
            maxLength={GENERAL_CHAT_MESSAGE_MAX}
            isSending={sendState.isSending}
            disabled={rateLimited}
            error={sendState.composerError}
            helpText={composerHelp}
          />
        </S.ComposerSlot>
      </S.Panel>
    </S.Screen>
  );
}

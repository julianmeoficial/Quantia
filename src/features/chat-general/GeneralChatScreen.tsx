"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Virtuoso, type VirtuosoHandle } from "react-virtuoso";

import { Button } from "@/components/base";
import { ChatMessage, MessageComposer, PresenceList } from "@/components/composite";
import { EmptyState, ErrorState, Sheet, Skeleton } from "@/components/system";
import { useAuth } from "@/features/auth/AuthProvider";
import { GENERAL_CHAT_MESSAGE_MAX } from "@/lib/api/chat";
import { errorStatePropsFromApiError } from "@/lib/api/errorUi";
import { useGeneralSocket } from "@/lib/socket";

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
  const [presenceOpen, setPresenceOpen] = useState(false);
  const wasFetchingOlder = useRef(false);
  const rowsBeforeOlderFetch = useRef(0);
  const isAtBottomRef = useRef(true);
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const presenceTriggerRef = useRef<HTMLElement | null>(null);

  const general = useGeneralSocket({ isAtBottomRef });

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

  const onlineCount = general.users.length;
  const presenceTriggerLabel =
    onlineCount === 0
      ? "En línea (0)"
      : onlineCount === 1
        ? "En línea (1)"
        : `En línea (${onlineCount})`;

  function jumpToLatest() {
    general.clearPendingNew();
    isAtBottomRef.current = true;
    if (rows.length === 0) return;
    virtuosoRef.current?.scrollToIndex({
      index: rows.length - 1,
      align: "end",
      behavior: "smooth",
    });
  }

  if (history.status === "loading" || history.status === "idle") {
    return (
      <S.Screen aria-labelledby="chat-general-title">
        <S.Header>
          <S.HeaderText>
            <h1 id="chat-general-title">Chat general</h1>
            <S.Lead>Conversación del semillero INNOVATEK&apos;S / GITEMOS.</S.Lead>
          </S.HeaderText>
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
          <S.HeaderText>
            <h1 id="chat-general-title">Chat general</h1>
          </S.HeaderText>
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
  const pendingLabel =
    general.pendingNewCount === 1
      ? "1 mensaje nuevo"
      : `${general.pendingNewCount} mensajes nuevos`;

  return (
    <S.Screen aria-labelledby="chat-general-title">
      <S.Header>
        <S.HeaderText>
          <h1 id="chat-general-title">Chat general</h1>
          <S.Lead>Conversación del semillero INNOVATEK&apos;S / GITEMOS.</S.Lead>
        </S.HeaderText>
        <S.MobilePresence
          ref={(node) => {
            presenceTriggerRef.current = node;
          }}
        >
          <Button type="button" intent="secondary" size="md" onClick={() => setPresenceOpen(true)}>
            {presenceTriggerLabel}
          </Button>
        </S.MobilePresence>
      </S.Header>

      <S.Layout>
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
                ref={virtuosoRef}
                style={{ height: "100%" }}
                data={rows}
                firstItemIndex={firstItemIndex}
                initialTopMostItemIndex={rows.length - 1}
                startReached={() => {
                  if (history.hasMore) history.loadOlder();
                }}
                atBottomStateChange={(atBottom) => {
                  isAtBottomRef.current = atBottom;
                  if (atBottom) general.clearPendingNew();
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
              {general.pendingNewCount > 0 ? (
                <S.NewMessagesPill type="button" onClick={jumpToLatest}>
                  {pendingLabel}
                </S.NewMessagesPill>
              ) : null}
              <S.LiveRegion aria-live="polite" aria-atomic="true">
                {general.liveAnnouncement}
              </S.LiveRegion>
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

        <S.Rail aria-label="Personas en línea">
          <PresenceList
            users={general.users}
            connectionState={general.connectionState}
            onReconnect={general.reconnect}
          />
        </S.Rail>
      </S.Layout>

      <Sheet
        open={presenceOpen}
        onOpenChange={setPresenceOpen}
        title="En línea"
        description={presenceTriggerLabel}
        triggerRef={presenceTriggerRef}
      >
        <PresenceList
          users={general.users}
          connectionState={general.connectionState}
          onReconnect={general.reconnect}
          headingId="presence-sheet-heading"
        />
      </Sheet>
    </S.Screen>
  );
}

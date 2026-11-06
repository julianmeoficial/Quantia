"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { Avatar, Button, IconButton } from "@/components/base";
import { ArrowDownIcon, UsersIcon, XIcon } from "@/components/base/icons";
import { ChatMessage, MessageComposer, PresenceList } from "@/components/composite";
import { ConfirmDialog, EmptyState, ErrorState, Sheet, Skeleton } from "@/components/system";
import { useAuth } from "@/features/auth/AuthProvider";
import { errorStatePropsFromApiError } from "@/lib/api/errorUi";
import { readDraft, saveDraft } from "@/lib/auth";
import { gsap, MOTION_QUERIES, useGSAP } from "@/lib/gsap";
import { transitions } from "@/lib/motion";

import { AvatarPickerPanel } from "./AvatarPickerPanel";
import { seenByCount, type ChatEntry } from "./chatReducer";
import * as S from "./GeneralChatScreen.styles";
import { buildChatRows } from "./groupMessagesByDay";
import { TypingIndicator } from "./TypingIndicator";
import { useGeneralChat } from "./useGeneralChat";

const DRAFT_KEY = "chat:general";
const BOTTOM_THRESHOLD_PX = 96;

function Title() {
  return (
    <S.HeaderText>
      <h1 id="chat-general-title">Chat general</h1>
      <S.Lead>Conversación del semillero INNOVATEK&apos;S / GITEMOS.</S.Lead>
    </S.HeaderText>
  );
}

function excerpt(text: string) {
  return text.length > 90 ? `${text.slice(0, 90)}…` : text;
}

export function GeneralChatScreen() {
  const { user } = useAuth();
  const chat = useGeneralChat();
  const { socket } = chat;

  const [draft, setDraftState] = useState(() => readDraft(DRAFT_KEY) ?? "");
  const [replyTo, setReplyTo] = useState<ChatEntry | null>(null);
  const [editing, setEditing] = useState<ChatEntry | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<ChatEntry | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [presenceOpen, setPresenceOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [pendingNew, setPendingNew] = useState(0);
  const [highlight, setHighlight] = useState<{ key: string; token: number } | null>(null);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [nowMs, setNowMs] = useState(0);
  const [layoutEnabled, setLayoutEnabled] = useState(true);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLLIElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const presenceTriggerRef = useRef<HTMLElement | null>(null);
  const atBottomRef = useRef(true);
  const prependAnchor = useRef<{ height: number; top: number } | null>(null);
  const lastKeyRef = useRef<string | null>(null);
  const didInitialScroll = useRef(false);
  const rowRefs = useRef(new Map<string, HTMLElement>());

  const setDraft = useCallback((value: string) => {
    setDraftState(value);
    saveDraft(DRAFT_KEY, value);
  }, []);

  // ---------- Rate-limit countdown ----------
  useEffect(() => {
    if (!chat.rateLimitedUntil) return;
    const tick = () => setNowMs(Date.now());
    tick();
    const timer = window.setInterval(tick, 1_000);
    const stop = window.setTimeout(
      () => {
        window.clearInterval(timer);
        chat.clearRateLimit();
      },
      Math.max(chat.rateLimitedUntil - Date.now(), 0) + 50,
    );
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(stop);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-arm only when the deadline moves
  }, [chat.rateLimitedUntil]);

  const rateLimitSeconds =
    chat.rateLimitedUntil && chat.rateLimitedUntil > nowMs
      ? Math.max(1, Math.ceil((chat.rateLimitedUntil - nowMs) / 1_000))
      : 0;

  // ---------- Rows ----------
  const rows = useMemo(
    () =>
      buildChatRows(chat.entries, {
        meId: chat.meId,
        unreadDividerSeq: chat.store.unreadDividerSeq,
      }),
    [chat.entries, chat.meId, chat.store.unreadDividerSeq],
  );
  const lastEntry = chat.entries.at(-1) ?? null;
  const typingIds = useMemo(() => new Set(socket.typing.map((card) => card.id)), [socket.typing]);
  const ownEntries = useMemo(
    () => chat.entries.filter((entry) => entry.message.author.id === chat.meId && !entry.local),
    [chat.entries, chat.meId],
  );

  // ---------- Scroll management ----------
  // Programmatic scrolling must never fight the person: a finger drag, a trackpad inertia
  // glide or a mouse wheel always wins over «follow the tail».
  const lastUserInputAt = useRef(0);
  const programmaticUntil = useRef(0);
  const markUserInput = useCallback(() => {
    lastUserInputAt.current = performance.now();
    programmaticUntil.current = 0;
  }, []);

  const scrollToBottom = useCallback((behavior: ScrollBehavior, force = false) => {
    const el = scrollerRef.current;
    if (!el) return;
    // A glide in progress (trackpad inertia, flick) keeps running: don't yank it.
    if (!force && performance.now() - lastUserInputAt.current < 350) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const next: ScrollBehavior = reduce ? "auto" : behavior;
    if (next === "smooth") programmaticUntil.current = performance.now() + 600;
    el.scrollTo({ top: el.scrollHeight, behavior: next });
    atBottomRef.current = true;
  }, []);

  const onScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < BOTTOM_THRESHOLD_PX;
    // While our own smooth scroll is travelling, intermediate positions aren't «left the bottom».
    if (!atBottom && performance.now() < programmaticUntil.current) return;
    atBottomRef.current = atBottom;
    if (atBottom) {
      setPendingNew(0);
      chat.markReadUpToLatest();
    }
  }, [chat]);

  // Initial position: the «Mensajes nuevos» divider if any, otherwise the bottom.
  useLayoutEffect(() => {
    if (chat.phase !== "ready" || didInitialScroll.current) return;
    const el = scrollerRef.current;
    if (!el) return;
    didInitialScroll.current = true;
    const divider = el.querySelector<HTMLElement>("[data-unread-divider]");
    if (divider) {
      el.scrollTop = Math.max(divider.offsetTop - el.clientHeight / 3, 0);
      atBottomRef.current = false;
    } else {
      el.scrollTop = el.scrollHeight;
      atBottomRef.current = true;
      chat.markReadUpToLatest();
    }
    lastKeyRef.current = lastEntry?.key ?? null;
  }, [chat, chat.phase, lastEntry]);

  // Keep the reading position when older pages are prepended.
  useLayoutEffect(() => {
    const anchor = prependAnchor.current;
    const el = scrollerRef.current;
    if (!anchor || !el || chat.isFetchingOlder) return;
    el.scrollTop = anchor.top + (el.scrollHeight - anchor.height);
    prependAnchor.current = null;
    const frame = requestAnimationFrame(() => setLayoutEnabled(true));
    return () => cancelAnimationFrame(frame);
  }, [chat.entries, chat.isFetchingOlder]);

  // New tail message: follow it if it's mine or I'm at the bottom; otherwise count it.
  useLayoutEffect(() => {
    if (!didInitialScroll.current || !lastEntry) return;
    if (lastEntry.key === lastKeyRef.current) return;
    lastKeyRef.current = lastEntry.key;
    if (!lastEntry.live) return;
    const mine = lastEntry.message.author.id === chat.meId;
    if (mine || atBottomRef.current) {
      requestAnimationFrame(() => scrollToBottom("smooth", mine));
      if (!mine) chat.markReadUpToLatest();
    } else {
      setPendingNew((count) => count + 1);
    }
  }, [chat, lastEntry, scrollToBottom]);

  // Typing indicator appearing at the bottom: keep it visible when following the tail.
  useEffect(() => {
    if (socket.typing.length > 0 && atBottomRef.current) scrollToBottom("smooth");
  }, [scrollToBottom, socket.typing.length]);

  // Infinite history upward.
  const requestOlder = useCallback(() => {
    const el = scrollerRef.current;
    if (!el || !chat.hasMore || chat.isFetchingOlder) return;
    prependAnchor.current = { height: el.scrollHeight, top: el.scrollTop };
    setLayoutEnabled(false);
    void chat.loadOlder().then((loaded) => {
      if (!loaded) {
        prependAnchor.current = null;
        setLayoutEnabled(true);
      }
    });
  }, [chat]);

  useEffect(() => {
    const target = sentinelRef.current;
    const root = scrollerRef.current;
    if (!target || !root || chat.phase !== "ready") return;
    const observer = new IntersectionObserver(
      (items) => {
        if (items.some((item) => item.isIntersecting) && didInitialScroll.current) requestOlder();
      },
      { root, rootMargin: "240px 0px 0px 0px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
    // Re-observe after every page: the observer only reports a *change* in visibility, so a
    // short page that leaves the sentinel in range would otherwise never request the next one.
  }, [chat.phase, chat.entries.length, chat.isFetchingOlder, requestOlder]);

  // Mark read when the tab becomes visible again at the bottom.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible" && atBottomRef.current) chat.markReadUpToLatest();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [chat]);

  // ---------- GSAP: first paint of the conversation ----------
  useGSAP(
    () => {
      if (chat.phase !== "ready" || !scrollerRef.current) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_QUERIES.allowMotion, () => {
        const bubbles = gsap.utils
          .toArray<HTMLElement>("[data-chat-row]", scrollerRef.current)
          .slice(-12);
        gsap.from(bubbles, {
          autoAlpha: 0,
          y: 14,
          duration: 0.25,
          ease: "power3.out",
          stagger: 0.02,
          clearProps: "opacity,visibility,transform",
        });
      });
      return () => mm.revert();
    },
    { dependencies: [chat.phase === "ready"], scope: scrollerRef },
  );

  // ---------- Actions ----------
  const focusComposer = () => requestAnimationFrame(() => textareaRef.current?.focus());

  const startReply = (entry: ChatEntry) => {
    setEditing(null);
    setReplyTo(entry);
    focusComposer();
  };

  const startEdit = (entry: ChatEntry) => {
    setReplyTo(null);
    setEditing(entry);
    setEditDraft(entry.message.content);
    focusComposer();
  };

  const cancelContext = () => {
    setReplyTo(null);
    setEditing(null);
    setEditDraft("");
    focusComposer();
  };

  const jumpTo = async (messageId: string) => {
    const key = await chat.ensureLoaded(messageId);
    if (!key) return;
    requestAnimationFrame(() => {
      const node = rowRefs.current.get(key);
      node?.scrollIntoView({ block: "center", behavior: "smooth" });
      setHighlight((current) => ({ key, token: (current?.token ?? 0) + 1 }));
    });
  };

  const submit = async () => {
    if (editing) {
      const content = editDraft.trim();
      if (!content) return;
      if (content === editing.message.content) {
        cancelContext();
        return;
      }
      setSavingEdit(true);
      const ok = await chat.edit(editing.message.id, content);
      setSavingEdit(false);
      if (ok) cancelContext();
      return;
    }
    const sent = chat.send(draft, replyTo?.message ?? null);
    if (sent) {
      setDraft("");
      setReplyTo(null);
      atBottomRef.current = true;
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    await chat.remove(pendingDelete);
    setDeleting(false);
    if (editing?.key === pendingDelete.key) cancelContext();
    if (replyTo?.key === pendingDelete.key) setReplyTo(null);
    setPendingDelete(null);
  };

  // ---------- Non-ready phases ----------
  if (chat.phase === "avatar-required" && user) {
    return (
      <S.Screen aria-labelledby="chat-general-title">
        <S.Header>
          <Title />
        </S.Header>
        <AvatarPickerPanel
          currentAvatar={user.avatar}
          displayName={user.fullName}
          onSaved={chat.completeAvatar}
        />
      </S.Screen>
    );
  }

  if (chat.phase === "chat-disabled") {
    return (
      <S.Screen aria-labelledby="chat-general-title">
        <S.Header>
          <Title />
        </S.Header>
        <ErrorState
          variant="server"
          title="Chat general no disponible"
          description="Esta conversación no está habilitada en este entorno."
        />
      </S.Screen>
    );
  }

  if (chat.phase === "error" && chat.loadError) {
    const ui = errorStatePropsFromApiError(chat.loadError);
    return (
      <S.Screen aria-labelledby="chat-general-title">
        <S.Header>
          <Title />
        </S.Header>
        <ErrorState
          variant={ui.variant}
          title={ui.title}
          description={ui.description}
          retryAfterSeconds={ui.retryAfterSeconds}
          onRetry={chat.reload}
          retryLabel="Reintentar"
        />
      </S.Screen>
    );
  }

  if (chat.phase === "loading") {
    return (
      <S.Screen aria-labelledby="chat-general-title" aria-busy>
        <S.Header>
          <Title />
        </S.Header>
        <S.Layout>
          <S.Panel>
            <S.EmptyWrap>
              <Skeleton variant="list" rows={6} />
            </S.EmptyWrap>
          </S.Panel>
          <S.Rail>
            <Skeleton variant="list" rows={4} />
          </S.Rail>
        </S.Layout>
      </S.Screen>
    );
  }

  // ---------- Ready ----------
  const empty = rows.length === 0;
  const composerContext = editing
    ? { title: "Editando mensaje", excerpt: excerpt(editing.message.content) }
    : replyTo
      ? {
          title: `Respondiendo a ${replyTo.message.author.id === chat.meId ? "ti" : replyTo.message.author.name}`,
          excerpt: excerpt(replyTo.message.content),
        }
      : null;
  const composerHelp =
    rateLimitSeconds > 0 ? `Espera ${rateLimitSeconds} s antes de enviar otro mensaje` : undefined;
  const lastOwnEditable = [...ownEntries].reverse().find((entry) => chat.canEdit(entry));
  const facePreview = socket.online.slice(0, 4);
  const onlineLabel = `En línea (${socket.online.length})`;

  const presence = (
    <PresenceList
      users={socket.online}
      connectionState={socket.connectionState}
      onReconnect={socket.reconnect}
      typingIds={typingIds}
      meId={chat.meId}
      recent={socket.recentlyLeft}
    />
  );

  return (
    <S.Screen aria-labelledby="chat-general-title">
      <S.Header>
        <Title />
        <S.HeaderActions>
          <S.CompactOnly
            ref={(node) => {
              presenceTriggerRef.current = node;
            }}
          >
            <Button
              type="button"
              intent="secondary"
              size="md"
              leadingIcon={<UsersIcon />}
              onClick={() => setPresenceOpen(true)}
              aria-label={onlineLabel}
            >
              <S.Faces aria-hidden>
                <AnimatePresence initial={false}>
                  {facePreview.map((card) => (
                    <S.FaceRing
                      key={card.id}
                      layout
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.6 }}
                      transition={transitions.layout}
                    >
                      <Avatar name={card.name} avatarKey={card.avatar} announceName={false} />
                    </S.FaceRing>
                  ))}
                </AnimatePresence>
              </S.Faces>
              {socket.online.length}
            </Button>
          </S.CompactOnly>
          {user ? (
            <Button type="button" intent="ghost" size="md" onClick={() => setAvatarOpen(true)}>
              <Avatar name={user.fullName} avatarKey={user.avatar} announceName={false} />
              Cambiar foto de perfil
            </Button>
          ) : null}
        </S.HeaderActions>
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
            <S.Scroller
              ref={scrollerRef}
              role="log"
              aria-label="Mensajes del chat general"
              aria-live="off"
              aria-busy={chat.isFetchingOlder || undefined}
              tabIndex={0}
              onScroll={onScroll}
              onWheel={markUserInput}
              onTouchStart={markUserInput}
              onTouchMove={markUserInput}
              onPointerDown={markUserInput}
              onKeyDown={markUserInput}
            >
              <S.Rows>
                <S.Sentinel ref={sentinelRef} aria-hidden />
                {chat.isFetchingOlder ? (
                  <S.OlderStatus>Cargando mensajes anteriores…</S.OlderStatus>
                ) : !chat.hasMore ? (
                  <S.OlderStatus>Inicio de la conversación</S.OlderStatus>
                ) : null}
                <AnimatePresence initial={false}>
                  {rows.map((row) => {
                    if (row.kind === "separator") {
                      return (
                        <S.DaySeparator key={row.key}>
                          <S.DayLabel>{row.label}</S.DayLabel>
                        </S.DaySeparator>
                      );
                    }
                    if (row.kind === "unread") {
                      return (
                        <S.UnreadDivider
                          key={row.key}
                          data-unread-divider
                          initial={{ opacity: 0, scaleX: 0.8 }}
                          animate={{ opacity: 1, scaleX: 1 }}
                          transition={transitions.slow}
                        >
                          Mensajes nuevos
                        </S.UnreadDivider>
                      );
                    }
                    const { entry, isOwn, groupPosition } = row;
                    const deliveryState = entry.local?.status ?? "sent";
                    return (
                      <S.Row
                        key={row.key}
                        ref={(node: HTMLLIElement | null) => {
                          if (node) rowRefs.current.set(row.key, node);
                          else rowRefs.current.delete(row.key);
                        }}
                        data-chat-row
                        data-own={isOwn}
                        layout={layoutEnabled ? "position" : false}
                        initial={entry.live ? { opacity: 0, y: 16, scale: 0.97 } : false}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.92, transition: transitions.base }}
                        transition={transitions.layout}
                      >
                        <ChatMessage
                          message={entry.message}
                          deliveryState={deliveryState}
                          failureText={entry.local?.errorText}
                          isOwn={isOwn}
                          groupPosition={groupPosition}
                          seenBy={isOwn ? seenByCount(chat.store, entry.message.seq, chat.meId) : 0}
                          meId={chat.meId}
                          reactionOptions={chat.reactions}
                          pop={
                            chat.store.lastPop?.messageId === entry.message.id
                              ? chat.store.lastPop
                              : null
                          }
                          highlightToken={highlight?.key === row.key ? highlight.token : 0}
                          actionsVisible={activeKey === row.key}
                          isEditing={editing?.key === row.key}
                          canEdit={chat.canEdit(entry)}
                          canDelete={chat.canDelete(entry)}
                          onActivate={() => setActiveKey(row.key)}
                          onRetry={() => chat.retry(entry)}
                          onDiscard={() => chat.discard(entry)}
                          onReact={(emoji) => void chat.react(entry, emoji)}
                          onReply={() => startReply(entry)}
                          onEdit={() => startEdit(entry)}
                          onDelete={() => setPendingDelete(entry)}
                          onQuoteClick={(id) => void jumpTo(id)}
                        />
                      </S.Row>
                    );
                  })}
                </AnimatePresence>
              </S.Rows>
            </S.Scroller>
          )}

          <TypingIndicator users={socket.typing} />

          <S.PillSlot>
            <AnimatePresence>
              {pendingNew > 0 ? (
                <S.NewMessagesPill
                  type="button"
                  initial={{ opacity: 0, y: 16, scale: 0.94 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 16, scale: 0.94 }}
                  transition={transitions.slow}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setPendingNew(0);
                    scrollToBottom("smooth", true);
                    chat.markReadUpToLatest();
                  }}
                >
                  <ArrowDownIcon aria-hidden />
                  {pendingNew === 1 ? "1 mensaje nuevo" : `${pendingNew} mensajes nuevos`}
                  <S.PillCount aria-hidden>
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span
                        key={pendingNew}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={transitions.fast}
                      >
                        {pendingNew}
                      </motion.span>
                    </AnimatePresence>
                  </S.PillCount>
                </S.NewMessagesPill>
              ) : null}
            </AnimatePresence>
          </S.PillSlot>

          <S.ComposerSlot>
            <AnimatePresence>
              {chat.notice ? (
                <S.Notice
                  key={chat.notice.text}
                  $tone={chat.notice.tone}
                  role={chat.notice.tone === "error" ? "alert" : "status"}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={transitions.base}
                >
                  {chat.notice.text}
                  <IconButton
                    accessibleLabel="Cerrar aviso"
                    icon={<XIcon />}
                    onClick={chat.dismissNotice}
                  />
                </S.Notice>
              ) : null}
            </AnimatePresence>
            <MessageComposer
              textareaRef={textareaRef}
              value={editing ? editDraft : draft}
              onChange={(value) => {
                if (editing) {
                  setEditDraft(value);
                  return;
                }
                setDraft(value);
                socket.notifyTyping(value);
              }}
              onBlur={socket.stopTyping}
              onSend={() => void submit()}
              maxLength={chat.limits.maxLength}
              isSending={savingEdit}
              disabled={rateLimitSeconds > 0}
              helpText={composerHelp}
              mode={editing ? "edit" : "compose"}
              context={composerContext}
              onCancelContext={composerContext ? cancelContext : undefined}
              onEditLast={lastOwnEditable ? () => startEdit(lastOwnEditable) : undefined}
            />
          </S.ComposerSlot>
        </S.Panel>

        <S.Rail aria-label="Participantes">{presence}</S.Rail>
      </S.Layout>

      <Sheet
        open={presenceOpen}
        onOpenChange={setPresenceOpen}
        title="Participantes"
        description="Personas conectadas al chat del semillero."
        triggerRef={presenceTriggerRef}
      >
        {presence}
      </Sheet>

      {user ? (
        <Sheet
          open={avatarOpen}
          onOpenChange={setAvatarOpen}
          title="Cambiar foto de perfil"
          description="Elige cómo te verán en el chat."
        >
          <AvatarPickerPanel
            currentAvatar={user.avatar}
            displayName={user.fullName}
            onCancel={() => setAvatarOpen(false)}
            onSaved={(next) => {
              setAvatarOpen(false);
              chat.completeAvatar(next);
            }}
          />
        </Sheet>
      ) : null}

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open && !deleting) setPendingDelete(null);
        }}
        title="Eliminar mensaje"
        description={
          pendingDelete && pendingDelete.message.author.id !== chat.meId
            ? `Se eliminará el mensaje de ${pendingDelete.message.author.name} para todo el semillero. Esta acción no se puede deshacer.`
            : "Se eliminará para todo el semillero, junto con sus reacciones. Esta acción no se puede deshacer."
        }
        confirmLabel="Eliminar mensaje"
        intent="danger"
        isLoading={deleting}
        onConfirm={() => void confirmDelete()}
      />

      <S.LiveRegion aria-live="polite" aria-atomic="true">
        {chat.announcement}
      </S.LiveRegion>
    </S.Screen>
  );
}

"use client";

import type {
  ChatGeneralReaction,
  GeneralChatMessageDto,
  GeneralChatReactionSummary,
} from "@quantia/contracts";
import { AnimatePresence, motion, useAnimate } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";

import { Avatar, Button, IconButton } from "@/components/base";
import {
  CheckDoubleIcon,
  CheckIcon,
  ClockIcon,
  EditIcon,
  ReplyIcon,
  SmileIcon,
  TrashIcon,
} from "@/components/base/icons";
import { formatTime } from "@/lib/format";
import { transitions } from "@/lib/motion";

import * as S from "./ChatMessage.styles";

export type ChatDeliveryState = "sending" | "sent" | "failed";

/** Position inside a run of consecutive messages from the same author (< 5 min apart). */
export type ChatGroupPosition = "single" | "first" | "middle" | "last";

export interface ChatMessageProps {
  message: GeneralChatMessageDto;
  deliveryState?: ChatDeliveryState;
  isOwn?: boolean;
  groupPosition?: ChatGroupPosition;
  /** Own messages: how many other users read up to this `seq` (✓✓ / «Visto por N»). */
  seenBy?: number;
  /** Short reason when `deliveryState="failed"`. */
  failureText?: string;
  /** Allowlist from `GET /chat/general/state` (`reactions`). Empty → no reaction picker. */
  reactionOptions?: readonly ChatGeneralReaction[];
  /** Current user id, to mark «reaccioné yo» on chips. */
  meId?: string;
  /** Changes on every reaction event; the matching chip plays a short pop. */
  pop?: { emoji: ChatGeneralReaction; token: number } | null;
  /** Bumps to replay the 1–2 s locate highlight (quote jump). */
  highlightToken?: number;
  /** Toolbar forced visible (touch devices tap a bubble to reveal it). */
  actionsVisible?: boolean;
  isEditing?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  onRetry?: () => void;
  onDiscard?: () => void;
  onReact?: (emoji: ChatGeneralReaction) => void;
  onReply?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  /** Tap on the quoted parent → scroll to it. */
  onQuoteClick?: (messageId: string) => void;
  onActivate?: () => void;
}

function ReactionChip({
  reaction,
  mine,
  popToken,
  onToggle,
}: {
  reaction: GeneralChatReactionSummary;
  mine: boolean;
  popToken: number | null;
  onToggle?: () => void;
}) {
  const [scope, animate] = useAnimate<HTMLButtonElement>();

  useEffect(() => {
    if (popToken === null || !scope.current) return;
    void animate(scope.current, { scale: [1, 1.22, 1] }, { duration: 0.25, ease: "easeOut" });
  }, [animate, popToken, scope]);

  const label = `${reaction.emoji} ${reaction.count} ${reaction.count === 1 ? "reacción" : "reacciones"}${mine ? ", incluida la tuya" : ""}`;

  return (
    <S.Chip
      ref={scope}
      type="button"
      layout
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.6 }}
      transition={transitions.layout}
      $mine={mine}
      aria-pressed={mine}
      aria-label={label}
      onClick={onToggle}
      disabled={!onToggle}
    >
      <span aria-hidden>{reaction.emoji}</span>
      <S.ChipCount aria-hidden>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={reaction.count}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={transitions.fast}
          >
            {reaction.count}
          </motion.span>
        </AnimatePresence>
      </S.ChipCount>
    </S.Chip>
  );
}

function DeliveryMark({
  deliveryState,
  seenBy,
}: {
  deliveryState: ChatDeliveryState;
  seenBy: number;
}) {
  const state = deliveryState === "sending" ? "sending" : seenBy > 0 ? "seen" : "sent";
  const label =
    state === "sending"
      ? "Enviando"
      : state === "seen"
        ? seenBy === 1
          ? "Visto por 1 persona"
          : `Visto por ${seenBy} personas`
        : "Enviado";

  return (
    <S.Delivery $seen={state === "seen"} role="img" aria-label={label} title={label}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={state}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          transition={transitions.fast}
          style={{ display: "inline-flex" }}
        >
          {state === "sending" ? (
            <ClockIcon />
          ) : state === "seen" ? (
            <CheckDoubleIcon />
          ) : (
            <CheckIcon />
          )}
        </motion.span>
      </AnimatePresence>
    </S.Delivery>
  );
}

export function ChatMessage({
  message,
  deliveryState = "sent",
  isOwn = false,
  groupPosition = "single",
  seenBy = 0,
  failureText,
  reactionOptions = [],
  meId,
  pop = null,
  highlightToken = 0,
  actionsVisible = false,
  isEditing = false,
  canEdit = false,
  canDelete = false,
  onRetry,
  onDiscard,
  onReact,
  onReply,
  onEdit,
  onDelete,
  onQuoteClick,
  onActivate,
}: ChatMessageProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerId = useId();
  const pickerTrigger = useRef<HTMLButtonElement>(null);
  const timeLabel = formatTime(message.createdAt);
  const sending = deliveryState === "sending";
  const failed = deliveryState === "failed";
  const persisted = deliveryState === "sent";
  const showIdentity = groupPosition === "single" || groupPosition === "first";
  const canReact = persisted && Boolean(onReact) && reactionOptions.length > 0;
  const hasActions = persisted && (canReact || onReply || canEdit || canDelete);

  function closePicker(restoreFocus: boolean) {
    setPickerOpen(false);
    if (restoreFocus) pickerTrigger.current?.focus();
  }

  return (
    <S.Root
      $own={isOwn}
      $group={groupPosition}
      data-delivery={deliveryState}
      data-actions={actionsVisible || pickerOpen ? "open" : undefined}
      onPointerDown={onActivate}
      onKeyDown={(event) => {
        if (event.key === "Escape" && pickerOpen) {
          event.stopPropagation();
          closePicker(true);
        }
      }}
    >
      <S.AvatarSlot aria-hidden={!showIdentity}>
        {showIdentity ? (
          <Avatar
            name={message.author.name}
            avatarKey={message.author.avatar}
            size="md"
            announceName={false}
          />
        ) : null}
      </S.AvatarSlot>

      <S.Body $own={isOwn}>
        {showIdentity ? <S.Author>{isOwn ? "Tú" : message.author.name}</S.Author> : null}

        <S.BubbleRow $own={isOwn}>
          <S.Bubble $own={isOwn} $group={groupPosition} $editing={isEditing} $sending={sending}>
            {highlightToken > 0 ? (
              <S.Highlight
                key={highlightToken}
                aria-hidden
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 1, 0] }}
                transition={{ duration: 1.6, times: [0, 0.12, 0.7, 1], ease: "easeInOut" }}
              />
            ) : null}

            {message.replyTo ? (
              <S.Quote
                type="button"
                $own={isOwn}
                disabled={message.replyTo.deleted || !onQuoteClick}
                onClick={() => message.replyTo && onQuoteClick?.(message.replyTo.id)}
                aria-label={
                  message.replyTo.deleted
                    ? "Respuesta a un mensaje eliminado"
                    : `Ir al mensaje de ${message.replyTo.author.name}: ${message.replyTo.excerpt ?? ""}`
                }
              >
                <S.QuoteAuthor>{message.replyTo.author.name}</S.QuoteAuthor>
                <S.QuoteText $deleted={message.replyTo.deleted}>
                  {message.replyTo.deleted ? "Mensaje eliminado" : message.replyTo.excerpt}
                </S.QuoteText>
              </S.Quote>
            ) : null}

            <AnimatePresence mode="popLayout" initial={false}>
              <S.Content
                key={message.version}
                initial={{ opacity: 0, y: 2 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={transitions.base}
              >
                {message.content}
              </S.Content>
            </AnimatePresence>

            <S.Meta $own={isOwn}>
              {message.editedAt ? <S.Edited>editado</S.Edited> : null}
              <S.Time dateTime={message.createdAt}>{timeLabel}</S.Time>
              {isOwn && !failed ? (
                <DeliveryMark deliveryState={deliveryState} seenBy={seenBy} />
              ) : null}
            </S.Meta>
          </S.Bubble>

          {hasActions ? (
            <S.Toolbar
              $own={isOwn}
              role="toolbar"
              aria-label={`Acciones del mensaje de ${message.author.name}`}
            >
              {canReact ? (
                <IconButton
                  ref={pickerTrigger}
                  accessibleLabel="Reaccionar"
                  title="Reaccionar"
                  icon={<SmileIcon />}
                  aria-expanded={pickerOpen}
                  aria-controls={pickerOpen ? pickerId : undefined}
                  onClick={() => setPickerOpen((open) => !open)}
                />
              ) : null}
              {onReply ? (
                <IconButton
                  accessibleLabel="Responder"
                  title="Responder"
                  icon={<ReplyIcon />}
                  onClick={onReply}
                />
              ) : null}
              {canEdit && onEdit ? (
                <IconButton
                  accessibleLabel="Editar mensaje"
                  title="Editar"
                  icon={<EditIcon />}
                  onClick={onEdit}
                />
              ) : null}
              {canDelete && onDelete ? (
                <IconButton
                  accessibleLabel="Eliminar mensaje"
                  title="Eliminar"
                  icon={<TrashIcon />}
                  onClick={onDelete}
                />
              ) : null}
            </S.Toolbar>
          ) : null}
        </S.BubbleRow>

        <AnimatePresence>
          {pickerOpen && canReact ? (
            <S.Tray
              id={pickerId}
              role="group"
              aria-label="Elegir reacción"
              $own={isOwn}
              initial={{ opacity: 0, y: -4, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.96 }}
              transition={transitions.fast}
            >
              {reactionOptions.map((emoji, index) => {
                const mine = message.reactions.some(
                  (reaction) => reaction.emoji === emoji && meId && reaction.userIds.includes(meId),
                );
                return (
                  <S.TrayEmoji
                    key={emoji}
                    type="button"
                    aria-pressed={mine}
                    aria-label={`Reaccionar con ${emoji}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...transitions.fast, delay: index * 0.018 }}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => {
                      onReact?.(emoji);
                      closePicker(true);
                    }}
                  >
                    {emoji}
                  </S.TrayEmoji>
                );
              })}
            </S.Tray>
          ) : null}
        </AnimatePresence>

        {message.reactions.length > 0 ? (
          <S.Reactions $own={isOwn} aria-label="Reacciones">
            <AnimatePresence initial={false} mode="popLayout">
              {message.reactions.map((reaction) => (
                <ReactionChip
                  key={reaction.emoji}
                  reaction={reaction}
                  mine={Boolean(meId && reaction.userIds.includes(meId))}
                  popToken={pop && pop.emoji === reaction.emoji ? pop.token : null}
                  onToggle={canReact ? () => onReact?.(reaction.emoji) : undefined}
                />
              ))}
            </AnimatePresence>
          </S.Reactions>
        ) : null}

        {failed ? (
          <S.FailedRow $own={isOwn} role="alert">
            <S.FailedText>{failureText ?? "No se envió."}</S.FailedText>
            {onRetry ? (
              <Button intent="ghost" size="md" type="button" onClick={onRetry}>
                Reintentar
              </Button>
            ) : null}
            {onDiscard ? (
              <Button intent="ghost" size="md" type="button" onClick={onDiscard}>
                Descartar
              </Button>
            ) : null}
          </S.FailedRow>
        ) : null}
      </S.Body>
    </S.Root>
  );
}

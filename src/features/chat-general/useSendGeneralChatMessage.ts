"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useRef, useState } from "react";

import { useAuth } from "@/features/auth/AuthProvider";
import { createGeneralChatMessage } from "@/lib/api/chat";
import { insertChatMessageInCache } from "@/lib/api/chatCache";
import { ApiError } from "@/lib/api/errors";
import type { GeneralChatMessageDto } from "@quantia/contracts";

import type { OptimisticChatMessage } from "./mergeChatMessages";

export type UseSendGeneralChatMessageState = {
  optimistic: OptimisticChatMessage[];
  draft: string;
  setDraft: (value: string) => void;
  isSending: boolean;
  rateLimitedUntil: number | null;
  composerError: string | undefined;
  send: () => void;
  retry: (clientMessageId: string) => void;
};

function newClientMessageId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `c-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function temporaryMessage(
  content: string,
  clientMessageId: string,
  author: { id: string; name: string; avatarUrl: string | null },
): GeneralChatMessageDto {
  return {
    id: `optimistic:${clientMessageId}`,
    content,
    clientMessageId,
    createdAt: new Date().toISOString(),
    author,
  };
}

export function useSendGeneralChatMessage(): UseSendGeneralChatMessageState {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState("");
  const [optimistic, setOptimistic] = useState<OptimisticChatMessage[]>([]);
  const [rateLimitedUntil, setRateLimitedUntil] = useState<number | null>(null);
  const [composerError, setComposerError] = useState<string | undefined>();
  const inFlight = useRef<Set<string>>(new Set());

  const author = useMemo(
    () => (user ? { id: user.id, name: user.fullName, avatarUrl: null as string | null } : null),
    [user],
  );

  const mutation = useMutation({
    mutationFn: (input: { content: string; clientMessageId: string }) =>
      createGeneralChatMessage(input),
  });

  const patchOptimistic = useCallback(
    (
      clientMessageId: string,
      patch: Partial<OptimisticChatMessage> & { message?: GeneralChatMessageDto },
    ) => {
      setOptimistic((prev) =>
        prev.map((entry) => {
          if (entry.message.clientMessageId !== clientMessageId) return entry;
          return {
            deliveryState: patch.deliveryState ?? entry.deliveryState,
            message: patch.message ?? entry.message,
          };
        }),
      );
    },
    [],
  );

  const dropOptimistic = useCallback((clientMessageId: string) => {
    setOptimistic((prev) =>
      prev.filter((entry) => entry.message.clientMessageId !== clientMessageId),
    );
  }, []);

  const runSend = useCallback(
    async (content: string, clientMessageId: string, options?: { clearDraft?: boolean }) => {
      if (!author) return;
      if (inFlight.current.has(clientMessageId)) return;

      const rateLimited = rateLimitedUntil !== null && rateLimitedUntil > Date.now();
      if (rateLimited) {
        const seconds = Math.max(1, Math.ceil((rateLimitedUntil - Date.now()) / 1000));
        setComposerError(`Estamos procesando demasiadas solicitudes. Reintentando en ${seconds}s`);
        return;
      }

      inFlight.current.add(clientMessageId);
      setComposerError(undefined);

      const existing = optimistic.find(
        (entry) => entry.message.clientMessageId === clientMessageId,
      );
      if (!existing) {
        setOptimistic((prev) => [
          ...prev,
          {
            message: temporaryMessage(content, clientMessageId, author),
            deliveryState: "sending",
          },
        ]);
      } else {
        patchOptimistic(clientMessageId, { deliveryState: "sending" });
      }

      if (options?.clearDraft) setDraft("");

      try {
        const confirmed = await mutation.mutateAsync({ content, clientMessageId });
        dropOptimistic(clientMessageId);
        insertChatMessageInCache(queryClient, confirmed);
      } catch (cause) {
        const error = cause instanceof ApiError ? cause : new ApiError("unknown", null);
        if (error.kind === "rate_limited") {
          const seconds = error.retryAfterSeconds ?? 5;
          setRateLimitedUntil(Date.now() + seconds * 1000);
          setComposerError(
            `Estamos procesando demasiadas solicitudes. Reintentando en ${seconds}s`,
          );
        } else {
          setComposerError("No se pudo enviar el mensaje. Inténtalo de nuevo.");
        }
        patchOptimistic(clientMessageId, { deliveryState: "failed" });
        if (options?.clearDraft) setDraft(content);
      } finally {
        inFlight.current.delete(clientMessageId);
      }
    },
    [author, dropOptimistic, mutation, optimistic, patchOptimistic, queryClient, rateLimitedUntil],
  );

  const send = useCallback(() => {
    const content = draft.trim();
    if (!content || !author) return;
    const clientMessageId = newClientMessageId();
    void runSend(content, clientMessageId, { clearDraft: true });
  }, [author, draft, runSend]);

  const retry = useCallback(
    (clientMessageId: string) => {
      const entry = optimistic.find((item) => item.message.clientMessageId === clientMessageId);
      if (!entry) return;
      void runSend(entry.message.content, clientMessageId);
    },
    [optimistic, runSend],
  );

  return {
    optimistic,
    draft,
    setDraft,
    isSending: mutation.isPending,
    rateLimitedUntil,
    composerError,
    send,
    retry,
  };
}

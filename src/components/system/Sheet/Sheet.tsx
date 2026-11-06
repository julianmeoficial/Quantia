"use client";

import { Dialog as DialogPrimitive } from "radix-ui";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
} from "react";

import { IconButton } from "@/components/base";
import { XIcon } from "@/components/base/icons";
import { haptic } from "@/lib/device";
import { MOTION_QUERIES, gsap, useGSAP } from "@/lib/gsap";
import { gsapDurations } from "@/lib/motion";

import * as S from "./Sheet.styles";

export interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  /** Optional trigger element for focus return (Radix uses previously focused node by default). */
  triggerRef?: RefObject<HTMLElement | null>;
}

function prefersWideSheet(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(min-width: 48rem)").matches;
}

export function Sheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  triggerRef,
}: SheetProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const closingRef = useRef(false);
  const [portalOpen, setPortalOpen] = useState(open);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    void (async () => {
      await Promise.resolve();
      if (cancelled) return;
      closingRef.current = false;
      setPortalOpen(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  const animateIn = useCallback(() => {
    const el = contentRef.current;
    if (!el) return;
    const reduceMotion = window.matchMedia(MOTION_QUERIES.reduceMotion).matches;
    if (reduceMotion) {
      gsap.set(el, { x: 0, y: 0, opacity: 1 });
      return;
    }
    const from = prefersWideSheet()
      ? { x: "100%", y: 0, opacity: 0 }
      : { x: 0, y: "100%", opacity: 0 };
    gsap.fromTo(el, from, {
      x: 0,
      y: 0,
      opacity: 1,
      duration: gsapDurations.slow,
      ease: "power2.out",
    });
  }, []);

  const animateOut = useCallback((then: () => void) => {
    const el = contentRef.current;
    if (!el) {
      then();
      return;
    }
    const reduceMotion = window.matchMedia(MOTION_QUERIES.reduceMotion).matches;
    if (reduceMotion) {
      then();
      return;
    }
    const to = prefersWideSheet()
      ? { x: "100%", y: 0, opacity: 0 }
      : { x: 0, y: "100%", opacity: 0 };
    gsap.to(el, {
      ...to,
      duration: gsapDurations.base,
      ease: "power2.in",
      onComplete: then,
    });
  }, []);

  useGSAP(
    () => {
      if (!open || !portalOpen) return;
      return animateIn();
    },
    { dependencies: [open, portalOpen], scope: contentRef },
  );

  const requestClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    animateOut(() => {
      closingRef.current = false;
      setPortalOpen(false);
      onOpenChange(false);
      triggerRef?.current?.focus();
    });
  }, [animateOut, onOpenChange, triggerRef]);

  // ---------- Bottom sheet: drag down to dismiss (compact only) ----------
  const drag = useRef<{ startY: number; lastY: number; lastT: number; velocity: number } | null>(
    null,
  );

  const onDragStart = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (prefersWideSheet() || (event.target as Element).closest("button")) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      startY: event.clientY,
      lastY: event.clientY,
      lastT: event.timeStamp,
      velocity: 0,
    };
  };

  const onDragMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    const el = contentRef.current;
    if (!state || !el) return;
    const dy = event.clientY - state.startY;
    const dt = Math.max(1, event.timeStamp - state.lastT);
    state.velocity = (event.clientY - state.lastY) / dt;
    state.lastY = event.clientY;
    state.lastT = event.timeStamp;
    // Downward follows the finger 1:1; upward resists (rubber band), like iOS sheets.
    gsap.set(el, { y: dy >= 0 ? dy : dy / 6 });
  };

  const onDragEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    const el = contentRef.current;
    drag.current = null;
    if (!state || !el) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    const dy = event.clientY - state.startY;
    if (dy > 96 || state.velocity > 0.6) {
      haptic("light");
      requestClose();
      return;
    }
    gsap.to(el, { y: 0, duration: gsapDurations.base, ease: "power3.out" });
  };

  useEffect(() => {
    if (open || !portalOpen || closingRef.current) return;
    let cancelled = false;
    void (async () => {
      await Promise.resolve();
      if (cancelled || closingRef.current) return;
      requestClose();
    })();
    return () => {
      cancelled = true;
    };
  }, [open, portalOpen, requestClose]);

  return (
    <DialogPrimitive.Root
      open={portalOpen}
      onOpenChange={(next) => {
        if (next) {
          onOpenChange(true);
          setPortalOpen(true);
          return;
        }
        requestClose();
      }}
    >
      <DialogPrimitive.Portal>
        <S.Overlay />
        <S.Content
          ref={contentRef}
          onCloseAutoFocus={(event) => {
            if (triggerRef?.current) {
              event.preventDefault();
              triggerRef.current.focus();
            }
          }}
        >
          <S.DragZone
            onPointerDown={onDragStart}
            onPointerMove={onDragMove}
            onPointerUp={onDragEnd}
            onPointerCancel={onDragEnd}
          >
            <S.Grabber aria-hidden />
            <S.Header>
              <S.HeaderText>
                <S.Title>{title}</S.Title>
              </S.HeaderText>
              <IconButton
                accessibleLabel="Cerrar panel"
                icon={<XIcon />}
                intent="ghost"
                onClick={requestClose}
              />
            </S.Header>
          </S.DragZone>
          {description ? <S.Description>{description}</S.Description> : null}
          <S.Body>{children}</S.Body>
          {footer ? <S.Footer>{footer}</S.Footer> : null}
        </S.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

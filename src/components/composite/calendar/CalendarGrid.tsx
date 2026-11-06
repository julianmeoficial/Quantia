"use client";

import { useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";

import { IconButton } from "@/components/base";
import { ChevronIcon } from "@/components/base/icons";

import { toApiDate } from "@/lib/format";

import * as S from "../DateRangePicker/DateRangePicker.styles";
import {
  WEEKDAYS,
  buildMonthCells,
  daysInMonth,
  isDateDisabled,
  monthLabel,
  shiftMonth,
  ymdKey,
  type CalendarMonth,
} from "./calendarMath";

export interface CalendarGridProps {
  label: string;
  cursor: CalendarMonth;
  onCursorChange: (next: CalendarMonth) => void;
  selectedIso?: string | null;
  rangeFromIso?: string | null;
  rangeToIso?: string | null;
  minDate?: string | null;
  maxDate?: string | null;
  onSelectDay: (iso: string) => void;
}

function dayFromIsoInMonth(iso: string | null | undefined, cursor: CalendarMonth): number | null {
  if (!iso) return null;
  const key = ymdKey(iso);
  if (!key) return null;
  const year = Number(key.slice(0, 4));
  const month = Number(key.slice(4, 6)) - 1;
  const day = Number(key.slice(6, 8));
  if (year !== cursor.year || month !== cursor.month) return null;
  return day;
}

export function CalendarGrid({
  label,
  cursor,
  onCursorChange,
  selectedIso,
  rangeFromIso,
  rangeToIso,
  minDate,
  maxDate,
  onSelectDay,
}: CalendarGridProps) {
  const cells = useMemo(() => buildMonthCells(cursor), [cursor]);
  const fromKey = ymdKey(rangeFromIso);
  const toKey = ymdKey(rangeToIso);
  const selectedKey = ymdKey(selectedIso);
  const todayKey = useMemo(() => ymdKey(toApiDate(new Date())), []);
  const defaultFocusDay =
    dayFromIsoInMonth(selectedIso, cursor) ??
    dayFromIsoInMonth(rangeFromIso, cursor) ??
    dayFromIsoInMonth(rangeToIso, cursor) ??
    1;
  const [rovingDay, setRovingDay] = useState(defaultFocusDay);
  const focusDay = Math.min(Math.max(1, rovingDay), daysInMonth(cursor.year, cursor.month));
  const dayRefs = useRef(new Map<number, HTMLButtonElement>());
  const pendingFocusDay = useRef<number | null>(null);

  useLayoutEffect(() => {
    if (pendingFocusDay.current === null) return;
    const day = pendingFocusDay.current;
    pendingFocusDay.current = null;
    dayRefs.current.get(day)?.focus();
  }, [cursor.year, cursor.month, focusDay]);

  const changeMonth = (next: CalendarMonth, preferDay?: number) => {
    const clamped = Math.min(preferDay ?? focusDay, daysInMonth(next.year, next.month));
    pendingFocusDay.current = clamped;
    setRovingDay(clamped);
    onCursorChange(next);
  };

  const focusDayButton = (day: number) => {
    setRovingDay(day);
    dayRefs.current.get(day)?.focus();
  };

  const moveFocus = (fromDay: number, delta: number) => {
    const maxDay = daysInMonth(cursor.year, cursor.month);
    const nextDay = fromDay + delta;
    if (nextDay < 1) {
      const prev = shiftMonth(cursor, -1);
      const prevMax = daysInMonth(prev.year, prev.month);
      changeMonth(prev, Math.min(prevMax, prevMax + nextDay));
      return;
    }
    if (nextDay > maxDay) {
      const overflow = nextDay - maxDay;
      const next = shiftMonth(cursor, 1);
      changeMonth(next, Math.min(daysInMonth(next.year, next.month), overflow));
      return;
    }
    focusDayButton(nextDay);
  };

  const handleGridKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "PageUp") {
      event.preventDefault();
      changeMonth(shiftMonth(cursor, event.shiftKey ? -12 : -1));
      return;
    }
    if (event.key === "PageDown") {
      event.preventDefault();
      changeMonth(shiftMonth(cursor, event.shiftKey ? 12 : 1));
      return;
    }

    const target = event.target;
    if (!(target instanceof HTMLButtonElement)) return;
    const currentDay = Number(target.dataset.day);
    if (!currentDay) return;

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      moveFocus(currentDay, -1);
      return;
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      moveFocus(currentDay, 1);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      moveFocus(currentDay, -7);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveFocus(currentDay, 7);
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      focusDayButton(1);
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      focusDayButton(daysInMonth(cursor.year, cursor.month));
    }
  };

  return (
    <>
      <S.MonthBar>
        <IconButton
          accessibleLabel="Mes anterior"
          icon={<ChevronIcon direction="left" />}
          onClick={() => changeMonth(shiftMonth(cursor, -1))}
        />
        <S.MonthLabel>{monthLabel(cursor)}</S.MonthLabel>
        <IconButton
          accessibleLabel="Mes siguiente"
          icon={<ChevronIcon direction="right" />}
          onClick={() => changeMonth(shiftMonth(cursor, 1))}
        />
      </S.MonthBar>
      <S.Grid role="grid" aria-label={label} onKeyDown={handleGridKeyDown}>
        {WEEKDAYS.map((day) => (
          <S.Weekday key={day}>{day}</S.Weekday>
        ))}
        {cells.map((cell, index) =>
          cell ? (
            <S.Day
              key={cell.iso}
              type="button"
              data-day={cell.day}
              ref={(node) => {
                if (node) dayRefs.current.set(cell.day, node);
                else dayRefs.current.delete(cell.day);
              }}
              disabled={isDateDisabled(cell.iso, minDate, maxDate)}
              aria-current={ymdKey(cell.iso) === todayKey ? "date" : undefined}
              tabIndex={cell.day === focusDay ? 0 : -1}
              aria-pressed={
                selectedKey
                  ? ymdKey(cell.iso) === selectedKey
                  : cell.iso === rangeFromIso || cell.iso === rangeToIso
              }
              $inRange={Boolean(
                fromKey && toKey && ymdKey(cell.iso) > fromKey && ymdKey(cell.iso) < toKey,
              )}
              onClick={() => {
                setRovingDay(cell.day);
                onSelectDay(cell.iso);
              }}
            >
              {cell.day}
            </S.Day>
          ) : (
            <span key={`empty-${index}`} />
          ),
        )}
      </S.Grid>
    </>
  );
}

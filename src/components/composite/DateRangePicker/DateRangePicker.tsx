"use client";

import { Popover as PopoverPrimitive } from "radix-ui";
import { useId, useMemo, useState } from "react";

import { IconButton, TextField } from "@/components/base";
import { CalendarIcon, ChevronIcon } from "@/components/base/icons";
import { formatDate, formatRange, toApiDate } from "@/lib/format";

import * as S from "./DateRangePicker.styles";

export interface DateRangeValue {
  from?: string | null;
  to?: string | null;
}

export interface DateRangePickerProps {
  label: string;
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  minDate?: string;
  maxDate?: string;
  error?: string;
}

const WEEKDAYS = ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"];

function ymdKey(iso: string | null | undefined): string {
  if (!iso) return "";
  const shown = formatDate(iso);
  if (shown === "—") return "";
  const [day, month, year] = shown.split("/");
  return `${year}${month}${day}`;
}

function monthParts(iso?: string | null): { year: number; month: number } {
  const shown = iso ? formatDate(iso) : formatDate(new Date());
  if (shown === "—") {
    const now = new Date();
    return { year: now.getUTCFullYear(), month: now.getUTCMonth() };
  }
  const [, month, year] = shown.split("/");
  return { year: Number(year), month: Number(month) - 1 };
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

function mondayIndex(year: number, month: number): number {
  const sunday = new Date(Date.UTC(year, month, 1)).getUTCDay();
  return (sunday + 6) % 7;
}

export function DateRangePicker({
  label,
  value,
  onChange,
  minDate,
  maxDate,
  error,
}: DateRangePickerProps) {
  const initial = monthParts(value.from ?? value.to);
  const [cursor, setCursor] = useState(initial);
  const [fromText, setFromText] = useState(value.from ? formatDate(value.from) : "");
  const [toText, setToText] = useState(value.to ? formatDate(value.to) : "");
  const [textError, setTextError] = useState<string | null>(null);
  const labelId = useId();
  const valueId = useId();
  const errorId = useId();

  const cells = useMemo(() => {
    const count = daysInMonth(cursor.year, cursor.month);
    const lead = mondayIndex(cursor.year, cursor.month);
    const items: Array<{ iso: string; day: number } | null> = Array.from(
      { length: lead },
      () => null,
    );
    for (let day = 1; day <= count; day += 1) {
      const dd = String(day).padStart(2, "0");
      const mm = String(cursor.month + 1).padStart(2, "0");
      items.push({ day, iso: toApiDate(`${dd}/${mm}/${cursor.year}`) ?? "" });
    }
    return items;
  }, [cursor]);

  const fromKey = ymdKey(value.from);
  const toKey = ymdKey(value.to);
  const minKey = ymdKey(minDate);
  const maxKey = ymdKey(maxDate);

  function isDisabled(iso: string): boolean {
    const key = ymdKey(iso);
    if (minKey && key < minKey) return true;
    if (maxKey && key > maxKey) return true;
    return false;
  }

  function selectDay(iso: string) {
    if (!value.from || (value.from && value.to)) {
      onChange({ from: iso, to: null });
      setFromText(formatDate(iso));
      setToText("");
      setTextError(null);
      return;
    }
    if (ymdKey(iso) < ymdKey(value.from)) {
      onChange({ from: iso, to: value.from });
      setFromText(formatDate(iso));
      setToText(formatDate(value.from));
    } else {
      onChange({ from: value.from, to: iso });
      setToText(formatDate(iso));
    }
    setTextError(null);
  }

  function commitText(which: "from" | "to", raw: string) {
    if (!raw.trim()) {
      onChange({ ...value, [which]: null });
      setTextError(null);
      return;
    }
    const iso = toApiDate(raw);
    if (!iso || isDisabled(iso)) {
      setTextError("Usa el formato DD/MM/AAAA dentro del rango permitido.");
      return;
    }
    const next = { ...value, [which]: iso };
    if (next.from && next.to && ymdKey(next.to) < ymdKey(next.from)) {
      setTextError("La fecha final no puede ser anterior a la inicial.");
      return;
    }
    setTextError(null);
    onChange(next);
  }

  const monthName = new Intl.DateTimeFormat("es-CO", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(cursor.year, cursor.month, 1)));

  return (
    <S.Root>
      <S.Label id={labelId}>{label}</S.Label>
      <PopoverPrimitive.Root>
        <S.Trigger
          type="button"
          aria-labelledby={`${labelId} ${valueId}`}
          aria-describedby={error || textError ? errorId : undefined}
        >
          <span id={valueId}>{formatRange(value.from, value.to)}</span>
          <CalendarIcon aria-hidden />
        </S.Trigger>
        <PopoverPrimitive.Portal>
          <S.Panel align="start">
            <S.MonthBar>
              <IconButton
                accessibleLabel="Mes anterior"
                icon={<ChevronIcon direction="left" />}
                onClick={() =>
                  setCursor((current) =>
                    current.month === 0
                      ? { year: current.year - 1, month: 11 }
                      : { year: current.year, month: current.month - 1 },
                  )
                }
              />
              <S.MonthLabel>{monthName}</S.MonthLabel>
              <IconButton
                accessibleLabel="Mes siguiente"
                icon={<ChevronIcon direction="right" />}
                onClick={() =>
                  setCursor((current) =>
                    current.month === 11
                      ? { year: current.year + 1, month: 0 }
                      : { year: current.year, month: current.month + 1 },
                  )
                }
              />
            </S.MonthBar>
            <S.Grid role="grid" aria-label={label}>
              {WEEKDAYS.map((day) => (
                <S.Weekday key={day}>{day}</S.Weekday>
              ))}
              {cells.map((cell, index) =>
                cell ? (
                  <S.Day
                    key={cell.iso}
                    type="button"
                    disabled={isDisabled(cell.iso)}
                    aria-pressed={cell.iso === value.from || cell.iso === value.to}
                    $inRange={Boolean(
                      fromKey && toKey && ymdKey(cell.iso) > fromKey && ymdKey(cell.iso) < toKey,
                    )}
                    onClick={() => selectDay(cell.iso)}
                  >
                    {cell.day}
                  </S.Day>
                ) : (
                  <span key={`empty-${index}`} />
                ),
              )}
            </S.Grid>
            <S.Fields>
              <TextField
                label="Desde"
                value={fromText}
                placeholder="DD/MM/AAAA"
                onChange={(event) => setFromText(event.target.value)}
                onBlur={() => commitText("from", fromText)}
              />
              <TextField
                label="Hasta"
                value={toText}
                placeholder="DD/MM/AAAA"
                onChange={(event) => setToText(event.target.value)}
                onBlur={() => commitText("to", toText)}
              />
            </S.Fields>
          </S.Panel>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
      {error || textError ? <S.ErrorText id={errorId}>{error ?? textError}</S.ErrorText> : null}
    </S.Root>
  );
}

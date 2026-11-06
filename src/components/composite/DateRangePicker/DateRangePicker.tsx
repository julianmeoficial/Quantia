"use client";

import { Popover as PopoverPrimitive } from "radix-ui";
import { useId, useState } from "react";

import { TextField } from "@/components/base";
import { CalendarIcon } from "@/components/base/icons";
import { formatDate, formatRange, toApiDate } from "@/lib/format";

import { CalendarGrid, isDateDisabled, monthParts, ymdKey } from "../calendar";
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
    if (!iso || isDateDisabled(iso, minDate, maxDate)) {
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
            <CalendarGrid
              label={label}
              cursor={cursor}
              onCursorChange={setCursor}
              rangeFromIso={value.from}
              rangeToIso={value.to}
              minDate={minDate}
              maxDate={maxDate}
              onSelectDay={selectDay}
            />
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

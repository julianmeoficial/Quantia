"use client";

import { Popover as PopoverPrimitive } from "radix-ui";
import { useId, useState } from "react";

import { Button } from "@/components/base";
import { CalendarIcon } from "@/components/base/icons";
import { bogotaTimeParts, formatDate, toApiDate, toApiDateTime } from "@/lib/format";

import { CalendarGrid, isDateDisabled, monthParts } from "../calendar";
import * as Range from "../DateRangePicker/DateRangePicker.styles";
import * as S from "./DatePicker.styles";

export interface DatePickerProps {
  label: string;
  value: string | null;
  onValueChange: (value: string | null) => void;
  withTime?: boolean;
  minDate?: string | null;
  maxDate?: string | null;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

/** Clock time offered when a day is picked before any time was chosen. */
const DEFAULT_TIME = "09:00";

function timeOf(value: string | null): string {
  if (!value) return DEFAULT_TIME;
  const { hour, minute } = bogotaTimeParts(value);
  return `${hour}:${minute}`;
}

/** Rendered only inside the open popover, so «today» is never read during prerender. */
function TodayButton({
  minDate,
  maxDate,
  onPick,
}: {
  minDate?: string | null;
  maxDate?: string | null;
  onPick: (todayIso: string) => void;
}) {
  const todayIso = toApiDate(new Date());
  const allowed = Boolean(todayIso) && !isDateDisabled(todayIso as string, minDate, maxDate);
  return (
    <Button
      intent="ghost"
      type="button"
      disabled={!allowed}
      onClick={() => {
        if (todayIso) onPick(todayIso);
      }}
    >
      Hoy
    </Button>
  );
}

export function DatePicker({
  label,
  value,
  onValueChange,
  withTime = false,
  minDate,
  maxDate,
  error,
  required = false,
  disabled = false,
}: DatePickerProps) {
  const labelId = useId();
  const valueId = useId();
  const errorId = useId();
  const [open, setOpen] = useState(false);
  const timeId = useId();
  const [cursor, setCursor] = useState(() => monthParts(value));
  const [time, setTime] = useState(() => timeOf(value));

  const display =
    value && formatDate(value, { withTime }) !== "—"
      ? formatDate(value, { withTime })
      : withTime
        ? "Elegir fecha y hora"
        : "Elegir fecha";

  const applyDay = (isoDay: string) => {
    const next = withTime ? toApiDateTime(isoDay, time) : isoDay;
    onValueChange(next);
    if (!withTime) setOpen(false);
  };

  const applyTime = (next: string) => {
    if (!/^\d{2}:\d{2}$/.test(next)) return;
    setTime(next);
    if (!value) return;
    onValueChange(toApiDateTime(value, next));
  };

  return (
    <Range.Root>
      <Range.Label id={labelId}>
        {label}
        {required ? <S.RequiredMark> (obligatorio)</S.RequiredMark> : null}
      </Range.Label>
      <PopoverPrimitive.Root
        open={open}
        onOpenChange={(next) => {
          if (disabled) return;
          setOpen(next);
          if (next) {
            setCursor(monthParts(value));
            setTime(timeOf(value));
          }
        }}
      >
        <Range.Trigger
          type="button"
          disabled={disabled}
          aria-labelledby={`${labelId} ${valueId}`}
          aria-describedby={error ? errorId : undefined}
          aria-invalid={error ? true : undefined}
        >
          <span id={valueId}>{display}</span>
          <CalendarIcon aria-hidden />
        </Range.Trigger>
        <PopoverPrimitive.Portal>
          <Range.Panel align="start" side="bottom" sideOffset={8} collisionPadding={16}>
            <CalendarGrid
              label={label}
              cursor={cursor}
              onCursorChange={setCursor}
              selectedIso={value}
              minDate={minDate}
              maxDate={maxDate}
              onSelectDay={applyDay}
            />
            {withTime ? (
              <S.TimeRow>
                <S.TimeLabel htmlFor={timeId}>Hora (Bogotá, 24 h)</S.TimeLabel>
                <S.TimeInput
                  id={timeId}
                  type="time"
                  value={time}
                  onChange={(event) => applyTime(event.target.value)}
                />
                {!value ? <S.TimeHint>Elige un día para fijar la fecha.</S.TimeHint> : null}
              </S.TimeRow>
            ) : null}
            <S.Actions>
              <TodayButton
                minDate={minDate}
                maxDate={maxDate}
                onPick={(todayIso) => {
                  applyDay(todayIso);
                  setCursor(monthParts(todayIso));
                }}
              />
              <Button
                intent="secondary"
                type="button"
                disabled={!value}
                onClick={() => {
                  onValueChange(null);
                  setOpen(false);
                }}
              >
                Limpiar
              </Button>
              {withTime ? (
                <Button intent="primary" type="button" onClick={() => setOpen(false)}>
                  Listo
                </Button>
              ) : null}
            </S.Actions>
          </Range.Panel>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
      {error ? <Range.ErrorText id={errorId}>{error}</Range.ErrorText> : null}
    </Range.Root>
  );
}

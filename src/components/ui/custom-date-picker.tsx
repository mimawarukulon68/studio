
"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format, parse, isValid } from 'date-fns';
import { id as localeID } from 'date-fns/locale/id';
import { IMaskInput } from 'react-imask';
import type IMask from 'imask';

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

function formatDateForDisplay(dateStr: string | undefined): string {
  if (!dateStr) return "";
  const date = parse(dateStr, "dd/MM/yyyy", new Date());
  if (!isValid(date) || format(date, 'dd/MM/yyyy') !== dateStr) return "";
  return format(date, "dd MMMM yyyy", { locale: localeID });
}

function parseInputToDate(input: string | undefined): Date | undefined {
  if (!input) return undefined;
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(input)) return undefined;
  
  const date = parse(input, "dd/MM/yyyy", new Date());
  if (isValid(date) && format(date, 'dd/MM/yyyy') === input) {
    return date;
  }
  return undefined;
}

interface CustomDatePickerProps {
  id?: string;
  label?: string;
  value?: string; // DD/MM/YYYY from RHF
  onDateChange?: (dateStr: string | undefined) => void; // To RHF
  name?: string;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
  ariaInvalid?: boolean;
}

export function CustomDatePicker({
  id = "custom-date",
  label,
  value,
  onDateChange,
  name,
  className,
  inputClassName,
  disabled = false,
  ariaInvalid = false,
}: CustomDatePickerProps) {
  const [isPickerOpen, setIsPickerOpen] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);
  
  const iMaskRef = React.useRef<{ maskRef: IMask.MaskedDate }>(null);
  const inputElementRef = React.useRef<HTMLInputElement | null>(null);

  const selectedDate = React.useMemo(() => parseInputToDate(value), [value]);

  const currentYear = new Date().getFullYear();
  const fromYear = currentYear - 120;
  const toYear = currentYear;

  const iMaskOptions: IMask.MaskedDateOptions = {
    mask: Date,
    pattern: 'd{/}m{/}Y',
    lazy: false,
    placeholderChar: '_',
    format: (date) => format(date, "dd/MM/yyyy", { locale: localeID }),
    parse: (str) => parse(str, "dd/MM/yyyy", new Date()),
    blocks: {
      d: { mask: IMask.MaskedRange, from: 1, to: 31, maxLength: 2, autofix: 'pad' },
      m: { mask: IMask.MaskedRange, from: 1, to: 12, maxLength: 2, autofix: 'pad' },
      Y: { mask: IMask.MaskedRange, from: fromYear, to: toYear, maxLength: 4 },
    },
  };

  const handleAccept = (acceptedValue: string, maskRef: IMask.Masked<any>) => {
    // We only want to update the form state when the mask is complete and valid.
    // handleBlur will take care of final commitment.
    if (maskRef.isComplete) {
      const parsed = parseInputToDate(acceptedValue);
      if (parsed) {
        if (value !== acceptedValue) {
          onDateChange?.(acceptedValue);
        }
      }
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    const currentValue = iMaskRef.current?.maskRef.value;
    const parsed = parseInputToDate(currentValue);

    if (parsed) {
      if (value !== currentValue) {
        onDateChange?.(currentValue);
      }
    } else {
      if (value) {
        onDateChange?.(undefined);
      }
    }
  };

  const handleCalendarSelect = (dateFromCalendar: Date | undefined) => {
    setIsPickerOpen(false);
    const formattedValueForRHF = dateFromCalendar ? format(dateFromCalendar, "dd/MM/yyyy") : undefined;
    onDateChange?.(formattedValueForRHF);
    inputElementRef.current?.blur();
  };
  
  const defaultCalendarMonth = selectedDate || new Date(Math.max(fromYear, toYear - 7), 0, 1);
  const displayValue = formatDateForDisplay(value);
  const shouldShowFormattedDisplay = !isFocused && displayValue && !disabled;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && <Label htmlFor={id} className={cn(disabled && "text-muted-foreground")}>{label}</Label>}
      <div className="relative">
        {shouldShowFormattedDisplay ? (
          <div
            onClick={() => { if (!disabled) { setIsFocused(true); setTimeout(() => inputElementRef.current?.focus(), 0); }}}
            className={cn(
              "flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
              "cursor-text",
              inputClassName,
              ariaInvalid && "border-destructive"
            )}
            role="textbox"
            tabIndex={disabled ? -1 : 0}
            aria-labelledby={label ? id + "-label" : undefined}
            onFocus={() => { if (!disabled) { setIsFocused(true); setTimeout(() => inputElementRef.current?.focus(), 0); }}}
          >
            {displayValue}
          </div>
        ) : (
          <IMaskInput
            ref={iMaskRef as any}
            inputRef={(el: HTMLInputElement) => (inputElementRef.current = el)}
            {...iMaskOptions}
            id={id}
            name={name}
            value={value || ''}
            onAccept={handleAccept}
            onFocus={() => setIsFocused(true)}
            onBlur={handleBlur}
            disabled={disabled}
            aria-invalid={ariaInvalid}
            placeholder="DD/MM/YYYY"
            className={cn(
              "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
              "pr-10",
              inputClassName,
              ariaInvalid && "border-destructive"
            )}
          />
        )}
        <Popover open={isPickerOpen} onOpenChange={setIsPickerOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              className={cn(
                "absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2 p-0",
                disabled && "cursor-not-allowed opacity-50"
              )}
              aria-label="Pilih tanggal"
              disabled={disabled}
            >
              <CalendarIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end" sideOffset={5}>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleCalendarSelect}
              defaultMonth={defaultCalendarMonth}
              captionLayout="dropdown"
              disabled={disabled || ((date) => date > new Date() || date < new Date(fromYear -1, 11, 31))}
              locale={localeID}
              fromYear={fromYear}
              toYear={toYear}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

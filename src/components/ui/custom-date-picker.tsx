
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

function formatDateForDisplay(date: Date | undefined): string {
  if (!date || !isValid(date)) return "";
  return format(date, "dd MMMM yyyy", { locale: localeID });
}

function formatDateForInput(date: Date | undefined): string {
  if (!date || !isValid(date)) return "";
  return format(date, "dd/MM/yyyy", { locale: localeID });
}

function parseInputToDate(input: string | undefined): Date | undefined {
  if (!input) return undefined;
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(input)) return undefined;
  
  const [day, month, year] = input.split('/').map(Number);
  const parsedDate = parse(input, "dd/MM/yyyy", new Date());

  // Check for date rollover issues (e.g., 31/02/2024 -> 02/03/2024)
  if (!isValid(parsedDate) || parsedDate.getDate() !== day || parsedDate.getMonth() !== month - 1 || parsedDate.getFullYear() !== year) {
    return undefined;
  }
  
  return parsedDate;
}

interface CustomDatePickerProps {
  id?: string;
  label?: string;
  initialValue?: string; // DD/MM/YYYY from RHF
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
  initialValue,
  onDateChange,
  name,
  className,
  inputClassName,
  disabled = false,
  ariaInvalid = false,
}: CustomDatePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(() => parseInputToDate(initialValue));
  const [isPickerOpen, setIsPickerOpen] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);
  
  const iMaskRef = React.useRef<{ maskRef: IMask.MaskedDate }>(null);
  const inputElementRef = React.useRef<HTMLInputElement | null>(null);

  const currentYear = new Date().getFullYear();
  const fromYear = currentYear - 120;
  const toYear = currentYear;

  // Sync internal selectedDate state when the value from RHF changes.
  React.useEffect(() => {
    setSelectedDate(parseInputToDate(initialValue));
  }, [initialValue]);

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

  const handleAccept = (value: string, maskRef: IMask.Masked<any>) => {
    if (initialValue !== value) {
      onDateChange?.(value);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    const currentValue = iMaskRef.current?.maskRef.value;
    if (initialValue !== currentValue) {
        onDateChange?.(currentValue);
    }
  };

  const handleCalendarSelect = (dateFromCalendar: Date | undefined) => {
    setIsPickerOpen(false);
    const formattedValueForRHF = dateFromCalendar ? formatDateForInput(dateFromCalendar) : undefined;
    onDateChange?.(formattedValueForRHF);
    inputElementRef.current?.blur(); // Unfocus the text input
  };
  
  const defaultCalendarMonth = selectedDate || new Date(Math.max(fromYear, toYear - 7), 0, 1);

  const shouldShowFormattedDisplay = !isFocused && selectedDate && isValid(selectedDate) && !disabled;

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
            {formatDateForDisplay(selectedDate)}
          </div>
        ) : (
          <IMaskInput
            ref={iMaskRef as any}
            inputRef={(el: HTMLInputElement) => (inputElementRef.current = el)}
            {...iMaskOptions}
            id={id}
            name={name}
            value={initialValue || ''}
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

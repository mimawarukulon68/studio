
"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format, parse, isValid } from 'date-fns';
import { id as localeID } from 'date-fns/locale/id';
import { IMaskInput } from 'react-imask';
import IMask from 'imask';

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { InputProps } from "@/components/ui/input"; // For styling

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
  const parsedDate = parse(input, "dd/MM/yyyy", new Date());
  return isValid(parsedDate) ? parsedDate : undefined;
}

function isValidDateString(dateStr: string | undefined): boolean {
    if (!dateStr) return false;
    const parsed = parseInputToDate(dateStr);
    if (!parsed || !isValid(parsed)) return false;
    // Double check for date rollover issues (e.g. 31/02/2024)
    const [day, month, year] = dateStr.split('/').map(Number);
    return parsed.getFullYear() === year && parsed.getMonth() === month - 1 && parsed.getDate() === day;
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
  initialValue, // This is the value from react-hook-form, expected as "dd/MM/yyyy" string
  onDateChange,
  name, // For RHF, passed to FormField
  className,
  inputClassName,
  disabled = false,
  ariaInvalid = false,
}: CustomDatePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(() =>
    isValidDateString(initialValue) ? parseInputToDate(initialValue) : undefined
  );
  const [maskedInputValue, setMaskedInputValue] = React.useState(initialValue || "");
  const [isPickerOpen, setIsPickerOpen] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);

  const iMaskRef = React.useRef<IMask.MaskedDate | null>(null);
  const inputElementRef = React.useRef<HTMLInputElement | null>(null);

  const currentYear = new Date().getFullYear();
  const fromYear = currentYear - 120;
  const toYear = currentYear;

  React.useEffect(() => {
    // Sync internal states when initialValue (from RHF) changes
    if (isValidDateString(initialValue)) {
      setSelectedDate(parseInputToDate(initialValue));
    } else {
      setSelectedDate(undefined);
    }
    // Always update maskedInputValue to reflect RHF's state,
    // especially if RHF clears the field or sets an invalid string.
    setMaskedInputValue(initialValue || "");
  }, [initialValue]);


  const iMaskOptions: IMask.MaskOptions<IMask.MaskedDate> = {
    mask: Date,
    pattern: 'd{/}m{/}Y',
    lazy: false, // Show mask characters immediately on focus
    placeholderChar: '_',
    format: (date) => format(date, "dd/MM/yyyy", { locale: localeID }),
    parse: (str) => parse(str, "dd/MM/yyyy", new Date()),
    blocks: {
      d: { mask: IMask.MaskedRange, from: 1, to: 31, maxLength: 2, autofix: 'pad' },
      m: { mask: IMask.MaskedRange, from: 1, to: 12, maxLength: 2, autofix: 'pad' },
      Y: { mask: IMask.MaskedRange, from: fromYear, to: toYear, maxLength: 4 },
    },
    validate: (value, masked) => {
      if (!masked.isComplete) return true;
      const [day, month, year] = value.split('/').map(Number);
      if (year < fromYear || year > toYear) return false;
      const date = new Date(year, month - 1, day);
      return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
      );
    },
  };

  const handleAccept = (value: string, maskRef: IMask.MaskedDate) => {
    const currentIMaskValue = maskRef.value; // String like "dd/MM/yyyy" or partial
    setMaskedInputValue(currentIMaskValue); // Keep internal state for IMask value

    if (isValidDateString(currentIMaskValue)) {
        setSelectedDate(parseInputToDate(currentIMaskValue));
    } else {
        setSelectedDate(undefined);
    }
    onDateChange?.(currentIMaskValue); // Inform RHF
  };
  
  const handleFocus = () => {
    setIsFocused(true);
    // When focusing, ensure maskedInputValue is what RHF holds,
    // so IMask starts with the correct value.
    setMaskedInputValue(initialValue || "");
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    // Ensure the latest value from IMask's input element is sent to RHF
    // as onAccept might not cover all blur scenarios if no change was made.
    if (inputElementRef.current && onDateChange) {
      const finalMaskValue = inputElementRef.current.value;
       if (initialValue !== finalMaskValue) { // Only call if different to avoid loops
         onDateChange(finalMaskValue);
       }
       // Update selectedDate based on this final mask value
       if (isValidDateString(finalMaskValue)) {
           setSelectedDate(parseInputToDate(finalMaskValue));
       } else {
           setSelectedDate(undefined);
       }
    }
  };

  const handleCalendarSelect = (dateFromCalendar: Date | undefined) => {
    setIsPickerOpen(false);
    const formattedValueForRHF = dateFromCalendar ? formatDateForInput(dateFromCalendar) : undefined;
    
    setSelectedDate(dateFromCalendar); // Update selectedDate immediately
    setMaskedInputValue(formattedValueForRHF || ""); // Update for IMask's value prop

    onDateChange?.(formattedValueForRHF); // Inform RHF

    // Ensure display changes by setting focus state after RHF update
    // Timeout helps ensure RHF has processed the change before we potentially re-evaluate display
    setTimeout(() => {
        setIsFocused(false);
         if (inputElementRef.current) {
            // inputElementRef.current.blur(); // Blurring here might be too aggressive or cause issues
        }
    }, 0);
  };

  const defaultCalendarMonth = selectedDate || new Date(Math.max(fromYear, toYear - 7), 0, 1);

  // Determine what to display: formatted date string or the IMaskInput
  const shouldShowFormattedDisplay = !isFocused && selectedDate && isValid(selectedDate) && !disabled;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && <Label htmlFor={id} className={cn(disabled && "text-muted-foreground")}>{label}</Label>}
      <div className="relative">
        {shouldShowFormattedDisplay ? (
          <div
            onClick={() => { if (!disabled) { setIsFocused(true); setTimeout(() => inputElementRef.current?.focus(),0); }}}
            className={cn(
              "flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
              "cursor-text", // Make it look clickable
              inputClassName,
              ariaInvalid && "border-destructive"
            )}
            role="textbox"
            tabIndex={disabled ? -1 : 0}
            aria-labelledby={label ? id + "-label" : undefined} // Assuming label has id ending with -label
            onFocus={() => { if (!disabled) { setIsFocused(true); setTimeout(() => inputElementRef.current?.focus(),0);}}} // Allow keyboard focus
          >
            {formatDateForDisplay(selectedDate)}
          </div>
        ) : (
          <IMaskInput
            {...iMaskOptions}
            inputRef={(el: HTMLInputElement) => (inputElementRef.current = el)}
            id={id}
            name={name} // RHF uses name for registration
            value={maskedInputValue}
            onAccept={handleAccept}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            aria-invalid={ariaInvalid}
            placeholder="DD/MM/YYYY"
            className={cn(
              "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
              "pr-10", // Space for the calendar icon button
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
              onClick={() => { if (!disabled) setIsPickerOpen((prev) => !prev); }}
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
              captionLayout="dropdown-buttons"
              fromYear={fromYear}
              toYear={toYear}
              disabled={disabled || ((date) => date > new Date() || date < new Date(fromYear -1 , 11, 31))}
              locale={localeID}
            />
          </PopoverContent>
        </Popover>
      </div>
      {name && ( // Hidden input for RHF if needed, but RHF should control via field.value
        <input
          type="hidden"
          name={name + "-hidden-value-for-debug"} // Differentiate from main field if RHF controls that
          value={initialValue || ""}
          disabled={disabled}
        />
      )}
    </div>
  );
}

    
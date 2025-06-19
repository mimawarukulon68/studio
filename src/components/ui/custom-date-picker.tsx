
"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format, parse, isValid } from 'date-fns';
import { id } from 'date-fns/locale';

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Format tampilan akhir: "dd MMMM yyyy" (contoh: "04 Maret 1997")
function formatDateForDisplay(date: Date | undefined): string {
  if (!date || !isValid(date)) return "";
  return format(date, "dd MMMM yyyy", { locale: id });
}

// Format untuk input manual dan saat fokus: "dd/MM/yyyy"
function formatDateForInput(date: Date | undefined): string {
  if (!date || !isValid(date)) return "";
  return format(date, "dd/MM/yyyy", { locale: id });
}

// Parsing dari "dd/MM/yyyy" ke Date
function parseInputToDate(input: string): Date | undefined {
  // Check if the input roughly matches the DD/MM/YYYY pattern before parsing
  if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(input)) return undefined;
  const parsedDate = parse(input, "dd/MM/yyyy", new Date());
  return isValid(parsedDate) ? parsedDate : undefined;
}

// Format internal untuk penyimpanan (opsional): "MM/dd/yyyy"
function formatDateForStorage(date: Date | undefined): string {
  if (!date || !isValid(date)) return "";
  return format(date, "MM/dd/yyyy");
}

interface CustomDatePickerProps {
  id?: string;
  label?: string;
  initialDate?: Date;
  onDateChange?: (date: Date | undefined, internalValue: string) => void;
  name?: string; // For the hidden input
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
  ariaInvalid?: boolean;
}

export function CustomDatePicker({
  id = "custom-date",
  label,
  initialDate,
  onDateChange,
  name,
  className,
  inputClassName,
  disabled = false,
  ariaInvalid = false,
}: CustomDatePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    initialDate && isValid(initialDate) ? initialDate : undefined
  );
  const [inputValue, setInputValue] = React.useState<string>(
    formatDateForDisplay(initialDate && isValid(initialDate) ? initialDate : undefined)
  );
  const [isPickerOpen, setIsPickerOpen] = React.useState(false);

  // Synchronize internal state with initialDate prop changes
  React.useEffect(() => {
    const currentInitialDate = initialDate && isValid(initialDate) ? initialDate : undefined;
    if (selectedDate?.getTime() !== currentInitialDate?.getTime()) {
        setSelectedDate(currentInitialDate);
        setInputValue(formatDateForDisplay(currentInitialDate));
    }
  }, [initialDate]);


  const handleValueChange = (date: Date | undefined) => {
    setSelectedDate(date);
    if (onDateChange) {
      onDateChange(date, formatDateForStorage(date));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const currentValue = e.target.value;
    setInputValue(currentValue);

    const parsed = parseInputToDate(currentValue);
    if (parsed) {
       if (selectedDate?.getTime() !== parsed.getTime()){
         handleValueChange(parsed);
       }
    } else if (currentValue.trim() === "" && selectedDate !== undefined) {
      handleValueChange(undefined);
    }
  };

  const handleInputFocus = () => {
    if (selectedDate) {
      setInputValue(formatDateForInput(selectedDate));
    }
  };

  const handleInputBlur = () => {
    const parsed = parseInputToDate(inputValue);
    if (parsed) {
      // If it's already selected, no need to update state, just format display
      if(selectedDate?.getTime() !== parsed.getTime()){
        handleValueChange(parsed);
      }
      setInputValue(formatDateForDisplay(parsed));
    } else {
      if (inputValue.trim() !== "") {
        setInputValue(""); 
      }
      if (selectedDate) { 
        handleValueChange(undefined);
      }
    }
  };

  const handleCalendarSelect = (dateFromCalendar: Date | undefined) => {
    setIsPickerOpen(false); // Close picker first
    if (dateFromCalendar && isValid(dateFromCalendar)) {
      handleValueChange(dateFromCalendar);
      setInputValue(formatDateForDisplay(dateFromCalendar));
    } else { 
      handleValueChange(undefined);
      setInputValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!disabled) setIsPickerOpen(true);
    }
  };

  const currentYear = new Date().getFullYear();
  const fromYear = currentYear - 120;
  const toYear = currentYear;
  
  const defaultCalendarMonth = selectedDate || new Date(Math.max(fromYear, toYear - 20), 0, 1);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && <Label htmlFor={id} className={cn(disabled && "text-muted-foreground")}>{label}</Label>}
      <div className="relative">
        <Input
          id={id}
          value={inputValue}
          placeholder="DD/MM/YYYY"
          className={cn("pr-10", disabled && "cursor-not-allowed opacity-50", inputClassName)}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          aria-invalid={ariaInvalid}
        />
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
              onClick={() => {if (!disabled) setIsPickerOpen(true)}}
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
              disabled={(date) =>
                date > new Date() || date < new Date(fromYear, 0, 1)
              }
              initialFocus
              locale={id}
            />
          </PopoverContent>
        </Popover>
      </div>
      {name && (
        <input
          type="hidden"
          name={name}
          value={formatDateForStorage(selectedDate)}
          disabled={disabled}
        />
      )}
    </div>
  );
}

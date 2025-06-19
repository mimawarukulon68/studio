// Suggested code may be subject to a license. Learn more: ~LicenseLog:3401891587.
"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format, parse, isValid } from 'date-fns';
import { id } from 'date-fns/locale/id'; // Import specifically
import { type Locale } from 'date-fns'; // Import Locale type
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
  // Add a basic check for approximate format before parsing for efficiency
  if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(input)) return undefined;
  const parsedDate = parse(input, "dd/MM/yyyy", new Date());
  return isValid(parsedDate) ? parsedDate : undefined;
}

// Format internal untuk penyimpanan (opsional): "MM/dd/yyyy"
function formatDateForStorage(date: Date | undefined): string {
  if (!date || !isValid(date)) return "";
  // Using en-US locale for MM/dd/yyyy format consistency
  // It's generally better to use 'en-US' or the default locale for consistent MM/dd/yyyy storage format.
 return format(date, "MM/dd/yyyy"); // Removed explicit locale: id
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
    // Only update state if the effective initialDate has changed
    if (selectedDate?.getTime() !== currentInitialDate?.getTime()) {
        setSelectedDate(currentInitialDate);
        setInputValue(formatDateForDisplay(currentInitialDate));
    }
  }, [initialDate, selectedDate]); // Added selectedDate dependency to prevent potential loop issues

  // Handle date changes (from input or calendar)
  const handleValueChange = (date: Date | undefined) => {
    setSelectedDate(date);
    // Call the external onDateChange handler
    if (onDateChange) {
      onDateChange(date, formatDateForStorage(date));
    }
  };

  // Handle input field changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const currentValue = e.target.value;
    setInputValue(currentValue); // Always update input display as user types

    // Attempt to parse the current input value as the user types or pastes
    const parsed = parseInputToDate(currentValue);

    if (parsed) {
       // If valid date is parsed from input, update the selected date state
       // Only update if it's a different date than the current selectedDate
       if (!selectedDate || selectedDate.getTime() !== parsed.getTime()){
         handleValueChange(parsed);
       }
    } else if (currentValue.trim() === "") {
      // If the input is cleared, set selectedDate to undefined
      if (selectedDate !== undefined) { // Avoid unnecessary state update
         handleValueChange(undefined);
      }
    }
    // If input is not empty but parsing failed, selectedDate state remains unchanged until blur.
    // The invalid state is reflected by inputValue not matching a valid date's display format.
  };

  // Handle input field focus
  const handleInputFocus = () => {
    // On focus, format the current selected date (if any) to the input format (DD/MM/YYYY)
    if (selectedDate) {
      setInputValue(formatDateForInput(selectedDate));
    }
    // Keep popover closed on initial focus unless ArrowDown is pressed
    // setIsPickerOpen(false); // Optional: ensure picker is closed on focus, but default behavior is usually fine.
  };

  // Handle input field blur
  const handleInputBlur = () => {
    const parsed = parseInputToDate(inputValue);

    if (parsed) {
      // If parsing is successful on blur
      if (!selectedDate || selectedDate.getTime() !== parsed.getTime()) {
        // Update selectedDate if it's a new valid date or was previously undefined
        handleValueChange(parsed);
      }
      // Always format input value to display format (DD MMMM YYYY) on blur if valid
      setInputValue(formatDateForDisplay(parsed));
    } else {
      // If parsing failed on blur
      if (selectedDate) {
        // If a valid date was previously selected, revert input display to that date's display format.
        // The invalid input text entered by the user is discarded from the input display.
        setInputValue(formatDateForDisplay(selectedDate));
        // selectedDate state remains unchanged.
      } else if (inputValue.trim() !== "") {
        // If no date was selected and input is not empty (contains invalid text),
        // clear the input display field.
        setInputValue("");
        // selectedDate state should already be undefined, handled by handleInputChange
      }
      // If inputValue is empty and selectedDate is undefined, do nothing.
    }
    // Consider adding a small delay before closing popover on blur if needed for accessibility
    // setIsPickerOpen(false); // Moved closing picker to calendar select
  };

  // Handle date selection from the calendar popover
  const handleCalendarSelect = (dateFromCalendar: Date | undefined) => {
    // Always close picker after selection (or clearing selection)
    setIsPickerOpen(false); 
    
    if (dateFromCalendar && isValid(dateFromCalendar)) {
      // If a valid date is selected from calendar, update state and input display
      handleValueChange(dateFromCalendar);
      setInputValue(formatDateForDisplay(dateFromCalendar));
    } else {
      // If selection is cleared (e.g., clicking already selected date in some libs),
      // set selectedDate to undefined and clear input display.
      handleValueChange(undefined);
      setInputValue("");
    }
  };

  // Handle keyboard events on the input field
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Open calendar picker when pressing Arrow Down
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!disabled) setIsPickerOpen(true);
    }
     // TODO: Add handling for Enter key to parse/validate input?
  };

  // Calculate valid year range for the calendar dropdowns
  const currentYear = new Date().getFullYear();
  const fromYear = currentYear - 120; // Allow picking dates up to 120 years ago
  const toYear = currentYear;         // Allow picking up to the current year
  
  // Determine the initial month displayed in the calendar
  const defaultCalendarMonth = selectedDate || new Date(Math.max(fromYear, toYear - 20), 0, 1);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {/* Label for the date picker */}
      {label && <Label htmlFor={id} className={cn(disabled && "text-muted-foreground")}>{label}</Label>}
      <div className="relative">
        {/* The main input field */} 
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
        {/* Popover containing the calendar */}
        <Popover open={isPickerOpen} onOpenChange={setIsPickerOpen}>
          <PopoverTrigger asChild>
            {/* Button to open the calendar popover */}
            <Button
              type="button"
              variant="ghost"
              className={cn(
                "absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2 p-0",
                disabled && "cursor-not-allowed opacity-50"
              )}
              aria-label="Pilih tanggal"
              disabled={disabled}
              // Toggle popover visibility
              onClick={() => {if (!disabled) setIsPickerOpen((prev) => !prev)}}
            >
              <CalendarIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end" sideOffset={5}>
            {/* The calendar component */}
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleCalendarSelect}
              defaultMonth={defaultCalendarMonth}
              captionLayout="dropdown"
              
              
              disabled={disabled || ((date) =>
                // Disable dates in the future or before the 'fromYear'
                date > new Date() || date < new Date(fromYear, 0, 1)
              )}
               // Focus the calendar on mount
              locale={id} // Use Indonesian locale
            />
          </PopoverContent>
        </Popover>
      </div>
      {/* Optional: Hidden input for form submission with specific format */}
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

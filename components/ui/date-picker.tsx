"use client";

import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CustomDatePickerProps {
  selected?: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  disabled?: (date: Date) => boolean;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
}

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  selected,
  onChange,
  placeholder = "Pick a date",
  disabled,
  className,
  minDate,
  maxDate,
}) => {
  const formatDate = (date: Date | null) => {
    if (!date) return placeholder;
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const CustomInput = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement> & { value?: string }
  >(({ value, onClick, ...props }, ref) => (
    <Button
      ref={ref}
      variant="outline"
      className={cn(
        "w-full pl-3 text-left font-normal justify-start",
        !selected && "text-muted-foreground",
        className,
      )}
      onClick={onClick}
      type="button"
      {...props}
    >
      {value || placeholder}
      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
    </Button>
  ));

  CustomInput.displayName = "CustomInput";

  return (
    <div className="relative">
      <DatePicker
        selected={selected}
        onChange={onChange}
        customInput={
          <CustomInput value={selected ? formatDate(selected) : ""} />
        }
        dateFormat="MMMM d, yyyy"
        minDate={minDate}
        maxDate={maxDate}
        popperClassName="z-50"
        popperPlacement="bottom-start"
        showPopperArrow={false}
        className="w-full"
        calendarClassName="rdp-calendar"
        weekDayClassName={() => "rdp-week-day"}
        monthClassName={() => "rdp-month"}
        timeClassName={() => "rdp-time"}
      />
    </div>
  );
};

export default CustomDatePicker;

"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import * as React from "react";
import { useFormContext } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { INPUT_CLASSNAME } from "@/utils/constants";
interface DatePickerProps {
  label: string;
  name: string;
}

const DatePicker: React.FC<DatePickerProps> = ({ label, name }) => {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        // Convert string to Date for display, handle both string and Date
        const displayValue = field.value
          ? (field.value instanceof Date ? field.value : new Date(field.value))
          : null;

        return (
          <FormItem className="col-span-12 sm:col-span-6 mt-2">
            <FormLabel className="block">{label}</FormLabel>
            <FormControl>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      INPUT_CLASSNAME,
                      "justify-start mt-2",
                      !displayValue && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {displayValue ? (
                      format(displayValue, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={displayValue || undefined}
                    onSelect={(date) => {
                      // Convert Date back to string for form storage
                      field.onChange(date ? date.toISOString() : "");
                    }}
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};

export default DatePicker;

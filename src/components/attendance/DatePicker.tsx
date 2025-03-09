
import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export function DatePicker({ selectedDate, onDateChange }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[280px] justify-start text-left font-normal border-purple-500/30 bg-purple-800/10 hover:bg-purple-800/20 hover-scale transition-all",
            !selectedDate && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-purple-400" />
          {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 border-purple-500/30 bg-background/95 backdrop-blur-sm" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && onDateChange(date)}
          initialFocus
          className="p-3 pointer-events-auto"
        />
      </PopoverContent>
    </Popover>
  );
}

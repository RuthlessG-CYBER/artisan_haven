"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CalendarProps {
  mode?: "single";
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  disabled?: (date: Date) => boolean;
  className?: string;
}

export function Calendar({ selected, onSelect, disabled, className }: CalendarProps) {
  const [visibleMonth, setVisibleMonth] = React.useState(() => {
    const base = selected ?? new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const days = React.useMemo(() => {
    const start = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
    const end = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0);
    const blanks = Array.from({ length: start.getDay() }, () => null);
    const monthDays = Array.from({ length: end.getDate() }, (_, index) => new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), index + 1));
    return [...blanks, ...monthDays];
  }, [visibleMonth]);

  const monthName = visibleMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className={cn("w-72 rounded-md bg-background p-3", className)}>
      <div className="mb-3 flex items-center justify-between">
        <Button type="button" variant="ghost" size="icon" onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1))}>
          <ChevronLeft className="size-4" />
        </Button>
        <div className="text-sm font-medium">{monthName}</div>
        <Button type="button" variant="ghost" size="icon" onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1))}>
          <ChevronRight className="size-4" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div key={day} className="py-1">{day}</div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          if (!date) return <div key={`blank-${index}`} />;
          const isSelected = selected?.toDateString() === date.toDateString();
          const isDisabled = disabled?.(date) ?? false;

          return (
            <Button
              key={date.toISOString()}
              type="button"
              variant={isSelected ? "default" : "ghost"}
              size="icon"
              disabled={isDisabled}
              onClick={() => onSelect?.(date)}
              className="size-9"
            >
              {date.getDate()}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

export interface SimpleCalendarProps {
  selected?: Date;
  onSelect?: (date: Date) => void;
  className?: string;
  locale?: string;
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const WEEKDAY_LABELS_ES = ["L", "M", "X", "J", "V", "S", "D"];

export function SimpleCalendar({ selected, onSelect, className, locale = "es-ES" }: SimpleCalendarProps) {
  const [view, setView] = React.useState(() => {
    const d = selected ? new Date(selected) : new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const monthLabel = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(view);

  const firstDay = new Date(view);
  firstDay.setDate(1);
  const startWeekday = (firstDay.getDay() + 6) % 7; // lunes = 0

  const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
  const cells: Array<Date | null> = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(view.getFullYear(), view.getMonth(), d));
  }
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className={cn("p-3 rounded-md border bg-card", className)}>
      <div className="flex items-center justify-between mb-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => {
            const d = new Date(view);
            d.setMonth(d.getMonth() - 1);
            setView(d);
          }}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-sm font-medium capitalize">{monthLabel}</div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => {
            const d = new Date(view);
            d.setMonth(d.getMonth() + 1);
            setView(d);
          }}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-1">
        {WEEKDAY_LABELS_ES.map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (!d) return <div key={i} className="h-8" />;
          const isSelected = selected ? sameDay(d, selected) : false;
          const isToday = sameDay(d, new Date());
          return (
            <button
              type="button"
              key={i}
              onClick={() => onSelect?.(d)}
              className={cn(
                "h-8 w-full rounded-md text-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer",
                isSelected && "bg-primary text-primary-foreground hover:bg-primary/90",
                !isSelected && isToday && "border border-primary/40"
              )}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn, diffHours } from "@/lib/utils";
import { SHIFT_TYPE_COLORS, SHIFT_TYPE_LABELS, type Shift, type User } from "@/lib/types";
import { Clock, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface ShiftBlockProps {
  shift: Shift;
  worker?: User;
  canEdit: boolean;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  compact?: boolean;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

export function ShiftBlock({ shift, worker, canEdit, onClick, onEdit, onDelete, compact }: ShiftBlockProps) {
  const colors = SHIFT_TYPE_COLORS[shift.shiftType];
  const isAllDay = shift.shiftType === "DESCANSO" || shift.shiftType === "VACACIONES";
  const hours = isAllDay ? 24 : diffHours(shift.startTime, shift.endTime);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -2 }}
      className={cn(
        "group relative rounded-lg border-l-4 p-2 text-xs cursor-pointer transition-shadow hover:shadow-md",
        colors.bg,
        colors.border,
        colors.text
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <div className="flex items-start justify-between gap-1">
        <div className="min-w-0 flex-1">
          <p className={cn("font-semibold leading-tight", compact && "truncate")}>
            {SHIFT_TYPE_LABELS[shift.shiftType]}
          </p>
          {!isAllDay && (
            <p className="mt-0.5 flex items-center gap-1 opacity-80">
              <Clock className="h-3 w-3" />
              {formatTime(shift.startTime)} – {formatTime(shift.endTime)}
            </p>
          )}
          {!compact && worker && (
            <p className="mt-0.5 truncate opacity-70">{worker.name}</p>
          )}
          {!compact && (
            <Badge variant="outline" className="mt-1.5 text-[10px] py-0">
              {Number.isInteger(hours) ? `${hours}h` : `${hours.toFixed(1)}h`}
            </Badge>
          )}
        </div>
        {canEdit && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5">
            {onEdit && (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                aria-label="Editar turno"
              >
                <Pencil className="h-3 w-3" />
              </Button>
            )}
            {onDelete && (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-6 w-6 hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                aria-label="Eliminar turno"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

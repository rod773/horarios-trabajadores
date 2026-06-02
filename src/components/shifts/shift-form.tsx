"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { shiftFormSchema, type ShiftFormInput } from "@/lib/validations";
import { createShiftAction, updateShiftAction } from "@/app/actions";
import type { Shift, User } from "@/lib/types";
import { SHIFT_TYPE_LABELS } from "@/lib/types";

export function ShiftForm({
  shift,
  workers,
  defaultDate,
  defaultWorkerId,
  onDone,
}: {
  shift?: Shift | null;
  workers: User[];
  defaultDate?: string;
  defaultWorkerId?: string;
  onDone?: () => void;
}) {
  const [pending, setPending] = React.useState(false);
  const isEdit = !!shift;

  const form = useForm<ShiftFormInput>({
    resolver: zodResolver(shiftFormSchema),
    defaultValues: shift
      ? {
          workerId: shift.workerId,
          date: shift.date,
          startTime: new Date(shift.startTime).toISOString().slice(11, 16),
          endTime: new Date(shift.endTime).toISOString().slice(11, 16),
          shiftType: shift.shiftType,
          notes: shift.notes ?? "",
        }
      : {
          workerId: defaultWorkerId ?? workers[0]?.id ?? "",
          date: defaultDate ?? new Date().toISOString().slice(0, 10),
          startTime: "09:00",
          endTime: "17:00",
          shiftType: "NORMAL",
          notes: "",
        },
  });

  const shiftType = form.watch("shiftType");

  async function onSubmit(values: ShiftFormInput) {
    setPending(true);
    const fd = new FormData();
    Object.entries(values).forEach(([k, v]) => {
      if (v !== null && v !== undefined) fd.append(k, String(v));
    });
    const action = isEdit
      ? await updateShiftAction(shift!.id, undefined, fd)
      : await createShiftAction(undefined, fd);
    setPending(false);
    if (!action.ok) {
      toast.error(action.error);
      return;
    }
    toast.success(isEdit ? "Turno actualizado" : "Turno creado");
    onDone?.();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="workerId">Trabajador</Label>
          <Select value={form.watch("workerId")} onValueChange={(v) => form.setValue("workerId", v)}>
            <SelectTrigger id="workerId">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {workers
                .filter((w) => w.role !== "ADMIN")
                .map((w) => (
                  <SelectItem key={w.id} value={w.id}>
                    {w.name} {w.team ? `· ${w.team}` : ""}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">Fecha</Label>
          <Input id="date" type="date" {...form.register("date")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="shiftType">Tipo</Label>
          <Select
            value={form.watch("shiftType")}
            onValueChange={(v) => form.setValue("shiftType", v as ShiftFormInput["shiftType"])}
          >
            <SelectTrigger id="shiftType">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(SHIFT_TYPE_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="startTime">Hora inicio</Label>
          <Input
            id="startTime"
            type="time"
            step={300}
            {...form.register("startTime")}
            disabled={shiftType === "DESCANSO" || shiftType === "VACACIONES"}
          />
          {form.formState.errors.startTime && (
            <p className="text-xs text-destructive">{form.formState.errors.startTime.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="endTime">Hora fin</Label>
          <Input
            id="endTime"
            type="time"
            step={300}
            {...form.register("endTime")}
            disabled={shiftType === "DESCANSO" || shiftType === "VACACIONES"}
          />
          {form.formState.errors.endTime && (
            <p className="text-xs text-destructive">{form.formState.errors.endTime.message}</p>
          )}
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="notes">Observaciones</Label>
          <Textarea id="notes" rows={2} {...form.register("notes")} />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isEdit ? "Guardar cambios" : "Crear turno"}
        </Button>
      </div>
    </form>
  );
}

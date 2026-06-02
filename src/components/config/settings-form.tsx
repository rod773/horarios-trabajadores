"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { settingsSchema, type SettingsInput } from "@/lib/validations";
import { updateSettingsAction } from "@/app/actions";
import type { AppSettings } from "@/lib/types";

export function SettingsForm({ settings }: { settings: AppSettings }) {
  const [pending, setPending] = React.useState(false);
  const form = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      maxHorasPorDia: settings.maxHorasPorDia,
      maxHorasPorSemana: settings.maxHorasPorSemana,
      minDescansoHoras: settings.minDescansoHoras,
      overlapToleranceMinutos: settings.overlapToleranceMinutos,
    },
  });

  async function onSubmit(values: SettingsInput) {
    setPending(true);
    const fd = new FormData();
    Object.entries(values).forEach(([k, v]) => fd.append(k, String(v)));
    const r = await updateSettingsAction(undefined, fd);
    setPending(false);
    if (!r.ok) {
      toast.error(r.error);
      return;
    }
    toast.success("Configuración guardada");
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Límites de horario</CardTitle>
          <CardDescription>
            Restricciones aplicadas al crear y editar turnos
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="maxHorasPorDia">Máx. horas por día</Label>
            <Input id="maxHorasPorDia" type="number" min={1} max={24} {...form.register("maxHorasPorDia", { valueAsNumber: true })} />
            {form.formState.errors.maxHorasPorDia && (
              <p className="text-xs text-destructive">{form.formState.errors.maxHorasPorDia.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxHorasPorSemana">Máx. horas por semana</Label>
            <Input id="maxHorasPorSemana" type="number" min={1} max={80} {...form.register("maxHorasPorSemana", { valueAsNumber: true })} />
            {form.formState.errors.maxHorasPorSemana && (
              <p className="text-xs text-destructive">{form.formState.errors.maxHorasPorSemana.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="minDescansoHoras">Mínimo descanso entre turnos (h)</Label>
            <Input id="minDescansoHoras" type="number" min={0} max={24} {...form.register("minDescansoHoras", { valueAsNumber: true })} />
            {form.formState.errors.minDescansoHoras && (
              <p className="text-xs text-destructive">{form.formState.errors.minDescansoHoras.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="overlapToleranceMinutos">Tolerancia solapamiento (min)</Label>
            <Input id="overlapToleranceMinutos" type="number" min={0} max={60} {...form.register("overlapToleranceMinutos", { valueAsNumber: true })} />
            {form.formState.errors.overlapToleranceMinutos && (
              <p className="text-xs text-destructive">{form.formState.errors.overlapToleranceMinutos.message}</p>
            )}
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Guardar configuración
        </Button>
      </div>
    </form>
  );
}

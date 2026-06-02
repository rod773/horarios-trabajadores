"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { workerFormSchema, type WorkerFormInput } from "@/lib/validations";
import { createWorkerAction, updateWorkerAction } from "@/app/actions";
import type { User } from "@/lib/types";

export function WorkerForm({
  worker,
  onDone,
}: {
  worker?: User | null;
  onDone?: () => void;
}) {
  const [pending, setPending] = React.useState(false);
  const isEdit = !!worker;

  const form = useForm<WorkerFormInput>({
    resolver: zodResolver(workerFormSchema) as any,
    defaultValues: {
      name: worker?.name ?? "",
      email: worker?.email ?? "",
      role: (worker?.role ?? "WORKER") as WorkerFormInput["role"],
      team: worker?.team ?? "",
      horasObjetivoSemanal:
        worker?.workerProfile?.horasObjetivoSemanal ?? 40,
    },
  });

  const onSubmit = async (values: WorkerFormInput) => {
    setPending(true);
    const fd = new FormData();

    Object.entries(values).forEach(([k, v]) => {
      if (v !== null && v !== undefined) fd.append(k, String(v));
    });

    if (!isEdit) {
      fd.append("password", "worker123");
    }

    const action = isEdit
      ? await updateWorkerAction(worker!.id, undefined, fd)
      : await createWorkerAction(undefined, fd);

    setPending(false);

    if (!action.ok) {
      toast.error(action.error);
      return;
    }

    toast.success(
      isEdit ? "Trabajador actualizado" : "Trabajador creado"
    );
    onDone?.();
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit as any)}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre completo</Label>
          <Input
            id="name"
            {...form.register("name")}
            aria-invalid={!!form.formState.errors.name}
          />
          {form.formState.errors.name && (
            <p className="text-xs text-destructive">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            {...form.register("email")}
            aria-invalid={!!form.formState.errors.email}
          />
          {form.formState.errors.email && (
            <p className="text-xs text-destructive">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Rol</Label>
          <Select
            value={form.watch("role")}
            onValueChange={(v) =>
              form.setValue("role", v as WorkerFormInput["role"])
            }
          >
            <SelectTrigger id="role">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="WORKER">Trabajador</SelectItem>
              <SelectItem value="SUPERVISOR">Supervisor</SelectItem>
              <SelectItem value="ADMIN">Administrador</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="team">Equipo / área</Label>
          <Input id="team" placeholder="Ej. Equipo A" {...form.register("team")} />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="horas">Horas objetivo semanales</Label>
          <Input
            id="horas"
            type="number"
            min={0}
            max={80}
            step={1}
            {...form.register("horasObjetivoSemanal", { valueAsNumber: true })}
          />
          {form.formState.errors.horasObjetivoSemanal && (
            <p className="text-xs text-destructive">
              {form.formState.errors.horasObjetivoSemanal.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isEdit ? "Guardar cambios" : "Crear trabajador"}
        </Button>
      </div>
    </form>
  );
}

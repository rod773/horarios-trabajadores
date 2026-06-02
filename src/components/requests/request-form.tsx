"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Send, Check, X, ClipboardList } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { requestFormSchema, type RequestFormInput } from "@/lib/validations";
import { createRequestAction, resolveRequestAction } from "@/app/actions";
import {
  REQUEST_STATUS_COLORS,
  REQUEST_STATUS_LABELS,
  REQUEST_TYPE_LABELS,
  type Shift,
  type ShiftRequest,
  type User,
} from "@/lib/types";
import { diffHours, formatDate } from "@/lib/utils";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function RequestForm({
  shifts,
  currentUserId,
  open,
  onOpenChange,
}: {
  shifts: Shift[];
  currentUserId: string;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [pending, setPending] = React.useState(false);
  const form = useForm<RequestFormInput>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      requestType: "INTERCAMBIO",
      fromShiftId: "",
      toShiftProposedId: "",
      reason: "",
    },
  });
  const router = useRouter();

  const myShifts = shifts.filter((s) => s.workerId === currentUserId);
  const requestType = form.watch("requestType");

  async function onSubmit(values: RequestFormInput) {
    setPending(true);
    const fd = new FormData();
    Object.entries(values).forEach(([k, v]) => {
      if (v !== null && v !== undefined) fd.append(k, String(v));
    });
    fd.append("requesterId", currentUserId);
    const r = await createRequestAction(undefined, fd);
    setPending(false);
    if (!r.ok) {
      toast.error(r.error);
      return;
    }
    toast.success("Solicitud enviada");
    form.reset();
    onOpenChange(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Send className="h-4 w-4" />
          Nueva solicitud
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva solicitud</DialogTitle>
          <DialogDescription>
            Envía una solicitud de cambio de turno, ajuste o vacaciones
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="requestType">Tipo de solicitud</Label>
            <Select
              value={form.watch("requestType")}
              onValueChange={(v) => form.setValue("requestType", v as RequestFormInput["requestType"])}
            >
              <SelectTrigger id="requestType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(REQUEST_TYPE_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="fromShiftId">Turno de origen</Label>
            <Select
              value={form.watch("fromShiftId")}
              onValueChange={(v) => form.setValue("fromShiftId", v)}
            >
              <SelectTrigger id="fromShiftId">
                <SelectValue placeholder="Selecciona un turno" />
              </SelectTrigger>
              <SelectContent>
                {myShifts.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {formatDate(s.date, { weekday: "short", day: "numeric", month: "short" })} ·{" "}
                    {new Date(s.startTime).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.fromShiftId && (
              <p className="text-xs text-destructive">{form.formState.errors.fromShiftId.message}</p>
            )}
          </div>
          {requestType === "INTERCAMBIO" && (
            <div className="space-y-2">
              <Label htmlFor="toShiftProposedId">Turno propuesto (opcional)</Label>
              <Select
                value={form.watch("toShiftProposedId") ?? ""}
                onValueChange={(v) => form.setValue("toShiftProposedId", v)}
              >
                <SelectTrigger id="toShiftProposedId">
                  <SelectValue placeholder="Selecciona un turno" />
                </SelectTrigger>
                <SelectContent>
                  {shifts
                    .filter((s) => s.workerId !== currentUserId)
                    .map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {formatDate(s.date, { weekday: "short", day: "numeric", month: "short" })} ·{" "}
                        {new Date(s.startTime).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="reason">Motivo</Label>
            <Textarea
              id="reason"
              rows={3}
              placeholder="Describe brevemente el motivo..."
              {...form.register("reason")}
            />
            {form.formState.errors.reason && (
              <p className="text-xs text-destructive">{form.formState.errors.reason.message}</p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={pending}>
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Enviar solicitud
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function RequestsList({
  requests,
  users,
  shifts,
  currentRole,
}: {
  requests: ShiftRequest[];
  users: User[];
  shifts: Shift[];
  currentRole: string;
}) {
  const router = useRouter();
  const [pending, setPending] = React.useState<string | null>(null);

  async function resolve(id: string, status: "APROBADA" | "RECHAZADA") {
    setPending(id);
    const r = await resolveRequestAction(id, status);
    setPending(null);
    if (!r.ok) {
      toast.error(r.error);
      return;
    }
    toast.success(`Solicitud ${status === "APROBADA" ? "aprobada" : "rechazada"}`);
    router.refresh();
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <ClipboardList className="h-10 w-10 mx-auto mb-2 opacity-50" />
          <p>No hay solicitudes para mostrar</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {requests.map((r, i) => {
          const requester = users.find((u) => u.id === r.requesterId);
          const fromShift = shifts.find((s) => s.id === r.fromShiftId);
          const toShift = r.toShiftProposedId ? shifts.find((s) => s.id === r.toShiftProposedId) : null;
          const isPending = r.status === "PENDIENTE";
          const canResolve = isPending && (currentRole === "ADMIN" || currentRole === "SUPERVISOR");
          return (
            <motion.div
              key={r.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ delay: i * 0.04, duration: 0.25 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-2">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>{requester ? initials(requester.name) : "?"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">{requester?.name ?? "Usuario"}</CardTitle>
                      <CardDescription className="text-xs">
                        {REQUEST_TYPE_LABELS[r.requestType]} ·{" "}
                        {formatDate(r.createdAt, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className={REQUEST_STATUS_COLORS[r.status]}>
                    {REQUEST_STATUS_LABELS[r.status]}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  {fromShift && (
                    <div className="text-sm">
                      <p className="text-xs text-muted-foreground">Turno de origen</p>
                      <p>
                        {formatDate(fromShift.date, { weekday: "long", day: "numeric", month: "short" })} ·{" "}
                        {new Date(fromShift.startTime).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })} –{" "}
                        {new Date(fromShift.endTime).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })} (
                        {diffHours(fromShift.startTime, fromShift.endTime).toFixed(1)}h)
                      </p>
                    </div>
                  )}
                  {toShift && (
                    <div className="text-sm">
                      <p className="text-xs text-muted-foreground">Turno propuesto</p>
                      <p>
                        {formatDate(toShift.date, { weekday: "long", day: "numeric", month: "short" })} ·{" "}
                        {new Date(toShift.startTime).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })} –{" "}
                        {new Date(toShift.endTime).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground">Motivo</p>
                    <p className="text-sm">{r.reason}</p>
                  </div>
                  {canResolve && (
                    <div className="flex gap-2 pt-1">
                      <Button
                        size="sm"
                        onClick={() => resolve(r.id, "APROBADA")}
                        disabled={pending === r.id}
                      >
                        {pending === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        Aprobar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => resolve(r.id, "RECHAZADA")}
                        disabled={pending === r.id}
                      >
                        <X className="h-4 w-4" />
                        Rechazar
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

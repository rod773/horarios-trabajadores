"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter, ListFilter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { addDays, formatDate, formatHours, startOfWeek, toISODate, diffHours } from "@/lib/utils";
import { SHIFT_TYPE_LABELS, type Shift, type User } from "@/lib/types";
import { deleteShiftAction } from "@/app/actions";
import { ShiftForm } from "./shift-form";
import { ShiftBlock } from "./shift-block";
import { FadeIn, StaggerChildren, StaggerItem } from "@/components/animations/page-transition";

interface WeekViewProps {
  shifts: Shift[];
  users: User[];
  weekStart: Date;
  isAdmin: boolean;
  filterWorkerId?: string;
  filterTeam?: string;
}

function getWeekDays(monday: Date) {
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

export function WeekScheduleView({
  shifts,
  users,
  weekStart,
  isAdmin,
  filterWorkerId,
  filterTeam,
}: WeekViewProps) {
  const router = useRouter();
  const sp = useSearchParams();
  const [openCreate, setOpenCreate] = React.useState(false);
  const [editing, setEditing] = React.useState<Shift | null>(null);
  const [openEdit, setOpenEdit] = React.useState(false);
  const [defaultDate, setDefaultDate] = React.useState<string | undefined>();

  const days = getWeekDays(weekStart);
  const teams = Array.from(new Set(users.map((u) => u.team).filter(Boolean))) as string[];

  const filtered = shifts.filter((s) => {
    if (filterWorkerId && filterWorkerId !== "all" && s.workerId !== filterWorkerId) return false;
    if (filterTeam && filterTeam !== "all") {
      const u = users.find((x) => x.id === s.workerId);
      if (u?.team !== filterTeam) return false;
    }
    return true;
  });

  function shiftsForDay(d: Date) {
    const iso = toISODate(d);
    return filtered
      .filter((s) => s.date === iso)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(sp.toString());
    if (value === "all" || !value) params.delete(key);
    else params.set(key, value);
    router.push(`?${params.toString()}`);
  }

  function navigateWeek(delta: number) {
    const params = new URLSearchParams(sp.toString());
    const newDate = new Date(weekStart);
    newDate.setDate(newDate.getDate() + delta * 7);
    params.set("week", toISODate(newDate));
    router.push(`?${params.toString()}`);
  }

  async function onDelete(shift: Shift) {
    if (!confirm("¿Eliminar este turno?")) return;
    const r = await deleteShiftAction(shift.id);
    if (!r.ok) {
      toast.error(r.error);
      return;
    }
    toast.success("Turno eliminado");
    router.refresh();
  }

  const totalHours = filtered.reduce(
    (acc, s) => acc + (s.shiftType === "NORMAL" || s.shiftType === "EXTRA" ? diffHours(s.startTime, s.endTime) : 0),
    0
  );

  return (
    <div className="space-y-4">
      <FadeIn>
        <Card>
          <CardHeader className="flex flex-col gap-3 space-y-0 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Vista semanal
              </CardTitle>
              <CardDescription>
                {formatDate(days[0], { day: "numeric", month: "short" })} –{" "}
                {formatDate(days[6], { day: "numeric", month: "short", year: "numeric" })}
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => navigateWeek(-1)} aria-label="Semana anterior">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setParam("week", toISODate(startOfWeek(new Date())))}>
                Hoy
              </Button>
              <Button variant="outline" size="icon" onClick={() => navigateWeek(1)} aria-label="Semana siguiente">
                <ChevronRight className="h-4 w-4" />
              </Button>
              {isAdmin && (
                <Dialog open={openCreate} onOpenChange={setOpenCreate}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4" />
                      Nuevo turno
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Nuevo turno</DialogTitle>
                      <DialogDescription>
                        Programa un nuevo turno para un trabajador
                      </DialogDescription>
                    </DialogHeader>
                    <ShiftForm
                      workers={users}
                      defaultDate={defaultDate}
                      onDone={() => {
                        setOpenCreate(false);
                        router.refresh();
                      }}
                    />
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Filter className="h-4 w-4" /> Filtros:
              </div>
              <Select value={filterWorkerId ?? "all"} onValueChange={(v) => setParam("worker", v)}>
                <SelectTrigger className="flex-1 sm:flex-initial sm:w-48 h-10 sm:h-9">
                  <SelectValue placeholder="Trabajador" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los trabajadores</SelectItem>
                  {users
                    .filter((u) => u.role !== "ADMIN")
                    .map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {teams.length > 0 && (
                <Select value={filterTeam ?? "all"} onValueChange={(v) => setParam("team", v)}>
                  <SelectTrigger className="flex-1 sm:flex-initial sm:w-40 h-10 sm:h-9">
                    <SelectValue placeholder="Equipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los equipos</SelectItem>
                    {teams.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <div className="flex w-full sm:w-auto sm:ml-auto items-center gap-2 sm:gap-3 text-xs text-muted-foreground flex-wrap">
                <Badge variant="outline" className="font-normal">
                  {filtered.length} turnos
                </Badge>
                <Badge variant="outline" className="font-normal">
                  {formatHours(totalHours)} totales
                </Badge>
              </div>
            </div>

            <StaggerChildren className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2" delay={0.04}>
              {days.map((d, i) => {
                const dayShifts = shiftsForDay(d);
                const isToday = toISODate(d) === toISODate(new Date());
                const canCreate = isAdmin || (d >= startOfWeek(new Date()));
                return (
                  <StaggerItem key={i}>
                    <motion.div
                      className={`rounded-lg border bg-card overflow-hidden ${
                        isToday ? "ring-2 ring-primary/30 border-primary/30" : ""
                      }`}
                    >
                      <div
                        className={`px-3 py-2 border-b ${
                          isToday ? "bg-primary/5" : "bg-muted/30"
                        }`}
                      >
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          {formatDate(d, { weekday: "short" })}
                        </p>
                        <p className="text-sm font-semibold tabular-nums">
                          {formatDate(d, { day: "numeric", month: "short" })}
                        </p>
                      </div>
                      <div className="p-2 min-h-[180px] space-y-1.5">
                        {dayShifts.length === 0 ? (
                          <button
                            type="button"
                            disabled={!canCreate}
                            onClick={() => {
                              setDefaultDate(toISODate(d));
                              setOpenCreate(true);
                            }}
                            className="w-full h-24 rounded-md border border-dashed text-xs text-muted-foreground hover:bg-accent transition-colors flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                          >
                            {canCreate ? "Sin turnos · Agregar" : "Sin turnos"}
                          </button>
                        ) : (
                          dayShifts.map((s) => (
                            <ShiftBlock
                              key={s.id}
                              shift={s}
                              worker={users.find((u) => u.id === s.workerId)}
                              canEdit={isAdmin}
                              onEdit={() => {
                                setEditing(s);
                                setOpenEdit(true);
                              }}
                              onDelete={() => onDelete(s)}
                            />
                          ))
                        )}
                        {dayShifts.length > 0 && canCreate && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="w-full h-9 sm:h-7 text-xs opacity-60 hover:opacity-100"
                            onClick={() => {
                              setDefaultDate(toISODate(d));
                              setOpenCreate(true);
                            }}
                          >
                            <Plus className="h-3 w-3" /> Agregar
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  </StaggerItem>
                );
              })}
            </StaggerChildren>
          </CardContent>
        </Card>
      </FadeIn>

      <FadeIn delay={0.2}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ListFilter className="h-4 w-4" />
              Leyenda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {Object.entries(SHIFT_TYPE_LABELS).map(([k, v]) => {
                const colors = {
                  NORMAL: "bg-sky-500",
                  DESCANSO: "bg-slate-500",
                  VACACIONES: "bg-emerald-500",
                  EXTRA: "bg-amber-500",
                }[k as keyof typeof SHIFT_TYPE_LABELS];
                return (
                  <div key={k} className="flex items-center gap-2 text-sm">
                    <span className={`h-3 w-3 rounded-full ${colors}`} />
                    {v}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      <Dialog
        open={openEdit}
        onOpenChange={(o) => {
          setOpenEdit(o);
          if (!o) setEditing(null);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar turno</DialogTitle>
            <DialogDescription>Modifica los datos del turno seleccionado</DialogDescription>
          </DialogHeader>
          {editing && (
            <ShiftForm
              shift={editing}
              workers={users}
              onDone={() => {
                setOpenEdit(false);
                setEditing(null);
                router.refresh();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Download, FileDown, FileSpreadsheet, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { diffHours, formatDate, formatHours, toISODate } from "@/lib/utils";
import {
  ROLE_LABELS,
  SHIFT_TYPE_LABELS,
  type Shift,
  type ShiftType,
  type User,
} from "@/lib/types";
import { FadeIn, StaggerChildren, StaggerItem } from "@/components/animations/page-transition";

interface ReportRow {
  workerId: string;
  workerName: string;
  totalHours: number;
  normal: number;
  extra: number;
  vacaciones: number;
  descanso: number;
  shiftCount: number;
}

function buildRows(shifts: Shift[], users: User[]): ReportRow[] {
  const map = new Map<string, ReportRow>();
  for (const u of users) {
    if (u.role === "ADMIN") continue;
    map.set(u.id, {
      workerId: u.id,
      workerName: u.name,
      totalHours: 0,
      normal: 0,
      extra: 0,
      vacaciones: 0,
      descanso: 0,
      shiftCount: 0,
    });
  }
  for (const s of shifts) {
    const r = map.get(s.workerId);
    if (!r) continue;
    r.shiftCount += 1;
    if (s.shiftType === "NORMAL" || s.shiftType === "EXTRA") {
      const h = diffHours(s.startTime, s.endTime);
      r.totalHours += h;
      if (s.shiftType === "NORMAL") r.normal += h;
      else r.extra += h;
    } else if (s.shiftType === "VACACIONES") {
      r.vacaciones += 8;
    } else if (s.shiftType === "DESCANSO") {
      r.descanso += 8;
    }
  }
  return Array.from(map.values()).sort((a, b) => b.totalHours - a.totalHours);
}

function toCSV(rows: ReportRow[], from: string, to: string) {
  const headers = [
    "ID Trabajador",
    "Trabajador",
    "Total horas",
    "Horas normales",
    "Horas extra",
    "Vacaciones (h)",
    "Descanso (h)",
    "Turnos totales",
  ];
  const lines = [headers.join(";")];
  for (const r of rows) {
    lines.push(
      [
        r.workerId,
        `"${r.workerName.replace(/"/g, "''")}"`,
        r.totalHours.toFixed(2),
        r.normal.toFixed(2),
        r.extra.toFixed(2),
        r.vacaciones.toFixed(2),
        r.descanso.toFixed(2),
        r.shiftCount,
      ].join(";")
    );
  }
  return [`# Reporte de horarios; desde ${from}; hasta ${to}`, ...lines].join("\n");
}

function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function ReportsView({ shifts, users, currentUser }: { shifts: Shift[]; users: User[]; currentUser: User }) {
  const router = useRouter();
  const sp = useSearchParams();

  const today = new Date();
  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 30);

  const [from, setFrom] = React.useState(sp.get("from") || toISODate(monthAgo));
  const [to, setTo] = React.useState(sp.get("to") || toISODate(today));
  const [filterWorker, setFilterWorker] = React.useState(sp.get("worker") || "all");

  const filtered = shifts.filter((s) => {
    if (s.date < from || s.date > to) return false;
    if (filterWorker !== "all" && s.workerId !== filterWorker) return false;
    return true;
  });

  const rows = buildRows(filtered, users);
  const totalHours = rows.reduce((acc, r) => acc + r.totalHours, 0);
  const totalExtra = rows.reduce((acc, r) => acc + r.extra, 0);
  const totalShifts = rows.reduce((acc, r) => acc + r.shiftCount, 0);
  const maxHours = Math.max(...rows.map((r) => r.totalHours), 1);

  function exportCSV() {
    if (rows.length === 0) {
      toast.error("No hay datos para exportar");
      return;
    }
    const csv = toCSV(rows, from, to);
    downloadFile(`reporte_${from}_${to}.csv`, csv, "text/csv;charset=utf-8");
    toast.success("Reporte CSV descargado");
  }

  function exportDetailedCSV() {
    const headers = [
      "Fecha",
      "Trabajador",
      "Tipo",
      "Inicio",
      "Fin",
      "Horas",
      "Observaciones",
    ];
    const lines = [headers.join(";")];
    for (const s of filtered) {
      const u = users.find((x) => x.id === s.workerId);
      lines.push(
        [
          s.date,
          `"${(u?.name ?? "").replace(/"/g, "''")}"`,
          SHIFT_TYPE_LABELS[s.shiftType as ShiftType],
          new Date(s.startTime).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
          new Date(s.endTime).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
          diffHours(s.startTime, s.endTime).toFixed(2),
          `"${(s.notes ?? "").replace(/"/g, "''")}"`,
        ].join(";")
      );
    }
    downloadFile(`reporte_detallado_${from}_${to}.csv`, lines.join("\n"), "text/csv;charset=utf-8");
    toast.success("Detalle CSV descargado");
  }

  function applyFilters() {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (filterWorker !== "all") params.set("worker", filterWorker);
    router.push(`?${params.toString()}`);
  }

  const summary = [
    { label: "Total horas", value: formatHours(totalHours) },
    { label: "Horas extra", value: formatHours(totalExtra) },
    { label: "Turnos", value: totalShifts.toString() },
    { label: "Trabajadores", value: rows.length.toString() },
  ];

  return (
    <div className="space-y-6">
      <FadeIn>
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Selecciona el rango y los trabajadores a incluir</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="from">Desde</Label>
                <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="to">Hasta</Label>
                <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="worker">Trabajador</Label>
                <Select value={filterWorker} onValueChange={setFilterWorker}>
                  <SelectTrigger id="worker">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {users
                      .filter((u) => u.role !== "ADMIN")
                      .map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-2">
                <Button onClick={applyFilters} className="flex-1">
                  Aplicar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      <StaggerChildren className="grid grid-cols-2 lg:grid-cols-4 gap-3" delay={0.06}>
        {summary.map((s, i) => (
          <StaggerItem key={i}>
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-bold tabular-nums mt-1">{s.value}</p>
              </CardContent>
            </Card>
          </StaggerItem>
        ))}
      </StaggerChildren>

      <FadeIn delay={0.1}>
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Resumen por trabajador
              </CardTitle>
              <CardDescription>
                {formatDate(from, { day: "numeric", month: "short" })} –{" "}
                {formatDate(to, { day: "numeric", month: "short", year: "numeric" })}
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={exportDetailedCSV}>
                <FileSpreadsheet className="h-4 w-4" />
                Detalle CSV
              </Button>
              <Button size="sm" onClick={exportCSV}>
                <Download className="h-4 w-4" />
                Resumen CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {rows.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">
                <FileDown className="h-10 w-10 mx-auto mb-2 opacity-50" />
                No hay datos en el rango seleccionado
              </div>
            ) : (
              <div className="space-y-3">
                {rows.map((r, i) => {
                  const user = users.find((u) => u.id === r.workerId);
                  const targetHours = user?.workerProfile?.horasObjetivoSemanal ?? 40;
                  return (
                    <motion.div
                      key={r.workerId}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.2 }}
                      className="rounded-lg border p-3 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <div>
                          <p className="font-medium text-sm">{r.workerName}</p>
                          <p className="text-xs text-muted-foreground">{ROLE_LABELS[user?.role ?? "WORKER"]} · {r.shiftCount} turnos</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold tabular-nums">{formatHours(r.totalHours)}</p>
                          {user?.role === "WORKER" && (
                            <p className="text-[11px] text-muted-foreground">/ {targetHours}h semana</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={Math.min(100, (r.totalHours / maxHours) * 100)} className="h-1.5" />
                        <div className="flex flex-wrap gap-1">
                          {r.normal > 0 && (
                            <Badge variant="info" className="text-[10px] py-0">{formatHours(r.normal)} normal</Badge>
                          )}
                          {r.extra > 0 && (
                            <Badge variant="warning" className="text-[10px] py-0">{formatHours(r.extra)} extra</Badge>
                          )}
                          {r.vacaciones > 0 && (
                            <Badge variant="success" className="text-[10px] py-0">{formatHours(r.vacaciones)} vac</Badge>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}

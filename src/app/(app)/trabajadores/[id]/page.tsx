import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Briefcase, Target, CalendarDays, ClipboardList } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { getRequests, getShifts, getUserById } from "@/lib/data";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ROLE_LABELS,
  SHIFT_TYPE_COLORS,
  SHIFT_TYPE_LABELS,
  REQUEST_STATUS_COLORS,
  REQUEST_STATUS_LABELS,
  REQUEST_TYPE_LABELS,
} from "@/lib/types";
import { addDays, diffHours, formatDate, formatHours, startOfWeek } from "@/lib/utils";
import { FadeIn } from "@/components/animations/page-transition";
import { WorkerDetailActions } from "@/components/workers/worker-detail-actions";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default async function WorkerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const me = await getCurrentUser();
  if (!me) redirect("/login");
  if (me.role === "WORKER") redirect("/dashboard");

  const { id } = await params;
  const worker = getUserById(id);
  if (!worker) notFound();

  const monday = startOfWeek(new Date());
  const weekFrom = monday.toISOString().slice(0, 10);
  const weekTo = addDays(monday, 6).toISOString().slice(0, 10);

  const upcomingShifts = getShifts({ workerId: worker.id, from: weekFrom }).slice(0, 10);
  const requests = getRequests({ requesterId: worker.id }).slice(0, 5);

  const totalWeekHours = upcomingShifts
    .filter((s) => s.shiftType === "NORMAL" || s.shiftType === "EXTRA")
    .reduce((acc, s) => acc + diffHours(s.startTime, s.endTime), 0);
  const targetHours = worker.workerProfile?.horasObjetivoSemanal ?? 40;
  const progress = Math.min(100, Math.round((totalWeekHours / Math.max(targetHours, 1)) * 100));

  return (
    <div className="space-y-6">
      <FadeIn>
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link href="/trabajadores">
            <ArrowLeft className="h-4 w-4" />
            Volver a trabajadores
          </Link>
        </Button>
      </FadeIn>

      <FadeIn delay={0.05}>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <Avatar className="h-16 w-16 shrink-0">
                <AvatarFallback className="text-lg">{initials(worker.name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">
                    {worker.name}
                  </h1>
                  <Badge variant="outline">{ROLE_LABELS[worker.role]}</Badge>
                </div>
                <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" />
                    {worker.email}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5" />
                    {worker.team || "Sin equipo"}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Target className="h-3.5 w-3.5" />
                    {targetHours}h objetivo semanal
                  </span>
                </div>
              </div>
              <WorkerDetailActions worker={worker} />
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      <div className="grid gap-6 lg:grid-cols-3">
        <FadeIn delay={0.1} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    Turnos próximos
                  </CardTitle>
                  <CardDescription>
                    Semana en curso · {formatDate(weekFrom)} – {formatDate(weekTo)}
                  </CardDescription>
                </div>
                <span className="text-sm tabular-nums text-muted-foreground">
                  {formatHours(totalWeekHours)} / {formatHours(targetHours)}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {upcomingShifts.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  Sin turnos programados
                </p>
              ) : (
                <div className="space-y-2">
                  {upcomingShifts.map((s) => {
                    const colors = SHIFT_TYPE_COLORS[s.shiftType];
                    return (
                      <div
                        key={s.id}
                        className={`flex items-center gap-3 rounded-lg border p-3 ${colors.bg} ${colors.border}`}
                      >
                        <div className={`h-2 w-2 rounded-full ${colors.dot}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">
                            {formatDate(s.date, { weekday: "short", day: "numeric", month: "short" })}
                            <span className="text-muted-foreground font-normal">
                              {" · "}
                              {new Date(s.startTime).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                              {" – "}
                              {new Date(s.endTime).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </p>
                          {s.notes && (
                            <p className="text-xs text-muted-foreground truncate">{s.notes}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="outline">{SHIFT_TYPE_LABELS[s.shiftType]}</Badge>
                          <span className="text-sm tabular-nums hidden sm:inline">
                            {formatHours(diffHours(s.startTime, s.endTime))}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.15}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Progreso semanal
              </CardTitle>
              <CardDescription>Horas trabajadas vs objetivo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${progress}%` }}
                    aria-hidden
                  />
                </div>
                <div className="flex justify-between text-sm tabular-nums">
                  <span>{formatHours(totalWeekHours)}</span>
                  <span className="text-muted-foreground">{formatHours(targetHours)}</span>
                </div>
              </div>
              <Separator />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Turnos esta semana</span>
                  <span className="font-medium tabular-nums">{upcomingShifts.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Solicitudes totales</span>
                  <span className="font-medium tabular-nums">{requests.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Alta</span>
                  <span className="font-medium">{formatDate(worker.createdAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      <FadeIn delay={0.2}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Solicitudes recientes
            </CardTitle>
            <CardDescription>Últimas solicitudes realizadas por {worker.name.split(" ")[0]}</CardDescription>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                No hay solicitudes registradas
              </p>
            ) : (
              <div className="space-y-2">
                {requests.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between gap-3 rounded-lg border p-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{REQUEST_TYPE_LABELS[r.requestType]}</p>
                      <p className="text-xs text-muted-foreground truncate">{r.reason}</p>
                    </div>
                    <Badge variant="outline" className={REQUEST_STATUS_COLORS[r.status]}>
                      {REQUEST_STATUS_LABELS[r.status]}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}

import { getCurrentUser } from "@/lib/session";
import { getRequests, getShifts, getUsers } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { FadeIn, StaggerChildren, StaggerItem } from "@/components/animations/page-transition";
import { GsapParallax } from "@/components/animations/gsap-reveal";
import { ScrollRevealBox } from "@/components/animations/scroll-reveal";
import { ROLE_LABELS, SHIFT_TYPE_COLORS, SHIFT_TYPE_LABELS, REQUEST_STATUS_LABELS, REQUEST_STATUS_COLORS } from "@/lib/types";
import { diffHours, formatDate, formatHours, startOfWeek, addDays } from "@/lib/utils";
import { Calendar, ClipboardList, Users, AlertCircle, Briefcase, TrendingUp } from "lucide-react";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const users = getUsers();
  const monday = startOfWeek(new Date());
  const weekShifts = getShifts({
    from: monday.toISOString().slice(0, 10),
    to: addDays(monday, 6).toISOString().slice(0, 10),
  });
  const myWeekShifts =
    user.role === "WORKER" ? weekShifts.filter((s) => s.workerId === user.id) : weekShifts;
  const requests = getRequests();
  const pendingRequests = requests.filter((r) => r.status === "PENDIENTE");

  // Estadísticas
  const totalUsers = users.length;
  const workers = users.filter((u) => u.role !== "ADMIN");
  const totalHours = myWeekShifts.reduce(
    (acc, s) => acc + (s.shiftType === "NORMAL" || s.shiftType === "EXTRA" ? diffHours(s.startTime, s.endTime) : 0),
    0
  );
  const targetHours = user.workerProfile?.horasObjetivoSemanal ?? 40;
  const progress = Math.min(100, Math.round((totalHours / targetHours) * 100));

  const cards = [
    {
      title: "Trabajadores",
      value: totalUsers,
      description: `${workers.length} con perfil`,
      icon: Users,
      gradient: "from-sky-500/20 to-sky-500/0",
      iconBg: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
    },
    {
      title: "Turnos esta semana",
      value: myWeekShifts.length,
      description: `${formatHours(totalHours)} programadas`,
      icon: Calendar,
      gradient: "from-violet-500/20 to-violet-500/0",
      iconBg: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
    },
    {
      title: "Solicitudes pendientes",
      value: pendingRequests.length,
      description: `${requests.length} solicitudes en total`,
      icon: ClipboardList,
      gradient: "from-amber-500/20 to-amber-500/0",
      iconBg: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    },
    {
      title: "Equipos",
      value: new Set(users.map((u) => u.team).filter(Boolean)).size,
      description: "Activos en la organización",
      icon: Briefcase,
      gradient: "from-emerald-500/20 to-emerald-500/0",
      iconBg: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    },
  ];

  return (
    <div className="space-y-6">
      <GsapParallax speed={0.15} className="relative -mx-3 sm:-mx-6 -mt-3 sm:-mt-6">
        <div className="px-3 sm:px-6 pt-3 sm:pt-6 pb-8 bg-gradient-to-br from-primary/5 via-background to-background border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                {formatDate(new Date(), { weekday: "long", day: "numeric", month: "long" })}
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Hola, {user.name.split(" ")[0]} 👋
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {ROLE_LABELS[user.role]} · {user.team || "Sin equipo"}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-xs text-muted-foreground">Progreso semanal</span>
              <div className="flex items-center gap-3 w-full sm:w-64">
                <Progress value={progress} className="h-2" />
                <span className="text-sm font-medium tabular-nums">
                  {formatHours(totalHours)} / {formatHours(targetHours)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </GsapParallax>

      <StaggerChildren className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <StaggerItem key={c.title}>
              <Card className={`relative overflow-hidden bg-gradient-to-br ${c.gradient}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{c.title}</CardTitle>
                  <div className={`h-9 w-9 rounded-lg grid place-items-center ${c.iconBg}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold tabular-nums">{c.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{c.description}</p>
                </CardContent>
              </Card>
            </StaggerItem>
          );
        })}
      </StaggerChildren>

      <div className="grid gap-6 lg:grid-cols-3">
        <FadeIn className="lg:col-span-2" delay={0.1}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Turnos próximos</CardTitle>
                  <CardDescription>Tu horario de la semana en curso</CardDescription>
                </div>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              {myWeekShifts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  No tienes turnos programados para esta semana
                </div>
              ) : (
                <div className="space-y-2">
                  {myWeekShifts.slice(0, 6).map((s) => {
                    const colors = SHIFT_TYPE_COLORS[s.shiftType];
                    const w = users.find((u) => u.id === s.workerId);
                    return (
                      <div
                        key={s.id}
                        className={`flex items-center gap-3 rounded-lg border p-3 ${colors.bg} ${colors.border}`}
                      >
                        <div className={`h-2 w-2 rounded-full ${colors.dot}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">
                            {formatDate(s.date, { weekday: "short", day: "numeric", month: "short" })} ·{" "}
                            <span className="text-muted-foreground font-normal">
                              {new Date(s.startTime).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })} –{" "}
                              {new Date(s.endTime).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {w?.name ?? "Trabajador"} · {SHIFT_TYPE_LABELS[s.shiftType]}
                          </p>
                        </div>
                        <Badge variant="outline" className="hidden sm:inline-flex">
                          {formatHours(diffHours(s.startTime, s.endTime))}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </FadeIn>

        <ScrollRevealBox>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Equipo</CardTitle>
              <CardDescription>Trabajadores activos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {workers.slice(0, 6).map((u) => (
                  <div key={u.id} className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>{initials(u.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{u.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {u.team || "Sin equipo"}
                      </p>
                    </div>
                    <Badge variant="outline" className="hidden sm:inline-flex">
                      {ROLE_LABELS[u.role]}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </ScrollRevealBox>
      </div>

      {pendingRequests.length > 0 && user.role !== "WORKER" && (
        <ScrollRevealBox>
          <Card>
            <CardHeader>
              <CardTitle>Solicitudes recientes</CardTitle>
              <CardDescription>Las últimas solicitudes pendientes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {pendingRequests.slice(0, 5).map((r) => {
                  const requester = users.find((u) => u.id === r.requesterId);
                  return (
                    <div key={r.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{requester?.name ?? "Usuario"}</p>
                        <p className="text-xs text-muted-foreground truncate">{r.reason}</p>
                      </div>
                      <Badge variant="outline" className={REQUEST_STATUS_COLORS[r.status]}>
                        {REQUEST_STATUS_LABELS[r.status]}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </ScrollRevealBox>
      )}
    </div>
  );
}

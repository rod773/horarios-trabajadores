import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getShifts, getUsers } from "@/lib/data";
import { addDays, startOfWeek, toISODate } from "@/lib/utils";
import { WeekScheduleView } from "@/components/shifts/week-schedule-view";
import { FadeIn } from "@/components/animations/page-transition";

export default async function HorariosPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string; worker?: string; team?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const monday = params.week ? new Date(params.week) : startOfWeek(new Date());
  const weekStart = startOfWeek(monday);
  const from = toISODate(weekStart);
  const to = toISODate(addDays(weekStart, 6));

  let shifts = getShifts({ from, to });
  if (user.role === "WORKER") {
    shifts = shifts.filter((s) => s.workerId === user.id);
  }
  const users = getUsers();
  const isAdmin = user.role === "ADMIN" || user.role === "SUPERVISOR";

  return (
    <div className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Horarios</h1>
          <p className="text-muted-foreground mt-1">
            Planifica y visualiza los turnos de la semana
          </p>
        </div>
      </FadeIn>
      <WeekScheduleView
        shifts={shifts}
        users={users}
        weekStart={weekStart}
        isAdmin={isAdmin}
        currentUserId={user.id}
        filterWorkerId={params.worker}
        filterTeam={params.team}
      />
    </div>
  );
}

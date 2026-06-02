import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getShifts, getUsers } from "@/lib/data";
import { ReportsView } from "@/components/reports/reports-view";
import { FadeIn } from "@/components/animations/page-transition";

export default async function ReportesPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; worker?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "WORKER") redirect("/dashboard");

  const params = await searchParams;
  const shifts = getShifts();
  const users = getUsers();

  return (
    <div className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Reportes</h1>
          <p className="text-muted-foreground mt-1">
            Resumen de horas y turnos por trabajador
          </p>
        </div>
      </FadeIn>
      <ReportsView shifts={shifts} users={users} currentUser={user} />
    </div>
  );
}

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { AppShell } from "@/components/layout/app-shell";
import { startOfWeek } from "@/lib/utils";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const monday = startOfWeek(new Date());
  const weekLabel = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short" }).format(monday);

  return (
    <AppShell
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        team: user.team,
      }}
      weekLabel={weekLabel}
    >
      {children}
    </AppShell>
  );
}

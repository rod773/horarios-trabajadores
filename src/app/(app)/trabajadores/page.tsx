import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getUsers } from "@/lib/data";
import { WorkersTable } from "@/components/workers/workers-table";
import { FadeIn } from "@/components/animations/page-transition";
import { noindexMetadata } from "@/lib/site";

export const metadata: Metadata = noindexMetadata(
  "Trabajadores",
  "Gestiona los miembros del equipo, sus roles y horas objetivo.",
);

export default async function TrabajadoresPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "WORKER") redirect("/dashboard");

  const users = getUsers();

  return (
    <div className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Trabajadores</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona los miembros del equipo, sus roles y horas objetivo
          </p>
        </div>
      </FadeIn>
      <FadeIn delay={0.1}>
        <WorkersTable workers={users} />
      </FadeIn>
    </div>
  );
}

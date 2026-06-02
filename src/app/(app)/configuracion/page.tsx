import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getSettings } from "@/lib/data";
import { SettingsForm } from "@/components/config/settings-form";
import { FadeIn } from "@/components/animations/page-transition";
import { noindexMetadata } from "@/lib/site";

export const metadata: Metadata = noindexMetadata(
  "Configuración",
  "Ajusta los límites y validaciones del sistema.",
);

export default async function ConfiguracionPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/dashboard");

  const settings = getSettings();

  return (
    <div className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Configuración</h1>
          <p className="text-muted-foreground mt-1">
            Ajusta los límites y validaciones del sistema
          </p>
        </div>
      </FadeIn>
      <FadeIn delay={0.1}>
        <SettingsForm settings={settings} />
      </FadeIn>
    </div>
  );
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { LoginForm } from "@/components/auth/login-form";
import { generateCaptcha } from "@/lib/captcha";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Accede a tu cuenta para gestionar horarios y turnos del equipo.",
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true,
    },
  },
  alternates: {
    canonical: "/login",
  },
};

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");
  const captcha = generateCaptcha();
  return <LoginForm captchaExpression={captcha.expression} captchaToken={captcha.token} />;
}

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { LoginForm } from "@/components/auth/login-form";
import { generateCaptcha } from "@/lib/captcha";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");
  const captcha = generateCaptcha();
  return <LoginForm captchaExpression={captcha.expression} captchaToken={captcha.token} />;
}

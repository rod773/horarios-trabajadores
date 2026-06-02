import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { verifyPassword } from "@/lib/data";
import { loginSchema } from "@/lib/validations";
import { login } from "@/lib/session";
import { verifyCaptcha } from "@/lib/captcha";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Datos inválidos" }, { status: 400 });
  }

  if (!verifyCaptcha(parsed.data.captchaToken, parsed.data.captchaAnswer)) {
    return NextResponse.json({ ok: false, error: "Captcha incorrecto" }, { status: 400 });
  }

  const user = verifyPassword(parsed.data.email, parsed.data.password);
  if (!user) {
    return NextResponse.json({ ok: false, error: "Credenciales inválidas" }, { status: 401 });
  }
  await login(user.email);
  return NextResponse.json({ ok: true, user: { id: user.id, name: user.name, role: user.role } });
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ user: null }, { status: 401 });
  return NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role, team: user.team },
  });
}

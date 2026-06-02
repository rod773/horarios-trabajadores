"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createRequest,
  createShift,
  createUser,
  deleteShift,
  deleteUser,
  getShiftById,
  getUserByEmail,
  resolveRequest,
  updateSettings,
  updateShift,
  updateUser,
  verifyPassword,
  getSettings,
  addAuditLog,
} from "@/lib/data";
import { login, logout } from "@/lib/session";
import {
  loginSchema,
  requestFormSchema,
  settingsSchema,
  shiftFormSchema,
  workerFormSchema,
} from "@/lib/validations";
import { parseTimeOnDate, diffHours, toISODate } from "@/lib/utils";

export type ActionResult<T = unknown> =
  | { ok: true; data?: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

function flatten(error: unknown): { ok: false; error: string; fieldErrors?: Record<string, string[]> } {
  if (error && typeof error === "object" && "issues" in error) {
    const issues = (error as { issues: Array<{ path: Array<string | number>; message: string }> }).issues;
    const fieldErrors: Record<string, string[]> = {};
    for (const i of issues) {
      const key = i.path.join(".");
      if (!fieldErrors[key]) fieldErrors[key] = [];
      fieldErrors[key].push(i.message);
    }
    return { ok: false, error: "Revisa los campos del formulario", fieldErrors };
  }
  return { ok: false, error: (error as Error)?.message ?? "Error desconocido" };
}


export async function loginAction(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    captchaToken: formData.get("captchaToken"),
    captchaAnswer: formData.get("captchaAnswer"),
  });
  if (!parsed.success) return flatten(parsed.error);

  const { verifyCaptcha } = await import("@/lib/captcha");
  if (!verifyCaptcha(parsed.data.captchaToken, parsed.data.captchaAnswer)) {
    return { ok: false, error: "Captcha incorrecto. Intenta de nuevo." };
  }

  const user = verifyPassword(parsed.data.email, parsed.data.password);
  if (!user) {
    return { ok: false, error: "Credenciales inválidas" };
  }
  try {
    const logged = await login(user.email);
    if (!logged) {
      return { ok: false, error: "Error de autenticación (JWT_SECRET no configurado)" };
    }
    redirect("/dashboard");
  } catch {
    return { ok: false, error: "Error de autenticación" };
  }
}

export async function logoutAction() {
  await logout();
  redirect("/login");
}

export async function createWorkerAction(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  const parsed = workerFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
    team: (formData.get("team") ?? null) as string | null,
    horasObjetivoSemanal: formData.get("horasObjetivoSemanal") || 40,
  });

  if (!parsed.success) return flatten(parsed.error);

  if (getUserByEmail(parsed.data.email)) {
    return { ok: false, error: "Ya existe un usuario con ese email" };
  }
  const password = (formData.get("password") as string) || "worker123";
  const u = createUser({
    name: parsed.data.name,
    email: parsed.data.email,
    role: parsed.data.role,
    team: parsed.data.team ?? null,
    horasObjetivoSemanal: parsed.data.horasObjetivoSemanal,
    password,
  });

  addAuditLog(u.id, "CREATE_USER", "User", u.id);
  revalidatePath("/trabajadores");
  return { ok: true };
}

export async function updateWorkerAction(id: string, _prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  const parsed = workerFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
    team: (formData.get("team") ?? null) as string | null,
    horasObjetivoSemanal: formData.get("horasObjetivoSemanal") || 40,
  });

  if (!parsed.success) return flatten(parsed.error);

  const u = updateUser(id, parsed.data);
  if (!u) return { ok: false, error: "Usuario no encontrado" };
  addAuditLog(id, "UPDATE_USER", "User", id);
  revalidatePath("/trabajadores");
  return { ok: true };
}

export async function deleteWorkerAction(id: string): Promise<ActionResult> {
  if (!deleteUser(id)) return { ok: false, error: "No se pudo eliminar" };
  addAuditLog(id, "DELETE_USER", "User", id);
  revalidatePath("/trabajadores");
  return { ok: true };
}

export async function createShiftAction(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  const parsed = shiftFormSchema.safeParse({
    workerId: formData.get("workerId"),
    date: formData.get("date"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    shiftType: formData.get("shiftType"),
    notes: formData.get("notes") || null,
  });
  if (!parsed.success) return flatten(parsed.error);

  const settings = getSettings();
  const start = parseTimeOnDate(parsed.data.date, parsed.data.startTime);
  const end = parseTimeOnDate(parsed.data.date, parsed.data.endTime);
  if (parsed.data.shiftType !== "DESCANSO" && parsed.data.shiftType !== "VACACIONES" && end <= start) {
    return { ok: false, error: "La hora de fin debe ser mayor a la hora de inicio" };
  }

  // Validar solapamiento
  const { getShifts } = await import("@/lib/data");
  const sameDay = getShifts({ workerId: parsed.data.workerId, from: parsed.data.date, to: parsed.data.date });
  const overlapTol = settings.overlapToleranceMinutos * 60_000;
  for (const s of sameDay) {
    if (parsed.data.shiftType === "DESCANSO" || parsed.data.shiftType === "VACACIONES") break;
    if (s.shiftType === "DESCANSO" || s.shiftType === "VACACIONES") continue;
    const sStart = new Date(s.startTime).getTime();
    const sEnd = new Date(s.endTime).getTime();
    if (start.getTime() < sEnd - overlapTol && end.getTime() > sStart + overlapTol) {
      return { ok: false, error: "El turno se solapa con otro existente para el mismo trabajador" };
    }
  }

  // Validar horas
  if (parsed.data.shiftType === "NORMAL" || parsed.data.shiftType === "EXTRA") {
    const hours = diffHours(start, end);
    if (hours > settings.maxHorasPorDia) {
      return { ok: false, error: `Excede el máximo de ${settings.maxHorasPorDia} horas por día` };
    }
  }

  const shift = createShift({
    workerId: parsed.data.workerId,
    date: parsed.data.date,
    startTime: start.toISOString(),
    endTime: end.toISOString(),
    shiftType: parsed.data.shiftType,
    notes: parsed.data.notes ?? null,
  });
  addAuditLog(parsed.data.workerId, "CREATE_SHIFT", "Shift", shift.id);
  revalidatePath("/horarios");
  return { ok: true };
}

export async function updateShiftAction(id: string, _prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  const parsed = shiftFormSchema.safeParse({
    workerId: formData.get("workerId"),
    date: formData.get("date"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    shiftType: formData.get("shiftType"),
    notes: formData.get("notes") || null,
  });
  if (!parsed.success) return flatten(parsed.error);

  const start = parseTimeOnDate(parsed.data.date, parsed.data.startTime);
  const end = parseTimeOnDate(parsed.data.date, parsed.data.endTime);
  const shift = updateShift(id, {
    workerId: parsed.data.workerId,
    date: parsed.data.date,
    startTime: start.toISOString(),
    endTime: end.toISOString(),
    shiftType: parsed.data.shiftType,
    notes: parsed.data.notes ?? null,
  });
  if (!shift) return { ok: false, error: "Turno no encontrado" };
  addAuditLog(parsed.data.workerId, "UPDATE_SHIFT", "Shift", id);
  revalidatePath("/horarios");
  return { ok: true };
}

export async function deleteShiftAction(id: string): Promise<ActionResult> {
  const shift = getShiftById(id);
  if (!shift) return { ok: false, error: "Turno no encontrado" };
  if (!deleteShift(id)) return { ok: false, error: "No se pudo eliminar" };
  addAuditLog(shift.workerId, "DELETE_SHIFT", "Shift", id);
  revalidatePath("/horarios");
  return { ok: true };
}

export async function createRequestAction(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  const parsed = requestFormSchema.safeParse({
    requestType: formData.get("requestType"),
    fromShiftId: formData.get("fromShiftId"),
    toShiftProposedId: formData.get("toShiftProposedId") || null,
    reason: formData.get("reason"),
  });
  if (!parsed.success) return flatten(parsed.error);

  const requesterId = (formData.get("requesterId") as string) || "";
  if (!requesterId) return { ok: false, error: "Falta identificar al solicitante" };

  const req = createRequest({
    requesterId,
    fromShiftId: parsed.data.fromShiftId,
    toShiftProposedId: parsed.data.toShiftProposedId ?? null,
    requestType: parsed.data.requestType,
    reason: parsed.data.reason,
  });
  addAuditLog(requesterId, "CREATE_REQUEST", "ShiftRequest", req.id);
  revalidatePath("/solicitudes");
  return { ok: true };
}

export async function resolveRequestAction(
  id: string,
  status: "APROBADA" | "RECHAZADA"
): Promise<ActionResult> {
  const { getRequestById } = await import("@/lib/data");
  const req = getRequestById(id);
  if (!req) return { ok: false, error: "Solicitud no encontrada" };
  resolveRequest(id, status, req.requesterId);
  addAuditLog(req.requesterId, `RESOLVE_REQUEST_${status}`, "ShiftRequest", id);
  revalidatePath("/solicitudes");
  return { ok: true };
}

export async function updateSettingsAction(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  const parsed = settingsSchema.safeParse({
    maxHorasPorDia: formData.get("maxHorasPorDia"),
    maxHorasPorSemana: formData.get("maxHorasPorSemana"),
    minDescansoHoras: formData.get("minDescansoHoras"),
    overlapToleranceMinutos: formData.get("overlapToleranceMinutos"),
  });
  if (!parsed.success) return flatten(parsed.error);
  updateSettings(parsed.data);
  revalidatePath("/configuracion");
  return { ok: true };
}



export async function computeWeekRange(start: Date) {
  const startDate = new Date(start);
  const endDate = new Date(start);
  endDate.setDate(endDate.getDate() + 6);
  return {
    from: toISODate(startDate),
    to: toISODate(endDate),
  };
}


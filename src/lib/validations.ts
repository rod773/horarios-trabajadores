import { z } from "zod";

export const roleSchema = z.enum(["ADMIN", "SUPERVISOR", "WORKER"]);
export const shiftTypeSchema = z.enum(["NORMAL", "DESCANSO", "VACACIONES", "EXTRA"]);
export const requestTypeSchema = z.enum(["INTERCAMBIO", "CAMBIO_HORARIO", "VACACIONES"]);
export const requestStatusSchema = z.enum(["PENDIENTE", "APROBADA", "RECHAZADA"]);

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
  captchaToken: z.string().min(1, "Error de verificación"),
  captchaAnswer: z.string().min(1, "Resuelve el captcha"),
});

export const workerFormSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  role: roleSchema,
  team: z.string().optional().nullable(),
  horasObjetivoSemanal: z.coerce.number().min(0).max(80),
});

export const shiftFormSchema = z
  .object({
    workerId: z.string().min(1, "Selecciona un trabajador"),
    date: z.string().min(1, "Selecciona una fecha"),
    startTime: z.string().min(1, "Hora de inicio requerida"),
    endTime: z.string().min(1, "Hora de fin requerida"),
    shiftType: shiftTypeSchema,
    notes: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.shiftType === "DESCANSO" || data.shiftType === "VACACIONES") return true;
      return data.endTime > data.startTime;
    },
    { message: "La hora de fin debe ser mayor a la hora de inicio", path: ["endTime"] }
  );

export const requestFormSchema = z.object({
  requestType: requestTypeSchema,
  fromShiftId: z.string().min(1, "Selecciona un turno de origen"),
  toShiftProposedId: z.string().optional().nullable(),
  reason: z.string().min(3, "Indica un motivo"),
});

export const settingsSchema = z.object({
  maxHorasPorDia: z.coerce.number().min(1).max(24),
  maxHorasPorSemana: z.coerce.number().min(1).max(80),
  minDescansoHoras: z.coerce.number().min(0).max(24),
  overlapToleranceMinutos: z.coerce.number().min(0).max(60),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type WorkerFormInput = z.infer<typeof workerFormSchema>;
export type ShiftFormInput = z.infer<typeof shiftFormSchema>;
export type RequestFormInput = z.infer<typeof requestFormSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;

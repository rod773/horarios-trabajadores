export type Role = "ADMIN" | "SUPERVISOR" | "WORKER";

export type ShiftType = "NORMAL" | "DESCANSO" | "VACACIONES" | "EXTRA";

export type RequestType = "INTERCAMBIO" | "CAMBIO_HORARIO" | "VACACIONES";

export type RequestStatus = "PENDIENTE" | "APROBADA" | "RECHAZADA";

export interface WorkerProfile {
  id: string;
  userId: string;
  horasObjetivoSemanal: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  team: string | null;
  workerProfile: WorkerProfile | null;
  createdAt: string;
  updatedAt?: string;
}

export interface Shift {
  id: string;
  workerId: string;
  date: string;
  startTime: string;
  endTime: string;
  shiftType: ShiftType;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ShiftRequest {
  id: string;
  requesterId: string;
  fromShiftId: string;
  toShiftProposedId: string | null;
  requestType: RequestType;
  status: RequestStatus;
  reason: string;
  createdAt: string;
  resolvedAt: string | null;
  resolvedById: string | null;
}

export interface AuditLog {
  id: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
}

export interface AppSettings {
  maxHorasPorDia: number;
  maxHorasPorSemana: number;
  minDescansoHoras: number;
  overlapToleranceMinutos: number;
}

export const SHIFT_TYPE_LABELS: Record<ShiftType, string> = {
  NORMAL: "Normal",
  DESCANSO: "Descanso",
  VACACIONES: "Vacaciones",
  EXTRA: "Extra",
};

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrador",
  SUPERVISOR: "Supervisor",
  WORKER: "Trabajador",
};

export const REQUEST_TYPE_LABELS: Record<RequestType, string> = {
  INTERCAMBIO: "Intercambio de turno",
  CAMBIO_HORARIO: "Cambio de horario",
  VACACIONES: "Vacaciones",
};

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  PENDIENTE: "Pendiente",
  APROBADA: "Aprobada",
  RECHAZADA: "Rechazada",
};

export const SHIFT_TYPE_COLORS: Record<ShiftType, { bg: string; border: string; text: string; dot: string }> = {
  NORMAL: {
    bg: "bg-sky-500/15",
    border: "border-sky-500/40",
    text: "text-sky-700 dark:text-sky-300",
    dot: "bg-sky-500",
  },
  DESCANSO: {
    bg: "bg-slate-500/15",
    border: "border-slate-500/40",
    text: "text-slate-700 dark:text-slate-300",
    dot: "bg-slate-500",
  },
  VACACIONES: {
    bg: "bg-emerald-500/15",
    border: "border-emerald-500/40",
    text: "text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  EXTRA: {
    bg: "bg-amber-500/15",
    border: "border-amber-500/40",
    text: "text-amber-700 dark:text-amber-300",
    dot: "bg-amber-500",
  },
};

export const REQUEST_STATUS_COLORS: Record<RequestStatus, string> = {
  PENDIENTE: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
  APROBADA: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  RECHAZADA: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
};

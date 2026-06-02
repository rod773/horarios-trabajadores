import type {
  AppSettings,
  AuditLog,
  Shift,
  ShiftRequest,
  User,
} from "./types";
import { addDays, startOfWeek, toISODate } from "./utils";

interface DataStore {
  users: User[];
  shifts: Shift[];
  requests: ShiftRequest[];
  auditLogs: AuditLog[];
  settings: AppSettings;
  passwords: Record<string, string>;
  seq: number;
}

declare global {
  var __APP_DATA__: DataStore | undefined;
}

function buildSeed(): DataStore {
  const now = new Date();
  const monday = startOfWeek(now);
  const iso = (d: Date) => toISODate(d);

  const users: User[] = [
    {
      id: "u_admin",
      email: "admin@empresa.com",
      name: "Ana García",
      role: "ADMIN",
      team: "Administración",
      workerProfile: null,
      createdAt: now.toISOString(),
    },
    {
      id: "u_sup_1",
      email: "supervisor@empresa.com",
      name: "Luis Martínez",
      role: "SUPERVISOR",
      team: "Operaciones",
      workerProfile: {
        id: "wp_sup_1",
        userId: "u_sup_1",
        horasObjetivoSemanal: 40,
      },
      createdAt: now.toISOString(),
    },
    {
      id: "u_w_1",
      email: "maria@empresa.com",
      name: "María López",
      role: "WORKER",
      team: "Equipo A",
      workerProfile: {
        id: "wp_1",
        userId: "u_w_1",
        horasObjetivoSemanal: 40,
      },
      createdAt: now.toISOString(),
    },
    {
      id: "u_w_2",
      email: "javier@empresa.com",
      name: "Javier Rodríguez",
      role: "WORKER",
      team: "Equipo A",
      workerProfile: {
        id: "wp_2",
        userId: "u_w_2",
        horasObjetivoSemanal: 40,
      },
      createdAt: now.toISOString(),
    },
    {
      id: "u_w_3",
      email: "carla@empresa.com",
      name: "Carla Fernández",
      role: "WORKER",
      team: "Equipo A",
      workerProfile: {
        id: "wp_3",
        userId: "u_w_3",
        horasObjetivoSemanal: 30,
      },
      createdAt: now.toISOString(),
    },
    {
      id: "u_w_4",
      email: "diego@empresa.com",
      name: "Diego Sánchez",
      role: "WORKER",
      team: "Equipo B",
      workerProfile: {
        id: "wp_4",
        userId: "u_w_4",
        horasObjetivoSemanal: 40,
      },
      createdAt: now.toISOString(),
    },
    {
      id: "u_w_5",
      email: "elena@empresa.com",
      name: "Elena Pérez",
      role: "WORKER",
      team: "Equipo B",
      workerProfile: {
        id: "wp_5",
        userId: "u_w_5",
        horasObjetivoSemanal: 40,
      },
      createdAt: now.toISOString(),
    },
    {
      id: "u_w_6",
      email: "pablo@empresa.com",
      name: "Pablo Gómez",
      role: "WORKER",
      team: "Equipo B",
      workerProfile: {
        id: "wp_6",
        userId: "u_w_6",
        horasObjetivoSemanal: 20,
      },
      createdAt: now.toISOString(),
    },
  ];

  const shifts: Shift[] = [];
  const shiftSeed: Array<Omit<Shift, "id" | "createdAt" | "updatedAt">> = [
    {
      workerId: "u_w_1",
      date: iso(monday),
      startTime: `${iso(monday)}T08:00:00.000Z`,
      endTime: `${iso(monday)}T16:00:00.000Z`,
      shiftType: "NORMAL",
      notes: "Turno de mañana",
    },
    {
      workerId: "u_w_1",
      date: iso(addDays(monday, 1)),
      startTime: `${iso(addDays(monday, 1))}T08:00:00.000Z`,
      endTime: `${iso(addDays(monday, 1))}T16:00:00.000Z`,
      shiftType: "NORMAL",
      notes: null,
    },
    {
      workerId: "u_w_1",
      date: iso(addDays(monday, 2)),
      startTime: `${iso(addDays(monday, 2))}T00:00:00.000Z`,
      endTime: `${iso(addDays(monday, 2))}T23:59:59.999Z`,
      shiftType: "DESCANSO",
      notes: null,
    },
    {
      workerId: "u_w_1",
      date: iso(addDays(monday, 3)),
      startTime: `${iso(addDays(monday, 3))}T08:00:00.000Z`,
      endTime: `${iso(addDays(monday, 3))}T16:00:00.000Z`,
      shiftType: "NORMAL",
      notes: null,
    },
    {
      workerId: "u_w_1",
      date: iso(addDays(monday, 4)),
      startTime: `${iso(addDays(monday, 4))}T14:00:00.000Z`,
      endTime: `${iso(addDays(monday, 4))}T20:00:00.000Z`,
      shiftType: "EXTRA",
      notes: "Cobertura por ausencia",
    },
    {
      workerId: "u_w_2",
      date: iso(monday),
      startTime: `${iso(monday)}T14:00:00.000Z`,
      endTime: `${iso(monday)}T22:00:00.000Z`,
      shiftType: "NORMAL",
      notes: null,
    },
    {
      workerId: "u_w_2",
      date: iso(addDays(monday, 1)),
      startTime: `${iso(addDays(monday, 1))}T14:00:00.000Z`,
      endTime: `${iso(addDays(monday, 1))}T22:00:00.000Z`,
      shiftType: "NORMAL",
      notes: null,
    },
    {
      workerId: "u_w_2",
      date: iso(addDays(monday, 2)),
      startTime: `${iso(addDays(monday, 2))}T14:00:00.000Z`,
      endTime: `${iso(addDays(monday, 2))}T22:00:00.000Z`,
      shiftType: "NORMAL",
      notes: null,
    },
    {
      workerId: "u_w_2",
      date: iso(addDays(monday, 3)),
      startTime: `${iso(addDays(monday, 3))}T00:00:00.000Z`,
      endTime: `${iso(addDays(monday, 3))}T23:59:59.999Z`,
      shiftType: "DESCANSO",
      notes: null,
    },
    {
      workerId: "u_w_2",
      date: iso(addDays(monday, 4)),
      startTime: `${iso(addDays(monday, 4))}T14:00:00.000Z`,
      endTime: `${iso(addDays(monday, 4))}T22:00:00.000Z`,
      shiftType: "NORMAL",
      notes: null,
    },
    {
      workerId: "u_w_3",
      date: iso(monday),
      startTime: `${iso(monday)}T00:00:00.000Z`,
      endTime: `${iso(monday)}T23:59:59.999Z`,
      shiftType: "VACACIONES",
      notes: "Semana completa",
    },
    {
      workerId: "u_w_4",
      date: iso(monday),
      startTime: `${iso(monday)}T09:00:00.000Z`,
      endTime: `${iso(monday)}T17:00:00.000Z`,
      shiftType: "NORMAL",
      notes: null,
    },
    {
      workerId: "u_w_4",
      date: iso(addDays(monday, 1)),
      startTime: `${iso(addDays(monday, 1))}T09:00:00.000Z`,
      endTime: `${iso(addDays(monday, 1))}T17:00:00.000Z`,
      shiftType: "NORMAL",
      notes: null,
    },
    {
      workerId: "u_w_4",
      date: iso(addDays(monday, 2)),
      startTime: `${iso(addDays(monday, 2))}T09:00:00.000Z`,
      endTime: `${iso(addDays(monday, 2))}T17:00:00.000Z`,
      shiftType: "NORMAL",
      notes: null,
    },
    {
      workerId: "u_w_4",
      date: iso(addDays(monday, 3)),
      startTime: `${iso(addDays(monday, 3))}T09:00:00.000Z`,
      endTime: `${iso(addDays(monday, 3))}T17:00:00.000Z`,
      shiftType: "NORMAL",
      notes: null,
    },
    {
      workerId: "u_w_4",
      date: iso(addDays(monday, 4)),
      startTime: `${iso(addDays(monday, 4))}T09:00:00.000Z`,
      endTime: `${iso(addDays(monday, 4))}T13:00:00.000Z`,
      shiftType: "NORMAL",
      notes: "Salida temprana",
    },
    {
      workerId: "u_w_5",
      date: iso(monday),
      startTime: `${iso(monday)}T12:00:00.000Z`,
      endTime: `${iso(monday)}T20:00:00.000Z`,
      shiftType: "NORMAL",
      notes: null,
    },
    {
      workerId: "u_w_5",
      date: iso(addDays(monday, 1)),
      startTime: `${iso(addDays(monday, 1))}T12:00:00.000Z`,
      endTime: `${iso(addDays(monday, 1))}T20:00:00.000Z`,
      shiftType: "NORMAL",
      notes: null,
    },
    {
      workerId: "u_w_5",
      date: iso(addDays(monday, 2)),
      startTime: `${iso(addDays(monday, 2))}T00:00:00.000Z`,
      endTime: `${iso(addDays(monday, 2))}T23:59:59.999Z`,
      shiftType: "DESCANSO",
      notes: null,
    },
    {
      workerId: "u_w_5",
      date: iso(addDays(monday, 3)),
      startTime: `${iso(addDays(monday, 3))}T12:00:00.000Z`,
      endTime: `${iso(addDays(monday, 3))}T20:00:00.000Z`,
      shiftType: "NORMAL",
      notes: null,
    },
    {
      workerId: "u_w_6",
      date: iso(addDays(monday, 1)),
      startTime: `${iso(addDays(monday, 1))}T16:00:00.000Z`,
      endTime: `${iso(addDays(monday, 1))}T20:00:00.000Z`,
      shiftType: "NORMAL",
      notes: "Medio turno",
    },
  ];

  shiftSeed.forEach((s, idx) => {
    shifts.push({
      ...s,
      id: `s_${idx + 1}`,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
  });

  const requests: ShiftRequest[] = [
    {
      id: "r_1",
      requesterId: "u_w_1",
      fromShiftId: "s_1",
      toShiftProposedId: "s_6",
      requestType: "INTERCAMBIO",
      status: "PENDIENTE",
      reason: "Necesito cubrir cita médica por la mañana",
      createdAt: now.toISOString(),
      resolvedAt: null,
      resolvedById: null,
    },
  ];

  const passwords: Record<string, string> = {
    "admin@empresa.com": "admin123",
    "supervisor@empresa.com": "super123",
    "maria@empresa.com": "worker123",
    "javier@empresa.com": "worker123",
    "carla@empresa.com": "worker123",
    "diego@empresa.com": "worker123",
    "elena@empresa.com": "worker123",
    "pablo@empresa.com": "worker123",
  };

  return {
    users,
    shifts,
    requests,
    auditLogs: [],
    settings: {
      maxHorasPorDia: 12,
      maxHorasPorSemana: 48,
      minDescansoHoras: 8,
      overlapToleranceMinutos: 0,
    },
    passwords,
    seq: 1000,
  };
}

function getStore(): DataStore {
  if (!globalThis.__APP_DATA__) {
    globalThis.__APP_DATA__ = buildSeed();
  }
  return globalThis.__APP_DATA__;
}

export function nextId(prefix: string) {
  const store = getStore();
  store.seq += 1;
  return `${prefix}_${store.seq}`;
}

export function getUsers() {
  return getStore().users;
}

export function getUserById(id: string) {
  return getStore().users.find((u) => u.id === id) ?? null;
}

export function getUserByEmail(email: string) {
  return getStore().users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export function getShifts(filter?: { workerId?: string; from?: string; to?: string }) {
  let list = getStore().shifts;
  if (filter?.workerId) list = list.filter((s) => s.workerId === filter.workerId);
  if (filter?.from) list = list.filter((s) => s.date >= filter.from!);
  if (filter?.to) list = list.filter((s) => s.date <= filter.to!);
  return list.sort((a, b) =>
    a.date === b.date ? a.startTime.localeCompare(b.startTime) : a.date.localeCompare(b.date)
  );
}

export function getShiftById(id: string) {
  return getStore().shifts.find((s) => s.id === id) ?? null;
}

export function getRequests(filter?: { requesterId?: string; status?: string }) {
  let list = getStore().requests;
  if (filter?.requesterId) list = list.filter((r) => r.requesterId === filter.requesterId);
  if (filter?.status) list = list.filter((r) => r.status === filter.status);
  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getRequestById(id: string) {
  return getStore().requests.find((r) => r.id === id) ?? null;
}

export function getSettings() {
  return getStore().settings;
}

export function updateSettings(next: AppSettings) {
  const store = getStore();
  store.settings = next;
  return next;
}

export function verifyPassword(email: string, password: string) {
  const store = getStore();
  const user = getUserByEmail(email);
  if (!user) return null;
  if (store.passwords[user.email] !== password) return null;
  return user;
}

export function createUser(data: Omit<User, "id" | "createdAt" | "workerProfile"> & {
  password: string;
  horasObjetivoSemanal: number;
}) {
  const store = getStore();
  const id = nextId("u");
  const profileId = nextId("wp");
  const user: User = {
    id,
    email: data.email,
    name: data.name,
    role: data.role,
    team: data.team ?? null,
    createdAt: new Date().toISOString(),
    workerProfile: {
      id: profileId,
      userId: id,
      horasObjetivoSemanal: data.horasObjetivoSemanal,
    },
  };
  store.users.push(user);
  store.passwords[data.email] = data.password;
  return user;
}

export function updateUser(id: string, data: Partial<Omit<User, "id" | "createdAt">> & {
  horasObjetivoSemanal?: number;
}) {
  const store = getStore();
  const user = store.users.find((u) => u.id === id);
  if (!user) return null;
  if (data.name !== undefined) user.name = data.name;
  if (data.email !== undefined) user.email = data.email;
  if (data.role !== undefined) user.role = data.role;
  if (data.team !== undefined) user.team = data.team;
  if (data.horasObjetivoSemanal !== undefined) {
    if (user.workerProfile) user.workerProfile.horasObjetivoSemanal = data.horasObjetivoSemanal;
  }
  user.updatedAt = new Date().toISOString();
  return user;
}

export function deleteUser(id: string) {
  const store = getStore();
  const idx = store.users.findIndex((u) => u.id === id);
  if (idx === -1) return false;
  const user = store.users[idx];
  delete store.passwords[user.email];
  store.shifts = store.shifts.filter((s) => s.workerId !== id);
  store.requests = store.requests.filter((r) => r.requesterId !== id);
  store.users.splice(idx, 1);
  return true;
}

export function createShift(data: Omit<Shift, "id" | "createdAt" | "updatedAt">) {
  const store = getStore();
  const shift: Shift = {
    ...data,
    id: nextId("s"),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.shifts.push(shift);
  return shift;
}

export function updateShift(id: string, data: Partial<Omit<Shift, "id" | "createdAt">>) {
  const store = getStore();
  const shift = store.shifts.find((s) => s.id === id);
  if (!shift) return null;
  Object.assign(shift, data, { updatedAt: new Date().toISOString() });
  return shift;
}

export function deleteShift(id: string) {
  const store = getStore();
  const idx = store.shifts.findIndex((s) => s.id === id);
  if (idx === -1) return false;
  store.shifts.splice(idx, 1);
  return true;
}

export function createRequest(data: Omit<ShiftRequest, "id" | "createdAt" | "resolvedAt" | "resolvedById" | "status"> & {
  status?: ShiftRequest["status"];
}) {
  const store = getStore();
  const req: ShiftRequest = {
    ...data,
    id: nextId("r"),
    status: data.status ?? "PENDIENTE",
    createdAt: new Date().toISOString(),
    resolvedAt: null,
    resolvedById: null,
  };
  store.requests.push(req);
  return req;
}

export function resolveRequest(id: string, status: "APROBADA" | "RECHAZADA", resolverId: string) {
  const store = getStore();
  const req = store.requests.find((r) => r.id === id);
  if (!req) return null;
  req.status = status;
  req.resolvedAt = new Date().toISOString();
  req.resolvedById = resolverId;
  return req;
}

export function addAuditLog(actorId: string, action: string, entityType: string, entityId: string) {
  const store = getStore();
  store.auditLogs.push({
    id: nextId("al"),
    actorId,
    action,
    entityType,
    entityId,
    createdAt: new Date().toISOString(),
  });
}

export function resetData() {
  globalThis.__APP_DATA__ = buildSeed();
}

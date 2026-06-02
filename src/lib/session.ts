import "server-only";
import { cookies } from "next/headers";
import { getUserById, getUserByEmail } from "./data";
import type { Role, User } from "./types";

const SESSION_COOKIE = "app_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 días

export async function getCurrentUser(): Promise<User | null> {
  const store = await cookies();
  const session = store.get(SESSION_COOKIE);
  if (!session) return null;
  return getUserById(session.value);
}

export async function login(email: string, password: string): Promise<User | null> {
  const user = getUserByEmail(email);
  if (!user) return null;
  // In-memory password check happens in actions.ts to keep data store pure.
  // Here we just set the cookie after the action validates.
  const store = await cookies();
  store.set(SESSION_COOKIE, user.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return user;
}

export async function logout() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHENTICATED");
  }
  return user;
}

export async function requireRole(roles: Role[]): Promise<User> {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    throw new Error("FORBIDDEN");
  }
  return user;
}

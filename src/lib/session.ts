import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { getUserById, getUserByEmail } from "./data";
import type { Role, User } from "./types";

const SESSION_COOKIE = "app_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function getSecret(): Uint8Array | null {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  return new TextEncoder().encode(secret);
}

interface JwtPayload {
  userId: string;
  role: string;
  email: string;
  name: string;
}

export async function signToken(payload: JwtPayload) {
  const secret = getSecret();
  if (!secret) throw new Error("JWT_SECRET no está configurado");

  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  const secret = getSecret();
  if (!secret) return null;

  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const store = await cookies();
  const session = store.get(SESSION_COOKIE);
  if (!session) return null;

  const payload = await verifyToken(session.value);
  if (!payload) return null;

  return getUserById(payload.userId);
}

export async function login(email: string): Promise<User | null> {
  const user = getUserByEmail(email);
  if (!user) return null;

  const token = await signToken({
    userId: user.id,
    role: user.role,
    email: user.email,
    name: user.name,
  });

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
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

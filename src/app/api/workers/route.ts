import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { getUsers } from "@/lib/data";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role === "WORKER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const users = getUsers().filter((u) => u.role !== "ADMIN");
  return NextResponse.json({ users });
}

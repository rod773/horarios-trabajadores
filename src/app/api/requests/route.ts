import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { getRequests } from "@/lib/data";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let requests = getRequests();
  if (user.role === "WORKER") {
    requests = requests.filter((r) => r.requesterId === user.id);
  }
  return NextResponse.json({ requests });
}

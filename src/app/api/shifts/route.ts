import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { getShifts } from "@/lib/data";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from") || undefined;
  const to = searchParams.get("to") || undefined;
  const workerIdParam = searchParams.get("workerId") || undefined;

  let shifts = getShifts({ from, to });
  if (user.role === "WORKER") {
    shifts = shifts.filter((s) => s.workerId === user.id);
  } else if (workerIdParam) {
    shifts = shifts.filter((s) => s.workerId === workerIdParam);
  }
  return NextResponse.json({ shifts });
}

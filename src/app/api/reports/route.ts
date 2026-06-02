import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { getShifts, getUsers } from "@/lib/data";
import { diffHours, toISODate } from "@/lib/utils";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role === "WORKER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from") || toISODate(new Date(Date.now() - 30 * 24 * 3600 * 1000));
  const to = searchParams.get("to") || toISODate(new Date());
  const format = searchParams.get("format") || "json";

  const shifts = getShifts({ from, to });
  const users = getUsers();

  const report = users
    .filter((u) => u.role !== "ADMIN")
    .map((u) => {
      const userShifts = shifts.filter((s) => s.workerId === u.id);
      const total = userShifts.reduce(
        (acc, s) => acc + (s.shiftType === "NORMAL" || s.shiftType === "EXTRA" ? diffHours(s.startTime, s.endTime) : 0),
        0
      );
      const extras = userShifts
        .filter((s) => s.shiftType === "EXTRA")
        .reduce((acc, s) => acc + diffHours(s.startTime, s.endTime), 0);
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        team: u.team,
        totalHours: Number(total.toFixed(2)),
        extraHours: Number(extras.toFixed(2)),
        shiftCount: userShifts.length,
      };
    });

  if (format === "csv") {
    const headers = ["ID", "Nombre", "Email", "Equipo", "Total horas", "Horas extra", "Turnos"];
    const lines = [headers.join(";")];
    for (const r of report) {
      lines.push([r.id, r.name, r.email, r.team ?? "", r.totalHours, r.extraHours, r.shiftCount].join(";"));
    }
    return new NextResponse(lines.join("\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="reporte_${from}_${to}.csv"`,
      },
    });
  }

  return NextResponse.json({ from, to, report });
}

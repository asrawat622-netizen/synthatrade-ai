import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import {
  computeMetrics,
  equityCurve,
  pnlDistribution,
  byDayOfWeek,
  byHour,
  bySession,
  byTag,
  tagCombinations,
  afterLossAnalysis,
  bestWorst,
} from "@/lib/analytics";

export async function GET(req: Request) {
  try {
    const user = await requireUser();
    const url = new URL(req.url);
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");

    const where: any = { userId: user.id };
    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from);
      if (to) where.date.lte = new Date(to);
    }
    const trades = await prisma.trade.findMany({
      where,
      include: { tradeTags: { include: { tag: true } } },
      orderBy: { date: "asc" },
    });

    return NextResponse.json({
      metrics: computeMetrics(trades),
      equityCurve: equityCurve(trades),
      pnlDistribution: pnlDistribution(trades),
      byDayOfWeek: byDayOfWeek(trades),
      byHour: byHour(trades),
      bySession: bySession(trades),
      byTag: byTag(trades),
      tagCombinations: tagCombinations(trades),
      afterLossAnalysis: afterLossAnalysis(trades),
      bestWorst: bestWorst(trades),
    });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

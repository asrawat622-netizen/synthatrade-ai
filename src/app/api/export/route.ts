import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await requireUser();
    const trades = await prisma.trade.findMany({
      where: { userId: user.id },
      include: { tradeTags: { include: { tag: true } } },
      orderBy: { date: "desc" },
    });

    const headers = [
      "date",
      "instrument",
      "direction",
      "session",
      "entryPrice",
      "exitPrice",
      "stopLoss",
      "takeProfit",
      "size",
      "pnlPoints",
      "pnlDollars",
      "result",
      "rMultiple",
      "tags",
      "ruleBreak",
      "notes",
    ];
    const escape = (v: any) => {
      if (v == null) return "";
      const s = String(v).replace(/"/g, '""');
      return /[",\n]/.test(s) ? `"${s}"` : s;
    };
    const rows = trades.map((t) =>
      [
        new Date(t.date).toISOString(),
        t.instrument,
        t.direction,
        t.session,
        t.entryPrice,
        t.exitPrice,
        t.stopLoss,
        t.takeProfit,
        t.positionSize,
        t.pnlPoints,
        t.pnlDollars,
        t.result,
        t.rMultiple,
        t.tradeTags.map((tt) => tt.tag.name).join("|"),
        t.ruleBreak,
        t.notes,
      ]
        .map(escape)
        .join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="synthatrade-${Date.now()}.csv"`,
      },
    });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

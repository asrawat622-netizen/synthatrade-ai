import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

const createSchema = z.object({
  date: z.string(),
  instrument: z.string().min(1).max(20),
  direction: z.enum(["Long", "Short"]),
  entryPrice: z.number(),
  exitPrice: z.number(),
  stopLoss: z.number().optional().nullable(),
  takeProfit: z.number().optional().nullable(),
  positionSize: z.number().default(1),
  session: z.string().optional().nullable(),
  timeframe: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  emotionBefore: z.number().int().min(1).max(10).optional().nullable(),
  emotionAfter: z.number().int().min(1).max(10).optional().nullable(),
  confidence: z.number().int().min(1).max(10).optional().nullable(),
  ruleBreak: z.boolean().default(false),
  screenshotUrl: z.string().optional().nullable(),
  tagIds: z.array(z.string()).default([]),
  pnlDollarsOverride: z.number().optional().nullable(),
});

function tickValueFor(instrument: string) {
  const map: Record<string, number> = {
    NQ: 5, ES: 12.5, YM: 5, RTY: 5,
    CL: 10, GC: 10,
    EURUSD: 10, GBPUSD: 10, USDJPY: 10,
  };
  return map[instrument.toUpperCase()] ?? 1;
}

export async function GET(req: Request) {
  try {
    const user = await requireUser();
    const url = new URL(req.url);
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");
    const session = url.searchParams.get("session");
    const instrument = url.searchParams.get("instrument");
    const tagIds = url.searchParams.getAll("tagId");

    const where: any = { userId: user.id };
    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from);
      if (to) where.date.lte = new Date(to);
    }
    if (session) where.session = session;
    if (instrument) where.instrument = instrument;
    if (tagIds.length) {
      where.tradeTags = { some: { tagId: { in: tagIds } } };
    }

    const trades = await prisma.trade.findMany({
      where,
      orderBy: { date: "desc" },
      include: { tradeTags: { include: { tag: true } } },
    });
    return NextResponse.json({ trades });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const data = createSchema.parse(body);

    const points = data.direction === "Long"
      ? data.exitPrice - data.entryPrice
      : data.entryPrice - data.exitPrice;
    const tv = tickValueFor(data.instrument);
    const pnlDollars = data.pnlDollarsOverride ?? points * tv * (data.positionSize ?? 1);
    const result: "Win" | "Loss" | "BE" =
      Math.abs(points) < 0.0001 ? "BE" : points > 0 ? "Win" : "Loss";

    const risk = data.stopLoss != null ? Math.abs(data.entryPrice - data.stopLoss) : null;
    const reward = Math.abs(data.exitPrice - data.entryPrice);
    const riskReward = risk && risk > 0 ? reward / risk : null;
    const rMultiple = risk && risk > 0
      ? (result === "Win" ? reward / risk : result === "Loss" ? -1 : 0)
      : null;

    const trade = await prisma.trade.create({
      data: {
        userId: user.id,
        date: new Date(data.date),
        instrument: data.instrument.toUpperCase(),
        direction: data.direction,
        entryPrice: data.entryPrice,
        exitPrice: data.exitPrice,
        stopLoss: data.stopLoss ?? null,
        takeProfit: data.takeProfit ?? null,
        positionSize: data.positionSize ?? 1,
        pnlPoints: points,
        pnlDollars,
        result,
        session: data.session ?? null,
        timeframe: data.timeframe ?? null,
        notes: data.notes ?? null,
        emotionBefore: data.emotionBefore ?? null,
        emotionAfter: data.emotionAfter ?? null,
        confidence: data.confidence ?? null,
        ruleBreak: data.ruleBreak,
        screenshotUrl: data.screenshotUrl ?? null,
        riskReward,
        rMultiple,
        tradeTags: {
          create: data.tagIds.map((tagId) => ({ tagId })),
        },
      },
      include: { tradeTags: { include: { tag: true } } },
    });
    return NextResponse.json({ trade });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (e?.issues) return NextResponse.json({ error: e.issues[0].message }, { status: 400 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

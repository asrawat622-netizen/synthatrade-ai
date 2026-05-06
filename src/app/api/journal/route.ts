import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

const upsertSchema = z.object({
  date: z.string(),
  sleepHours: z.number().nullable().optional(),
  stressLevel: z.number().int().min(1).max(10).nullable().optional(),
  focusLevel: z.number().int().min(1).max(10).nullable().optional(),
  notes: z.string().nullable().optional(),
});

export async function GET() {
  try {
    const user = await requireUser();
    const journals = await prisma.dailyJournal.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      take: 30,
    });
    return NextResponse.json({ journals });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const data = upsertSchema.parse(body);
    const date = new Date(data.date);
    date.setHours(0, 0, 0, 0);
    const journal = await prisma.dailyJournal.upsert({
      where: { userId_date: { userId: user.id, date } },
      create: {
        userId: user.id,
        date,
        sleepHours: data.sleepHours ?? null,
        stressLevel: data.stressLevel ?? null,
        focusLevel: data.focusLevel ?? null,
        notes: data.notes ?? null,
      },
      update: {
        sleepHours: data.sleepHours ?? null,
        stressLevel: data.stressLevel ?? null,
        focusLevel: data.focusLevel ?? null,
        notes: data.notes ?? null,
      },
    });
    return NextResponse.json({ journal });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (e?.issues) return NextResponse.json({ error: e.issues[0].message }, { status: 400 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    const trade = await prisma.trade.findFirst({
      where: { id: params.id, userId: user.id },
      include: { tradeTags: { include: { tag: true } } },
    });
    if (!trade) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ trade });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    const trade = await prisma.trade.findFirst({
      where: { id: params.id, userId: user.id },
    });
    if (!trade) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await prisma.trade.delete({ where: { id: trade.id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    const trade = await prisma.trade.findFirst({
      where: { id: params.id, userId: user.id },
    });
    if (!trade) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const body = await req.json();
    const updated = await prisma.trade.update({
      where: { id: trade.id },
      data: {
        notes: body.notes ?? trade.notes,
        emotionAfter: body.emotionAfter ?? trade.emotionAfter,
        ruleBreak: body.ruleBreak ?? trade.ruleBreak,
      },
    });
    return NextResponse.json({ trade: updated });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

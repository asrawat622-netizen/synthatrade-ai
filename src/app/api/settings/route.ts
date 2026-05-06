import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

const schema = z.object({
  preferredInstruments: z.array(z.string()).optional(),
  propFirmMode: z.boolean().optional(),
  accountSize: z.number().nullable().optional(),
  dailyDrawdownLimit: z.number().nullable().optional(),
  maxDrawdownLimit: z.number().nullable().optional(),
  profitTarget: z.number().nullable().optional(),
  name: z.string().min(1).max(80).optional(),
});

export async function GET() {
  try {
    const user = await requireUser();
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        preferredInstruments: user.preferredInstruments,
        propFirmMode: user.propFirmMode,
        accountSize: user.accountSize,
        dailyDrawdownLimit: user.dailyDrawdownLimit,
        maxDrawdownLimit: user.maxDrawdownLimit,
        profitTarget: user.profitTarget,
        plan: user.plan,
      },
    });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const data = schema.parse(body);
    const updated = await prisma.user.update({
      where: { id: user.id },
      data,
    });
    return NextResponse.json({
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        preferredInstruments: updated.preferredInstruments,
        propFirmMode: updated.propFirmMode,
        accountSize: updated.accountSize,
        dailyDrawdownLimit: updated.dailyDrawdownLimit,
        maxDrawdownLimit: updated.maxDrawdownLimit,
        profitTarget: updated.profitTarget,
        plan: updated.plan,
      },
    });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (e?.issues) return NextResponse.json({ error: e.issues[0].message }, { status: 400 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const user = await requireUser();
    await prisma.user.delete({ where: { id: user.id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

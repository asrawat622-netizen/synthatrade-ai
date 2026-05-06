import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(1).max(80),
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

const DEFAULT_TAGS = [
  "SMT",
  "External DOL",
  "Internal DOL",
  "FVG",
  "Liquidity Sweep",
  "Breaker",
  "MSS",
  "Order Block",
  "Silver Bullet",
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = schema.parse(body);
    const email = data.email.toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }
    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: { name: data.name, email, passwordHash },
    });
    // Seed default tags for the new user
    await prisma.tag.createMany({
      data: DEFAULT_TAGS.map((name) => ({ name, userId: user.id })),
      skipDuplicates: true,
    });
    return NextResponse.json({ id: user.id, email: user.email });
  } catch (e: any) {
    if (e?.issues) return NextResponse.json({ error: e.issues[0].message }, { status: 400 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

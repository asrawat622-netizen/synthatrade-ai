import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import TradeDetailClient from "@/components/dashboard/trade-detail-client";

export const dynamic = "force-dynamic";

export default async function TradeDetailPage({ params }: { params: { id: string } }) {
  let user;
  try {
    user = await requireUser();
  } catch {
    redirect("/login");
  }

  const trade = await prisma.trade.findFirst({
    where: { id: params.id, userId: user.id },
    include: { tradeTags: { include: { tag: true } } },
  });

  if (!trade) notFound();

  // Serialize for client
  const serialized = {
    ...trade,
    date: trade.date.toISOString(),
    createdAt: trade.createdAt.toISOString(),
    updatedAt: trade.updatedAt.toISOString(),
    tags: trade.tradeTags.map((tt) => tt.tag),
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/trades"
          className="inline-flex items-center gap-2 text-sm text-ink-300 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to trades
        </Link>
      </div>

      <TradeDetailClient trade={serialized} />
    </div>
  );
}

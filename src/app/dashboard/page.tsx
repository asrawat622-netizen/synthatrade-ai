import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Activity,
  Trophy,
  AlertTriangle,
  PlusCircle,
  Brain,
  Shield,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { computeMetrics, bestWorst } from "@/lib/analytics";
import { StatCard } from "@/components/ui/stat-card";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { EquityChart } from "@/components/charts/equity-chart";
import { equityCurve } from "@/lib/analytics";
import { PropFirmCard } from "@/components/dashboard/prop-firm-card";

export default async function DashboardHome() {
  const user = await requireUser();

  const [allTrades, todayTrades, weekTrades, monthTrades] = await Promise.all([
    prisma.trade.findMany({
      where: { userId: user.id },
      include: { tradeTags: { include: { tag: true } } },
      orderBy: { date: "asc" },
    }),
    prisma.trade.findMany({
      where: { userId: user.id, date: { gte: startOfDay() } },
      include: { tradeTags: { include: { tag: true } } },
    }),
    prisma.trade.findMany({
      where: { userId: user.id, date: { gte: startOfWeek() } },
      include: { tradeTags: { include: { tag: true } } },
    }),
    prisma.trade.findMany({
      where: { userId: user.id, date: { gte: startOfMonth() } },
      include: { tradeTags: { include: { tag: true } } },
    }),
  ]);

  const all = computeMetrics(allTrades);
  const today = computeMetrics(todayTrades);
  const week = computeMetrics(weekTrades);
  const month = computeMetrics(monthTrades);
  const eq = equityCurve(allTrades);
  const bw = bestWorst(allTrades);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Welcome back, {user.name?.split(" ")[0] || "Trader"}.
          </h1>
          <p className="text-ink-300 text-sm">Here's how you're trading.</p>
        </div>
        <Link href="/dashboard/trades/new" className="btn-primary">
          <PlusCircle className="w-4 h-4" />
          Log Trade
        </Link>
      </div>

      {/* TOP STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Today"
          value={formatCurrency(today.totalPnl)}
          hint={`${today.totalTrades} trades · ${formatPercent(today.winRate)} WR`}
          trend={today.totalPnl > 0 ? "up" : today.totalPnl < 0 ? "down" : "neutral"}
          icon={Activity}
        />
        <StatCard
          label="This Week"
          value={formatCurrency(week.totalPnl)}
          hint={`${week.totalTrades} trades · ${formatPercent(week.winRate)} WR`}
          trend={week.totalPnl > 0 ? "up" : week.totalPnl < 0 ? "down" : "neutral"}
          icon={TrendingUp}
        />
        <StatCard
          label="This Month"
          value={formatCurrency(month.totalPnl)}
          hint={`${month.totalTrades} trades · ${formatPercent(month.winRate)} WR`}
          trend={month.totalPnl > 0 ? "up" : month.totalPnl < 0 ? "down" : "neutral"}
          icon={Target}
        />
        <StatCard
          label="All Time"
          value={formatCurrency(all.totalPnl)}
          hint={`${all.totalTrades} trades · PF ${
            all.profitFactor === Infinity ? "∞" : all.profitFactor.toFixed(2)
          }`}
          trend={all.totalPnl > 0 ? "up" : all.totalPnl < 0 ? "down" : "neutral"}
          icon={Trophy}
        />
      </div>

      {/* PROP FIRM CARD */}
      {user.propFirmMode && (
        <PropFirmCard
          accountSize={user.accountSize}
          dailyDrawdownLimit={user.dailyDrawdownLimit}
          maxDrawdownLimit={user.maxDrawdownLimit}
          profitTarget={user.profitTarget}
          dailyPnl={today.totalPnl}
          totalPnl={all.totalPnl}
        />
      )}

      {/* EQUITY CURVE */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold">Equity Curve</h2>
            <p className="text-xs text-ink-400">Cumulative PnL across all trades</p>
          </div>
          <Link href="/dashboard/analytics" className="text-sm text-brand-400 hover:text-brand-300">
            Full analytics →
          </Link>
        </div>
        <EquityChart data={eq} />
      </div>

      {/* BEST/WORST + AI TEASER */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-teal-400" />
            What's working
          </h2>
          <ul className="space-y-3 text-sm">
            {bw.bestTag && (
              <li className="flex justify-between p-2.5 rounded bg-teal-500/5 border border-teal-500/20">
                <span className="text-ink-200">Best setup: <strong className="text-teal-300">{bw.bestTag.tag}</strong></span>
                <span className="text-teal-400">{formatCurrency(bw.bestTag.pnl)} · {formatPercent(bw.bestTag.winRate)}</span>
              </li>
            )}
            {bw.bestSession && (
              <li className="flex justify-between p-2.5 rounded bg-teal-500/5 border border-teal-500/20">
                <span className="text-ink-200">Best session: <strong className="text-teal-300">{bw.bestSession.session}</strong></span>
                <span className="text-teal-400">{formatCurrency(bw.bestSession.pnl)} · {formatPercent(bw.bestSession.winRate)}</span>
              </li>
            )}
            {bw.bestDay && (
              <li className="flex justify-between p-2.5 rounded bg-teal-500/5 border border-teal-500/20">
                <span className="text-ink-200">Best day: <strong className="text-teal-300">{bw.bestDay.day}</strong></span>
                <span className="text-teal-400">{formatCurrency(bw.bestDay.pnl)}</span>
              </li>
            )}
            {!bw.bestTag && !bw.bestSession && !bw.bestDay && (
              <li className="text-ink-400">Log more trades to see what works.</li>
            )}
          </ul>
        </div>

        <div className="card">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            What's leaking
          </h2>
          <ul className="space-y-3 text-sm">
            {bw.worstTag && (
              <li className="flex justify-between p-2.5 rounded bg-red-500/5 border border-red-500/20">
                <span className="text-ink-200">Worst setup: <strong className="text-red-300">{bw.worstTag.tag}</strong></span>
                <span className="text-red-400">{formatCurrency(bw.worstTag.pnl)} · {formatPercent(bw.worstTag.winRate)}</span>
              </li>
            )}
            {bw.worstSession && (
              <li className="flex justify-between p-2.5 rounded bg-red-500/5 border border-red-500/20">
                <span className="text-ink-200">Worst session: <strong className="text-red-300">{bw.worstSession.session}</strong></span>
                <span className="text-red-400">{formatCurrency(bw.worstSession.pnl)}</span>
              </li>
            )}
            {bw.worstDay && (
              <li className="flex justify-between p-2.5 rounded bg-red-500/5 border border-red-500/20">
                <span className="text-ink-200">Worst day: <strong className="text-red-300">{bw.worstDay.day}</strong></span>
                <span className="text-red-400">{formatCurrency(bw.worstDay.pnl)}</span>
              </li>
            )}
            {!bw.worstTag && !bw.worstSession && !bw.worstDay && (
              <li className="text-ink-400">Nothing flagged yet.</li>
            )}
          </ul>
        </div>
      </div>

      {/* AI TEASER */}
      <Link
        href="/dashboard/insights"
        className="card hover:border-purple-500/50 transition flex items-center justify-between group"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center">
            <Brain className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold">AI Insight of the Week</h3>
            <p className="text-sm text-ink-300">
              Get a fresh AI-coached breakdown of your trading patterns.
            </p>
          </div>
        </div>
        <span className="text-purple-400 group-hover:translate-x-1 transition">→</span>
      </Link>
    </div>
  );
}

function startOfDay() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
function startOfWeek() {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}
function startOfMonth() {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

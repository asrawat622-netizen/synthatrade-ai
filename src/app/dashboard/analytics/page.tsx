"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  AlertTriangle,
  Activity,
  DollarSign,
  Percent,
  Flame,
  Zap,
} from "lucide-react";
import { EquityChart } from "@/components/charts/equity-chart";
import PnlDistributionChart from "@/components/charts/pnl-distribution-chart";
import DayOfWeekChart from "@/components/charts/day-of-week-chart";
import SessionChart from "@/components/charts/session-chart";
import HourChart from "@/components/charts/hour-chart";
import { StatCard } from "@/components/ui/stat-card";
import { formatCurrency, formatPercent } from "@/lib/utils";

type Analytics = {
  metrics: {
    totalTrades: number;
    wins: number;
    losses: number;
    breakeven: number;
    winRate: number;
    avgWin: number;
    avgLoss: number;
    expectancy: number;
    profitFactor: number;
    totalPnl: number;
    totalPoints: number;
    biggestWin: number;
    biggestLoss: number;
    maxWinStreak: number;
    maxLossStreak: number;
    currentStreak: { type: string; count: number };
    ruleBreakCount: number;
    ruleBreakRate: number;
    avgRMultiple: number;
  };
  equityCurve: { idx: number; date: string; equity: number; pnl: number }[];
  pnlDistribution: { range: string; count: number }[];
  byDayOfWeek: { day: string; trades: number; winRate: number; pnl: number }[];
  byHour: { hour: string; trades: number; winRate: number; pnl: number }[];
  bySession: { session: string; trades: number; winRate: number; pnl: number }[];
  byTag: {
    tag: string;
    trades: number;
    winRate: number;
    pnl: number;
    avgPnl: number;
  }[];
  tagCombinations: {
    combo: string;
    trades: number;
    winRate: number;
    pnl: number;
    avgPnl: number;
  }[];
  afterLossAnalysis: { consecutiveLosses: string; trades: number; winRate: number }[];
  bestWorst: any;
};

export default function AnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const r = await fetch("/api/analytics");
        if (!r.ok) throw new Error();
        const j = await r.json();
        if (active) setData(j);
      } catch {
        if (active) setData(null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <div className="card text-ink-400 text-center py-16">
          Crunching numbers…
        </div>
      </div>
    );
  }

  if (!data || data.metrics.totalTrades === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <div className="card text-center py-16">
          <Activity className="w-12 h-12 mx-auto mb-4 text-ink-500" />
          <h2 className="text-lg font-semibold mb-2">No trades yet</h2>
          <p className="text-ink-400 mb-6">
            Log a few trades to start seeing your edge.
          </p>
          <a href="/dashboard/trades/new" className="btn-primary inline-block">
            Add your first trade
          </a>
        </div>
      </div>
    );
  }

  const m = data.metrics;
  const bestCombos = [...data.tagCombinations]
    .sort((a, b) => b.winRate - a.winRate || b.pnl - a.pnl)
    .slice(0, 10);
  const worstCombos = [...data.tagCombinations]
    .sort((a, b) => a.winRate - b.winRate || a.pnl - b.pnl)
    .slice(0, 10);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-ink-400 mt-1">
          Everything the data is telling you about your edge.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total PnL"
          value={formatCurrency(m.totalPnl)}
          icon={DollarSign}
          trend={m.totalPnl > 0 ? "up" : m.totalPnl < 0 ? "down" : "neutral"}
        />
        <StatCard
          label="Win rate"
          value={formatPercent(m.winRate)}
          hint={`${m.wins}W / ${m.losses}L / ${m.breakeven}BE`}
          icon={Percent}
        />
        <StatCard
          label="Profit factor"
          value={
            m.profitFactor === Infinity ? "∞" : m.profitFactor.toFixed(2)
          }
          icon={Target}
          trend={m.profitFactor >= 1.5 ? "up" : m.profitFactor < 1 ? "down" : "neutral"}
        />
        <StatCard
          label="Expectancy / trade"
          value={formatCurrency(m.expectancy)}
          icon={Activity}
          trend={m.expectancy > 0 ? "up" : "down"}
        />
        <StatCard
          label="Avg win"
          value={formatCurrency(m.avgWin)}
          icon={TrendingUp}
        />
        <StatCard
          label="Avg loss"
          value={formatCurrency(-m.avgLoss)}
          icon={TrendingDown}
        />
        <StatCard
          label="Biggest win"
          value={formatCurrency(m.biggestWin)}
          icon={Award}
        />
        <StatCard
          label="Biggest loss"
          value={formatCurrency(m.biggestLoss)}
          icon={AlertTriangle}
        />
        <StatCard
          label="Max win streak"
          value={`${m.maxWinStreak}`}
          icon={Flame}
        />
        <StatCard
          label="Max loss streak"
          value={`${m.maxLossStreak}`}
          icon={TrendingDown}
        />
        <StatCard
          label="Avg R-multiple"
          value={`${m.avgRMultiple.toFixed(2)}R`}
          icon={Zap}
          trend={m.avgRMultiple > 0 ? "up" : "down"}
        />
        <StatCard
          label="Rule break rate"
          value={`${(m.ruleBreakRate * 100).toFixed(1)}%`}
          hint={`${m.ruleBreakCount} trades`}
          icon={AlertTriangle}
          trend={m.ruleBreakRate > 0.15 ? "down" : "neutral"}
        />
      </div>

      <div className="card">
        <h2 className="font-semibold mb-4">Equity curve</h2>
        <EquityChart data={data.equityCurve} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold mb-4">PnL distribution</h2>
          <PnlDistributionChart data={data.pnlDistribution} />
        </div>
        <div className="card">
          <h2 className="font-semibold mb-2">After consecutive losses</h2>
          <p className="text-xs text-ink-400 mb-4">
            How your win rate changes after a losing streak — early signs of tilt.
          </p>
          <div className="space-y-3">
            {data.afterLossAnalysis.map((row) => (
              <div
                key={row.consecutiveLosses}
                className="flex items-center justify-between py-2 border-b border-ink-800 last:border-0"
              >
                <div className="text-sm">
                  After{" "}
                  <span className="font-semibold">
                    {row.consecutiveLosses}
                  </span>{" "}
                  {row.consecutiveLosses === "1" ? "loss" : "losses"}
                </div>
                <div className="text-right">
                  <div
                    className={`text-sm font-semibold ${
                      row.winRate >= 0.5
                        ? "text-emerald-400"
                        : row.winRate >= 0.4
                        ? "text-ink-200"
                        : "text-red-400"
                    }`}
                  >
                    {formatPercent(row.winRate)} WR
                  </div>
                  <div className="text-xs text-ink-400">
                    {row.trades} trades
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold mb-4">PnL by day of week</h2>
          <DayOfWeekChart data={data.byDayOfWeek} />
        </div>
        <div className="card">
          <h2 className="font-semibold mb-4">PnL by session</h2>
          <SessionChart data={data.bySession} />
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold mb-4">PnL by hour of day</h2>
        <HourChart data={data.byHour} />
      </div>

      <div className="card">
        <h2 className="font-semibold mb-4">Tag performance</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-ink-400 border-b border-ink-800">
                <th className="py-2 pr-4">Tag</th>
                <th className="py-2 pr-4">Trades</th>
                <th className="py-2 pr-4">Win rate</th>
                <th className="py-2 pr-4">Avg PnL</th>
                <th className="py-2 pr-4">Total PnL</th>
              </tr>
            </thead>
            <tbody>
              {data.byTag.map((row) => (
                <tr
                  key={row.tag}
                  className="border-b border-ink-800/50 last:border-0"
                >
                  <td className="py-3 pr-4">
                    <span className="badge-tag">{row.tag}</span>
                  </td>
                  <td className="py-3 pr-4 text-ink-300">{row.trades}</td>
                  <td
                    className={`py-3 pr-4 font-medium ${
                      row.winRate >= 0.55
                        ? "text-emerald-400"
                        : row.winRate < 0.4
                        ? "text-red-400"
                        : "text-ink-200"
                    }`}
                  >
                    {formatPercent(row.winRate)}
                  </td>
                  <td className="py-3 pr-4 text-ink-300">
                    {formatCurrency(row.avgPnl)}
                  </td>
                  <td
                    className={`py-3 pr-4 font-semibold ${
                      row.pnl > 0 ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {formatCurrency(row.pnl)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold mb-1">Top combinations</h2>
          <p className="text-xs text-ink-400 mb-4">
            Best performing 2-4 tag combinations (min 3 trades).
          </p>
          {bestCombos.length === 0 ? (
            <p className="text-sm text-ink-500 py-4">
              Not enough multi-tag trades yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {bestCombos.map((c) => (
                <li
                  key={c.combo}
                  className="flex items-center justify-between py-2 border-b border-ink-800 last:border-0"
                >
                  <div className="flex flex-wrap gap-1">
                    {c.combo.split(" + ").map((t) => (
                      <span key={t} className="badge-tag">
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <div className="text-sm font-semibold text-emerald-400">
                      {formatPercent(c.winRate)} WR
                    </div>
                    <div className="text-xs text-ink-400">
                      {c.trades} trades · {formatCurrency(c.pnl)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="card">
          <h2 className="font-semibold mb-1">Worst combinations</h2>
          <p className="text-xs text-ink-400 mb-4">
            Where your edge breaks down — consider cutting these.
          </p>
          {worstCombos.length === 0 ? (
            <p className="text-sm text-ink-500 py-4">
              Not enough multi-tag trades yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {worstCombos.map((c) => (
                <li
                  key={c.combo}
                  className="flex items-center justify-between py-2 border-b border-ink-800 last:border-0"
                >
                  <div className="flex flex-wrap gap-1">
                    {c.combo.split(" + ").map((t) => (
                      <span key={t} className="badge-tag">
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <div className="text-sm font-semibold text-red-400">
                      {formatPercent(c.winRate)} WR
                    </div>
                    <div className="text-xs text-ink-400">
                      {c.trades} trades · {formatCurrency(c.pnl)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

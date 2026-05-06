import { Shield, AlertTriangle } from "lucide-react";
import { formatCurrency, formatPercent } from "@/lib/utils";

export function PropFirmCard({
  accountSize,
  dailyDrawdownLimit,
  maxDrawdownLimit,
  profitTarget,
  dailyPnl,
  totalPnl,
}: {
  accountSize: number | null;
  dailyDrawdownLimit: number | null;
  maxDrawdownLimit: number | null;
  profitTarget: number | null;
  dailyPnl: number;
  totalPnl: number;
}) {
  const dailyDrawdown = dailyPnl < 0 ? Math.abs(dailyPnl) : 0;
  const dailyPct = dailyDrawdownLimit ? dailyDrawdown / dailyDrawdownLimit : 0;
  const dailyAlert = dailyPct >= 0.8;
  const dailyExceeded = dailyPct >= 1;

  const totalDrawdown = totalPnl < 0 ? Math.abs(totalPnl) : 0;
  const totalPct = maxDrawdownLimit ? totalDrawdown / maxDrawdownLimit : 0;
  const totalAlert = totalPct >= 0.8;

  const profitPct = profitTarget && totalPnl > 0 ? totalPnl / profitTarget : 0;

  return (
    <div className="card border-purple-500/30">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold flex items-center gap-2">
          <Shield className="w-4 h-4 text-purple-400" />
          Prop Firm Status
        </h2>
        {(dailyAlert || totalAlert) && (
          <span className="badge bg-red-500/15 text-red-300 border border-red-500/30 inline-flex items-center gap-1.5">
            <AlertTriangle className="w-3 h-3" />
            {dailyExceeded ? "Daily limit hit!" : "Approaching limit"}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {dailyDrawdownLimit && (
          <ProgressRow
            label="Daily Drawdown"
            value={formatCurrency(dailyDrawdown)}
            limit={formatCurrency(dailyDrawdownLimit)}
            pct={dailyPct}
            color={dailyExceeded ? "red" : dailyAlert ? "amber" : "teal"}
          />
        )}
        {maxDrawdownLimit && (
          <ProgressRow
            label="Max Drawdown"
            value={formatCurrency(totalDrawdown)}
            limit={formatCurrency(maxDrawdownLimit)}
            pct={totalPct}
            color={totalAlert ? "red" : "teal"}
          />
        )}
        {profitTarget && (
          <ProgressRow
            label="Profit Target"
            value={formatCurrency(Math.max(0, totalPnl))}
            limit={formatCurrency(profitTarget)}
            pct={profitPct}
            color="brand"
          />
        )}
      </div>

      {dailyAlert && !dailyExceeded && (
        <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-sm text-amber-200">
          ⚠️ You are at {formatPercent(dailyPct, 0)} of your daily loss limit. Consider stopping for the day.
        </div>
      )}
      {dailyExceeded && (
        <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-200">
          🚨 Daily loss limit reached. Stop trading to protect your account.
        </div>
      )}
    </div>
  );
}

function ProgressRow({
  label,
  value,
  limit,
  pct,
  color,
}: {
  label: string;
  value: string;
  limit: string;
  pct: number;
  color: "red" | "amber" | "teal" | "brand";
}) {
  const colorMap = {
    red: "bg-red-500",
    amber: "bg-amber-500",
    teal: "bg-teal-500",
    brand: "bg-brand-500",
  };
  const clampPct = Math.max(0, Math.min(1, pct));
  return (
    <div>
      <div className="flex justify-between text-xs text-ink-300 mb-1.5">
        <span>{label}</span>
        <span>
          <span className="text-white font-medium">{value}</span>
          <span className="text-ink-400"> / {limit}</span>
        </span>
      </div>
      <div className="h-2 rounded-full bg-ink-800 overflow-hidden">
        <div
          className={`h-full ${colorMap[color]} transition-all`}
          style={{ width: `${clampPct * 100}%` }}
        />
      </div>
    </div>
  );
}

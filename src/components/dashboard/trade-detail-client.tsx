"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Target,
  Shield,
  DollarSign,
  Hash,
  Trash2,
  Save,
  AlertTriangle,
} from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/utils";

type Trade = {
  id: string;
  date: string;
  instrument: string;
  direction: string;
  entryPrice: number;
  exitPrice: number;
  stopLoss: number | null;
  takeProfit: number | null;
  positionSize: number;
  pnlPoints: number;
  pnlDollars: number;
  result: string;
  session: string | null;
  timeframe: string | null;
  notes: string | null;
  emotionBefore: number | null;
  emotionAfter: number | null;
  confidence: number | null;
  ruleBreak: boolean;
  riskReward: number | null;
  rMultiple: number | null;
  tags: { id: string; name: string }[];
};

export default function TradeDetailClient({ trade }: { trade: Trade }) {
  const router = useRouter();
  const [notes, setNotes] = useState(trade.notes ?? "");
  const [emotionAfter, setEmotionAfter] = useState(trade.emotionAfter ?? 5);
  const [ruleBreak, setRuleBreak] = useState(trade.ruleBreak);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isWin = trade.result === "Win";
  const isLoss = trade.result === "Loss";

  async function save() {
    setSaving(true);
    try {
      const r = await fetch(`/api/trades/${trade.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes, emotionAfter, ruleBreak }),
      });
      if (!r.ok) throw new Error();
      toast.success("Trade updated");
      router.refresh();
    } catch {
      toast.error("Failed to update trade");
    } finally {
      setSaving(false);
    }
  }

  async function deleteTrade() {
    if (!confirm("Delete this trade permanently? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const r = await fetch(`/api/trades/${trade.id}`, { method: "DELETE" });
      if (!r.ok) throw new Error();
      toast.success("Trade deleted");
      router.push("/dashboard/trades");
    } catch {
      toast.error("Failed to delete trade");
      setDeleting(false);
    }
  }

  const date = new Date(trade.date);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold">{trade.instrument}</h1>
              <span
                className={`badge ${
                  trade.direction === "Long" ? "badge-win" : "badge-loss"
                }`}
              >
                {trade.direction === "Long" ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {trade.direction}
              </span>
              <span
                className={`badge ${
                  isWin ? "badge-win" : isLoss ? "badge-loss" : "badge-be"
                }`}
              >
                {trade.result}
              </span>
              {trade.ruleBreak && (
                <span className="badge bg-red-500/15 text-red-300">
                  <AlertTriangle className="w-3 h-3" />
                  Rule break
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-ink-400">
              <Calendar className="w-4 h-4" />
              {date.toLocaleString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
              {trade.session && (
                <>
                  <span>·</span>
                  <span>{trade.session}</span>
                </>
              )}
              {trade.timeframe && (
                <>
                  <span>·</span>
                  <span>{trade.timeframe}</span>
                </>
              )}
            </div>
          </div>
          <div className="text-right">
            <div
              className={`text-3xl font-bold ${
                trade.pnlDollars > 0
                  ? "text-emerald-400"
                  : trade.pnlDollars < 0
                  ? "text-red-400"
                  : "text-ink-300"
              }`}
            >
              {formatCurrency(trade.pnlDollars)}
            </div>
            <div className="text-sm text-ink-400 mt-1">
              {formatNumber(trade.pnlPoints)} points
            </div>
          </div>
        </div>
      </div>

      {/* Tags */}
      {trade.tags.length > 0 && (
        <div className="card">
          <h2 className="text-sm font-semibold text-ink-300 mb-3">Strategy tags</h2>
          <div className="flex flex-wrap gap-2">
            {trade.tags.map((t) => (
              <span key={t.id} className="badge-tag">
                {t.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Price & risk grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="text-xs text-ink-400 uppercase tracking-wider mb-1 flex items-center gap-1">
            <DollarSign className="w-3 h-3" />
            Entry
          </div>
          <div className="text-lg font-semibold">{formatNumber(trade.entryPrice)}</div>
        </div>
        <div className="stat-card">
          <div className="text-xs text-ink-400 uppercase tracking-wider mb-1 flex items-center gap-1">
            <DollarSign className="w-3 h-3" />
            Exit
          </div>
          <div className="text-lg font-semibold">{formatNumber(trade.exitPrice)}</div>
        </div>
        <div className="stat-card">
          <div className="text-xs text-ink-400 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Shield className="w-3 h-3" />
            Stop loss
          </div>
          <div className="text-lg font-semibold">
            {trade.stopLoss != null ? formatNumber(trade.stopLoss) : "—"}
          </div>
        </div>
        <div className="stat-card">
          <div className="text-xs text-ink-400 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Target className="w-3 h-3" />
            Take profit
          </div>
          <div className="text-lg font-semibold">
            {trade.takeProfit != null ? formatNumber(trade.takeProfit) : "—"}
          </div>
        </div>
        <div className="stat-card">
          <div className="text-xs text-ink-400 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Hash className="w-3 h-3" />
            Position size
          </div>
          <div className="text-lg font-semibold">{trade.positionSize}</div>
        </div>
        <div className="stat-card">
          <div className="text-xs text-ink-400 uppercase tracking-wider mb-1">
            Risk : Reward
          </div>
          <div className="text-lg font-semibold">
            {trade.riskReward != null ? `1 : ${trade.riskReward.toFixed(2)}` : "—"}
          </div>
        </div>
        <div className="stat-card">
          <div className="text-xs text-ink-400 uppercase tracking-wider mb-1">
            R-multiple
          </div>
          <div
            className={`text-lg font-semibold ${
              (trade.rMultiple ?? 0) > 0
                ? "text-emerald-400"
                : (trade.rMultiple ?? 0) < 0
                ? "text-red-400"
                : ""
            }`}
          >
            {trade.rMultiple != null ? `${trade.rMultiple.toFixed(2)}R` : "—"}
          </div>
        </div>
        <div className="stat-card">
          <div className="text-xs text-ink-400 uppercase tracking-wider mb-1">
            Confidence
          </div>
          <div className="text-lg font-semibold">
            {trade.confidence != null ? `${trade.confidence} / 10` : "—"}
          </div>
        </div>
      </div>

      {/* Emotion summary */}
      {(trade.emotionBefore != null || trade.emotionAfter != null) && (
        <div className="card">
          <h2 className="text-sm font-semibold text-ink-300 mb-4">Psychology</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-xs text-ink-400 mb-1">Emotion before</div>
              <div className="text-lg font-semibold">
                {trade.emotionBefore ?? "—"} / 10
              </div>
            </div>
            <div>
              <div className="text-xs text-ink-400 mb-1">Emotion after (editable)</div>
              <input
                type="range"
                min={1}
                max={10}
                value={emotionAfter}
                onChange={(e) => setEmotionAfter(Number(e.target.value))}
                className="w-full"
              />
              <div className="text-sm text-ink-300 mt-1">{emotionAfter} / 10</div>
            </div>
          </div>
        </div>
      )}

      {/* Notes & rule break */}
      <div className="card">
        <h2 className="text-sm font-semibold text-ink-300 mb-3">Trade notes</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={6}
          placeholder="What worked? What didn't? What would you do differently?"
          className="input w-full resize-y"
        />
        <label className="flex items-center gap-2 mt-4 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={ruleBreak}
            onChange={(e) => setRuleBreak(e.target.checked)}
            className="w-4 h-4 accent-red-500"
          />
          <span className="text-sm">This trade broke my rules</span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <button
          onClick={save}
          disabled={saving}
          className="btn-primary inline-flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save changes"}
        </button>
        <button
          onClick={deleteTrade}
          disabled={deleting}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-300 hover:bg-red-500/20 transition border border-red-500/20"
        >
          <Trash2 className="w-4 h-4" />
          {deleting ? "Deleting..." : "Delete trade"}
        </button>
      </div>
    </div>
  );
}

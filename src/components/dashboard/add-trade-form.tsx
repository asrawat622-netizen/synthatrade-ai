"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { X, Plus } from "lucide-react";

type Tag = { id: string; name: string };

const SESSIONS = ["Asia", "London", "NY Open", "NY Lunch", "NY PM"];
const TIMEFRAMES = ["1m", "5m", "15m", "1h", "4h", "1D"];
const COMMON_INSTRUMENTS = ["NQ", "ES", "YM", "RTY", "EURUSD", "GBPUSD", "USDJPY", "GC", "CL"];

function tickValueFor(instrument: string) {
  const map: Record<string, number> = {
    NQ: 5, ES: 12.5, YM: 5, RTY: 5,
    CL: 10, GC: 10,
    EURUSD: 10, GBPUSD: 10, USDJPY: 10,
  };
  return map[instrument.toUpperCase()] ?? 1;
}

export function AddTradeForm({
  tags: initialTags,
  preferredInstruments,
}: {
  tags: Tag[];
  preferredInstruments: string[];
}) {
  const router = useRouter();
  const [tags, setTags] = useState<Tag[]>(initialTags);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  const defaultDate = today.toISOString().slice(0, 16);

  const [form, setForm] = useState({
    date: defaultDate,
    instrument: preferredInstruments[0] || "NQ",
    direction: "Long" as "Long" | "Short",
    entryPrice: "",
    exitPrice: "",
    stopLoss: "",
    takeProfit: "",
    positionSize: "1",
    session: "NY Open",
    timeframe: "5m",
    notes: "",
    emotionBefore: 5,
    emotionAfter: 5,
    confidence: 5,
    ruleBreak: false,
  });

  function set<K extends keyof typeof form>(k: K, v: any) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  // Live calculations
  const calc = useMemo(() => {
    const e = parseFloat(form.entryPrice);
    const x = parseFloat(form.exitPrice);
    const s = parseFloat(form.stopLoss);
    const sz = parseFloat(form.positionSize) || 1;
    if (!isFinite(e) || !isFinite(x)) return null;
    const points = form.direction === "Long" ? x - e : e - x;
    const tv = tickValueFor(form.instrument);
    const pnl = points * tv * sz;
    const result = Math.abs(points) < 0.0001 ? "BE" : points > 0 ? "Win" : "Loss";
    let rr: number | null = null;
    let rMultiple: number | null = null;
    if (isFinite(s) && s > 0) {
      const risk = Math.abs(e - s);
      const reward = Math.abs(x - e);
      if (risk > 0) {
        rr = reward / risk;
        rMultiple = result === "Win" ? reward / risk : result === "Loss" ? -1 : 0;
      }
    }
    return { points, pnl, result, rr, rMultiple };
  }, [form]);

  function toggleTag(id: string) {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function addTag() {
    const name = newTagName.trim();
    if (!name) return;
    const res = await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) {
      toast.error("Could not add tag");
      return;
    }
    const j = await res.json();
    setTags((prev) => [...prev.filter((t) => t.id !== j.tag.id), j.tag].sort((a, b) => a.name.localeCompare(b.name)));
    setSelectedTagIds((prev) => [...prev, j.tag.id]);
    setNewTagName("");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.entryPrice || !form.exitPrice) {
      toast.error("Entry and exit price required");
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/trades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: form.date,
        instrument: form.instrument,
        direction: form.direction,
        entryPrice: parseFloat(form.entryPrice),
        exitPrice: parseFloat(form.exitPrice),
        stopLoss: form.stopLoss ? parseFloat(form.stopLoss) : null,
        takeProfit: form.takeProfit ? parseFloat(form.takeProfit) : null,
        positionSize: parseFloat(form.positionSize) || 1,
        session: form.session || null,
        timeframe: form.timeframe || null,
        notes: form.notes || null,
        emotionBefore: form.emotionBefore,
        emotionAfter: form.emotionAfter,
        confidence: form.confidence,
        ruleBreak: form.ruleBreak,
        tagIds: selectedTagIds,
      }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      toast.error(j.error || "Could not save trade");
      return;
    }
    toast.success("Trade logged");
    router.push("/dashboard/trades");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Live calc banner */}
      {calc && (
        <div className="card border-brand-500/30 bg-brand-500/5">
          <div className="flex flex-wrap gap-6 text-sm">
            <Stat label="Result" value={calc.result} color={calc.result === "Win" ? "teal" : calc.result === "Loss" ? "red" : "ink"} />
            <Stat label="Points" value={calc.points.toFixed(2)} />
            <Stat label="PnL" value={`$${calc.pnl.toFixed(2)}`} color={calc.pnl > 0 ? "teal" : calc.pnl < 0 ? "red" : "ink"} />
            {calc.rr != null && <Stat label="R:R" value={calc.rr.toFixed(2)} />}
            {calc.rMultiple != null && <Stat label="R" value={calc.rMultiple.toFixed(2) + "R"} color={calc.rMultiple > 0 ? "teal" : "red"} />}
          </div>
        </div>
      )}

      {/* Trade basics */}
      <div className="card">
        <h2 className="font-semibold mb-4">Trade Basics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Date / Time</label>
            <input
              type="datetime-local"
              value={form.date}
              onChange={(e) => set("date", e.target.value)}
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">Instrument</label>
            <select
              value={form.instrument}
              onChange={(e) => set("instrument", e.target.value)}
              className="input"
            >
              {[...new Set([...preferredInstruments, ...COMMON_INSTRUMENTS])].map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Direction</label>
            <div className="grid grid-cols-2 gap-2">
              {(["Long", "Short"] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => set("direction", d)}
                  className={`btn ${
                    form.direction === d
                      ? d === "Long"
                        ? "bg-teal-500/20 border border-teal-500/40 text-teal-300"
                        : "bg-red-500/20 border border-red-500/40 text-red-300"
                      : "btn-secondary"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Position Size</label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={form.positionSize}
              onChange={(e) => set("positionSize", e.target.value)}
              className="input"
            />
          </div>
        </div>
      </div>

      {/* Prices */}
      <div className="card">
        <h2 className="font-semibold mb-4">Execution</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Entry Price</label>
            <input
              type="number"
              step="any"
              required
              value={form.entryPrice}
              onChange={(e) => set("entryPrice", e.target.value)}
              className="input"
              placeholder="e.g. 17500.50"
            />
          </div>
          <div>
            <label className="label">Exit Price</label>
            <input
              type="number"
              step="any"
              required
              value={form.exitPrice}
              onChange={(e) => set("exitPrice", e.target.value)}
              className="input"
              placeholder="e.g. 17532.00"
            />
          </div>
          <div>
            <label className="label">Stop Loss</label>
            <input
              type="number"
              step="any"
              value={form.stopLoss}
              onChange={(e) => set("stopLoss", e.target.value)}
              className="input"
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="label">Take Profit</label>
            <input
              type="number"
              step="any"
              value={form.takeProfit}
              onChange={(e) => set("takeProfit", e.target.value)}
              className="input"
              placeholder="Optional"
            />
          </div>
        </div>
      </div>

      {/* Session / strategy tags */}
      <div className="card">
        <h2 className="font-semibold mb-4">Setup</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="label">Session</label>
            <select
              value={form.session}
              onChange={(e) => set("session", e.target.value)}
              className="input"
            >
              {SESSIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Timeframe</label>
            <select
              value={form.timeframe}
              onChange={(e) => set("timeframe", e.target.value)}
              className="input"
            >
              {TIMEFRAMES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
        <label className="label">Strategy Tags</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => toggleTag(t.id)}
              className={`badge transition ${
                selectedTagIds.includes(t.id)
                  ? "bg-brand-500/30 text-brand-200 border border-brand-500/50 scale-105"
                  : "bg-ink-800 text-ink-300 border border-ink-700 hover:bg-ink-700"
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="Add new tag..."
            className="input flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
          />
          <button type="button" onClick={addTag} className="btn-secondary">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Psychology */}
      <div className="card">
        <h2 className="font-semibold mb-4">Psychology</h2>
        <div className="space-y-4">
          <SliderRow
            label="Emotion Before (calm → anxious)"
            value={form.emotionBefore}
            onChange={(v) => set("emotionBefore", v)}
          />
          <SliderRow
            label="Emotion After (down → euphoric)"
            value={form.emotionAfter}
            onChange={(v) => set("emotionAfter", v)}
          />
          <SliderRow
            label="Confidence in setup"
            value={form.confidence}
            onChange={(v) => set("confidence", v)}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.ruleBreak}
              onChange={(e) => set("ruleBreak", e.target.checked)}
              className="w-4 h-4 rounded border-ink-600 bg-ink-800 accent-brand-500"
            />
            <span className="text-ink-200">I broke a rule on this trade</span>
          </label>
        </div>
      </div>

      {/* Notes */}
      <div className="card">
        <label className="label">Notes</label>
        <textarea
          rows={4}
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          className="input"
          placeholder="What was the setup? What did you see? What worked / didn't?"
        />
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-secondary"
        >
          Cancel
        </button>
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? "Saving..." : "Save Trade"}
        </button>
      </div>
    </form>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color?: "teal" | "red" | "ink" }) {
  const c = color === "teal" ? "text-teal-400" : color === "red" ? "text-red-400" : "text-ink-100";
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-ink-400">{label}</div>
      <div className={`text-lg font-semibold ${c}`}>{value}</div>
    </div>
  );
}

function SliderRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-ink-300">{label}</span>
        <span className="text-sm font-semibold text-brand-300 min-w-[2rem] text-right">{value}</span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        step={1}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full accent-brand-500"
      />
    </div>
  );
}

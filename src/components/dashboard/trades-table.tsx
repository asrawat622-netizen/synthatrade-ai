"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpDown, Filter, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type Tag = { id: string; name: string };
type Trade = {
  id: string;
  date: string;
  instrument: string;
  direction: string;
  pnlPoints: number;
  pnlDollars: number;
  result: string;
  session: string | null;
  tradeTags: { tag: Tag }[];
  ruleBreak: boolean;
};

type SortKey = "date" | "instrument" | "pnlDollars" | "result" | "session";

export function TradesTable({ trades, tags }: { trades: Trade[]; tags: Tag[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [session, setSession] = useState("");
  const [instrument, setInstrument] = useState("");
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const instruments = useMemo(
    () => Array.from(new Set(trades.map((t) => t.instrument))).sort(),
    [trades]
  );
  const sessions = useMemo(
    () => Array.from(new Set(trades.map((t) => t.session).filter(Boolean))) as string[],
    [trades]
  );

  const filtered = useMemo(() => {
    let list = [...trades];
    if (fromDate) list = list.filter((t) => new Date(t.date) >= new Date(fromDate));
    if (toDate) {
      const end = new Date(toDate);
      end.setHours(23, 59, 59, 999);
      list = list.filter((t) => new Date(t.date) <= end);
    }
    if (session) list = list.filter((t) => t.session === session);
    if (instrument) list = list.filter((t) => t.instrument === instrument);
    if (tagFilter.length) {
      list = list.filter((t) =>
        tagFilter.every((id) => t.tradeTags.some((tt) => tt.tag.id === id))
      );
    }
    list.sort((a, b) => {
      const av = (a as any)[sortKey];
      const bv = (b as any)[sortKey];
      let cmp = 0;
      if (sortKey === "date") cmp = new Date(av).getTime() - new Date(bv).getTime();
      else if (typeof av === "number") cmp = av - bv;
      else cmp = String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [trades, fromDate, toDate, session, instrument, tagFilter, sortKey, sortDir]);

  function toggleSort(k: SortKey) {
    if (sortKey === k) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortKey(k);
      setSortDir("desc");
    }
  }

  function clearFilters() {
    setFromDate("");
    setToDate("");
    setSession("");
    setInstrument("");
    setTagFilter([]);
  }

  const hasFilters = fromDate || toDate || session || instrument || tagFilter.length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn-secondary text-sm"
        >
          <Filter className="w-4 h-4" />
          Filters
          {hasFilters ? (
            <span className="badge bg-brand-500 text-white ml-1">
              {[fromDate, toDate, session, instrument, ...tagFilter].filter(Boolean).length}
            </span>
          ) : null}
        </button>
        {hasFilters && (
          <button onClick={clearFilters} className="btn-ghost text-sm">
            <X className="w-3 h-3" />
            Clear
          </button>
        )}
        <span className="text-sm text-ink-400 ml-auto">
          Showing {filtered.length} of {trades.length}
        </span>
      </div>

      {showFilters && (
        <div className="card grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="label">From</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">To</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">Session</label>
            <select value={session} onChange={(e) => setSession(e.target.value)} className="input">
              <option value="">All</option>
              {sessions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Instrument</label>
            <select value={instrument} onChange={(e) => setInstrument(e.target.value)} className="input">
              <option value="">All</option>
              {instruments.map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2 md:col-span-4">
            <label className="label">Tags (must include all)</label>
            <div className="flex flex-wrap gap-2">
              {tags.map((t) => (
                <button
                  key={t.id}
                  onClick={() =>
                    setTagFilter((prev) =>
                      prev.includes(t.id) ? prev.filter((x) => x !== t.id) : [...prev, t.id]
                    )
                  }
                  className={`badge text-xs ${
                    tagFilter.includes(t.id)
                      ? "bg-brand-500/30 text-brand-200 border border-brand-500/50"
                      : "bg-ink-800 text-ink-300 border border-ink-700 hover:bg-ink-700"
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ink-800/50 border-b border-ink-700">
              <tr>
                <Th onClick={() => toggleSort("date")} active={sortKey === "date"}>Date</Th>
                <Th onClick={() => toggleSort("instrument")} active={sortKey === "instrument"}>Sym</Th>
                <Th>Dir</Th>
                <Th>Tags</Th>
                <Th onClick={() => toggleSort("session")} active={sortKey === "session"}>Session</Th>
                <Th onClick={() => toggleSort("pnlDollars")} active={sortKey === "pnlDollars"} align="right">PnL $</Th>
                <Th align="right">Pts</Th>
                <Th onClick={() => toggleSort("result")} active={sortKey === "result"}>Result</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-ink-800 hover:bg-ink-800/30 transition cursor-pointer"
                >
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/trades/${t.id}`} className="block">
                      <div className="text-ink-100">{new Date(t.date).toLocaleDateString()}</div>
                      <div className="text-xs text-ink-400">
                        {new Date(t.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-medium">
                    <Link href={`/dashboard/trades/${t.id}`} className="block">{t.instrument}</Link>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/trades/${t.id}`} className="block">
                      <span
                        className={
                          t.direction === "Long"
                            ? "text-teal-400 text-xs font-medium"
                            : "text-red-400 text-xs font-medium"
                        }
                      >
                        {t.direction}
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/trades/${t.id}`} className="block">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {t.tradeTags.slice(0, 3).map((tt) => (
                          <span key={tt.tag.id} className="badge-tag text-[10px]">
                            {tt.tag.name}
                          </span>
                        ))}
                        {t.tradeTags.length > 3 && (
                          <span className="text-[10px] text-ink-400">+{t.tradeTags.length - 3}</span>
                        )}
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-300 text-xs">
                    <Link href={`/dashboard/trades/${t.id}`} className="block">
                      {t.session || "—"}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    <Link href={`/dashboard/trades/${t.id}`} className="block">
                      <span className={t.pnlDollars > 0 ? "text-teal-400" : t.pnlDollars < 0 ? "text-red-400" : "text-ink-300"}>
                        {formatCurrency(t.pnlDollars)}
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-right text-ink-300 font-mono text-xs">
                    <Link href={`/dashboard/trades/${t.id}`} className="block">
                      {t.pnlPoints.toFixed(1)}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/trades/${t.id}`} className="block">
                      <span
                        className={
                          t.result === "Win"
                            ? "badge-win"
                            : t.result === "Loss"
                            ? "badge-loss"
                            : "badge-be"
                        }
                      >
                        {t.result}
                      </span>
                    </Link>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-ink-400">
                    No trades match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Th({
  children,
  onClick,
  active,
  align = "left",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  align?: "left" | "right";
}) {
  return (
    <th
      onClick={onClick}
      className={`px-4 py-3 text-xs font-medium uppercase tracking-wide select-none ${
        align === "right" ? "text-right" : "text-left"
      } ${onClick ? "cursor-pointer hover:bg-ink-800" : ""} ${
        active ? "text-brand-300" : "text-ink-300"
      }`}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        {onClick && <ArrowUpDown className="w-3 h-3 opacity-60" />}
      </span>
    </th>
  );
}

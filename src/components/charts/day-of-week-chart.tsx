"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from "recharts";

type Row = { day: string; trades: number; winRate: number; pnl: number };

export default function DayOfWeekChart({ data }: { data: Row[] }) {
  // Filter weekends if no trades — markets often closed
  const filtered = data.filter((d) => d.trades > 0 || ["Mon", "Tue", "Wed", "Thu", "Fri"].includes(d.day));
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={filtered} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
        <YAxis stroke="#94a3b8" fontSize={11} />
        <Tooltip
          contentStyle={{
            background: "#0b1220",
            border: "1px solid #1e293b",
            borderRadius: 8,
          }}
          formatter={(v: any, name: string) =>
            name === "pnl"
              ? [`$${Number(v).toFixed(2)}`, "PnL"]
              : [v, name]
          }
          labelFormatter={(label, payload) => {
            const row = payload?.[0]?.payload as Row | undefined;
            if (!row) return label;
            return `${label} · ${row.trades} trades · ${(row.winRate * 100).toFixed(0)}% WR`;
          }}
        />
        <Bar dataKey="pnl" radius={[6, 6, 0, 0]}>
          {filtered.map((r, i) => (
            <Cell key={i} fill={r.pnl >= 0 ? "#14b8a6" : "#f43f5e"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

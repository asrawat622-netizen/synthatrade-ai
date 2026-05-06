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

type Row = { hour: string; trades: number; winRate: number; pnl: number };

export default function HourChart({ data }: { data: Row[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis dataKey="hour" stroke="#94a3b8" fontSize={10} />
        <YAxis stroke="#94a3b8" fontSize={11} />
        <Tooltip
          contentStyle={{
            background: "#0b1220",
            border: "1px solid #1e293b",
            borderRadius: 8,
          }}
          formatter={(v: any) => [`$${Number(v).toFixed(2)}`, "PnL"]}
          labelFormatter={(label, payload) => {
            const row = payload?.[0]?.payload as Row | undefined;
            if (!row) return label;
            return `${label} · ${row.trades} trades · ${(row.winRate * 100).toFixed(0)}% WR`;
          }}
        />
        <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
          {data.map((r, i) => (
            <Cell key={i} fill={r.pnl >= 0 ? "#a855f7" : "#f43f5e"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

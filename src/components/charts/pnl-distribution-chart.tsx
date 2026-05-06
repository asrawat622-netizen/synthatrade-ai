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

type Bucket = { range: string; count: number };

export default function PnlDistributionChart({ data }: { data: Bucket[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis dataKey="range" stroke="#94a3b8" fontSize={11} />
        <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
        <Tooltip
          contentStyle={{
            background: "#0b1220",
            border: "1px solid #1e293b",
            borderRadius: 8,
          }}
        />
        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
          {data.map((b, i) => (
            <Cell
              key={i}
              fill={
                b.range.startsWith("<") || b.range.startsWith("-")
                  ? "#f43f5e"
                  : "#14b8a6"
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Bold categorical palette — 25 distinct hues, high saturation
const BOLD_COLORS = [
  "#2563eb", "#dc2626", "#16a34a", "#d97706", "#7c3aed",
  "#0891b2", "#be185d", "#65a30d", "#ea580c", "#0284c7",
  "#9333ea", "#059669", "#b45309", "#e11d48", "#0d9488",
  "#4338ca", "#c2410c", "#047857", "#1d4ed8", "#92400e",
  "#7e22ce", "#0f766e", "#b91c1c", "#15803d", "#6d28d9",
];

interface Props {
  data: { name: string; count: number; color: string }[];
}

export default function DisasterDonut({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        No data yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={65}
          outerRadius={110}
          paddingAngle={2}
          dataKey="count"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={BOLD_COLORS[i % BOLD_COLORS.length]} stroke="none" />
          ))}
        </Pie>
        <Tooltip
          formatter={(v, name) => [Number(v).toLocaleString(), String(name)]}
          contentStyle={{
            borderRadius: 8,
            border: "2px solid #1e293b",
            background: "#0f172a",
            color: "#f8fafc",
            fontSize: 13,
            fontFamily: "Inter, sans-serif",
            padding: "8px 12px",
          }}
          labelStyle={{ fontWeight: 700, color: "#f8fafc", marginBottom: 2 }}
          itemStyle={{ color: "#e2e8f0" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

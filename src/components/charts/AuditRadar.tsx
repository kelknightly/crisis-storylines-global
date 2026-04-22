"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { ValidationSummary } from "@/types";

interface Props {
  validation: ValidationSummary;
}

export default function AuditRadar({ validation }: Props) {
  const byType = validation.byDisasterType ?? {};
  const data = Object.entries(byType)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10)
    .map(([type, stats]) => ({
      subject: type.length > 16 ? type.slice(0, 16) + "…" : type,
      precision: Math.round(stats.precision * 100),
      fullMark: 100,
    }));

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        No validation data available — run the preprocessing script first.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={340}>
      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
        <PolarGrid stroke="oklch(0.88 0.006 80)" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fontSize: 11, fill: "oklch(0.45 0.015 250)", fontFamily: "Inter, sans-serif" }}
        />
        <Radar
          name="AI Precision (%)"
          dataKey="precision"
          stroke="oklch(0.52 0.1 258)"
          fill="oklch(0.52 0.1 258)"
          fillOpacity={0.2}
          strokeWidth={1.5}
        />
        <Tooltip
          formatter={(value) => [`${value}%`, "Expert-validated precision"]}
          contentStyle={{
            borderRadius: 8,
            border: "1px solid oklch(0.91 0.007 80)",
            fontSize: 12,
            fontFamily: "Inter, sans-serif",
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

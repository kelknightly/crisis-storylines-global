"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import type { HeatmapCell } from "@/types";

interface Props {
  data: HeatmapCell[];
  title?: string;
}

// White → yellow → orange → red heatmap scale
const STEPS = [
  "#ffffff",
  "#fef9c3",
  "#fde68a",
  "#f97316",
  "#dc2626",
  "#7f1d1d",
];

function cellColor(value: number, max: number): string {
  if (max === 0 || value === 0) return STEPS[0];
  const idx = Math.ceil((value / max) * (STEPS.length - 1));
  return STEPS[Math.min(idx, STEPS.length - 1)];
}

function cellTextColor(value: number, max: number): string {
  if (max === 0 || value === 0) return "#9ca3af";
  const ratio = value / max;
  // White text on dark orange/red cells, dark text on light cells
  return ratio > 0.55 ? "#ffffff" : "#1e293b";
}

export default function CausalHeatmap({ data, title }: Props) {
  const router = useRouter();

  const { disasterTypes, factors, lookup, maxCount } = useMemo(() => {
    const types = [...new Set(data.map((d) => d.disasterType))].sort();
    const factors = [...new Set(data.map((d) => d.factor))].slice(0, 20);
    const lookup = new Map(data.map((d) => [`${d.disasterType}||${d.factor}`, d.count]));
    const maxCount = Math.max(...data.map((d) => d.count), 1);
    return { disasterTypes: types, factors, lookup, maxCount };
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
        No data available — run the preprocessing script first.
      </div>
    );
  }

  const CELL_W = 90;
  const CELL_H = 34;
  const LABEL_W = 200;
  const HEADER_H = 140;
  const svgWidth = LABEL_W + factors.length * CELL_W;
  const svgHeight = HEADER_H + disasterTypes.length * CELL_H;

  return (
    <div className="overflow-auto">
      {title && (
        <h3 className="text-sm font-semibold text-foreground mb-3">{title}</h3>
      )}
      <svg width={svgWidth} height={svgHeight} className="block">
        {/* Column headers (rotated -45°) */}
        {factors.map((factor, fi) => (
          <g key={factor} transform={`translate(${LABEL_W + fi * CELL_W + CELL_W / 2}, ${HEADER_H - 8})`}>
            <text
              transform="rotate(-45)"
              textAnchor="end"
              style={{
                fontSize: 11,
                fill: "#334155",
                fontFamily: "var(--font-inter)",
              }}
            >
              {factor}
            </text>
          </g>
        ))}

        {/* Row labels + cells */}
        {disasterTypes.map((dtype, ri) => (
          <g key={dtype} transform={`translate(0, ${HEADER_H + ri * CELL_H})`}>
            {/* Row label */}
            <text
              x={LABEL_W - 10}
              y={CELL_H / 2}
              dominantBaseline="middle"
              textAnchor="end"
              style={{
                fontSize: 12,
                fill: "#1e293b",
                fontFamily: "var(--font-inter)",
              }}
            >
              {dtype}
            </text>

            {/* Cells */}
            {factors.map((factor, fi) => {
              const count = lookup.get(`${dtype}||${factor}`) ?? 0;
              const bg = cellColor(count, maxCount);
              const fg = cellTextColor(count, maxCount);
              return (
                <g
                  key={factor}
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    router.push(`/events?disasterType=${encodeURIComponent(dtype)}`)
                  }
                >
                  <title>{`${dtype} × ${factor}: ${count}`}</title>
                  <rect
                    x={LABEL_W + fi * CELL_W + 1}
                    y={1}
                    width={CELL_W - 2}
                    height={CELL_H - 2}
                    rx={3}
                    fill={bg}
                    stroke="#e2e8f0"
                    strokeWidth={0.5}
                  />
                  {count > 0 && (
                    <text
                      x={LABEL_W + fi * CELL_W + CELL_W / 2}
                      y={CELL_H / 2}
                      dominantBaseline="middle"
                      textAnchor="middle"
                      style={{
                        fontSize: 10,
                        fill: fg,
                        fontFamily: "var(--font-jetbrains-mono)",
                        fontWeight: 600,
                      }}
                    >
                      {count}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        ))}
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
        <span>Low</span>
        <div className="flex gap-0.5">
          {STEPS.map((color, i) => (
            <div
              key={i}
              className="w-6 h-3 rounded-sm border border-border/40"
              style={{ background: color }}
            />
          ))}
        </div>
        <span>High (frequency of causal factor)</span>
        <span className="ml-4 text-muted-foreground/60">Click a cell to explore events →</span>
      </div>
    </div>
  );
}

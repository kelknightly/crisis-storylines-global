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
  return ratio > 0.55 ? "#ffffff" : "#1e293b";
}

// Fixed layout constants
const LABEL_W = 190;  // px — row label column width
const CELL_H = 34;    // px — row height
const CELL_MIN_W = 58; // px — minimum cell width before horizontal scroll kicks in
const HEADER_H = 150; // px — height of the diagonal-label header row

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

  return (
    // overflow-x: auto handles many-column overflow; overflow-y: visible lets
    // the diagonal labels poke above the card boundary without being clipped.
    <div style={{ overflowX: "auto", overflowY: "visible" }}>
      {title && (
        <h3 className="text-sm font-semibold text-foreground mb-3">{title}</h3>
      )}

      {/* Min-width wrapper so horizontal scroll activates before cells collapse */}
      <div style={{ minWidth: LABEL_W + factors.length * CELL_MIN_W }}>

        {/* ── Header row: diagonal column labels ── */}
        <div className="flex" style={{ paddingLeft: LABEL_W }}>
          {factors.map((factor) => (
            <div
              key={factor}
              style={{
                flex: 1,
                minWidth: CELL_MIN_W,
                height: HEADER_H,
                position: "relative",
                // overflow must be visible so rotated text can escape the cell box
                overflow: "visible",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  // Anchor the left-bottom of the text at the cell's horizontal centre
                  bottom: 6,
                  left: "50%",
                  display: "block",
                  whiteSpace: "nowrap",
                  fontSize: 11,
                  color: "#334155",
                  fontFamily: "var(--font-inter, sans-serif)",
                  // Rotate from the left-bottom corner (the anchor)
                  transformOrigin: "left bottom",
                  transform: "rotate(-45deg)",
                  userSelect: "none",
                }}
              >
                {factor}
              </span>
            </div>
          ))}
        </div>

        {/* ── Data rows ── */}
        {disasterTypes.map((dtype) => (
          <div
            key={dtype}
            className="flex items-stretch"
            style={{ height: CELL_H }}
          >
            {/* Row label */}
            <div
              style={{
                width: LABEL_W,
                minWidth: LABEL_W,
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                paddingRight: 10,
                fontSize: 12,
                color: "#1e293b",
                fontFamily: "var(--font-inter, sans-serif)",
                flexShrink: 0,
              }}
            >
              {dtype}
            </div>

            {/* Cells */}
            {factors.map((factor) => {
              const count = lookup.get(`${dtype}||${factor}`) ?? 0;
              const bg = cellColor(count, maxCount);
              const fg = cellTextColor(count, maxCount);
              return (
                <div
                  key={factor}
                  title={`${dtype} × ${factor}: ${count}`}
                  onClick={() =>
                    router.push(`/events?disasterType=${encodeURIComponent(dtype)}`)
                  }
                  style={{
                    flex: 1,
                    minWidth: CELL_MIN_W,
                    margin: 1,
                    background: bg,
                    border: "0.5px solid #e2e8f0",
                    borderRadius: 3,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    fontSize: 10,
                    fontWeight: 600,
                    color: fg,
                    fontFamily: "var(--font-jetbrains-mono, monospace)",
                    userSelect: "none",
                  }}
                >
                  {count > 0 ? count : null}
                </div>
              );
            })}
          </div>
        ))}
      </div>

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

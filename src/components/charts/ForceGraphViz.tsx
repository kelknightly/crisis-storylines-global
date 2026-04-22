"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef } from "react";
import type { GraphData } from "@/types";

// react-force-graph-2d uses canvas + browser APIs — must be client-only
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
      Loading graph…
    </div>
  ),
});

interface Props {
  data: GraphData;
  width?: number;
  height?: number;
  highlightNodes?: Set<string>;
}

// Semantic edge colours — strong red for causes, strong green for prevents
const CAUSES_COLOR = "rgba(220, 38, 38, 0.85)";
const PREVENTS_COLOR = "rgba(22, 163, 74, 0.85)";
const NODE_COLOR = "oklch(0.52 0.1 258)";
const NODE_HIGHLIGHT = "oklch(0.78 0.12 70)";

export default function ForceGraphViz({
  data,
  width = 900,
  height = 560,
  highlightNodes,
}: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fgRef = useRef<any>(null);

  // Increase charge repulsion so nodes spread out
  useEffect(() => {
    const fg = fgRef.current;
    if (!fg) return;
    fg.d3Force("charge")?.strength(-280);
    fg.d3Force("link")?.distance(60);
    fg.d3ReheatSimulation();
  }, [data]);
  // Transform our schema → react-force-graph-2d schema (uses `links`)
  const graphData = {
    nodes: data.nodes.map((n) => ({
      id: n.id,
      label: n.label,
      val: Math.log1p(n.frequency) * 2, // Node size ~ log(frequency)
      frequency: n.frequency,
      disasterTypes: n.disasterTypes,
    })),
    links: data.edges.map((e) => ({
      source: e.source,
      target: e.target,
      relation: e.relation,
      value: e.weight,
    })),
  };

  const nodeCanvasObject = useCallback(
    (node: Record<string, unknown>, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const label = node.label as string;
      const val = (node.val as number) ?? 2;
      const radius = Math.max(3, val);
      const x = node.x as number;
      const y = node.y as number;
      const highlighted = highlightNodes?.has(node.id as string);

      // Node circle
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = highlighted ? NODE_HIGHLIGHT : NODE_COLOR;
      ctx.globalAlpha = highlighted ? 1 : 0.85;
      ctx.fill();
      ctx.globalAlpha = 1;

      // Label (only if zoomed in enough or node is large)
      if (globalScale >= 1.5 || val > 6) {
        const fontSize = Math.max(8, 10 / globalScale);
        ctx.font = `${fontSize}px Inter, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "oklch(0.2 0.015 250)";
        const shortLabel = label.length > 24 ? label.slice(0, 24) + "…" : label;
        ctx.fillText(shortLabel, x, y + radius + fontSize);
      }
    },
    [highlightNodes]
  );

  if (data.nodes.length === 0) {
    return (
      <div
        className="flex items-center justify-center border border-dashed border-border rounded-lg text-muted-foreground text-sm"
        style={{ height }}
      >
        No graph data available — run the preprocessing script first.
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-white">
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        width={width}
        height={height}
        nodeCanvasObject={nodeCanvasObject}
        nodeCanvasObjectMode={() => "replace"}
        linkColor={(link: Record<string, unknown>) =>
          (link.relation as string) === "prevents" ? PREVENTS_COLOR : CAUSES_COLOR
        }
        linkWidth={(link: Record<string, unknown>) =>
          Math.log1p((link.value as number) ?? 1) * 0.8
        }
        linkDirectionalArrowLength={4}
        linkDirectionalArrowRelPos={0.9}
        backgroundColor="#ffffff"
        cooldownTicks={150}
        nodeLabel={(node: Record<string, unknown>) =>
          `${node.label as string} (${(node.frequency as number) ?? 0} occurrences)`
        }
      />

      {/* Legend */}
      <div className="px-4 py-2 border-t border-border flex items-center gap-6 text-xs text-muted-foreground bg-muted/30">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-1 rounded" style={{ background: CAUSES_COLOR }} />
          <span className="font-medium" style={{ color: CAUSES_COLOR }}>causes</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-1 rounded" style={{ background: PREVENTS_COLOR }} />
          <span className="font-medium" style={{ color: PREVENTS_COLOR }}>prevents</span>
        </div>
        <span className="ml-auto">Node size = global frequency across all events</span>
      </div>
    </div>
  );
}

"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
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

// Semantic edge colours
const CAUSES_COLOR = "rgba(220, 38, 38, 0.9)";
const CAUSES_DIM = "rgba(220, 38, 38, 0.07)";
const PREVENTS_COLOR = "rgba(22, 163, 74, 0.9)";
const PREVENTS_DIM = "rgba(22, 163, 74, 0.07)";

// Event-level (large) node palette — matches the original paper's style
const EVENT_NODE_FILL = "#bfdbfe";   // blue-200
const EVENT_NODE_STROKE = "#1d4ed8"; // blue-700
const EVENT_NODE_RADIUS = 22;        // fixed large circle
// Global graph node palette
const GLOBAL_NODE_DEFAULT = "#64748b";
// Shared interaction palette
const NODE_SELECTED = "#f59e0b";    // amber-400
const NODE_CONNECTED = "#93c5fd";   // blue-300
const NODE_EXTERNAL_HL = "#a78bfa"; // violet-400

// Extract string id from a node ref that may be a string or an object after simulation
function nodeId(ref: unknown): string {
  if (typeof ref === "object" && ref !== null) return (ref as { id: string }).id;
  return ref as string;
}

// Stable key for a directed link
function linkKey(source: unknown, target: unknown): string {
  return `${nodeId(source)}---${nodeId(target)}`;
}

export default function ForceGraphViz({
  data,
  width = 900,
  height = 560,
  highlightNodes,
  alwaysShowLabels = false,
}: Props & { alwaysShowLabels?: boolean }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fgRef = useRef<any>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [connectedIds, setConnectedIds] = useState<Set<string>>(new Set());
  const [connectedKeys, setConnectedKeys] = useState<Set<string>>(new Set());

  // Spread nodes; event graphs need much stronger repulsion to avoid overlap with large nodes
  useEffect(() => {
    const fg = fgRef.current;
    if (!fg) return;
    fg.d3Force("charge")?.strength(alwaysShowLabels ? -2500 : -500);
    fg.d3Force("link")?.distance(alwaysShowLabels ? 200 : 110);
    fg.d3ReheatSimulation();
  }, [data, alwaysShowLabels]);

  // Reset selection when data changes (e.g. disaster-type filter)
  useEffect(() => {
    setSelectedId(null);
    setConnectedIds(new Set());
    setConnectedKeys(new Set());
  }, [data]);

  const graphData = {
    nodes: data.nodes.map((n) => ({
      id: n.id,
      label: n.label,
      // val drives collision radius in the physics sim — match our drawn radius
      val: alwaysShowLabels
        ? (EVENT_NODE_RADIUS * EVENT_NODE_RADIUS) / 4  // ~121, keeps nodes from overlapping
        : Math.log1p(n.frequency) * 2,
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

  const handleNodeClick = useCallback(
    (node: Record<string, unknown>) => {
      const id = node.id as string;
      // Toggle off if already selected
      if (selectedId === id) {
        setSelectedId(null);
        setConnectedIds(new Set());
        setConnectedKeys(new Set());
        return;
      }
      setSelectedId(id);
      const neighbours = new Set<string>();
      const keys = new Set<string>();
      data.edges.forEach((e) => {
        if (e.source === id || e.target === id) {
          neighbours.add(e.source);
          neighbours.add(e.target);
          keys.add(`${e.source}---${e.target}`);
        }
      });
      neighbours.delete(id); // selected node handled separately
      setConnectedIds(neighbours);
      setConnectedKeys(keys);
    },
    [selectedId, data.edges]
  );

  const handleBackgroundClick = useCallback(() => {
    setSelectedId(null);
    setConnectedIds(new Set());
    setConnectedKeys(new Set());
  }, []);

  const nodeCanvasObject = useCallback(
    (node: Record<string, unknown>, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const id = node.id as string;
      const label = node.label as string;
      const val = (node.val as number) ?? 2;
      const x = node.x as number;
      const y = node.y as number;

      // Event graphs: fixed large circle; global graph: size by frequency
      const radius = alwaysShowLabels ? EVENT_NODE_RADIUS : Math.max(4, val);

      const hasSelection = selectedId !== null;
      const isSelected = selectedId === id;
      const isConnected = connectedIds.has(id);
      const isDimmed = hasSelection && !isSelected && !isConnected;
      const isExternalHL = !hasSelection && highlightNodes?.has(id);

      // ── Fill — fully opaque so edges never bleed through ──
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);

      if (isDimmed) {
        ctx.fillStyle = alwaysShowLabels
          ? "rgba(191, 219, 254, 0.2)"
          : "rgba(100, 116, 139, 0.12)";
      } else if (isSelected) {
        ctx.fillStyle = NODE_SELECTED;
      } else if (isConnected) {
        ctx.fillStyle = NODE_CONNECTED;
      } else if (isExternalHL) {
        ctx.fillStyle = NODE_EXTERNAL_HL;
      } else {
        ctx.fillStyle = alwaysShowLabels ? EVENT_NODE_FILL : GLOBAL_NODE_DEFAULT;
      }
      ctx.fill();

      // ── Stroke ring ──
      if (!isDimmed) {
        ctx.strokeStyle = isSelected
          ? "#b45309"
          : isConnected
          ? "#1d4ed8"
          : alwaysShowLabels
          ? EVENT_NODE_STROKE
          : "#334155";
        ctx.lineWidth = isSelected ? 2.5 / globalScale : (alwaysShowLabels ? 2 / globalScale : 1 / globalScale);
        ctx.stroke();
      }

      // ── Label ──
      const showLabel =
        !isDimmed &&
        (alwaysShowLabels || isSelected || isConnected || globalScale >= 1.2 || val > 6);
      if (showLabel) {
        const fontSize = alwaysShowLabels
          ? Math.max(11, 13 / Math.max(globalScale, 0.8))
          : Math.max(9, 11 / Math.max(globalScale, 0.8));
        ctx.font = isSelected
          ? `bold ${fontSize}px Inter, sans-serif`
          : `${fontSize}px Inter, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillStyle = isSelected
          ? "#92400e"
          : isConnected
          ? "#1e3a8a"
          : alwaysShowLabels
          ? "#1e3a8a"
          : "#1e293b";
        const shortLabel = label.length > 28 ? label.slice(0, 28) + "…" : label;
        ctx.fillText(shortLabel, x, y + radius + 4);
      }
    },
    [selectedId, connectedIds, highlightNodes, alwaysShowLabels]
  );

  // Draw relation labels ("causes" / "prevents") at edge midpoints — only on event graphs
  const linkCanvasObject = useCallback(
    (link: Record<string, unknown>, ctx: CanvasRenderingContext2D, globalScale: number) => {
      if (!alwaysShowLabels) return;
      const start = link.source as { x: number; y: number } | null;
      const end = link.target as { x: number; y: number } | null;
      if (!start?.x || !end?.x) return;

      const key = linkKey(link.source, link.target);
      const isDimmedLink = selectedId !== null && !connectedKeys.has(key);
      if (isDimmedLink) return; // don't clutter dimmed links with labels

      const midX = (start.x + end.x) / 2;
      const midY = (start.y + end.y) / 2;
      const relation = link.relation as string;
      const fontSize = Math.max(9, 10 / Math.max(globalScale, 0.6));

      ctx.font = `bold ${fontSize}px Inter, sans-serif`;
      const textW = ctx.measureText(relation).width;
      const pad = 3 / globalScale;
      const bgW = textW + pad * 2;
      const bgH = fontSize + pad * 2;

      // White pill behind label for legibility
      ctx.fillStyle = "rgba(255,255,255,0.88)";
      ctx.beginPath();
      const r = bgH / 2;
      ctx.moveTo(midX - bgW / 2 + r, midY - bgH / 2);
      ctx.lineTo(midX + bgW / 2 - r, midY - bgH / 2);
      ctx.arcTo(midX + bgW / 2, midY - bgH / 2, midX + bgW / 2, midY + bgH / 2, r);
      ctx.lineTo(midX - bgW / 2 + r, midY + bgH / 2);
      ctx.arcTo(midX - bgW / 2, midY + bgH / 2, midX - bgW / 2, midY - bgH / 2, r);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = relation === "prevents" ? "#15803d" : "#dc2626";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(relation, midX, midY);
    },
    [alwaysShowLabels, selectedId, connectedKeys]
  );

  const getLinkColor = useCallback(
    (link: Record<string, unknown>) => {
      const isPrevents = (link.relation as string) === "prevents";
      if (selectedId !== null) {
        const key = linkKey(link.source, link.target);
        if (!connectedKeys.has(key)) return isPrevents ? PREVENTS_DIM : CAUSES_DIM;
      }
      return isPrevents ? PREVENTS_COLOR : CAUSES_COLOR;
    },
    [selectedId, connectedKeys]
  );

  const getLinkWidth = useCallback(
    (link: Record<string, unknown>) => {
      const base = Math.log1p((link.value as number) ?? 1) * 1.0;
      if (selectedId !== null) {
        const key = linkKey(link.source, link.target);
        if (connectedKeys.has(key)) return base * 2.5;
      }
      return base;
    },
    [selectedId, connectedKeys]
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
        linkColor={getLinkColor}
        linkWidth={getLinkWidth}
        linkDirectionalArrowLength={10}
        linkDirectionalArrowRelPos={0.85}
        linkDirectionalArrowColor={getLinkColor}
        linkCanvasObject={linkCanvasObject}
        linkCanvasObjectMode={() => "after"}
        backgroundColor="#ffffff"
        cooldownTicks={150}
        onNodeClick={handleNodeClick}
        onBackgroundClick={handleBackgroundClick}
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
        {selectedId && (
          <span className="italic">
            Click selected node or background to deselect
          </span>
        )}
        <span className="ml-auto">Node size = global frequency across all events</span>
      </div>
    </div>
  );
}

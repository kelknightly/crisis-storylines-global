"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Insight } from "@/types";
import ConfidenceBadge from "./ConfidenceBadge";
import TripletTable from "./TripletTable";
import AiGeneratedBadge from "@/components/AiGeneratedBadge";
import CitationChip from "@/components/CitationChip";

interface Props {
  insight: Insight;
  index: number;
}

const BORDER_COLOR: Record<string, string> = {
  "Expert Verified": "border-l-[oklch(0.67_0.1_152)]",
  "Mixed":           "border-l-[oklch(0.78_0.12_70)]",
  "Model Generated": "border-l-[oklch(0.6_0.13_15)]",
};

export default function InsightCard({ insight, index }: Props) {
  const [open, setOpen] = useState(false);
  const [showFull, setShowFull] = useState(false);

  const paras = insight.narrative ? insight.narrative.split("\n\n").filter(Boolean) : [];
  const keyFinding = paras[0] ?? "";
  const restParas = paras.slice(1);

  const borderClass = BORDER_COLOR[insight.confidenceLabel] ?? "border-l-border";

  return (
    <article className={`bg-card border border-border border-l-4 ${borderClass} rounded-xl overflow-hidden`}>
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-start gap-3 mb-4">
          <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded shrink-0 mt-0.5">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3 className="text-base font-semibold text-foreground leading-snug">
            {insight.question}
          </h3>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <ConfidenceBadge
            label={insight.confidenceLabel}
            score={insight.confidenceScore}
          />
          <AiGeneratedBadge
            model={insight.model.replace("claude-", "claude-").split("-20")[0]}
            runDate={insight.runTimestamp}
          />
          <CitationChip />
        </div>

        {/* Narrative */}
        {keyFinding ? (
          <div className="space-y-3">
            {/* Key Finding callout */}
            <div
              className="rounded-lg px-4 py-3 border-l-4 text-sm leading-relaxed"
              style={{
                background: "oklch(0.97 0.04 70 / 0.55)",
                borderLeftColor: "oklch(0.78 0.12 70)",
              }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5"
                style={{ color: "oklch(0.58 0.12 70)" }}>
                Key Finding
              </p>
              <p className="text-foreground/90">{keyFinding}</p>
            </div>

            {/* Full analysis expand/collapse */}
            {restParas.length > 0 && (
              <>
                {showFull && (
                  <div className="prose prose-sm max-w-none text-foreground/80 leading-relaxed pt-1">
                    {restParas.map((para, i) => (
                      <p key={i} className="mb-3 last:mb-0 text-sm">{para}</p>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => setShowFull((s) => !s)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showFull ? (
                    <><ChevronUp className="w-3.5 h-3.5" /> Collapse analysis</>
                  ) : (
                    <><ChevronDown className="w-3.5 h-3.5" /> Show full analysis ({restParas.length} more {restParas.length === 1 ? "paragraph" : "paragraphs"})</>
                  )}
                </button>
              </>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            Narrative not yet generated. Run scripts/03_generate_insights.py to populate.
          </p>
        )}
      </div>

      {/* Evidence accordion */}
      {insight.evidenceTriplets.length > 0 && (
        <div className="border-t border-border">
          <button
            onClick={() => setOpen((o) => !o)}
            className="w-full px-6 py-3 flex items-center justify-between text-sm text-muted-foreground hover:bg-muted/40 transition-colors"
          >
            <span>
              {insight.tripletsRetrievedCount} supporting triplets
              {insight.relatedDisasterTypes.length > 0 && (
                <span className="ml-2 text-xs">
                  · {insight.relatedDisasterTypes.slice(0, 3).join(", ")}
                </span>
              )}
            </span>
            {open ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {open && (
            <div className="px-6 pb-5">
              <TripletTable triplets={insight.evidenceTriplets} />
            </div>
          )}
        </div>
      )}
    </article>
  );
}

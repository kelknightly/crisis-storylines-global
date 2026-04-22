"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Circle, ChevronLeft, ChevronRight } from "lucide-react";
import type { EvidenceTriplet } from "@/types";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

const PAGE_SIZE = 10;

interface Props {
  triplets: EvidenceTriplet[];
  limit?: number;
}

export default function TripletTable({ triplets, limit }: Props) {
  const [page, setPage] = useState(0);

  const allTriplets = limit !== undefined ? triplets.slice(0, limit) : triplets;
  const totalPages = Math.ceil(allTriplets.length / PAGE_SIZE);
  const shown = allTriplets.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  if (allTriplets.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="py-2 pr-3 font-medium w-6"></th>
              <th className="py-2 pr-3 font-medium">Source factor</th>
              <th className="py-2 pr-3 font-medium">Relation</th>
              <th className="py-2 pr-3 font-medium">Target factor</th>
              <th className="py-2 pr-3 font-medium">Event</th>
              <th className="py-2 pr-3 font-medium">Type</th>
              <th className="py-2 font-medium">Year</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((t, i) => (
              <tr key={page * PAGE_SIZE + i} className="border-b border-border/50 hover:bg-muted/40 transition-colors">
                <td className="py-1.5 pr-3">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          {t.highConfidence ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[oklch(0.67_0.1_152)]" />
                          ) : (
                            <Circle className="w-3.5 h-3.5 text-muted-foreground" />
                          )}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {t.highConfidence
                          ? "High confidence (≥70% model precision for this disaster type)"
                          : "Standard confidence"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </td>
                <td className="py-1.5 pr-3 font-mono text-foreground/80">{t.source}</td>
                <td className="py-1.5 pr-3">
                  <span
                    className={
                      t.relation === "causes"
                        ? "text-[oklch(0.52_0.1_258)] font-medium"
                        : "text-[oklch(0.55_0.1_152)] font-medium"
                    }
                  >
                    {t.relation}
                  </span>
                </td>
                <td className="py-1.5 pr-3 font-mono text-foreground/80">{t.target}</td>
                <td className="py-1.5 pr-3">
                  <Link
                    href={`/events/${t.eventId}`}
                    className="text-primary hover:underline font-mono"
                  >
                    {t.eventId}
                  </Link>
                </td>
                <td className="py-1.5 pr-3 text-muted-foreground">{t.disasterType}</td>
                <td className="py-1.5 text-muted-foreground">{t.year}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-muted-foreground">
            {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, allTriplets.length)} of {allTriplets.length} triplets
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs text-muted-foreground tabular-nums">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="p-1 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

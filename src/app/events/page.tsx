"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { fetchEvents } from "@/lib/data";
import type { DisasterEvent } from "@/types";
import PageHeader from "@/components/layout/PageHeader";
import { REGIONS } from "@/lib/regions";
import { ArrowUpDown, ArrowUp, ArrowDown, ExternalLink } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const SEVERITIES = ["", "Low", "Medium", "High"];

type SortKey = "year" | "disasterType" | "country" | "region" | "severity" | "triplets";
type SortDir = "asc" | "desc";

function SortIcon({ col, active, dir }: { col: string; active: boolean; dir: SortDir }) {
  if (!active) return <ArrowUpDown className="w-3 h-3 ml-1 opacity-40" />;
  return dir === "asc"
    ? <ArrowUp className="w-3 h-3 ml-1" />
    : <ArrowDown className="w-3 h-3 ml-1" />;
}

const SEVERITY_ORDER: Record<string, number> = { Low: 0, Medium: 1, High: 2 };

function parseSeverity(s: string): { label: string; detail: string | null } {
  const m = s.match(/^(High|Medium|Low)(.*)?$/i);
  if (m) {
    const raw = m[2]?.trim() ?? "";
    const detail = raw.startsWith("(") && raw.endsWith(")")
      ? raw.slice(1, -1).trim()
      : raw || null;
    return { label: m[1], detail };
  }
  return { label: s, detail: null };
}

export default function EventsPage() {
  return (
    <Suspense
      fallback={
        <div>
          <PageHeader title="Disaster Events" description="Loading events…" />
          <div className="max-w-7xl mx-auto px-6 py-8 space-y-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-12 bg-muted/30 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      }
    >
      <EventsContent />
    </Suspense>
  );
}

function EventsContent() {
  const searchParams = useSearchParams();
  const [events, setEvents] = useState<DisasterEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters — pre-populated from URL params
  const [filterCountry, setFilterCountry] = useState(searchParams.get("country") ?? "");
  const [filterType, setFilterType] = useState(searchParams.get("disasterType") ?? "");
  const [filterRegion, setFilterRegion] = useState(searchParams.get("region") ?? "");
  const [filterSeverity, setFilterSeverity] = useState(searchParams.get("severity") ?? "");
  const [filterYearFrom, setFilterYearFrom] = useState(searchParams.get("yearFrom") ?? "");
  const [filterYearTo, setFilterYearTo] = useState(searchParams.get("yearTo") ?? "");

  const [sortKey, setSortKey] = useState<SortKey>("year");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  useEffect(() => {
    fetchEvents()
      .then(setEvents)
      .finally(() => setLoading(false));
  }, []);

  // Derive unique disaster types for the filter dropdown
  const disasterTypes = useMemo(() => {
    const types = [...new Set(events.map((e) => e.disasterType))].sort();
    return types;
  }, [events]);

  // Apply filters
  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (filterType && e.disasterType !== filterType) return false;
      if (filterRegion && e.region !== filterRegion) return false;
      if (filterSeverity && e.severity !== filterSeverity) return false;
      if (filterCountry) {
        const q = filterCountry.toLowerCase();
        if (!e.country.toLowerCase().includes(q) && !e.countryIso.toLowerCase().includes(q))
          return false;
      }
      if (filterYearFrom && e.year < Number(filterYearFrom)) return false;
      if (filterYearTo && e.year > Number(filterYearTo)) return false;
      return true;
    });
  }, [events, filterType, filterRegion, filterSeverity, filterCountry, filterYearFrom, filterYearTo]);

  // Apply sort
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "year": cmp = a.year - b.year; break;
        case "disasterType": cmp = a.disasterType.localeCompare(b.disasterType); break;
        case "country": cmp = a.country.localeCompare(b.country); break;
        case "region": cmp = a.region.localeCompare(b.region); break;
        case "severity":
          cmp = (SEVERITY_ORDER[a.severity] ?? -1) - (SEVERITY_ORDER[b.severity] ?? -1);
          break;
        case "triplets": cmp = a.triplets.length - b.triplets.length; break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function clearFilters() {
    setFilterCountry("");
    setFilterType("");
    setFilterRegion("");
    setFilterSeverity("");
    setFilterYearFrom("");
    setFilterYearTo("");
  }

  const hasFilters =
    filterCountry || filterType || filterRegion || filterSeverity || filterYearFrom || filterYearTo;

  const severityColor: Record<string, string> = {
    High: "bg-red-100 text-red-700 border-red-200",
    Medium: "bg-amber-100 text-amber-700 border-amber-200",
    Low: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };

  return (
    <div>
      <PageHeader
        title="Disaster Events"
        description={`${loading ? "…" : events.length.toLocaleString()} events from 2014–2024. Filter and explore individual disaster storylines.`}
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filter bar */}
        <div className="bg-card border border-border rounded-xl p-4 mb-6 space-y-3">
          <div className="flex flex-wrap gap-3">
            {/* Country search */}
            <div className="flex flex-col gap-1 min-w-[160px]">
              <label className="text-xs text-muted-foreground font-medium">Country</label>
              <input
                type="text"
                placeholder="Name or ISO code…"
                value={filterCountry}
                onChange={(e) => setFilterCountry(e.target.value)}
                className="h-8 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Disaster type */}
            <div className="flex flex-col gap-1 min-w-[180px]">
              <label className="text-xs text-muted-foreground font-medium">Disaster type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="h-8 rounded-md border border-border bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">All types</option>
                {disasterTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Region */}
            <div className="flex flex-col gap-1 min-w-[200px]">
              <label className="text-xs text-muted-foreground font-medium">Region</label>
              <select
                value={filterRegion}
                onChange={(e) => setFilterRegion(e.target.value)}
                className="h-8 rounded-md border border-border bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">All regions</option>
                {REGIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Severity */}
            <div className="flex flex-col gap-1 min-w-[130px]">
              <label className="text-xs text-muted-foreground font-medium">Severity</label>
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="h-8 rounded-md border border-border bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {SEVERITIES.map((s) => (
                  <option key={s} value={s}>{s || "All severities"}</option>
                ))}
              </select>
            </div>

            {/* Year range */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground font-medium">Year from</label>
              <input
                type="number"
                placeholder="2014"
                min={2014}
                max={2024}
                value={filterYearFrom}
                onChange={(e) => setFilterYearFrom(e.target.value)}
                className="h-8 w-24 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground font-medium">Year to</label>
              <input
                type="number"
                placeholder="2024"
                min={2014}
                max={2024}
                value={filterYearTo}
                onChange={(e) => setFilterYearTo(e.target.value)}
                className="h-8 w-24 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Clear */}
            {hasFilters && (
              <div className="flex flex-col justify-end">
                <button
                  onClick={clearFilters}
                  className="h-8 px-3 rounded-md border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>

          {/* Result count */}
          <p className="text-xs text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{sorted.length.toLocaleString()}</span> of{" "}
            {events.length.toLocaleString()} events
            {hasFilters && " (filtered)"}
          </p>
        </div>

        {/* Table */}
        {loading ? (
          <div className="space-y-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-12 bg-muted/30 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    {(
                      [
                        { key: "year", label: "Year", width: "w-16" },
                        { key: "disasterType", label: "Disaster type", width: "w-44" },
                        { key: "country", label: "Country", width: "w-44" },
                        { key: "region", label: "Region", width: "w-48" },
                        { key: "severity", label: "Severity", width: "w-24" },
                        { key: "triplets", label: "Triplets", width: "w-20" },
                      ] as { key: SortKey; label: string; width: string }[]
                    ).map(({ key, label, width }) => (
                      <th
                        key={key}
                        className={`${width} px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer select-none hover:text-foreground transition-colors`}
                        onClick={() => handleSort(key)}
                      >
                        <span className="flex items-center">
                          {label}
                          <SortIcon col={key} active={sortKey === key} dir={sortDir} />
                        </span>
                      </th>
                    ))}
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                        No events match your filters.
                      </td>
                    </tr>
                  ) : (
                    sorted.map((event) => (
                      <tr
                        key={event.id}
                        className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                      >
                        <td className="px-4 py-3 font-mono text-sm text-muted-foreground">
                          {event.year}
                        </td>
                        <td className="px-4 py-3 font-medium text-foreground">
                          {event.disasterType}
                        </td>
                        <td className="px-4 py-3 text-foreground">{event.country}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">
                          {event.region}
                        </td>
                        <td className="px-4 py-3">
                          {event.severity && event.severity !== "nan" ? (() => {
                            const { label, detail } = parseSeverity(event.severity);
                            const badge = (
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                                  severityColor[label] ??
                                  "bg-muted text-muted-foreground border-border"
                                }`}
                              >
                                {label}
                              </span>
                            );
                            return detail ? (
                              <Tooltip>
                                <TooltipTrigger className="cursor-default focus:outline-none">
                                  {badge}
                                </TooltipTrigger>
                                <TooltipContent side="top">{detail}</TooltipContent>
                              </Tooltip>
                            ) : badge;
                          })() : (
                            <span className="text-xs text-muted-foreground/50">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono text-sm text-muted-foreground">
                          {event.triplets.length}
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/events/${event.id}`}
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            View
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { fetchEvent } from "@/lib/data";
import type { DisasterEvent } from "@/types";
import dynamic from "next/dynamic";
import { ArrowLeft, MapPin, Users, HeartCrack, DollarSign, Newspaper } from "lucide-react";

const ForceGraphViz = dynamic(
  () => import("@/components/charts/ForceGraphViz"),
  { ssr: false }
);

const WorldMapViz = dynamic(
  () => import("@/components/charts/WorldMapViz"),
  { ssr: false }
);

function MetaChip({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <Icon className="w-3.5 h-3.5" />
      <span className="text-xs text-muted-foreground">{label}:</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

function StorylineSection({ title, content }: { title: string; content: string }) {
  if (!content || content === "nan" || content.trim() === "") return null;
  return (
    <div className="bg-card border border-border rounded-xl px-6 py-5">
      <h3 className="text-sm font-semibold text-primary uppercase tracking-wide mb-3">
        {title}
      </h3>
      <p className="text-sm text-foreground/90 leading-relaxed">{content}</p>
    </div>
  );
}

export default function EventPage() {
  const params = useParams();
  const id = params?.id as string;
  const [event, setEvent] = useState<DisasterEvent | null | undefined>(undefined);

  useEffect(() => {
    if (id) fetchEvent(id).then(setEvent);
  }, [id]);

  if (event === undefined) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="h-8 bg-muted/30 rounded w-48 animate-pulse mb-4" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted/30 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
        <p className="text-muted-foreground">Event not found: {id}</p>
        <Link href="/" className="text-primary hover:underline mt-4 block">
          ← Back to overview
        </Link>
      </div>
    );
  }

  const localGraphData = {
    nodes: Array.from(
      new Set(event.triplets.flatMap((t) => [t.source, t.target]))
    ).map((n) => ({
      id: n,
      label: n,
      frequency: event.triplets.filter((t) => t.source === n || t.target === n).length,
      disasterTypes: [event.disasterType],
    })),
    edges: event.triplets.map((t) => ({
      source: t.source,
      target: t.target,
      relation: t.relation,
      weight: 1,
      disasterTypes: [event.disasterType],
    })),
  };

  const dateStr = [
    event.year,
    event.month ? String(event.month).padStart(2, "0") : null,
    event.day ? String(event.day).padStart(2, "0") : null,
  ]
    .filter(Boolean)
    .join("-");

  const mapCountry = event.lat != null
    ? [{ iso: event.countryIso, country: event.country, count: 1, lat: event.lat, lng: event.lng, disasterTypes: [event.disasterType] }]
    : [];

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      {/* Back + breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground flex items-center gap-1 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Overview
        </Link>
        <span>/</span>
        <Link href="/trends" className="hover:text-foreground transition-colors">
          {event.disasterType}
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">{event.country}</span>
        <span>/</span>
        <span className="font-mono text-primary">{event.id}</span>
      </div>

      {/* Header */}
      <div className="bg-card border border-border rounded-xl px-6 py-6">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
            {event.disasterType}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground font-mono">
            {event.id}
          </span>
          {event.severity && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent text-accent-foreground">
              {event.severity}
            </span>
          )}
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-1">
          {event.disasterType} — {event.country}
        </h1>
        <p className="text-muted-foreground text-sm mb-4">
          <MapPin className="w-3.5 h-3.5 inline mr-1" />
          {event.location || event.country} · {dateStr} · {event.region}
        </p>
        <div className="flex flex-wrap gap-4">
          {event.fatalities != null && (
            <MetaChip icon={HeartCrack} label="Fatalities" value={event.fatalities.toLocaleString()} />
          )}
          {event.peopleAffected != null && (
            <MetaChip icon={Users} label="Affected" value={event.peopleAffected.toLocaleString()} />
          )}
          {event.economicLosses && event.economicLosses !== "nan" && (
            <MetaChip icon={DollarSign} label="Economic losses" value={event.economicLosses} />
          )}
          <MetaChip icon={Newspaper} label="News sources" value={String(event.nNews)} />
        </div>
      </div>

      {/* Storyline sections */}
      <div className="space-y-4">
        <StorylineSection title="Key information" content={event.keyInformation} />
        <StorylineSection title="Key drivers" content={event.keyDrivers} />
        <StorylineSection title="Main impacts, exposure and vulnerability" content={event.mainImpacts} />
        <StorylineSection title="Likelihood of multi-hazard risks" content={event.multiHazardRisk} />
        <StorylineSection title="Best practices for managing this risk" content={event.bestPractices} />
        <StorylineSection title="Recommendations and recovery" content={event.recommendations} />
      </div>

      {/* Local causal graph */}
      {event.triplets.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-semibold text-foreground mb-4">
            Causal Knowledge Graph{" "}
            <span className="text-xs font-mono text-muted-foreground ml-1">
              ({event.triplets.length} triplets)
            </span>
          </h2>
          <ForceGraphViz data={localGraphData} width={760} height={520} alwaysShowLabels />
        </div>
      )}

      {/* Map */}
      {mapCountry.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-semibold text-foreground mb-4">Location</h2>
          <WorldMapViz countries={mapCountry} height={280} />
        </div>
      )}

      {/* Raw triplets */}
      {event.triplets.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-semibold text-foreground mb-1">Raw causal triplets</h2>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            These structured <span className="font-medium text-foreground">subject → relation → object</span> statements
            were extracted from news reports about this event using an AI language model. Each triplet
            captures a single causal or preventive relationship — for example,{" "}
            <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">heavy rainfall → causes → flooding</span>.
            The triplets feed the knowledge graph above and are also aggregated into the global causal network
            across all events, powering the Trends and Insights pages.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-left">
                  <th className="py-2 pr-4 font-medium">Source</th>
                  <th className="py-2 pr-4 font-medium">Relation</th>
                  <th className="py-2 font-medium">Target</th>
                </tr>
              </thead>
              <tbody>
                {event.triplets.map((t, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-1.5 pr-4 font-mono text-foreground/80">{t.source}</td>
                    <td className="py-1.5 pr-4">
                      <span className={t.relation === "causes" ? "font-bold text-red-600" : "font-bold text-green-600"}>
                        {t.relation}
                      </span>
                    </td>
                    <td className="py-1.5 font-mono text-foreground/80">{t.target}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";
import type { EvidenceTriplet } from "@/types";

interface Props {
  triplets: EvidenceTriplet[];
  limit?: number;
}

export default function TripletTable({ triplets, limit = 10 }: Props) {
  const shown = triplets.slice(0, limit);

  if (shown.length === 0) return null;

  return (
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
            <tr key={i} className="border-b border-border/50 hover:bg-muted/40 transition-colors">
              <td className="py-1.5 pr-3">
                {t.expertVerified ? (
                  <span title="Expert verified"><CheckCircle2 className="w-3.5 h-3.5 text-[oklch(0.67_0.1_152)]" /></span>
                ) : (
                  <span title="Model generated"><Circle className="w-3.5 h-3.5 text-muted-foreground" /></span>
                )}
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
      {triplets.length > limit && (
        <p className="text-xs text-muted-foreground mt-2">
          Showing {limit} of {triplets.length} retrieved triplets.
        </p>
      )}
    </div>
  );
}

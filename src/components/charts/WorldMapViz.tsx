"use client";

import dynamic from "next/dynamic";
import type { CountryData } from "@/types";

// react-leaflet uses browser APIs — client-only
const LeafletMap = dynamic(() => import("./LeafletMapInner"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full text-muted-foreground text-sm bg-muted/30 rounded-lg">
      Loading map…
    </div>
  ),
});

interface Props {
  countries: CountryData[];
  height?: number;
}

export default function WorldMapViz({ countries, height = 440 }: Props) {
  return <LeafletMap countries={countries} height={height} />;
}

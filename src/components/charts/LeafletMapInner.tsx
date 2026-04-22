"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { CountryData } from "@/types";

interface Props {
  countries: CountryData[];
  height?: number;
}

function bubbleRadius(count: number, max: number): number {
  return Math.max(5, (Math.sqrt(count / max) * 30));
}

export default function LeafletMapInner({ countries, height = 440 }: Props) {
  const router = useRouter();
  const withCoords = countries.filter(
    (c) => c.lat != null && c.lng != null
  ) as (CountryData & { lat: number; lng: number })[];

  const max = Math.max(...withCoords.map((c) => c.count), 1);

  // Fix default Leaflet icon paths broken by webpack
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = require("leaflet");
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  if (withCoords.length === 0) {
    return (
      <div
        className="flex items-center justify-center border border-dashed border-border rounded-lg text-muted-foreground text-sm"
        style={{ height }}
      >
        No geographic data available — run the preprocessing script first.
      </div>
    );
  }

  return (
    <div style={{ height }} className="rounded-lg overflow-hidden border border-border">
      <MapContainer
        center={[20, 10]}
        zoom={2}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
        zoomControl
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          opacity={0.5}
        />
        {withCoords.map((country) => (
          <CircleMarker
            key={country.iso}
            center={[country.lat, country.lng]}
            radius={bubbleRadius(country.count, max)}
            pathOptions={{
              fillColor: "oklch(0.52 0.1 258)",
              color: "oklch(0.4 0.1 258)",
              fillOpacity: 0.55,
              weight: 1,
              className: "cursor-pointer",
            }}
            eventHandlers={{
              click: () => router.push(`/events?country=${country.iso}`),
            }}
          >
            <Tooltip>
              <span className="font-semibold">{country.country}</span>
              <br />
              {country.count} disaster event{country.count !== 1 ? "s" : ""}
              <br />
              <span className="text-muted-foreground text-xs">
                {country.disasterTypes.slice(0, 3).join(", ")}
                {country.disasterTypes.length > 3 && " …"}
              </span>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}

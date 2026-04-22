import type { DisasterEvent, GraphData, InsightsData, Stats, ValidationSummary } from "@/types";

const BASE = "/data";

async function fetchJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}/${path}`);
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`);
  return res.json() as Promise<T>;
}

export async function fetchStats(): Promise<Stats> {
  return fetchJSON<Stats>("stats.json");
}

export async function fetchGraphData(): Promise<GraphData> {
  return fetchJSON<GraphData>("graph_data.json");
}

export async function fetchValidation(): Promise<ValidationSummary> {
  return fetchJSON<ValidationSummary>("validation.json");
}

export async function fetchInsights(): Promise<InsightsData> {
  return fetchJSON<InsightsData>("insights.json");
}

export async function fetchEvents(): Promise<DisasterEvent[]> {
  const data = await fetchJSON<{ events: DisasterEvent[] }>("events.json");
  return data.events;
}

export async function fetchEvent(id: string): Promise<DisasterEvent | null> {
  const events = await fetchEvents();
  return events.find((e) => e.id === id) ?? null;
}

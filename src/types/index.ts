export interface DisasterEvent {
  id: string;
  disasterType: string;
  country: string;
  countryIso: string;
  location: string;
  year: number;
  month: number;
  day: number;
  lat: number | null;
  lng: number | null;
  region: string;
  keyInformation: string;
  severity: string;
  keyDrivers: string;
  mainImpacts: string;
  multiHazardRisk: string;
  bestPractices: string;
  recommendations: string;
  peopleAffected: number | null;
  fatalities: number | null;
  economicLosses: string;
  locations: string[];
  nNews: number;
  triplets: Triplet[];
}

export interface Triplet {
  source: string;
  relation: "causes" | "prevents";
  target: string;
}

export interface GlobalTriplet extends Triplet {
  disasterType: string;
  country: string;
  countryIso: string;
  year: number;
  region: string;
  eventId: string;
}

export interface GraphNode {
  id: string;
  label: string;
  frequency: number;
  disasterTypes: string[];
}

export interface GraphEdge {
  source: string;
  target: string;
  relation: "causes" | "prevents";
  weight: number;
  disasterTypes: string[];
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface HeatmapCell {
  disasterType: string;
  factor: string;
  count: number;
}

export interface CountryData {
  iso: string;
  country: string;
  count: number;
  lat: number | null;
  lng: number | null;
  disasterTypes: string[];
}

export interface Stats {
  totalEvents: number;
  totalTriplets: number;
  totalCountries: number;
  yearRange: [number, number];
  disasterTypes: { name: string; count: number; color: string }[];
  topDrivers: { name: string; count: number }[];
  topImpacts: { name: string; count: number }[];
  heatmapCauses: HeatmapCell[];
  heatmapPrevents: HeatmapCell[];
  byCountry: CountryData[];
  byYear: { year: number; count: number }[];
  byRegion: { region: string; count: number }[];
}

export interface ValidationSummary {
  overallPrecision: number;
  byDisasterType: Record<string, { precision: number; count: number; disputed: number }>;
  byRelation: {
    causes: { precision: number; count: number };
    prevents: { precision: number; count: number };
  };
  topDisputedTriplets: {
    triplet: [string, string, string];
    expertScore: number;
    disasterType: string;
  }[];
  annotatorCount: number;
  totalAnnotated: number;
}

export interface EvidenceTriplet {
  source: string;
  relation: string;
  target: string;
  eventId: string;
  disasterType: string;
  country: string;
  year: number;
  expertVerified: boolean;
}

export interface Insight {
  id: string;
  question: string;
  narrative: string;
  evidenceTriplets: EvidenceTriplet[];
  confidenceScore: number;
  confidenceLabel: "Expert Verified" | "Mixed" | "Model Generated";
  model: string;
  modelVersion: string;
  runTimestamp: string;
  tripletsRetrievedCount: number;
  systemPrompt: string;
  relatedDisasterTypes: string[];
  relatedRegions: string[];
}

export interface InsightsData {
  generatedAt: string;
  model: string;
  modelVersion: string;
  embeddingModel: string;
  topK: number;
  totalApiCalls: number;
  systemPrompt: string;
  insights: Insight[];
}

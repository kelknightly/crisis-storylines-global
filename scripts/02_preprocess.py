"""
02_preprocess.py
Converts raw Zenodo data files into optimised JSON for the crisesStorylines-Nexus web app.

Source data: Ronco et al. (2026) — CC-BY-4.0
DOI: https://doi.org/10.5281/zenodo.18598183

Outputs (all to public/data/):
  events.json          — 1,424 events with decoded IDs and human-readable country names
  triplets_global.json — every causal triplet with event metadata
  graph_data.json      — force-directed graph nodes + edges (with global frequency weights)
  validation.json      — expert annotation summary by disaster type
  stats.json           — aggregated statistics for heatmap, charts, world map
  event_ids.json       — lightweight list of event IDs for static route generation

Run: python scripts/02_preprocess.py
"""

import ast
import json
import math
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

import numpy as np
import pandas as pd
import pycountry
from tqdm import tqdm

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
ROOT = Path(__file__).parent.parent
RAW = ROOT / "data" / "raw"
OUT = ROOT / "public" / "data"
OUT.mkdir(parents=True, exist_ok=True)

# ---------------------------------------------------------------------------
# Region mapping  (UN Geoscheme sub-regions, adjusted to match EM-DAT usage)
# Keys are ISO alpha-3 codes.
# ---------------------------------------------------------------------------
REGION_MAP: dict[str, str] = {}

_REGION_DEFINITIONS: dict[str, list[str]] = {
    "Sub-Saharan Africa": [
        "AGO","BEN","BWA","BFA","BDI","CMR","CPV","CAF","TCD","COM","COD","COG",
        "CIV","DJI","GNQ","ERI","SWZ","ETH","GAB","GMB","GHA","GIN","GNB","KEN",
        "LSO","LBR","MDG","MWI","MLI","MRT","MUS","MOZ","NAM","NER","NGA","RWA",
        "STP","SEN","SLE","SOM","ZAF","SSD","TZA","TGO","UGA","ZMB","ZWE","SHN",
        "REU","MYT","IOT",
    ],
    "North Africa & Middle East": [
        "DZA","EGY","LBY","MAR","SDN","TUN","ESH","BHR","IRQ","IRN","ISR","JOR",
        "KWT","LBN","OMN","PSE","QAT","SAU","SYR","ARE","YEM","TUR","CYP",
    ],
    "South Asia": [
        "AFG","BGD","BTN","IND","MDV","NPL","PAK","LKA",
    ],
    "Southeast Asia": [
        "BRN","KHM","TLS","IDN","LAO","MYS","MMR","PHL","SGP","THA","VNM",
    ],
    "East Asia & Pacific": [
        "CHN","HKG","MAC","MNG","PRK","KOR","JPN","TWN",
        "AUS","FJI","KIR","MHL","FSM","NRU","NZL","PLW","PNG","WSM","SLB","TON",
        "TUV","VUT","COK","NIU","TKL","PYF","NCL","GUM","ASM","MNP",
    ],
    "Central Asia": [
        "KAZ","KGZ","TJK","TKM","UZB","ARM","AZE","GEO",
    ],
    "Europe": [
        "ALB","AND","AUT","BLR","BEL","BIH","BGR","HRV","CZE","DNK","EST","FIN",
        "FRA","DEU","GRC","HUN","ISL","IRL","ITA","XKX","LVA","LIE","LTU","LUX",
        "MLT","MDA","MCO","MNE","NLD","MKD","NOR","POL","PRT","ROU","RUS","SMR",
        "SRB","SVK","SVN","ESP","SWE","CHE","UKR","GBR","VAT",
    ],
    "North America": [
        "CAN","MEX","USA","BMU","GRL",
    ],
    "Latin America & Caribbean": [
        "ARG","ATG","BHS","BLZ","BOL","BRA","BRB","CHL","COL","CRI","CUB","DMA",
        "DOM","ECU","SLV","GRD","GTM","GUY","HTI","HND","JAM","KNA","LCA","VCT",
        "SUR","TTO","URY","VEN","PAN","PRY","NIC","PER","GLP","MTQ","GUF","ABW",
        "CUW","SXM",
    ],
    "Oceania": [
        "FJI","PNG","SLB","VUT","WSM","TON","KIR","FSM","MHL","NRU","PLW","TUV",
        "COK","NIU","TKL","NZL","AUS",
    ],
}

for region, codes in _REGION_DEFINITIONS.items():
    for code in codes:
        REGION_MAP[code] = region

# ---------------------------------------------------------------------------
# Country centroids  (approximate lat/lng, degrees)
# Sourced from open-domain natural earth data; sufficient for bubble markers.
# ---------------------------------------------------------------------------
COUNTRY_CENTROIDS: dict[str, tuple[float, float]] = {
    "AFG": (33.9, 67.7), "AGO": (-11.2, 17.9), "ALB": (41.2, 20.2),
    "ARG": (-38.4, -63.6), "ARM": (40.1, 45.0), "AUS": (-25.3, 133.8),
    "AUT": (47.5, 14.6), "AZE": (40.1, 47.6), "BGD": (23.7, 90.4),
    "BEL": (50.5, 4.5), "BEN": (9.3, 2.3), "BFA": (12.4, -1.6),
    "BGR": (42.7, 25.5), "BIH": (43.9, 17.7), "BOL": (-16.3, -63.6),
    "BRA": (-14.2, -51.9), "BRN": (4.5, 114.7), "BTN": (27.5, 90.4),
    "BWA": (-22.3, 24.7), "CAF": (6.6, 20.9), "CAN": (56.1, -106.3),
    "CHE": (46.8, 8.2), "CHL": (-35.7, -71.5), "CHN": (35.9, 104.2),
    "CIV": (7.5, -5.5), "CMR": (3.9, 11.5), "COD": (-4.0, 21.8),
    "COG": (-0.2, 15.8), "COL": (4.0, -72.0), "COM": (-11.6, 43.3),
    "CPV": (16.0, -24.0), "CRI": (9.7, -83.8), "CUB": (22.0, -79.5),
    "CYP": (35.1, 33.4), "CZE": (49.8, 15.5), "DEU": (51.2, 10.5),
    "DJI": (11.8, 42.6), "DNK": (56.3, 9.5), "DOM": (18.7, -70.2),
    "DZA": (28.0, 1.7), "ECU": (-1.8, -78.2), "EGY": (26.8, 30.8),
    "ERI": (15.2, 39.8), "ESP": (40.5, -3.7), "ETH": (9.1, 40.5),
    "FIN": (64.0, 26.0), "FJI": (-18.0, 178.0), "FRA": (46.2, 2.2),
    "GAB": (-0.8, 11.6), "GBR": (55.4, -3.4), "GEO": (42.3, 43.4),
    "GHA": (7.9, -1.0), "GIN": (9.9, -11.8), "GMB": (13.4, -15.3),
    "GNB": (11.8, -15.2), "GNQ": (1.7, 10.3), "GRC": (39.1, 21.8),
    "GTM": (15.8, -90.2), "GUY": (4.9, -58.9), "HND": (15.2, -86.2),
    "HRV": (45.1, 15.2), "HTI": (18.9, -72.3), "HUN": (47.2, 19.5),
    "IDN": (-0.8, 113.9), "IND": (20.6, 79.0), "IRL": (53.4, -8.2),
    "IRN": (32.4, 53.7), "IRQ": (33.2, 43.7), "ISL": (65.0, -18.0),
    "ISR": (31.5, 34.8), "ITA": (41.9, 12.6), "JAM": (18.1, -77.3),
    "JOR": (30.6, 36.2), "JPN": (36.2, 138.3), "KAZ": (47.2, 67.0),
    "KEN": (-0.0, 37.9), "KGZ": (41.2, 74.8), "KHM": (12.6, 104.9),
    "KOR": (35.9, 127.8), "KWT": (29.3, 47.5), "LAO": (17.9, 102.5),
    "LBN": (33.9, 35.5), "LBR": (6.4, -9.4), "LBY": (26.3, 17.2),
    "LKA": (7.9, 80.7), "LSO": (-29.6, 28.2), "LTU": (55.2, 23.9),
    "LVA": (56.9, 24.6), "MAR": (31.8, -7.1), "MDA": (47.4, 28.4),
    "MDG": (-18.8, 46.9), "MDV": (3.2, 73.2), "MEX": (23.6, -102.6),
    "MKD": (41.6, 21.7), "MLI": (17.6, -2.0), "MMR": (17.1, 96.0),
    "MNG": (46.9, 103.8), "MOZ": (-18.7, 35.5), "MRT": (21.0, -10.9),
    "MWI": (-13.3, 34.3), "MYS": (4.2, 108.0), "NAM": (-22.3, 17.0),
    "NER": (17.6, 8.1), "NGA": (9.1, 8.7), "NIC": (12.9, -85.2),
    "NLD": (52.1, 5.3), "NOR": (60.5, 8.5), "NPL": (28.4, 84.1),
    "NZL": (-42.0, 172.0), "OMN": (21.5, 55.9), "PAK": (30.4, 69.3),
    "PAN": (8.5, -80.8), "PER": (-9.2, -75.0), "PHL": (12.9, 121.8),
    "PNG": (-6.3, 143.9), "POL": (52.1, 19.1), "PRK": (40.3, 127.5),
    "PRT": (39.4, -8.2), "PRY": (-23.4, -58.4), "PSE": (31.9, 35.3),
    "QAT": (25.4, 51.2), "ROU": (45.9, 24.9), "RUS": (61.5, 105.3),
    "RWA": (-2.0, 29.9), "SAU": (23.9, 45.1), "SDN": (15.6, 32.5),
    "SEN": (14.5, -14.5), "SLE": (8.5, -11.8), "SLB": (-9.6, 160.2),
    "SLV": (13.8, -88.9), "SOM": (5.2, 46.2), "SRB": (44.0, 21.0),
    "SSD": (7.9, 29.7), "SUR": (3.9, -56.0), "SVK": (48.7, 19.7),
    "SVN": (46.2, 15.0), "SWE": (60.1, 18.6), "SWZ": (-26.5, 31.5),
    "SYR": (34.8, 38.9), "TCD": (15.5, 18.7), "TGO": (8.6, 0.8),
    "THA": (15.9, 100.9), "TJK": (38.9, 71.3), "TKM": (38.9, 59.6),
    "TLS": (-8.9, 125.7), "TON": (-21.2, -175.2), "TTO": (10.7, -61.2),
    "TUN": (33.9, 9.5), "TUR": (38.9, 35.2), "TWN": (23.7, 121.0),
    "TZA": (-6.4, 35.0), "UGA": (1.4, 32.3), "UKR": (48.4, 31.2),
    "URY": (-32.5, -55.8), "USA": (37.1, -95.7), "UZB": (41.4, 64.6),
    "VEN": (6.4, -66.6), "VNM": (14.1, 108.3), "VUT": (-15.4, 166.9),
    "WSM": (-13.8, -172.1), "YEM": (15.6, 48.5), "ZAF": (-30.6, 22.9),
    "ZMB": (-13.1, 27.9), "ZWE": (-20.0, 30.0),
}

# ---------------------------------------------------------------------------
# Disaster type colour palette (pastel)
# ---------------------------------------------------------------------------
TYPE_COLORS = [
    "#a8c5da", "#8db5a0", "#d4a5a5", "#c5b8d4", "#d4c5a0",
    "#a0c5d4", "#d4b8a0", "#b8d4a0", "#d4a0b8", "#a0b8d4",
    "#c5d4a0", "#d4a0c5",
]


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def parse_triplets(raw: object) -> list[list[str]]:
    """Parse the causal graph cell: a string repr of a list of [src, rel, tgt] lists."""
    if pd.isna(raw) or raw == "" or raw is None:
        return []
    if isinstance(raw, list):
        return raw
    text = str(raw).strip()
    if not text or text.lower() in ("nan", "none", "[]"):
        return []
    try:
        parsed = ast.literal_eval(text)
        if isinstance(parsed, list):
            return [list(t) for t in parsed if isinstance(t, (list, tuple)) and len(t) == 3]
    except (ValueError, SyntaxError):
        pass
    # Fallback: regex extraction of quoted triplets
    matches = re.findall(r'\[([^\[\]]+?),\s*([^\[\]]+?),\s*([^\[\]]+?)\]', text)
    result = []
    for m in matches:
        triple = [s.strip().strip("'\"") for s in m]
        if len(triple) == 3:
            result.append(triple)
    return result


def normalize_node(text: str) -> str:
    """Lowercase, strip, basic normalisation."""
    t = text.lower().strip()
    t = re.sub(r'\s+', ' ', t)
    # Very light singularisation (common endings)
    if t.endswith("ings") and len(t) > 6:
        t = t[:-1]  # e.g. "floodings" → "flooding"
    return t


def iso3_to_country(iso3: str) -> str:
    """Return a full country name from ISO alpha-3 code, or the code itself if not found."""
    try:
        c = pycountry.countries.get(alpha_3=iso3.upper())
        return c.name if c else iso3
    except Exception:
        return iso3


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    print("=" * 60)
    print("crisesStorylines-Nexus: Pre-processing")
    print("=" * 60)

    # -----------------------------------------------------------------------
    # 1. Load raw data
    # -----------------------------------------------------------------------
    story_path = RAW / "DisasterStory.csv"
    emdat_path = RAW / "input_emdat_1424.xlsx"
    val_path = RAW / "triplet_expert_val.xlsx"

    for p in [story_path, emdat_path, val_path]:
        if not p.exists():
            print(f"✗ Missing: {p}")
            print("  Run python scripts/01_download_data.py first.")
            sys.exit(1)

    print("\n[1/6] Loading DisasterStory.csv …")
    df = pd.read_csv(story_path, encoding="utf-8", low_memory=False)
    print(f"  Loaded {len(df):,} events, {len(df.columns)} columns")

    print("[2/6] Loading input_emdat_1424.xlsx …")
    emdat = pd.read_excel(emdat_path)
    print(f"  Loaded {len(emdat):,} EM-DAT records")

    print("[3/6] Loading triplet_expert_val.xlsx …")
    val = pd.read_excel(val_path)
    print(f"  Loaded {len(val):,} expert validation rows")

    # -----------------------------------------------------------------------
    # 2. Merge EM-DAT metadata into main dataframe on DisNo.
    # -----------------------------------------------------------------------
    # Normalise column names before merge
    df.columns = df.columns.str.strip()
    emdat.columns = emdat.columns.str.strip()

    # Select the EM-DAT columns we need (avoid duplicating Disaster Type / Country)
    emdat_cols = ["DisNo.", "ISO", "Start Year", "Start Month", "Start Day",
                  "Latitude", "Longitude", "Total Deaths", "Total Affected",
                  "Total Damage ('000 US$)", "Location"]
    emdat_subset = emdat[[c for c in emdat_cols if c in emdat.columns]].copy()
    emdat_subset = emdat_subset.drop_duplicates(subset=["DisNo."])

    df = df.merge(emdat_subset, on="DisNo.", how="left")
    print(f"  Merged EM-DAT metadata — {df['ISO'].notna().sum():,}/{len(df):,} events matched")

    # -----------------------------------------------------------------------
    # 3. Clean and enrich the main dataframe
    # -----------------------------------------------------------------------
    print("\n[4/6] Parsing causal triplets and building JSON …")

    events: list[dict] = []
    all_triplets: list[dict] = []
    node_freq: Counter = Counter()
    edge_freq: Counter = Counter()
    edge_disaster_types: dict[str, set] = defaultdict(set)
    node_disaster_types: dict[str, set] = defaultdict(set)
    missing_triplet_count = 0

    for _, row in tqdm(df.iterrows(), total=len(df), desc="  Events"):
        dis_no = str(row.get("DisNo.", "")).strip()
        iso = str(row.get("ISO", "")).strip().upper()[:3]
        country_full = iso3_to_country(iso) if iso and iso != "NAN" else str(row.get("Country", ""))
        region = REGION_MAP.get(iso, "Other")
        # Prefer EM-DAT lat/lng; fall back to country centroid
        lat_raw = row.get("Latitude")
        lng_raw = row.get("Longitude")
        if pd.notna(lat_raw) and pd.notna(lng_raw):
            lat, lng = float(lat_raw), float(lng_raw)
        else:
            lat, lng = COUNTRY_CENTROIDS.get(iso, (None, None))

        # Dates — prefer EM-DAT Start Year/Month/Day, fall back to start_dt
        if pd.notna(row.get("Start Year")):
            year = int(row["Start Year"])
            month = int(row["Start Month"]) if pd.notna(row.get("Start Month")) else 0
            day = int(row["Start Day"]) if pd.notna(row.get("Start Day")) else 0
        else:
            try:
                from datetime import datetime
                dt = datetime.strptime(str(row.get("start_dt", ""))[:10], "%Y-%m-%d")
                year, month, day = dt.year, dt.month, dt.day
            except Exception:
                year, month, day = 0, 0, 0
        disaster_type = str(row.get("Disaster Type", "Unknown")).strip()

        # Parse triplets
        raw_graph = row.get("llama graph", row.get("causal graph", row.get("Causal graph", row.get("causal_graph", ""))))
        triplets_raw = parse_triplets(raw_graph)

        if not triplets_raw:
            missing_triplet_count += 1

        event_triplets = []
        for t in triplets_raw:
            src = normalize_node(str(t[0]))
            rel = str(t[1]).strip().lower()
            tgt = normalize_node(str(t[2]))
            if rel not in ("causes", "prevents"):
                rel = "causes"  # Default for ambiguous relations
            if not src or not tgt:
                continue

            event_triplets.append({"source": src, "relation": rel, "target": tgt})
            all_triplets.append({
                "source": src,
                "relation": rel,
                "target": tgt,
                "disasterType": disaster_type,
                "country": country_full,
                "countryIso": iso,
                "year": year,
                "region": region,
                "eventId": dis_no,
            })

            # Frequency tracking
            node_freq[src] += 1
            node_freq[tgt] += 1
            edge_key = f"{src}|||{rel}|||{tgt}"
            edge_freq[edge_key] += 1
            edge_disaster_types[edge_key].add(disaster_type)
            node_disaster_types[src].add(disaster_type)
            node_disaster_types[tgt].add(disaster_type)

        # Locations list
        locs_raw = row.get("Locations", row.get("Location", ""))
        locations = [l.strip() for l in str(locs_raw).split(",") if l.strip() and str(locs_raw) != "nan"]

        def safe_int(v: object) -> int | None:
            try:
                val_f = float(str(v).replace(",", ""))
                return int(val_f) if not math.isnan(val_f) else None
            except Exception:
                return None

        events.append({
            "id": dis_no,
            "disasterType": disaster_type,
            "country": country_full,
            "countryIso": iso,
            "location": str(row.get("Location", "")).strip(),
            "year": year,
            "month": month,
            "day": day,
            "lat": lat,
            "lng": lng,
            "region": region,
            "keyInformation": str(row.get("key information", "")).strip(),
            "severity": str(row.get("severity", "")).strip(),
            "keyDrivers": str(row.get("key drivers", "")).strip(),
            "mainImpacts": str(row.get("main impacts, exposure, and vulnerability", "")).strip(),
            "multiHazardRisk": str(row.get("likelihood of multi-hazard risks", "")).strip(),
            "bestPractices": str(row.get("best practices for managing this risk", "")).strip(),
            "recommendations": str(row.get("recommendations and supportive measures for recovery", "")).strip(),
            "peopleAffected": safe_int(row.get("Total Affected")),
            "fatalities": safe_int(row.get("Total Deaths")),
            "economicLosses": str(row.get("Total Damage ('000 US$)", "")).strip(),
            "locations": locations,
            "nNews": safe_int(row.get("nNews")) or 0,
            "triplets": event_triplets,
        })

    print(f"  Parsed {len(all_triplets):,} triplets from {len(events):,} events")
    print(f"  {missing_triplet_count} events had no parseable causal graph")

    # -----------------------------------------------------------------------
    # 3. Build graph_data.json
    # -----------------------------------------------------------------------
    # Limit to top-N nodes by frequency for a usable graph
    TOP_NODES = 200
    top_node_ids = {n for n, _ in node_freq.most_common(TOP_NODES)}

    graph_nodes = [
        {
            "id": node,
            "label": node,
            "frequency": freq,
            "disasterTypes": list(node_disaster_types.get(node, set())),
        }
        for node, freq in node_freq.most_common(TOP_NODES)
    ]

    graph_edges = []
    for edge_key, freq in edge_freq.items():
        parts = edge_key.split("|||")
        if len(parts) != 3:
            continue
        src, rel, tgt = parts
        if src in top_node_ids and tgt in top_node_ids:
            graph_edges.append({
                "source": src,
                "target": tgt,
                "relation": rel,
                "weight": freq,
                "disasterTypes": list(edge_disaster_types.get(edge_key, set())),
            })

    # -----------------------------------------------------------------------
    # 4. Build validation.json from expert annotations
    # -----------------------------------------------------------------------
    print("[5/6] Processing expert validation data …")
    val.columns = val.columns.str.strip()

    # Detect annotation columns (those with numeric values for expert scores)
    # The file has triplets + N annotator columns (binary: 1=correct, 0=incorrect)
    numeric_cols = val.select_dtypes(include=[np.number]).columns.tolist()
    expert_cols = [c for c in numeric_cols if c not in ("year", "Year", "start_year")]

    # Detect triplet component columns
    source_col = next((c for c in val.columns if "source" in c.lower() or c.lower() == "subject"), None)
    rel_col = next((c for c in val.columns if "relat" in c.lower() or "predic" in c.lower()), None)
    target_col = next((c for c in val.columns if "target" in c.lower() or "object" in c.lower()), None)
    type_col = next((c for c in val.columns if "disaster" in c.lower() or "type" in c.lower()), None)

    val_precision_overall: float = 0.0
    by_type: dict[str, dict] = {}
    top_disputed: list[dict] = []

    if expert_cols:
        scores = val[expert_cols].apply(pd.to_numeric, errors="coerce")
        val["mean_score"] = scores.mean(axis=1)
        val_precision_overall = float(val["mean_score"].mean())

        if type_col:
            for dtype, grp in val.groupby(type_col):
                precision = float(grp["mean_score"].mean()) if not grp["mean_score"].isna().all() else 0.0
                disputed = int((grp["mean_score"] < 0.5).sum())
                by_type[str(dtype)] = {
                    "precision": round(precision, 3),
                    "count": len(grp),
                    "disputed": disputed,
                }

        # Top disputed (lowest expert agreement)
        disputed_df = val.nsmallest(20, "mean_score") if "mean_score" in val.columns else val.head(0)
        for _, r in disputed_df.iterrows():
            src = str(r.get(source_col, "")) if source_col else ""
            rel = str(r.get(rel_col, "")) if rel_col else ""
            tgt = str(r.get(target_col, "")) if target_col else ""
            if src and tgt:
                top_disputed.append({
                    "triplet": [src, rel, tgt],
                    "expertScore": round(float(r.get("mean_score", 0.0)), 3),
                    "disasterType": str(r.get(type_col, "")) if type_col else "",
                })

    validation_out = {
        "overallPrecision": round(val_precision_overall, 3),
        "byDisasterType": by_type,
        "byRelation": {
            "causes": {
                "precision": round(
                    float(val.loc[val[rel_col].str.lower().str.contains("cause", na=False), "mean_score"].mean())
                    if rel_col and expert_cols and val[rel_col].str.lower().str.contains("cause", na=False).any()
                    else val_precision_overall,
                    3,
                ),
                "count": len([t for t in all_triplets if t["relation"] == "causes"]),
            },
            "prevents": {
                "precision": round(
                    float(val.loc[val[rel_col].str.lower().str.contains("prevent", na=False), "mean_score"].mean())
                    if rel_col and expert_cols and val[rel_col].str.lower().str.contains("prevent", na=False).any()
                    else val_precision_overall,
                    3,
                ),
                "count": len([t for t in all_triplets if t["relation"] == "prevents"]),
            },
        },
        "topDisputedTriplets": top_disputed,
        "annotatorCount": len(expert_cols),
        "totalAnnotated": len(val),
    }

    # -----------------------------------------------------------------------
    # 5. Build stats.json
    # -----------------------------------------------------------------------
    print("[6/6] Computing aggregated statistics …")

    # Disaster type distribution
    type_counts = Counter(e["disasterType"] for e in events)
    disaster_types_out = [
        {"name": k, "count": v, "color": TYPE_COLORS[i % len(TYPE_COLORS)]}
        for i, (k, v) in enumerate(type_counts.most_common())
    ]

    # Top 30 causal drivers (source nodes in "causes" relations)
    driver_freq: Counter = Counter()
    impact_freq: Counter = Counter()
    for t in all_triplets:
        if t["relation"] == "causes":
            driver_freq[t["source"]] += 1
            impact_freq[t["target"]] += 1

    top_drivers = [{"name": k, "count": v} for k, v in driver_freq.most_common(30)]
    top_impacts = [{"name": k, "count": v} for k, v in impact_freq.most_common(30)]

    # Heatmap: disaster type × top driver
    TOP_HEATMAP_FACTORS = 20
    heatmap_drivers = [d["name"] for d in top_drivers[:TOP_HEATMAP_FACTORS]]
    heatmap_impacts = [d["name"] for d in top_impacts[:TOP_HEATMAP_FACTORS]]
    heatmap_causes: list[dict] = []
    heatmap_prevents: list[dict] = []

    cause_cells: Counter = Counter()
    prevent_cells: Counter = Counter()
    for t in all_triplets:
        if t["relation"] == "causes" and t["source"] in heatmap_drivers:
            cause_cells[(t["disasterType"], t["source"])] += 1
        elif t["relation"] == "prevents" and t["source"] in heatmap_impacts:
            prevent_cells[(t["disasterType"], t["source"])] += 1

    for (dtype, factor), cnt in cause_cells.items():
        heatmap_causes.append({"disasterType": dtype, "factor": factor, "count": cnt})
    for (dtype, factor), cnt in prevent_cells.items():
        heatmap_prevents.append({"disasterType": dtype, "factor": factor, "count": cnt})

    # Country-level aggregation for world map
    country_agg: dict[str, dict] = {}
    for e in events:
        iso = e["countryIso"]
        if iso not in country_agg:
            country_agg[iso] = {
                "iso": iso,
                "country": e["country"],
                "count": 0,
                "lat": e.get("lat"),
                "lng": e.get("lng"),
                "disasterTypes": set(),
            }
        country_agg[iso]["count"] += 1
        country_agg[iso]["disasterTypes"].add(e["disasterType"])

    by_country = []
    for d in country_agg.values():
        d["disasterTypes"] = list(d["disasterTypes"])
        by_country.append(d)
    by_country.sort(key=lambda x: x["count"], reverse=True)

    # Year distribution
    year_counts = Counter(e["year"] for e in events if e["year"] > 0)
    by_year = [{"year": y, "count": c} for y, c in sorted(year_counts.items())]

    # Region distribution
    region_counts = Counter(e["region"] for e in events)
    by_region = [{"region": r, "count": c} for r, c in region_counts.most_common()]

    stats_out = {
        "totalEvents": len(events),
        "totalTriplets": len(all_triplets),
        "totalCountries": len(country_agg),
        "yearRange": [min(year_counts) if year_counts else 2014, max(year_counts) if year_counts else 2024],
        "disasterTypes": disaster_types_out,
        "topDrivers": top_drivers,
        "topImpacts": top_impacts,
        "heatmapCauses": heatmap_causes,
        "heatmapPrevents": heatmap_prevents,
        "byCountry": by_country,
        "byYear": by_year,
        "byRegion": by_region,
    }

    # -----------------------------------------------------------------------
    # 6. Write all JSON files
    # -----------------------------------------------------------------------
    files = {
        "events.json": {"events": events},
        "triplets_global.json": {"triplets": all_triplets},
        "graph_data.json": {"nodes": graph_nodes, "edges": graph_edges},
        "validation.json": validation_out,
        "stats.json": stats_out,
        "event_ids.json": {"ids": [e["id"] for e in events]},
    }

    for filename, data in files.items():
        path = OUT / filename
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
        size_kb = path.stat().st_size / 1024
        print(f"  ✓ {filename} ({size_kb:.0f} KB)")

    print("\n" + "=" * 60)
    print(f"✓ Pre-processing complete. Files written to: {OUT.resolve()}")
    print("  Next step: python scripts/03_generate_insights.py")


if __name__ == "__main__":
    main()

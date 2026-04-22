"""
03_generate_insights.py
Generates pre-computed AI insights using LanceDB (semantic search) and Gemini.

This script runs ONCE offline. All AI-generated outputs are stored in public/data/insights.json
and served statically — no runtime LLM calls occur in the web application.

Requirements:
  - GEMINI_API_KEY set in environment or .env file
  - public/data/triplets_global.json must exist (run 02_preprocess.py first)

LLM: gemini-2.5-flash (Google AI Studio)
Embeddings: sentence-transformers/all-MiniLM-L6-v2
Retrieval: LanceDB (in-memory, no persistence needed)

Run: python scripts/03_generate_insights.py
"""

import json
import os
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

import lancedb
import numpy as np
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
from tqdm import tqdm

load_dotenv()

try:
    from google import genai
    from google.genai import types as genai_types
except ImportError:
    print("✗ google-genai package not installed. Run: pip install google-genai")
    sys.exit(1)

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
ROOT = Path(__file__).parent.parent
DATA_DIR = ROOT / "public" / "data"
MODEL_NAME = "gemini-2.5-flash"
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
TOP_K = 100
MAX_TOKENS = 8192

SYSTEM_PROMPT = (
    "You are an expert in Disaster Risk Management and global hazard analysis. "
    "You are analysing data from the crisesStorylinesRAG dataset (Ronco et al., 2026), "
    "which contains causal knowledge graph triplets extracted from 10 years (2014–2024) "
    "of global disaster news using large language models.\n\n"
    "Your task is to answer the question using ONLY the retrieved triplets and evidence "
    "provided in the context. Do not make claims that are not supported by the data. "
    "If the evidence is insufficient for a strong conclusion, say so explicitly.\n\n"
    "Structure your response as 2–3 clear paragraphs of clear, precise prose. "
    "Reference specific causal relationships from the triplets where relevant. "
    "Be precise about geographic scope, disaster type, and time period. "
    "Do not hallucinate beyond what the data shows."
)

# ---------------------------------------------------------------------------
# Pre-defined insight questions
# These are the 12 questions that will be answered once and stored statically.
# ---------------------------------------------------------------------------
QUESTIONS = [
    {
        "id": "insight_01",
        "question": "What are the most common human-caused drivers of floods globally?",
        "filter": {"disasterType": "Flood", "relation": "causes"},
    },
    {
        "id": "insight_02",
        "question": "How do the primary causal drivers of floods in Southeast Asia compare to those in Europe?",
        "filter": {"disasterType": "Flood"},
    },
    {
        "id": "insight_03",
        "question": "What are the most repeated failure points in disaster response across all disaster types?",
        "filter": {},
    },
    {
        "id": "insight_04",
        "question": "What prevention and early warning measures are most commonly cited across all disaster types?",
        "filter": {"relation": "prevents"},
    },
    {
        "id": "insight_05",
        "question": "What secondary hazards and cascade effects are most commonly triggered by earthquakes?",
        "filter": {"disasterType": "Earthquake"},
    },
    {
        "id": "insight_06",
        "question": "What are the primary causal chains in wildfire events, and how do climate and human factors interact?",
        "filter": {"disasterType": "Wildfire"},
    },
    {
        "id": "insight_07",
        "question": "What factors most commonly drive population displacement and forced migration in disaster events?",
        "filter": {},
    },
    {
        "id": "insight_08",
        "question": "What are the most common drivers of high economic losses in disaster events?",
        "filter": {},
    },
    {
        "id": "insight_09",
        "question": "How effective are early warning systems in preventing casualties, according to the causal triplet data?",
        "filter": {},
    },
    {
        "id": "insight_10",
        "question": "What patterns emerge in drought and food insecurity causal chains across Sub-Saharan Africa?",
        "filter": {"disasterType": "Drought"},
    },
    {
        "id": "insight_11",
        "question": "What structural and governance factors most commonly appear as root causes across all disaster types?",
        "filter": {},
    },
    {
        "id": "insight_12",
        "question": "What does the data reveal about climate change as a driver across different disaster types and regions?",
        "filter": {},
    },
]

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def load_triplets() -> list[dict]:
    path = DATA_DIR / "triplets_global.json"
    if not path.exists():
        print(f"✗ {path} not found. Run 02_preprocess.py first.")
        sys.exit(1)
    with open(path) as f:
        data = json.load(f)
    return data.get("triplets", [])


def load_validation() -> dict:
    path = DATA_DIR / "validation.json"
    if not path.exists():
        return {}
    with open(path) as f:
        return json.load(f)


def triplet_to_text(t: dict) -> str:
    """Convert a triplet dict to a text chunk for embedding."""
    return (
        f"{t['source']} {t['relation']} {t['target']} "
        f"[{t['disasterType']}, {t['country']}, {t.get('region', '')}, {t['year']}]"
    )


def get_confidence_label(score: float) -> str:
    if score >= 0.75:
        return "Expert Verified"
    elif score >= 0.50:
        return "Mixed"
    else:
        return "Model Generated"


def retrieve_triplets(
    query: str,
    table,
    embedder: SentenceTransformer,
    all_triplets: list[dict],
    top_k: int = TOP_K,
    filter_dict: dict | None = None,
) -> list[dict]:
    """Embed query, search LanceDB, return top-k matching triplets."""
    q_emb = embedder.encode([query])[0].tolist()
    # Over-fetch generously: filtered queries need more candidates to find top_k matches
    fetch_limit = top_k * 20 if filter_dict else top_k * 5
    results = table.search(q_emb).limit(fetch_limit).to_list()

    retrieved = []
    seen = set()
    for r in results:
        idx = r.get("idx")
        if idx is None or idx >= len(all_triplets):
            continue
        t = all_triplets[idx]

        # Apply optional filter
        if filter_dict:
            dtype_filter = filter_dict.get("disasterType")
            rel_filter = filter_dict.get("relation")
            if dtype_filter and t["disasterType"].lower() != dtype_filter.lower():
                continue
            if rel_filter and t["relation"] != rel_filter:
                continue

        key = f"{t['source']}|||{t['relation']}|||{t['target']}"
        if key not in seen:
            seen.add(key)
            retrieved.append(t)
        if len(retrieved) >= top_k:
            break

    # If filtered results are sparse, fall back to unfiltered
    if len(retrieved) < 5 and filter_dict:
        return retrieve_triplets(query, table, embedder, all_triplets, top_k, None)

    return retrieved


def build_context(triplets: list[dict]) -> str:
    lines = []
    for i, t in enumerate(triplets, 1):
        lines.append(
            f"{i}. [{t['disasterType']} | {t['country']} | {t['year']} | Event: {t['eventId']}] "
            f"{t['source']} → {t['relation']} → {t['target']}"
        )
    return "\n".join(lines)


def call_gemini(client: "genai.Client", question: str, context: str) -> str:
    user_msg = f"Context (retrieved causal triplets from crisesStorylinesRAG dataset):\n\n{context}\n\nQuestion: {question}"
    for attempt in range(5):
        try:
            response = client.models.generate_content(
                model=MODEL_NAME,
                contents=user_msg,
                config=genai_types.GenerateContentConfig(
                    system_instruction=SYSTEM_PROMPT,
                    max_output_tokens=MAX_TOKENS,
                ),
            )
            return response.text
        except Exception as e:
            if "503" in str(e) or "UNAVAILABLE" in str(e):
                wait = 10 * (2 ** attempt)
                print(f"    ⚠ 503 on attempt {attempt + 1}, retrying in {wait}s…")
                time.sleep(wait)
            else:
                raise
    raise RuntimeError("Gemini API unavailable after 5 retries")


def cross_ref_validation(triplets: list[dict], val_data: dict) -> tuple[float, str]:
    """Estimate confidence from expert validation data based on disaster types in retrieved triplets."""
    if not val_data:
        return 0.5, "Model Generated"

    by_type = val_data.get("byDisasterType", {})
    overall = val_data.get("overallPrecision", 0.5)
    if not triplets:
        return overall, get_confidence_label(overall)

    relevant_scores = []
    for t in triplets:
        dtype = t.get("disasterType", "")
        if dtype in by_type:
            relevant_scores.append(by_type[dtype]["precision"])

    score = float(np.mean(relevant_scores)) if relevant_scores else overall
    return round(score, 3), get_confidence_label(score)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    print("=" * 60)
    print("crisesStorylines-Nexus: Insight Generation")
    print(f"Model: {MODEL_NAME}")
    print(f"Embeddings: {EMBEDDING_MODEL}")
    print(f"Questions: {len(QUESTIONS)}")
    print("=" * 60)

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("\n✗ GEMINI_API_KEY not set.")
        print("  Create a .env file with: GEMINI_API_KEY=your-key-here")
        sys.exit(1)

    gemini_client = genai.Client(api_key=api_key)

    # Load data
    print("\nLoading triplets …")
    all_triplets = load_triplets()
    print(f"  {len(all_triplets):,} triplets loaded")

    val_data = load_validation()

    # Build embeddings + LanceDB index
    print(f"\nBuilding embeddings with {EMBEDDING_MODEL} …")
    embedder = SentenceTransformer(EMBEDDING_MODEL)

    texts = [triplet_to_text(t) for t in tqdm(all_triplets, desc="  Embedding")]
    embeddings = embedder.encode(texts, show_progress_bar=True, batch_size=256)

    print("  Indexing into LanceDB …")
    db = lancedb.connect("memory://")

    table_data = [
        {"idx": i, "vector": emb.tolist(), "text": texts[i]}
        for i, emb in enumerate(embeddings)
    ]
    table = db.create_table("triplets", data=table_data)
    print(f"  ✓ Indexed {len(table_data):,} vectors")

    # Generate insights
    run_ts = datetime.now(timezone.utc).isoformat()

    # Load any existing insights so successful ones can be skipped on re-run
    out_path = DATA_DIR / "insights.json"
    existing_by_id: dict = {}
    if out_path.exists():
        try:
            with open(out_path) as f:
                existing = json.load(f)
            for item in existing.get("insights", []):
                if item.get("tripletsRetrievedCount", 0) > 0 and len(item.get("narrative", "")) > 50:
                    existing_by_id[item["id"]] = item
            if existing_by_id:
                print(f"  ↩ Skipping {len(existing_by_id)} already-successful insight(s)\n")
        except Exception:
            pass

    insights_out = []
    total_api_calls = 0

    print(f"\nGenerating {len(QUESTIONS)} insights …\n")
    for q in QUESTIONS:
        print(f"  [{q['id']}] {q['question'][:70]}…")

        # Skip if already generated successfully
        if q["id"] in existing_by_id:
            insights_out.append(existing_by_id[q["id"]])
            print(f"    ↩ skipped (already successful)")
            continue

        try:
            retrieved = retrieve_triplets(
                q["question"], table, embedder, all_triplets,
                TOP_K, q.get("filter")
            )
            context = build_context(retrieved)
            narrative = call_gemini(gemini_client, q["question"], context)
            total_api_calls += 1

            confidence_score, confidence_label = cross_ref_validation(retrieved, val_data)

            evidence = []
            for t in retrieved:
                dtype = t.get("disasterType", "")
                type_val = val_data.get("byDisasterType", {}).get(dtype, {})
                precision = type_val.get("precision", val_data.get("overallPrecision", 0.5))
                evidence.append({
                    "source": t["source"],
                    "relation": t["relation"],
                    "target": t["target"],
                    "eventId": t["eventId"],
                    "disasterType": t["disasterType"],
                    "country": t["country"],
                    "year": t["year"],
                    "expertVerified": precision >= 0.7,
                })

            # Collect unique disaster types and regions from evidence
            related_types = list({e["disasterType"] for e in evidence})
            related_regions = list({t.get("region", "") for t in retrieved if t.get("region")})

            insights_out.append({
                "id": q["id"],
                "question": q["question"],
                "narrative": narrative,
                "evidenceTriplets": evidence,
                "confidenceScore": confidence_score,
                "confidenceLabel": confidence_label,
                "model": MODEL_NAME,
                "modelVersion": MODEL_NAME,
                "runTimestamp": run_ts,
                "tripletsRetrievedCount": len(retrieved),
                "relatedDisasterTypes": related_types,
                "relatedRegions": related_regions,
            })
            print(f"    ✓ {len(retrieved)} triplets retrieved, confidence: {confidence_label} ({confidence_score})")

        except Exception as e:
            print(f"    ✗ Failed: {e}")
            insights_out.append({
                "id": q["id"],
                "question": q["question"],
                "narrative": "Insight generation unavailable.",
                "evidenceTriplets": [],
                "confidenceScore": 0.0,
                "confidenceLabel": "Model Generated",
                "model": MODEL_NAME,
                "modelVersion": MODEL_NAME,
                "runTimestamp": run_ts,
                "tripletsRetrievedCount": 0,
                "relatedDisasterTypes": [],
                "relatedRegions": [],
            })

    # Write output
    output = {
        "generatedAt": run_ts,
        "model": MODEL_NAME,
        "modelVersion": MODEL_NAME,
        "embeddingModel": EMBEDDING_MODEL,
        "topK": TOP_K,
        "totalApiCalls": total_api_calls,
        "insights": insights_out,
    }

    out_path = DATA_DIR / "insights.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    size_kb = out_path.stat().st_size / 1024
    print(f"\n✓ insights.json written ({size_kb:.0f} KB) — {len(insights_out)} insights, {total_api_calls} API calls")
    print(f"  Path: {out_path.resolve()}")
    print("\nNext step: npm run build")


if __name__ == "__main__":
    main()

"""
01_download_data.py
Downloads the three source files from Zenodo for the crisesStorylines-Nexus dashboard.

Source: Ronco et al. (2026), Zenodo. https://doi.org/10.5281/zenodo.18598183
License: CC-BY-4.0

Run: python scripts/01_download_data.py
"""

import os
import sys
import requests
from tqdm import tqdm
from pathlib import Path

# ---------------------------------------------------------------------------
# File registry — direct download URLs from Zenodo record 18598183
# ---------------------------------------------------------------------------
FILES = [
    {
        "name": "DisasterStory.csv",
        "url": "https://zenodo.org/records/18598183/files/DisasterStory.csv?download=1",
        "description": "Main results: 1,424 disaster events with storylines and causal knowledge graph triplets",
    },
    {
        "name": "triplet_expert_val.xlsx",
        "url": "https://zenodo.org/records/18598183/files/triplet_expert_val.xlsx?download=1",
        "description": "Ground truth: 1,000 triplets annotated by 6 independent disaster-management experts",
    },
    {
        "name": "input_emdat_1424.xlsx",
        "url": "https://zenodo.org/records/18598183/files/input_emdat_1424.xlsx?download=1",
        "description": "Event metadata: EM-DAT seed data (2014–2024) with disaster type, country, ISO codes",
    },
]

# Fallback mirror for DisasterStory.csv (JRC Open Data FTP)
FALLBACK_DISASTER_STORY = (
    "https://jeodpp.jrc.ec.europa.eu/ftp/jrc-opendata/ETOHA/storylines/DisasterStory.csv"
)

OUTPUT_DIR = Path(__file__).parent.parent / "data" / "raw"


def download_file(url: str, dest: Path, description: str) -> bool:
    """Download a single file with a progress bar. Returns True on success."""
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists():
        print(f"  ✓ Already exists: {dest.name} — skipping")
        return True

    print(f"\n  Downloading: {dest.name}")
    print(f"  {description}")
    try:
        response = requests.get(url, stream=True, timeout=120)
        response.raise_for_status()
        total = int(response.headers.get("content-length", 0))
        with open(dest, "wb") as f, tqdm(
            total=total,
            unit="B",
            unit_scale=True,
            unit_divisor=1024,
            desc=dest.name,
            leave=False,
        ) as bar:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
                bar.update(len(chunk))
        print(f"  ✓ Saved: {dest}")
        return True
    except requests.RequestException as e:
        print(f"  ✗ Failed: {e}")
        if dest.exists():
            dest.unlink()
        return False


def main() -> None:
    print("=" * 60)
    print("crisesStorylines-Nexus: Data Download")
    print("Source: Ronco et al. (2026) — CC-BY-4.0")
    print("DOI: https://doi.org/10.5281/zenodo.18598183")
    print("=" * 60)

    errors = []
    for file_info in FILES:
        dest = OUTPUT_DIR / file_info["name"]
        ok = download_file(file_info["url"], dest, file_info["description"])

        # Fallback for DisasterStory.csv
        if not ok and file_info["name"] == "DisasterStory.csv":
            print(f"  Trying fallback URL (JRC FTP)…")
            ok = download_file(FALLBACK_DISASTER_STORY, dest, file_info["description"])

        if not ok:
            errors.append(file_info["name"])

    print("\n" + "=" * 60)
    if errors:
        print(f"✗ {len(errors)} file(s) failed to download: {', '.join(errors)}")
        print("  Check your internet connection and retry.")
        sys.exit(1)
    else:
        print(f"✓ All files downloaded to: {OUTPUT_DIR.resolve()}")
        print("  Next step: python scripts/02_preprocess.py")


if __name__ == "__main__":
    main()

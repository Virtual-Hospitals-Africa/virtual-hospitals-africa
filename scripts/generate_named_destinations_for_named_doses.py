#!/usr/bin/env python3
"""
Scans the Adult Hospital Level EML PDF and adds named destinations for each
disorder, so that links like ...pdf#1.2.3 jump to the right section.

Section headers are identified by grey-background filled rectangles containing
bold text that starts with the disorder number.
"""

import fitz       # PyMuPDF
import pikepdf
import json
import re
import sys
from pathlib import Path

REPO_ROOT  = Path(__file__).parent.parent
JSON_PATH  = REPO_ROOT / "backend/recommended_doses/parsed/recommended_doses.json"
PDF_INPUT  = REPO_ROOT / "static/medical-resources/za/eml/Hospital-Level-Adults-Standard-Treatment-Guidelines-and-EMP-6th-Edition-2024.pdf"
PDF_OUTPUT = REPO_ROOT / "static/medical-resources/za/eml/named-destinations/Hospital-Level-Adults-Standard-Treatment-Guidelines-and-EMP-6th-Edition-2024.pdf"

# ── Load JSON, collect unique disorders ───────────────────────────────────────

with open(JSON_PATH) as f:
    data = json.load(f)

unique_disorders: dict[str, str] = {}   # disorder_number -> disorder_name
for entry in data:
    if entry.get("publication") != "Adult Hospital Level":
        continue
    num = entry.get("disorder_number")
    if num is None:
        continue
    num = num.rstrip(".")   # some entries have trailing dots e.g. "20.12.1.1."
    if num not in unique_disorders:
        unique_disorders[num] = entry["disorder"]

print(unique_disorders)
disorder_numbers = set(unique_disorders)
print(f"Scanning for {len(unique_disorders)} unique disorders in PDF…")

# ── Phase 1: scan PDF for grey-background section headers ────────────────────

doc = fitz.open(PDF_INPUT)
found: dict[str, tuple[int, float, float]] = {}   # num -> (page_num, grey_y0, page_height)
not_found = set(disorder_numbers)

for page_num in range(len(doc)):
    page = doc[page_num]

    # Collect meaningful grey filled rectangles (section-header backgrounds).
    # Grey = all three RGB components between 0.5 and 0.98, rect of useful size.
    grey_rects = [
        d["rect"]
        for d in page.get_drawings()
        if (fill := d.get("fill"))
        and len(fill) == 3
        and all(0.5 < c < 0.98 for c in fill)
        and d["rect"].width > 50
        and d["rect"].height > 3
    ]

    if not grey_rects:
        continue

    for block in page.get_text("dict")["blocks"]:
        if block["type"] != 0:   # text block
            continue
        for line in block["lines"]:
            for span in line["spans"]:
                if not (span["flags"] & 16):   # bold flag
                    continue
                text = span["text"].strip()
                m = re.match(r"^(\d+\.\d+(?:\.\d+)*)\b", text)
                if not m:
                    continue
                num = m.group(1)
                if num not in disorder_numbers or num in found:
                    continue
                span_rect = fitz.Rect(span["bbox"])
                for grey_rect in grey_rects:
                    if grey_rect.intersects(span_rect):
                        found[num] = (page_num, grey_rect.y0, page.rect.height)
                        not_found.discard(num)
                        break

doc.close()

print(f"Found {len(found)} / {len(unique_disorders)} disorders")

# ── Phase 2: write output PDF with named destinations ─────────────────────────

PDF_OUTPUT.parent.mkdir(parents=True, exist_ok=True)

def sort_key(num: str) -> list:
    parts = []
    for x in num.split("."):
        try:
            parts.append(int(x))
        except ValueError:
            parts.append(x)
    return parts

with pikepdf.open(PDF_INPUT) as pdf:
    dests_array = pikepdf.Array()

    for num in sorted(found, key=sort_key):
        page_num, fitz_y, page_height = found[num]
        pdf_y = float(page_height - fitz_y)   # PDF coords are bottom-up

        dest = pikepdf.Array([
            pdf.pages[page_num].obj,
            pikepdf.Name("/XYZ"),
            None,               # x: keep current
            pikepdf.Real(pdf_y),
            None,               # zoom: keep current
        ])
        dests_array.append(pikepdf.String(num))
        dests_array.append(dest)

    if "/Names" not in pdf.Root:
        pdf.Root["/Names"] = pikepdf.Dictionary()
    pdf.Root["/Names"]["/Dests"] = pikepdf.Dictionary(Names=dests_array)

    pdf.save(PDF_OUTPUT)

print(f"Written → {PDF_OUTPUT}")

# ── Report not-found ─────────────────────────────────────────────────────────

if not_found:
    print(f"\nDisorders NOT found ({len(not_found)}):")
    for num in sorted(not_found, key=sort_key):
        print(f"  {num}  {unique_disorders[num]}")
else:
    print("\nAll disorders found.")

if len(not_found) == len(unique_disorders):
    print("\nERROR: ALL disorders not found — script is likely broken.", file=sys.stderr)
    sys.exit(1)

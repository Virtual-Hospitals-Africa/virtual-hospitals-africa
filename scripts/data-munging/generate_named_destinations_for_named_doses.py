#!/usr/bin/env python3
"""
Scans the Adult Hospital Level EML PDF and adds named destinations:

  #1.2.3                     → top of the disorder section header
  #1.2.3-Clopidogrel → first occurrence of that medicine within the section

Section headers are identified by grey-background filled rectangles containing
bold text that starts with the disorder number.
"""

import fitz       # PyMuPDF
import pikepdf
import json
import re
import sys
from pathlib import Path

REPO_ROOT  = Path(__file__).parent.parent.parent
JSON_PATH  = REPO_ROOT / "backend/recommended_doses/parsed/recommended_doses.json"
PDF_INPUT  = REPO_ROOT / "static/medical-resources/za/eml/Hospital-Level-Adults-Standard-Treatment-Guidelines-and-EMP-6th-Edition-2024.pdf"
PDF_OUTPUT = REPO_ROOT / "static/medical-resources/za/eml/named-destinations/Hospital-Level-Adults-Standard-Treatment-Guidelines-and-EMP-6th-Edition-2024.pdf"

# ── Load JSON ─────────────────────────────────────────────────────────────────

with open(JSON_PATH) as f:
    data = json.load(f)

adult_entries = [e for e in data if e.get("publication") == "Adult Hospital Level"]

def strip_num(num: str | None) -> str | None:
    return num.rstrip(".") if num else None

# Unique disorders: disorder_number -> disorder_name
unique_disorders: dict[str, str] = {}
for entry in adult_entries:
    num = strip_num(entry.get("disorder_number"))
    if num and num not in unique_disorders:
        unique_disorders[num] = entry["disorder"]

# Unique medicine targets: set of (disorder_num, medicine_name)
unique_medicine_targets: set[tuple[str, str]] = set()
for entry in adult_entries:
    num = strip_num(entry.get("disorder_number"))
    med = entry.get("medicine", {}).get("name", "").strip()
    if num and med:
        unique_medicine_targets.add((num, med))

disorder_numbers = set(unique_disorders)
print(f"Scanning for {len(unique_disorders)} disorders and "
      f"{len(unique_medicine_targets)} disorder+medicine pairs…")

# ── Phase 1: scan PDF for grey-background section headers ────────────────────
# Also collect ALL grey-box positions to use as section boundaries.

doc = fitz.open(PDF_INPUT)

found_disorders: dict[str, tuple[int, float, float, float, float, float]] = {}  # num -> (page, x0, y0, x1, y1, page_h)
not_found_disorders = set(disorder_numbers)

def get_grey_rects(page: fitz.Page) -> list[fitz.Rect]:
    return [
        d["rect"]
        for d in page.get_drawings()
        if (fill := d.get("fill"))
        and len(fill) == 3
        and all(0.5 < c < 0.98 for c in fill)
        and d["rect"].width > 50
        and d["rect"].height > 3
    ]

for page_num in range(len(doc)):
    page = doc[page_num]
    grey_rects = get_grey_rects(page)
    if not grey_rects:
        continue

    for block in page.get_text("dict")["blocks"]:
        if block["type"] != 0:
            continue
        for line in block["lines"]:
            for span in line["spans"]:
                if not (span["flags"] & 16):   # bold
                    continue
                text = span["text"].strip()
                m = re.match(r"^(\d+\.\d+(?:\.\d+)*)\b", text)
                if not m:
                    continue
                num = m.group(1)
                if num not in disorder_numbers or num in found_disorders:
                    continue
                span_rect = fitz.Rect(span["bbox"])
                for gr in grey_rects:
                    if gr.intersects(span_rect):
                        found_disorders[num] = (page_num, gr.x0, gr.y0, gr.x1, gr.y1, page.rect.height)
                        not_found_disorders.discard(num)
                        break

# Sorted list of all found disorder positions — used as section boundaries when
# scanning for medicine text.  Each header has two stacked grey rects (title +
# ICD codes); using found_disorders avoids treating the ICD-codes rect as a
# separate boundary that would cut the scan off prematurely.
disorder_positions: list[tuple[int, float, str]] = sorted(
    (pn, y0, num) for num, (pn, _x0, y0, _x1, _y1, _ph) in found_disorders.items()
)

print(f"Found {len(found_disorders)} / {len(unique_disorders)} disorders")

# ── Phase 2: find medicine positions within sections ─────────────────────────

def next_section_boundary(start_page: int, start_y: float) -> tuple[int, float]:
    """Return the (page, y0) of the next disorder header after (start_page, start_y)."""
    for dpage, dy, _ in disorder_positions:
        if (dpage, dy) > (start_page, start_y):
            return (dpage, dy)
    return (len(doc), 0.0)   # sentinel: past the end of the document

def find_medicine(
    start_page: int,
    start_y: float,
    end_page: int,
    end_y: float,
    medicine_name: str,
) -> tuple[int, float, float, float, float, float] | None:
    """
    Scan text blocks from (start_page, start_y) up to (end_page, end_y).
    Returns (page_num, block_y0, page_height) of the first block containing
    medicine_name (case-insensitive), or None if not found before the boundary.

    Blocks are sorted by y before processing because PyMuPDF does not guarantee
    order, and an out-of-order block past the boundary would otherwise cause a
    premature None return.  A small tolerance is applied to start_y because the
    text block that contains the section header also contains the medicine list
    and starts a few points above the grey-rect top.
    """
    needle = medicine_name.lower()
    TOLERANCE = 5.0   # pt — header blocks can start slightly above gr.y0

    for page_num in range(start_page, min(end_page + 1, len(doc))):
        if page_num > end_page:
            break
        page = doc[page_num]
        # Sort ascending by y so the boundary-stop condition is correct.
        blocks = sorted(page.get_text("dict")["blocks"], key=lambda b: b["bbox"][1])

        for block in blocks:
            if block["type"] != 0:
                continue
            x0, y0, x1, y1 = block["bbox"]

            if page_num == start_page and y0 < start_y - TOLERANCE:
                continue
            if page_num == end_page and y0 >= end_y:
                return None   # correct because blocks are sorted

            block_text = " ".join(
                span["text"]
                for line in block["lines"]
                for span in line["spans"]
            ).lower()

            if needle in block_text:
                return (page_num, x0, y0, x1, y1, page.rect.height)

    return None

found_medicines: dict[tuple[str, str], tuple[int, float, float, float, float, float]] = {}
not_found_medicines: list[tuple[str, str]] = []

for disorder_num, medicine_name in sorted(unique_medicine_targets):
    if disorder_num not in found_disorders:
        continue   # disorder itself wasn't found; already reported above
    start_page, _, start_y, _, _, _ = found_disorders[disorder_num]
    end_page, end_y = next_section_boundary(start_page, start_y)
    result = find_medicine(start_page, start_y, end_page, end_y, medicine_name)
    if result is None:
        not_found_medicines.append((disorder_num, medicine_name))
    else:
        found_medicines[(disorder_num, medicine_name)] = result

doc.close()

print(f"Found {len(found_medicines)} / {len(unique_medicine_targets)} medicine positions")

# ── Phase 3: write output PDF with all named destinations ─────────────────────

PDF_OUTPUT.parent.mkdir(parents=True, exist_ok=True)

def sort_key(num: str) -> list:
    parts = []
    for x in num.split("."):
        try:
            parts.append((0, int(x)))
        except ValueError:
            parts.append((1, x))
    return parts

with pikepdf.open(PDF_INPUT) as pdf:
    # Collect all destinations then sort by name in lexicographic (byte) order,
    # which is what PDF name trees require for binary search to work.
    all_dests: list[tuple[str, int, float, float, float, float, float]] = []

    for num, (page_num, x0, y0, x1, y1, page_height) in found_disorders.items():
        all_dests.append((num, page_num, x0, y0, x1, y1, page_height))

    for (disorder_num, medicine_name), (page_num, x0, y0, x1, y1, page_height) in found_medicines.items():
        all_dests.append((f"{disorder_num}-{medicine_name}", page_num, x0, y0, x1, y1, page_height))

    all_dests.sort(key=lambda t: t[0])

    dests_array = pikepdf.Array()
    for name, page_num, fitz_x0, fitz_y0, fitz_x1, fitz_y1, page_height in all_dests:
        # Convert fitz (top-left origin) to PDF (bottom-left origin)
        pdf_left   = float(fitz_x0)
        pdf_bottom = float(page_height - fitz_y1)
        pdf_right  = float(fitz_x1)
        pdf_top    = float(page_height - fitz_y0)
        dest = pikepdf.Array([
            pdf.pages[page_num].obj,
            pikepdf.Name("/FitR"),
            pikepdf.Real(pdf_left),
            pikepdf.Real(pdf_bottom),
            pikepdf.Real(pdf_right),
            pikepdf.Real(pdf_top),
        ])
        dests_array.append(pikepdf.String(name))
        dests_array.append(dest)

    if "/Names" not in pdf.Root:
        pdf.Root["/Names"] = pikepdf.Dictionary()
    pdf.Root["/Names"]["/Dests"] = pikepdf.Dictionary(Names=dests_array)

    pdf.save(PDF_OUTPUT)

print(f"Written → {PDF_OUTPUT}")

# ── Report not-found ─────────────────────────────────────────────────────────

if not_found_disorders:
    print(f"\nDisorders NOT found ({len(not_found_disorders)}):")
    for num in sorted(not_found_disorders, key=sort_key):
        print(f"  {num}  {unique_disorders[num]}")
else:
    print("\nAll disorders found.")

if not_found_medicines:
    print(f"\nMedicines NOT found in their section ({len(not_found_medicines)}):")
    for disorder_num, medicine_name in not_found_medicines:
        print(f"  {disorder_num}-{medicine_name}  [{unique_disorders.get(disorder_num, '?')}]")

if found_medicines:
    print(f"\nMedicines found in their section ({len(found_medicines)}):")
    for disorder_num, medicine_name in found_medicines:
        print(f"  {disorder_num}-{medicine_name}  [{unique_disorders.get(disorder_num, '?')}]")

if len(not_found_disorders) == len(unique_disorders):
    print("\nERROR: ALL disorders not found — script is likely broken.", file=sys.stderr)
    sys.exit(1)

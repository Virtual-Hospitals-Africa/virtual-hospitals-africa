#!/usr/bin/env python3
"""
Extracts red-boxed urgent-attention content from static/pack-sa.pdf.

For each page containing a red box, writes:
  red_boxes/<page_num>-<title-slug>.txt

Rules:
 - Two red boxes with the same section title  → one file, separated by two blank lines.
 - Two red boxes with different section titles → two files.
"""

import argparse
import fitz
import re
from pathlib import Path
from collections import defaultdict

REPO_ROOT = Path(__file__).parent.parent.parent


# ── helpers ──────────────────────────────────────────────────────────────────

def is_red(color):
    if not color or len(color) < 3:
        return False
    r, g, b = color[0], color[1], color[2]
    return r > 0.55 and g < 0.35 and b < 0.35


def rect_to_rendered(raw_rect, mat):
    """Transform a raw-coordinate rect to the rendered (visual) coordinate space."""
    p0 = fitz.Point(raw_rect.x0, raw_rect.y0) * mat
    p1 = fitz.Point(raw_rect.x1, raw_rect.y1) * mat
    return fitz.Rect(
        min(p0.x, p1.x), min(p0.y, p1.y),
        max(p0.x, p1.x), max(p0.y, p1.y),
    )


# ── per-page extraction ───────────────────────────────────────────────────────

def get_red_rects(page):
    """Return red-bordered rectangles (raw coords) on this page."""
    rects = []
    for d in page.get_drawings():
        rect = d.get("rect")
        if not rect:
            continue
        # Must be substantial in at least one dimension (handles both rotated/non-rotated)
        if max(rect.width, rect.height) < 80 or min(rect.width, rect.height) < 10:
            continue
        if is_red(d.get("color")):
            rects.append(rect)
    return rects


def get_page_number(page):
    """
    Read the printed page number.

    Adult PDF (rotation=90): number sits at raw coords (550–610, 40–80).
    Child PDF (rotation=0):  number sits at the top-right corner of the page.
    """
    if page.rotation == 0:
        w = page.rect.width
        clip = fitz.Rect(w - 65, 0, w, 25)
    else:
        clip = fitz.Rect(550, 40, 610, 80)
    words = page.get_text("words", clip=clip)
    for w in words:
        text = w[4].strip()
        if re.match(r"^\d{1,3}$", text):
            num = int(text)
            if 1 <= num <= 300:
                return num
    return None


def get_section_titles(page):
    """
    Return a list of (rendered_y0, title_text) for every coloured header bar
    on the page, sorted top-to-bottom.

    Title bars are wide + short rectangles with a noticeably dark/saturated fill
    (r+g+b < 2.1 to exclude white, cream and light-grey content boxes).
    """
    mat = page.rotation_matrix
    titles = []
    seen: set[str] = set()

    for d in page.get_drawings():
        fill = d.get("fill")
        rect = d.get("rect")
        if not fill or len(fill) < 3 or not rect:
            continue
        r, g, b = fill[0], fill[1], fill[2]
        # Exclude white/cream/light content boxes; keep saturated/dark fills
        if r + g + b >= 2.1:
            continue
        # In rendered space the title bar is wide (> 300) and short (< 60)
        r_rect = rect_to_rendered(rect, mat)
        if r_rect.width < 300 or r_rect.height > 60:
            continue

        clip = fitz.Rect(rect.x0 - 2, rect.y0 - 2, rect.x1 + 2, rect.y1 + 2)
        parts: list[str] = []
        for block in page.get_text("dict", clip=clip)["blocks"]:
            if block["type"] != 0:
                continue
            for line in block["lines"]:
                for span in line["spans"]:
                    # Skip small annotation text inside the title bar
                    if span["size"] < 11:
                        continue
                    t = span["text"].strip()
                    if t:
                        parts.append(t)

        text = " ".join(parts).strip()
        if not text or text in seen:
            continue
        seen.add(text)
        titles.append((r_rect.y0, text))

    # Fallback: look for large bold text near the top if no bars found
    if not titles:
        for block in page.get_text("dict")["blocks"]:
            if block["type"] != 0:
                continue
            for line in block["lines"]:
                for span in line["spans"]:
                    if span["size"] < 14:
                        continue
                    t = span["text"].strip()
                    if not t or t in seen:
                        continue
                    p = fitz.Point(span["bbox"][0], span["bbox"][1]) * mat
                    seen.add(t)
                    titles.append((p.y, t))

    return sorted(titles, key=lambda t: t[0])


def get_title_for_rect(titles, rendered_y0):
    """Find the section title whose bar appears closest above the given rendered y."""
    best = None
    for title_y0, title_text in titles:
        if title_y0 < rendered_y0:
            best = title_text
    return best


def clean(text: str) -> str:
    return text.replace("\t", " ").rstrip()


def extract_text_from_rect(page, raw_rect: fitz.Rect) -> str:
    """
    Extract text inside raw_rect, reordering multi-column bullet lists so that
    content is read column-by-column (top-to-bottom within each column) rather
    than the raw left-to-right PDF order.

    Strategy
    --------
    1. Retrieve lines with their *rendered* (x, y) positions.
    2. Group lines that share the same rendered-y (±5 pt) into rows.
    3. Rows with ≥2 items indicate the multi-column zone; the surrounding
       single-item rows are pre- and post-column sections.
    4. Within the multi-column zone, bucket lines by rendered-x cluster
       (column) and emit them column-by-column, each column sorted by y.
    """
    mat = page.rotation_matrix
    rendered_rect = rect_to_rendered(raw_rect, mat)

    pad = 3
    clip = fitz.Rect(
        raw_rect.x0 - pad, raw_rect.y0 - pad,
        raw_rect.x1 + pad, raw_rect.y1 + pad,
    )

    # Collect lines with rendered positions
    all_lines: list[tuple[float, float, str]] = []  # (rendered_y, rendered_x, text)
    for block in page.get_text("dict", clip=clip)["blocks"]:
        if block["type"] != 0:
            continue
        for line in block["lines"]:
            spans = line["spans"]
            if not spans:
                continue
            text = "".join(s["text"] for s in spans)
            if not text.strip():
                continue
            lx0, ly0, lx1, ly1 = line["bbox"]
            p0 = fitz.Point(lx0, ly0) * mat
            p1 = fitz.Point(lx1, ly1) * mat
            ry0 = min(p0.y, p1.y)
            rx0 = min(p0.x, p1.x)
            all_lines.append((ry0, rx0, clean(text)))

    if not all_lines:
        return ""

    all_lines.sort(key=lambda l: (l[0], l[1]))

    # Group into rows by rendered-y proximity
    ROW_TOL = 5
    rows: list[list[tuple[float, float, str]]] = []
    cur_row = [all_lines[0]]
    for line in all_lines[1:]:
        if abs(line[0] - cur_row[0][0]) <= ROW_TOL:
            cur_row.append(line)
        else:
            rows.append(sorted(cur_row, key=lambda l: l[1]))
            cur_row = [line]
    rows.append(sorted(cur_row, key=lambda l: l[1]))

    # Fast-path: single column
    if max(len(r) for r in rows) <= 1:
        return "\n".join(line[2] for row in rows for line in row)

    # Identify multi-column rows and derive column x-positions
    multi_rows = [r for r in rows if len(r) > 1]
    mc_y_min = min(r[0][0] for r in multi_rows)
    mc_y_max = max(r[0][0] for r in multi_rows)

    all_col_rx = sorted({round(l[1]) for r in multi_rows for l in r})
    col_gap = rendered_rect.width * 0.08
    col_positions: list[float] = [all_col_rx[0]]
    for rx in all_col_rx[1:]:
        if rx - col_positions[-1] > col_gap:
            col_positions.append(rx)

    def assign_col(rx: float) -> int:
        return min(range(len(col_positions)), key=lambda i: abs(rx - col_positions[i]))

    # Partition rows
    pre: list[tuple[float, str]] = []
    col_lines: dict[int, list[tuple[float, str]]] = defaultdict(list)
    post: list[tuple[float, str]] = []

    for row in rows:
        ry = row[0][0]
        if ry < mc_y_min - ROW_TOL:
            for _, rx, text in row:
                pre.append((ry, text))
        elif ry > mc_y_max + ROW_TOL:
            for _, rx, text in row:
                post.append((ry, text))
        else:
            for _, rx, text in row:
                col_lines[assign_col(rx)].append((ry, text))

    for col in col_lines:
        col_lines[col].sort(key=lambda l: l[0])

    result: list[str] = []
    result.extend(t for _, t in sorted(pre, key=lambda l: l[0]))
    for col_idx in sorted(col_lines):
        result.extend(t for _, t in col_lines[col_idx])
    result.extend(t for _, t in sorted(post, key=lambda l: l[0]))

    return "\n".join(result)


def slugify(text: str) -> str:
    s = text.lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")


# ── main ──────────────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(description="Extract red-boxed content from a PDF.")
    parser.add_argument("pdf_input", type=Path, nargs="?", default=REPO_ROOT / "static/pack-sa.pdf")
    parser.add_argument("output_dir", type=Path, nargs="?", default=REPO_ROOT / "red_boxes/apc-adult")
    args = parser.parse_args()

    PDF_INPUT = args.pdf_input
    OUTPUT_DIR = args.output_dir

    OUTPUT_DIR.mkdir(exist_ok=True)
    doc = fitz.open(PDF_INPUT)

    files_written = 0

    for page_idx in range(len(doc)):
        page = doc[page_idx]
        red_rects = get_red_rects(page)
        if not red_rects:
            continue

        page_num = get_page_number(page)
        if page_num is None:
            continue  # skip unnumbered pages (cover, TOC, etc.)

        mat = page.rotation_matrix
        titles = get_section_titles(page)

        # Sort red rects top-to-bottom in rendered space
        red_rects_sorted = sorted(
            red_rects,
            key=lambda r: rect_to_rendered(r, mat).y0,
        )

        # Group by associated section title (preserving insertion/y order)
        title_to_rects: dict[str, list[fitz.Rect]] = {}
        for raw_r in red_rects_sorted:
            ry0 = rect_to_rendered(raw_r, mat).y0
            title = get_title_for_rect(titles, ry0) or f"page-{page_num}"
            title_to_rects.setdefault(title, []).append(raw_r)

        for title, rects in title_to_rects.items():
            title_slug = slugify(title)
            filename = f"{page_num}-{title_slug}.txt"

            contents = [
                extract_text_from_rect(page, r)
                for r in rects
            ]
            contents = [c for c in contents if c.strip()]

            if contents:
                output = "\n\n".join(contents)
                (OUTPUT_DIR / filename).write_text(output, encoding="utf-8")
                print(f"Written: {filename}")
                files_written += 1

    doc.close()
    print(f"\nTotal files written: {files_written}")


if __name__ == "__main__":
    main()

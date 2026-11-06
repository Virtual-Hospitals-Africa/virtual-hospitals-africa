"""Element inventory for APC red boxes (deterministic; no model involved).

For each requested page, finds red-bordered boxes (same colour/size test as the VHA
repo's scripts/data-munging/extract_red_boxes.py), splits the text inside into
elements, and writes:
  <out>/p<N>.json  element list (ids, text, kind, section, indent, parent, bbox)
  <out>/p<N>.md    the same list, readable
  <out>/p<N>.png   page render for agents that need the layout

Element rules (all deterministic):
  - A line starting with a bullet glyph or a dash starts a new item.
  - A line without a bullet continues the item above it in the same column if it
    sits within 14pt below that item's last line and is indented by -2..+20pt.
  - A line whose spans are all bold/semibold, with at least 3 words and 12 letters (or 6+ letters
    ending in ':'), is a header. Any other unbulleted line is 'other' (figure labels, notes).
  - Section = nearest header above whose horizontal span covers the element (40pt slack),
    else the horizontally closest header above.
  - kind_hint 'criterion' if the section header contains "any of"; 'management' if it
    mentions manage/management/refer/give/treat; else 'unclassified'. This is a HINT
    only: flowcharts and mixed boxes defeat it. Scope is judged later (inference, logged).

v2 (apc-2026-full) changes, from the review-page handoff's "known issues":
  - Box headers are elements too (kind_hint 'header'), so a rule's trigger can cite the header.
  - Every element has `key`: a content hash (page + normalised text + occurrence), stable when the
    extractor's numbering changes. `id` stays as the readable positional label.
  - Box rectangles are written in rendered (rotated) page coordinates, with one crop PNG per box.
  - Splitting several criteria inside one bullet is NOT done here: provenance cites a verbatim
    quote inside the element, so a criterion is identified by (element key, quote).

Usage: python -I extract_elements.py <pdf> <out_dir> <page> [<page> ...]
"""
import hashlib, json, re, sys
from pathlib import Path
import pymupdf as fitz

pdf, out = sys.argv[1], Path(sys.argv[2])
pages = [int(x) for x in sys.argv[3:]]
out.mkdir(parents=True, exist_ok=True)

BULLET = re.compile(r"^[\s ]*([•\-–]|•)[\s \t]")
PUA = re.compile(r"[-]")


def is_red(c):
    return bool(c) and len(c) >= 3 and c[0] > 0.55 and c[1] < 0.35 and c[2] < 0.35


def red_rects(page):
    rs = []
    for d in page.get_drawings():
        r = d.get("rect")
        if r and is_red(d.get("color")) and max(r.width, r.height) >= 80 and min(r.width, r.height) >= 10:
            if not any(abs(r.x0 - q.x0) < 2 and abs(r.y0 - q.y0) < 2 and abs(r.x1 - q.x1) < 2 and abs(r.y1 - q.y1) < 2 for q in rs):
                rs.append(r)
    return rs


def clean(t):
    t = PUA.sub("", t).replace("\t", " ").replace(" ", " ").replace("\xa0", " ")
    return re.sub(r"\s+", " ", t).strip()


def is_header_text(raw):
    """Header = bold line with at least 3 words and 12 letters (excludes figure labels like 'Front', '4.5%')."""
    t = clean(raw)
    letters = len(re.findall(r"[A-Za-z]", t))
    return (letters >= 12 and len(t.split()) >= 3) or (letters >= 6 and t.endswith(":"))


def classify(header):
    h = (header or "").lower()
    if "any of" in h:
        return "criterion"
    if re.search(r"\b(manage|management|refer|give|treat|while awaiting)\b", h):
        return "management"
    return "unclassified"


doc = fitz.open(pdf)
for n in pages:
    page = doc[n - 1]
    mat = page.rotation_matrix
    elements = []
    for bi, rect in enumerate(red_rects(page), 1):
        lines = []
        for b in page.get_text("dict", clip=rect)["blocks"]:
            for l in b.get("lines", []):
                raw = "".join(s["text"] for s in l["spans"])
                if not raw.strip():
                    continue
                bb = fitz.Rect(l["bbox"]) * mat
                bold = all(("Bold" in s["font"] or "Semibold" in s["font"]) for s in l["spans"] if s["text"].strip())
                lines.append(dict(raw=raw, x=bb.x0, y=bb.y0, x1=bb.x1, y1=bb.y1, bold=bold))
        lines.sort(key=lambda d: (round(d["y"]), d["x"]))
        items, headers = [], []
        for ln in lines:
            if BULLET.match(ln["raw"]):
                items.append(dict(lines=[ln], x=ln["x"], last_y=ln["y"]))
                continue
            if ln["bold"] and is_header_text(ln["raw"]):
                headers.append(ln)
                items.append(dict(lines=[ln], x=ln["x"], last_y=ln["y"], other=True, header=True))
                continue
            cont = [it for it in items if 0 < ln["y"] - it["last_y"] <= 14 and -2 <= ln["x"] - it["x"] <= 20]
            if cont:
                it = max(cont, key=lambda it: it["last_y"])
                it["lines"].append(ln)
                it["last_y"] = ln["y"]
            else:
                items.append(dict(lines=[ln], x=ln["x"], last_y=ln["y"], other=True))
        # sections: nearest header above, preferring one whose column overlaps
        def section_for(x, y):
            # nearest header above whose horizontal span covers the item (40pt slack);
            # if none covers it, the horizontally closest header above
            above = [h for h in headers if h["y"] < y + 1]
            if not above:
                return None
            def dist(h):
                return 0 if h["x"] - 40 <= x <= h["x1"] + 40 else min(abs(x - h["x"]), abs(x - h["x1"]))
            covering = [h for h in above if dist(h) == 0]
            if covering:
                return max(covering, key=lambda h: h["y"])
            return min(above, key=lambda h: (dist(h), -h["y"]))
        xs = sorted({round(it["x"]) for it in items if not it.get("other")})
        base = {}
        for it in items:
            if it.get("other"):
                continue
            # indent level within its column: compare to the leftmost bullet x within 30pt to its left
            col_left = min(x for x in xs if it["x"] - 30 <= x <= it["x"] + 0.5)
            base[id(it)] = 1 + round((it["x"] - col_left) / 6)
        eid = 0
        last_at_level = {}
        for it in sorted(items, key=lambda it: (round(it["lines"][0]["y"]), it["x"])):
            first = it["lines"][0]
            h = section_for(first["x"], first["y"])
            hdr = clean(h["raw"]) if h else None
            text = clean(" ".join(l["raw"] for l in it["lines"]))
            text = re.sub(r"^[•\-–]\s*", "", text)
            eid += 1
            el_id = f"p{n}-rb{bi}-e{eid:02d}"
            lvl = base.get(id(it), 0)
            parent = None
            if lvl > 1:
                cands = [e for e in elements if e["box"] == bi and e["indent"] == lvl - 1 and e["section"] == hdr
                         and abs(e["bbox"][0] - first["x"]) < 30 and e["bbox"][1] < first["y"]]
                if cands:
                    parent = max(cands, key=lambda e: e["bbox"][1])["id"]
            elements.append(dict(
                id=el_id, page=n, box=bi, kind_hint="header" if it.get("header") else ("other" if it.get("other") else classify(hdr)),
                section=hdr, section_y=round(h["y"], 1) if h else -1, indent=lvl, parent=parent, text=text,
                bbox=[round(first["x"], 1), round(first["y"], 1), round(max(l["x1"] for l in it["lines"]), 1), round(it["lines"][-1]["y1"], 1)],
            ))
    # Text outside the red boxes: one element per text block (box 0, kind_hint 'outside'), so
    # builders can cite the page's "X likely" logic, as Will's standard asks. The navigation tabs
    # (bottom band), the running header and the page number (top band) are left out.
    rects = red_rects(page)
    W, H = page.rect.width, page.rect.height
    oi = 0
    for b in page.get_text("dict")["blocks"]:
        keep = []
        for l in b.get("lines", []):
            raw = "".join(s["text"] for s in l["spans"])
            if not raw.strip():
                continue
            r = fitz.Rect(l["bbox"])
            cx, cy = (r.x0 + r.x1) / 2, (r.y0 + r.y1) / 2
            if any(q.x0 <= cx <= q.x1 and q.y0 <= cy <= q.y1 for q in rects):
                continue
            bb = r * mat
            if bb.y0 < H * 0.06 or bb.y1 > H * 0.93:
                continue
            keep.append((bb, raw))
        if not keep:
            continue
        t = clean(" ".join(raw for _, raw in keep))
        if len(re.findall(r"[A-Za-z]", t)) < 3:
            continue
        oi += 1
        x0 = min(bb.x0 for bb, _ in keep); y0 = min(bb.y0 for bb, _ in keep)
        x1 = max(bb.x1 for bb, _ in keep); y1 = max(bb.y1 for bb, _ in keep)
        elements.append(dict(id=f"p{n}-out-e{oi:02d}", page=n, box=0, kind_hint="outside", section=None, section_y=-1,
                             indent=0, parent=None, text=t, bbox=[round(x0, 1), round(y0, 1), round(x1, 1), round(y1, 1)]))
    occ = {}
    for e in elements:
        norm = re.sub(r"\s+", " ", e["text"]).strip().lower()
        occ[norm] = occ.get(norm, 0) + 1
        e["key"] = f"p{n}-" + hashlib.sha1(f"{n}|{norm}|{occ[norm]}".encode()).hexdigest()[:8]
    boxes = []
    for bi, r in enumerate(red_rects(page), 1):
        rr = r * mat
        boxes.append(dict(box=bi, rect=[round(v, 1) for v in (rr.x0, rr.y0, rr.x1, rr.y1)]))
        page.get_pixmap(dpi=150, clip=r).save(out / f"p{n}-box{bi}.png")
    (out / f"p{n}.json").write_text(json.dumps(dict(pdf=Path(pdf).name, page=n, page_size=[round(page.rect.width, 1), round(page.rect.height, 1)], red_boxes=len(boxes), boxes=boxes, elements=elements), indent=1, ensure_ascii=False))
    md = [f"# {Path(pdf).name}, page {n}: elements (red boxes, then the rest of the page)", ""]
    sec = object()
    for e in sorted(elements, key=lambda e: (e["box"], e["section_y"], e["bbox"][0] > 0 and e["bbox"][1], e["bbox"][0])):
        if e["section"] != sec:
            sec = e["section"]
            md += ["", (f"## Box {e['box']} — {sec or '(no header)'}" if e["box"] else "## Outside the red boxes (cite for \"X likely\" logic; coverage not required)"), ""]
        md.append(f"- `{e['id']}` (key `{e['key']}`) [{e['kind_hint']}, indent {e['indent']}{', parent ' + e['parent'] if e['parent'] else ''}] {e['text']}")
    (out / f"p{n}.md").write_text("\n".join(md) + "\n")
    page.get_pixmap(dpi=200).save(out / f"p{n}.png")
    from collections import Counter
    print(n, "boxes", len(red_rects(page)), "elements", len(elements), dict(Counter(e["kind_hint"] for e in elements)))

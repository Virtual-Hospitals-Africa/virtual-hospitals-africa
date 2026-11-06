import sys, re, json, pymupdf as fitz
def is_red(c): return bool(c) and len(c)>=3 and c[0]>0.55 and c[1]<0.35 and c[2]<0.35
def red_rects(p):
    rs=[]
    for d in p.get_drawings():
        r=d.get("rect")
        if r and is_red(d.get("color")) and max(r.width,r.height)>=80 and min(r.width,r.height)>=10:
            if not any(abs(r.x0-q.x0)<2 and abs(r.y0-q.y0)<2 and abs(r.x1-q.x1)<2 and abs(r.y1-q.y1)<2 for q in rs): rs.append(r)
    return rs
out={}
for label,pdf in (("2023",sys.argv[1]),("2026",sys.argv[2])):
    doc=fitz.open(pdf); rows=[]
    for i,p in enumerate(doc):
        t=p.get_text()
        yes=len(re.findall(r"(?m)^\s*Yes\s*$",t)); no=len(re.findall(r"(?m)^\s*No\s*$",t))
        rows.append(dict(page=i+1,red=len(red_rects(p)),yes=yes,no=no))
    out[label]=rows
json.dump(out,open(sys.argv[3],"w"))
for k,rows in out.items():
    rp=[r for r in rows if r["red"]]; fc=[r for r in rows if r["yes"]>=2 and r["no"]>=2]
    print(k,"pages",len(rows),"pages_with_red",len(rp),"red_boxes",sum(r["red"] for r in rows),"flowchart_pages(yes/no>=2)",len(fc),"red+flowchart",len([r for r in rp if r in fc]))

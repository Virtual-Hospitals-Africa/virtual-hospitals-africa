"""Measured cost of a workflow run, from every agent's transcript (deterministic).
Sums usage per model (deduplicated by message id), splits cache writes by TTL, and prices them at
Anthropic first-party API list rates (claude-api skill, cached 2026-10-06): cache write 1.25x input
(5-minute TTL) or 2x (1-hour), cache reads at each model's listed read price. This is the list-price
equivalent of the tokens used; what is actually billed depends on the account's plan.
Usage: python -I run_cost.py <workflow transcript dir> [...]"""
import collections, glob, json, sys
PRICE = {  # $/MTok: input, output, cache read
    "claude-opus-5-5": (4.00, 20.00, 0.20),
    "claude-sonnet-5-5": (2.00, 10.00, 0.20),
    "claude-fable-5-1": (10.00, 50.00, 0.25),
}
grand = 0.0
for wf in sys.argv[1:]:
    tot = collections.defaultdict(collections.Counter); agents = collections.Counter()
    for f in glob.glob(wf + "/agent-*.jsonl"):
        seen, model = set(), None
        for line in open(f):
            try: x = json.loads(line)
            except ValueError: continue
            m = x.get("message") or {}
            u, mid = m.get("usage"), m.get("id")
            if not u or mid in seen: continue
            seen.add(mid); model = m.get("model"); t = tot[model]
            t["in"] += u.get("input_tokens") or 0; t["out"] += u.get("output_tokens") or 0
            t["read"] += u.get("cache_read_input_tokens") or 0
            cc = u.get("cache_creation") or {}
            w5, w1 = cc.get("ephemeral_5m_input_tokens"), cc.get("ephemeral_1h_input_tokens")
            if w5 is None and w1 is None: w5, w1 = u.get("cache_creation_input_tokens") or 0, 0
            t["w5"] += w5 or 0; t["w1"] += w1 or 0
        if model: agents[model] += 1
    print(wf.rstrip("/").split("/")[-1])
    sub = 0.0
    for mo, t in sorted(tot.items()):
        pi, po, pr = PRICE.get(mo, (0, 0, 0))
        cost = (t["in"] * pi + t["out"] * po + t["read"] * pr + t["w5"] * pi * 1.25 + t["w1"] * pi * 2) / 1e6
        sub += cost
        print(f"  {mo:18} agents {agents[mo]:4}  out {t['out']/1e6:6.2f}M  cache read {t['read']/1e6:7.1f}M  cache write {(t['w5']+t['w1'])/1e6:5.1f}M (1h {t['w1']/1e6:.1f}M)  ${cost:,.2f}" + ("" if mo in PRICE else "  (no price on file)"))
    print(f"  subtotal ${sub:,.2f}  ({sum(agents.values())} agents, ${sub/max(1,sum(agents.values())):.2f}/agent)")
    grand += sub
print(f"TOTAL ${grand:,.2f}")

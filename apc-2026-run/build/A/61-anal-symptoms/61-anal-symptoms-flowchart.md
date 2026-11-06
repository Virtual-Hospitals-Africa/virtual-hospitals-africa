# Page 61 – Anal symptoms: flowchart

Source: APC 2026 e-book page 61 (`inputs/2026/p61.png`). The red box is a screen; below it, the
"Approach to the patient with anal symptoms not needing urgent attention" is a branching
examination algorithm with one Yes/No question (worms).

```mermaid
flowchart TD
    A["Patient with anal symptoms"] --> RB{"Red box: any of<br/>Extremely painful lump on anus<br/>Unable to pass stool because of anal symptoms"}
    RB -- Yes --> URG["Give urgent attention.<br/>Manage pain and refer same day"]
    RB -- No --> APP["Approach: not needing urgent attention"]
    APP --> SEX["If anal sex: ask about genital symptoms, treat partner (62)"]
    APP --> PROC{"Painless bleeding, passing mucus<br/>or tenesmus?"}
    PROC -- Yes --> TPROC["Treat for sexually transmitted proctitis"]
    APP --> DIAR["If diarrhoea (58)"]
    APP --> EX["Examine anal area to look for cause"]
    EX --> CR["Crack/s: lactulose if constipated; bismuth ointment, lidocaine"]
    EX --> LP["Lump/pile: treat constipation (60); avoid straining;<br/>refer if irreducible/thrombosed; bismuth, lidocaine"]
    EX --> RR["Red/raw skin: hygiene, contact cause, emollient, zinc;<br/>hydrocortisone if severe itch"]
    CR --> NB["If no better with treatment, refer"]
    LP --> NB
    RR --> NB
    EX --> UW["Ulcer/s or perianal wart/s: refer if …;<br/>treat as genital ulcer (65) or genital warts (68)"]
    EX --> W{"Suspected worms:<br/>is worm flat and white with worm segments (blunt ended)?"}
    W -- Yes --> TAPE["Tapeworm likely: albendazole 3 days"]
    W -- No --> PIN{"Worm thin and white,<br/>with anal itch worse at night?"}
    PIN -- Yes --> PINL["Pinworm likely: mebendazole/albendazole"]
    PIN -- No --> OTH["Other worm or unsure: mebendazole/albendazole"]
    TAPE --> HH["Treat household; check Hb (Hb &lt; 12 woman / &lt; 13 man: anaemia likely 44);<br/>hygiene advice; refer if abdominal tenderness/pain, mass, vomiting, larva migrans"]
    PINL --> HH
    OTH --> HH
```

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| Patient with anal symptoms | `(clinical_finding "Anal finding")` as trigger | `Check for urgent anal symptoms and their causes` |
| Red box = Yes | Anal finding **and** (perianal lump with severe anal pain **or** does not defecate) | `Urgent: anal symptoms with very painful lump or unable to pass stool` |
| Painless bleeding / mucus / tenesmus = Yes | Anal finding **and** any of painless rectal bleeding, mucus in stool, tenesmus | `Diagnose probable sexually transmitted proctitis (anal symptoms)` |
| Suspected worms → No → thin white worm with anal itch worse at night | Worms in stool **and** pruritus ani qualified "Night time" (worm shape not representable) | `Diagnose probable pinworm (anal symptoms)` |
| Suspected worms → Yes (flat, white, segmented) → tapeworm likely | **Not encoded**: no SNOMED finding for a flat/segmented worm; see remaining questions | — |
| Hb < 12 / < 13 → anaemia likely | **Not encoded**: Hb has no unit/observable in the language | — |
| Crack/s, lump/pile, red/raw skin, ulcer/wart branches | Examination routing to management only; no "likely" statement | — (management) |
| Anal sex → genital symptoms, partner; diarrhoea → 58 | Cross-references | — |

## Notes

- "Extremely painful" is read as `Severe (severity modifier)` on `Anal pain`, paired with
  `Perianal lump`; the language cannot tie the pain to the lump.
- "because of anal symptoms" is expressed only by the `and` with the anal-symptom trigger.
- The proctitis branch is not gated on anal sex (the page's sentences are separate); see remaining questions.

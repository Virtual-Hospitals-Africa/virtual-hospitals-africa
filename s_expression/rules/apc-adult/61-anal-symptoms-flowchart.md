# Page 61 – Anal symptoms: flowchart

Source: `inputs/2026/p61.png` (APC 2026, page 61). The red box is a single "any of" list; the
lower half of the page is an examination algorithm with one Yes/No branch (suspected worms).

```mermaid
flowchart TD
    A["Patient with anal symptoms"] --> RB{"Red box: any of<br/>• Extremely painful lump on anus<br/>• Unable to pass stool because of anal symptoms"}
    RB -- Yes --> URG["Give urgent attention.<br/>Manage pain and refer same day"]
    RB -- No --> APP["Approach to the patient not needing urgent attention"]
    APP --> PROC{"Painless bleeding, passing mucus<br/>or tenesmus?"}
    PROC -- Yes --> STIP["Treat for sexually transmitted proctitis"]
    APP --> EXAM["Examine anal area to look for cause"]
    EXAM --> CR["Crack/s"] --> CRM["Treatment (lactulose if constipated, ointments)"]
    EXAM --> LP["Lump/pile"] --> LPM["Treat constipation, ointment/suppositories;<br/>refer if irreducible or thrombosed"]
    EXAM --> RR["Red/raw skin"] --> RRM["Hygiene, contact cause, creams"]
    CRM --> NB["If no better with treatment, refer"]
    LPM --> NB
    RRM --> NB
    EXAM --> UW["Ulcer/s or perianal wart/s"] --> UWM["Refer criteria; treat as genital ulcer 65 / genital warts 68"]
    EXAM --> SW{"Suspected worms:<br/>Is worm flat and white with worm segments (blunt ended)?"}
    SW -- Yes --> TAPE["Tapeworm likely"]
    SW -- No --> PIN{"Worm thin and white,<br/>with anal itch worse at night?"}
    PIN -- Yes --> PINL["Pinworm likely"]
    PIN -- "Other worm or unsure" --> OTH["Mebendazole / albendazole"]
    TAPE --> HH["Treat household; check Hb:<br/>Hb < 12 (woman) or < 13 (man) → anaemia likely 44;<br/>hygiene; refer if abdominal tenderness/pain, mass, vomiting, larva migrans"]
    PINL --> HH
    OTH --> HH
```

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| Patient with anal symptoms | `(clinical_finding Anal finding)` as the task trigger (descendants such as Anal pain, Pruritus ani, Anal fissure match) | `Check for urgent anal symptom conditions` |
| Red box = Yes | Anal finding **and** (Perianal lump **and** severe Anal pain, **or** Does not defecate) | `Urgent: anal symptoms with extremely painful lump or unable to pass stool` |
| Painless bleeding / mucus / tenesmus → treat for STI proctitis | Anal finding **and** any of Painless rectal bleeding, Mucus in stool, Tenesmus of anus and/or rectum → `Infective proctitis` at `probable` | `Diagnose probable sexually transmitted proctitis from anal symptoms` |
| Suspected worms → No → thin white worm with anal itch worse at night → pinworm likely | Worms in stool **and** Pruritus ani qualified `Night time` → `Enterobiasis` at `probable`. "Thin and white" and "not flat/segmented" are not representable | `Diagnose probable pinworm from anal itch at night` |
| Suspected worms → Yes → tapeworm likely | **Not encoded**: the only discriminator (flat, white, segmented worm) has no SNOMED finding; see remaining questions | — |
| Hb < 12 / < 13 → anaemia likely | **Not encoded**: haemoglobin has no unit/observable in the language | — |
| Crack/s, Lump/pile, Red/raw skin, Ulcer/wart branches | Examination routing to management only; the page names no "likely" diagnosis on these branches | — (management) |

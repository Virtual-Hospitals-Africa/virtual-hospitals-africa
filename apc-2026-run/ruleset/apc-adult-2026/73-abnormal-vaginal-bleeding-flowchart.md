# Page 73 – Abnormal vaginal bleeding: flowchart

Source: APC 2026 e-book page 73 (red box plus the "not needing urgent attention" approach).

```mermaid
flowchart TD
    VB["Vaginal bleeding"] --> RB{"Any of: pregnant; recent delivery/miscarriage/termination;<br/>Shock/SBP &lt; 80; pallor with pulse ≥ 100, RR ≥ 30, dizziness/weakness or chest pain;<br/>Hb &lt; 6; sexual assault and/or rape?"}
    RB -- Yes --> URG["Give urgent attention; manage and refer urgently"]
    RB -- No --> APP["Approach: check for pregnancy, pelvic/speculum exam, cervical screen;<br/>if &gt; 40 years ask about menopausal symptoms;<br/>new bleeding &gt; 1 year after final period: refer within 2 weeks"]
    APP --> TYPE{"Not menopausal: type of bleeding problem"}
    TYPE --> HP["Heavy or prolonged periods"]
    TYPE --> IP["Irregular periods (cycle &lt; 21 or &gt; 35 days)"]
    TYPE --> SP["Spotting between periods"]
    TYPE --> PC["Bleeding after sex"]
    HP --> HPM["Hb &lt; 12: likely anaemia ↻44; COC / ibuprofen; refer if mass, no better after 3 months, etc."]
    IP --> IPM["Thyroid symptoms: check TSH; COC"]
    SP --> SPM["Assess STI; Hb &lt; 12: likely anaemia; manage by contraceptive method"]
    PC --> PCM["Assess STI; sexual assault ↻32; abuse ↻33"]
```

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| Vaginal bleeding (trigger) | `(clinical_finding "Bleeding from vagina")` | `Check for urgent abnormal vaginal bleeding conditions` |
| Red box = Yes | `(and bleeding (or pregnancy, postpartum, recent miscarriage, recent termination, shock, SBP < 80, (and pallor (or pulse ≥ 100, RR ≥ 30, dizziness, asthenia, chest pain)), victim of sexual aggression, victim of rape))`. Hb < 6 not representable | `Urgent: abnormal vaginal bleeding with danger signs` |
| Approach / type of bleeding problem | Not modelled: management, examinations, investigations and referral only | — |
| Hb < 12: likely anaemia | Not modelled: needs a haemoglobin value | — |

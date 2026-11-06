# Page 27 – Poisoning/Overdose: flowchart

Source: `inputs/2026/p27.png`. The page is a red box (urgent list + management) and a short
routing chart for the patient not needing urgent attention.

```mermaid
flowchart TD
    P["Suspected poisoning/overdose"] --> RB{"Any of the red box signs?<br/>self-harm/suicide, ↓LOC, seizure, pupils dilated/pinpoint,<br/>confused/agitated/hallucinating, weakness/twitching,<br/>drooling/sweating, persistent vomiting, breathing problems,<br/>RR &lt; 12, shock/SBP &lt; 80, pulse &lt; 60 or &gt; 100"}
    RB -- Yes --> URG["Urgent: manage and refer urgently"]
    URG --> OPQ{"Pinpoint pupils, drooling/sweating, excessive secretions,<br/>vomiting/diarrhoea, pulse &lt; 60, BP &lt; 90/60?"}
    OPQ -- Yes --> OP["Organophosphate poisoning likely (atropine)"]
    RB -- No --> NU["Ask about amount, type, time; contact PIH/AfriTox: toxic dose?"]
    NU --> T["Toxic dose: refer urgently"]
    NU --> U["Unknown poison or dose / non-toxic dose with symptoms: discuss with PIH"]
    NU --> N["Non-toxic dose, no symptoms: if self-harm 34; advise return"]
```

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| Suspected poisoning/overdose | `(clinical_finding Poisoning)` (warning sign) | trigger of `Check for urgent poisoning/overdose conditions` |
| Red box "any of" | `(and Poisoning (or …13 items…))` | `Urgent: poisoning/overdose with danger signs` |
| Organophosphate signs | `(and Poisoning (or signs))` | `Diagnose probable organophosphate poisoning` |
| Toxic / unknown / non-toxic dose | Not modelled: needs a toxic-dose judgment from PIH, management routing | — |

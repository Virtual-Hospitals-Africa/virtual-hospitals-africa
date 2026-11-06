# Page 122 – HIV: post-exposure prophylaxis (PEP): flowchart

Source: `inputs/2026/p122.png` (the whole algorithm sits inside the red box).

```mermaid
flowchart TD
    H["Give urgent attention to the patient exposed to infectious fluid.<br/>Does patient have either of:<br/>• Exposure to blood, blood-stained fluid/tissue, pleural/pericardial/peritoneal/<br/>amniotic/synovial/cerebrospinal fluid, vaginal secretions, semen or breast milk<br/>• Human bite severe enough to cause bleeding"]
    H -- Yes --> Q2["Was there sexual contact, sharps injury, splash to eye/open wound/mouth/nose?"]
    H -- No --> OTHER["If human bite severe enough to cause bleeding, prevent hepatitis B only (no HIV PEP).<br/>For all other exposures, reassure, avoid giving PEP. If unsure, discuss."]
    Q2 -- No --> OTHER
    Q2 -- Yes --> S1["STEP 1. Immediate attention: clean broken skin; rinse/irrigate splash"]
    S1 --> S2["STEP 2. Assess need for HIV PEP, give immediately if ≤ 72 hours since exposure. Check HIV status"]
    S2 --> KP["Known HIV positive"]
    S2 --> RT["HIV negative/unknown: consent + HIV rapid test"]
    RT -- Positive --> AV["Avoid HIV PEP, routine HIV care 126"]
    KP --> AV
    RT -- "Negative / inconclusive / refuses test" --> PEP["Give HIV PEP only if ≤ 72 hours since exposure, for 28 days"]
    AV --> S3["STEP 3. Bloods from exposed patient"]
    PEP --> S3
    S3 --> S4["STEP 4. Bloods from source if possible and consents"]
    S4 --> S5["STEP 5. Hepatitis B PEP if needed"]
    S5 --> S6["STEP 6. Continue to assess and manage"]
```

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| Presenting complaint "patient exposed to infectious fluid" | Exposure to body fluid (any descendant substance) or a human bite wound | Trigger of `Check for HIV PEP infectious fluid exposure`; first `and` arm of `Urgent: exposure to infectious fluid (HIV PEP)` |
| "Does patient have either of" = Yes | Exposure to any of the 10 listed fluids, **or** human bite wound **and** bleeding | `Urgent: exposure to infectious fluid (HIV PEP)` (Urgent) |
| Sexual contact / sharps injury / splash? | Not modelled: decides HIV PEP (management) only | — |
| HIV status, rapid test result, ≤ 72 hours | Not modelled: PEP management | — |
| Steps 3–6 | Laboratory tests and medicines: management | — |

## Notes

- The page's "Yes"/"No" branches after the first question decide whether HIV and/or hepatitis B PEP
  is given. That is management and is out of scope for this pass; the triage logic is the header plus
  the "either of" list.

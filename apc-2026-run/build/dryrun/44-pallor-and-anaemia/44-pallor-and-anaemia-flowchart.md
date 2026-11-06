# Page 44 – Pallor and anaemia: flowchart

Source: `inputs/2026/p44.png` (APC 2026 e-book, page 44). Only the red box (urgent attention) is
encoded as rules. The approach section below it (MCV algorithm) is drawn here for traceability but
sits outside the red box, so its element inventory has no keys and it is not encoded (see
remaining-questions, **Could not model**).

```mermaid
flowchart TD
    P["Patient has pallor (pale conjunctiva or palms)<br/>or anaemia (Hb &lt; 12 non-pregnant woman, &lt; 11 pregnant woman, &lt; 13 man)"]
    P --> U{"Any of: Hb &lt; 6 · Pulse ≥ 100 · Respiratory rate ≥ 30 ·<br/>Shock¹/SBP &lt; 80 · Dizzy/faint · Chest pain or palpitations ·<br/>Swollen legs · Jaundice · Black² or bloody stools ·<br/>Widespread/easy bruising · Purple/red rash that does not disappear with pressure"}
    U -- Yes --> URG["Give urgent attention. Manage and refer urgently"]
    U -- No --> APP["Approach: test for HIV, check for TB, check for pregnancy.<br/>Fever now/past 3 days + malaria area in past 3 months → malaria likely"]
    APP --> FBC{"If not pregnant: FBC, MCV³ result"}
    FBC -- low --> IDA["Iron deficiency anaemia likely"]
    IDA --> Q1{"Man or woman who no longer has periods?"}
    Q1 -- Yes --> HID["Discuss/refer to look for hidden blood loss"]
    Q1 -- No --> IRON["Ask about abnormal vaginal bleeding; iron; advise"]
    FBC -- normal --> SYS["Systemic disease or long-term condition likely"]
    FBC -- high --> MAC["Macrocytic anaemia likely"]
    MAC --> Q2{"Postpartum or known to misuse alcohol⁴?"}
    Q2 -- Yes --> FOL["Folate deficiency likely"]
    Q2 -- No --> B12["Refer to investigate for vitamin B12 deficiency"]
```

¹ If SBP < 80, pulse ≥ 100, respiratory rate > 30, confusion/restlessness, weakness, shock likely.
² Black stools may be caused by iron tablets. ³ Mean cell volume. ⁴ > 14 drinks/week or ≥ 4 drinks/session.

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| P (presenting complaint) | Pale conjunctiva, pale skin (`Pale discoloration of entire skin of body`), or anaemia recorded as a finding | `Check for urgent pallor/anaemia conditions` (trigger); first `and` arm of `Urgent: pallor/anaemia with danger signs` |
| U = Yes | `(and <pallor/anaemia> (or …red-box items…))`. Pulse, RR and SBP as vital measurements. Hb < 6 **not encoded** (no Hb unit in the language) | `Urgent: pallor/anaemia with danger signs` |
| U = No → APP, FBC, IDA, SYS, MAC, Q1, Q2, FOL, B12 | Outside the red box: not encoded in this pass | — |
| Footnote ¹ (shock definition) | Not used; "Shock/SBP < 80" encoded as written (decision for all pages) | — |

# Page 44 – Pallor and anaemia: flowchart

Source: `inputs/2026/p44.png` (APC 2026, page 44), red box 1 and the "Approach to the patient
with pallor/anaemia not needing urgent attention" algorithm below it.

```mermaid
flowchart TD
    START["Patient with pallor (pale conjunctiva or palms) or anaemia<br/>(anaemia likely if non-pregnant woman Hb &lt; 12, pregnant woman Hb &lt; 11, man Hb &lt; 13)"]
    START --> RB{"Any of: Hb &lt; 6, pulse ≥ 100, RR ≥ 30, shock¹/SBP &lt; 80, dizzy/faint,<br/>chest pain or palpitations, swollen legs, jaundice, black² or bloody stools,<br/>widespread/easy bruising, purple/red rash that does not disappear with pressure?"}
    RB -- Yes --> URG["Give urgent attention. Manage and refer urgently<br/>(oxygen if RR increased; IV fluids if shock/SBP &lt; 80)"]
    RB -- No --> APP["Approach to patient not needing urgent attention:<br/>test for HIV ↻124, check for TB ↻102, check for pregnancy ↻174"]
    APP --> MAL{"Fever now or in past 3 days,<br/>and in a malaria area in past 3 months?"}
    MAL -- Yes --> MALL["Malaria likely → 39"]
    APP --> PREG{"Not pregnant?"}
    PREG -- Yes --> FBC{"Send FBC: MCV³ result"}
    FBC -- low --> IDA["Iron deficiency anaemia likely"]
    IDA --> IDAQ{"Man, or woman who no longer has periods?"}
    IDAQ -- Yes --> HID["Discuss/refer to look for hidden blood loss"]
    IDAQ -- No --> IRON["Ask about abnormal vaginal bleeding ↻73; iron treatment; advise"]
    FBC -- normal --> SYS["Systemic disease or long-term condition likely"]
    SYS --> SYSM["If HIV, TB and pregnancy excluded, discuss/refer.<br/>If known life-limiting illness, palliative care ↻191"]
    FBC -- high --> MAC["Macrocytic anaemia likely<br/>(if on zidovudine or antiseizure medication, discuss with doctor)"]
    MAC --> MACQ{"Postpartum or known to misuse alcohol⁴?"}
    MACQ -- Yes --> FOL["Folate deficiency likely: folate, advise, refer if chronic diarrhoea"]
    MACQ -- No --> B12["Refer to investigate for vitamin B12 deficiency"]
```

¹ If SBP < 80, pulse ≥ 100, respiratory rate > 30, confusion/restlessness, weakness, shock likely.
² Black stools may be caused by iron tablets; only refer if black stools started before iron treatment.
³ MCV low, normal or high compared to the reference range on the FBC result sheet.
⁴ > 14 drinks/week or ≥ 4 drinks/session.

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| START (presenting complaint) | `(or Pale complexion, Pale conjunctiva, Pale discoloration of entire skin of body, Anemia)` as `clinical_finding`s | trigger of `Check for urgent pallor/anaemia conditions` |
| RB = Yes | `(and <pallor/anaemia> (or …red box items…))`; Hb < 6 not representable | `Urgent: pallor/anaemia with danger signs` |
| RB items to ask | every red-box finding that is not a routine vital | `Check for urgent pallor/anaemia conditions` |
| MAL (question) | pallor/anaemia **and** `(active_condition Fever)` → ask about malaria area | `Check for malaria area exposure in pallor/anaemia with fever` |
| MAL = Yes | pallor/anaemia **and** Fever **and** endemic-area finding for Malaria | `Diagnose probable malaria in pallor/anaemia` |
| PREG, FBC/MCV, IDA, SYS, MAC, IDAQ, MACQ, FOL, B12 | **not modelled**: every branch below the FBC hangs on the MCV result, which the language cannot express (no lab observable or unit) | none (see remaining-questions, Could not model) |
| URG, APP, HID, IRON, SYSM, B12 actions | management / referral / cross-references | none (management_step, cross_reference_only) |

## Notes

- "Fever now or in past 3 days" is modelled as `(active_condition Fever)` only; a fever that has
  resolved within the last 3 days is not captured.
- "In a malaria area in past 3 months": the 3-month window is not modelled; the endemic-area
  finding ("recent area visited") is taken as recent.
- "Not needing urgent attention" is not encoded as a negation: the malaria rule fires whether or
  not the urgent rule also fires.

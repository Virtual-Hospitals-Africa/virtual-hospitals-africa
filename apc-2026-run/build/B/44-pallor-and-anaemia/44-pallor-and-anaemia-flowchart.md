# Page 44 – Pallor and anaemia: flowchart

Source: `inputs/2026/p44.png` (APC 2026, page 44), red box and the "Approach to the patient with
pallor/anaemia not needing urgent attention" algorithm below it.

```mermaid
flowchart TD
    P["Pallor (pale conjunctiva or palms)<br/>or anaemia (Hb &lt; 12 non-pregnant woman, &lt; 11 pregnant woman, &lt; 13 man)"]
    P --> RB{"Any of: Hb &lt; 6, Pulse ≥ 100, RR ≥ 30, Shock¹/SBP &lt; 80, Dizzy/faint,<br/>Chest pain or palpitations, Swollen legs, Jaundice, Black² or bloody stools,<br/>Widespread/easy bruising, Purple/red rash that does not disappear with pressure?"}
    RB -- Yes --> URG["Give urgent attention. Manage and refer urgently"]
    RB -- No --> APP["Test for HIV, check for TB, check for pregnancy"]
    APP --> MAL{"Fever now or in past 3 days<br/>and in a malaria area in past 3 months?"}
    MAL -- Yes --> MALL["Malaria likely → 39"]
    APP --> FBC{"If not pregnant: FBC, MCV³ result"}
    FBC -- "MCV low" --> IDA["Iron deficiency anaemia likely"]
    IDA --> MEN{"Man or woman who no longer has periods?"}
    MEN -- Yes --> HID["Discuss/refer to look for hidden blood loss"]
    MEN -- No --> IRON["Ask about abnormal vaginal bleeding; iron treatment; advise"]
    FBC -- "MCV normal" --> SYS["Systemic disease or long-term condition likely"]
    SYS --> SYSM["If HIV, TB, pregnancy excluded: discuss/refer.<br/>Known life-limiting illness: palliative care"]
    FBC -- "MCV high" --> MAC["Macrocytic anaemia likely.<br/>On zidovudine or antiseizure medication: discuss"]
    MAC --> PP{"Postpartum or known to misuse alcohol⁴?"}
    PP -- Yes --> FOL["Folate deficiency likely: folate, advise"]
    PP -- No --> B12["Refer to investigate for vitamin B12 deficiency"]
```

¹ If SBP < 80, pulse ≥ 100, respiratory rate > 30, confusion/restlessness, weakness, shock likely.
² Black stools may be caused by iron tablets. ³ MCV low/normal/high against the FBC reference range.
⁴ > 14 drinks/week or ≥ 4 drinks/session.

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| P (presenting complaint) | `or` of Pale conjunctiva, Pale complexion, Pale discoloration of entire skin of body (SNOMED synonym "Pallor"), Anemia — as `clinical_finding` | trigger of `Check for urgent pallor/anaemia conditions` and of `Urgent: pallor/anaemia with danger signs` |
| RB = Yes | P **and** `or` of every red-box item except Hb < 6 | `Urgent: pallor/anaemia with danger signs` (items checked by `Check for urgent pallor/anaemia conditions`) |
| RB = No → Approach | Not modelled (HIV/TB/pregnancy checks are pointers to other pages) | — |
| MAL = Yes | P **and** active Fever **and** history of high-risk travel with onset within 3 months | `Diagnose probable malaria in pallor/anaemia` (travel checked by `Check for malaria exposure in pallor/anaemia`) |
| FBC / MCV low / normal / high | Not representable: no MCV or Hb observable in the language | — |
| Iron deficiency / systemic disease / macrocytic / folate deficiency likely | Not representable: every branch hangs on the MCV result | — (see remaining questions) |
| MEN, PP, HID, B12 | Depend on the MCV branch; management/referral only | — |

## Notes

- "Hb < 6" (red box) and the Hb thresholds that define anaemia cannot be expressed; anaemia is
  taken from a recorded `Anemia` finding.
- "Shock¹/SBP < 80" is encoded exactly as an `or` of the Shock finding and systolic BP < 80; the
  footnote's own definition of shock is not built.
- "Not needing urgent attention" is not encoded as a negation: the malaria rule fires whether or
  not the urgent rule also fires.

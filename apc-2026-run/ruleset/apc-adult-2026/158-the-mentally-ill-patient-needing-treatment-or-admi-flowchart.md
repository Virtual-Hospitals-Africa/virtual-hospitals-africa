# Page 158 – The mentally ill patient needing treatment or admission: flowchart

Source: APC 2026 e-book page 158 (red box, then the "Approach to the mentally ill patient in need of
hospital admission/treatment not needing emergency referral" chart).

```mermaid
flowchart TD
    RB["Red box: delay in referral may lead to the mental illness causing any of:<br/>death, irreversible health problem/s, serious harm to self/others,<br/>serious damage to or loss of property"]
    RB -- Yes --> URG["Give urgent attention. Manage and refer urgently with or without consent<br/>(MHCA 01, 24 h assessment; aggression ↻35; underlying causes ↻36; police/MHCA 22)"]
    RB -- No --> APP["Approach: needs admission/treatment, not emergency referral"]
    APP --> C1["Patient able to give informed consent¹"]
    APP --> C2["Patient incapable of giving informed consent¹"]
    C1 --> NR1["Does not refuse"] --> VOL["Admit or treat as Voluntary user<br/>Record in notes/referral letter; escort² or staff accompany if admitted"]
    C1 --> REF["Refuses treatment/admission"]
    C2 --> REF
    C2 --> NR2["Does not refuse"] --> ASS["Admit or treat as Assisted user under MHCA"]
    REF --> Q["Mental illness may result in serious harm to self/others<br/>or serious damage to financial interests/reputation?"]
    Q -- No --> OUT1["Manage as outpatient"]
    Q -- Yes --> INV["Admit or treat as Involuntary user under MHCA"]
    INV --> F["MHCA 04 by escort²/HCP³; two MHCA 05 (MHCP⁴ + doctor)"]
    ASS --> F
    F -- "agree" --> HHE["HHE completes MHCA 07; send forms; police/MHCA 22/48 if needed;<br/>outpatient → forms to MHRB"]
    F -- "do not agree" --> F3["Third MHCP⁴ completes a third MHCA 05"]
    F3 -- agrees --> HHE
    F3 -- "does not agree" --> OUT2["Manage as an outpatient"]
```

Below the chart: a patient with a Court/MHRB order for outpatient care is reviewed and given the
prescribed intervention regardless of consent.

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| Red box (presenting complaint) | `(clinical_finding Mental disorder)` | `Check for urgent risks in the mentally ill patient needing admission` |
| Red box: serious harm to self/others | `At increased risk of self-injurious behavior`, `At increased risk for suicide`, `High risk of harm to others` | same task; `Urgent: mentally ill patient at risk of harm or property damage if referral delayed` |
| Red box: serious damage to or loss of property | `At increased risk for destructive behavior to property` | same task and Urgent rule |
| Red box: death, irreversible health problem/s | Not modelled (no SNOMED concept) | — |
| Manage and refer urgently | Management | — (no manage tasks) |
| Consent / refusal / voluntary / assisted / involuntary user, MHCA forms | Legal routing and management, not triage or diagnosis | — |
| Q: harm to self/others or financial interests/reputation | Legal criterion for involuntary admission; not a priority or diagnosis | — |

## Notes

- Nothing on this page says "X likely" or "consider X", so there are no diagnosis rules.
- The legal flowchart elements sit outside the red box and need no accounting.

# Page 35 – Aggressive/Disruptive Behaviour: flowchart

Source: `inputs/2026/p35.png` (one red box). The red box opens with the urgent-attention criteria;
everything below "Manage urgently" is a sedation algorithm (management only, not encoded).

```mermaid
flowchart TD
    A["Aggressive/disruptive patient"] --> U{"Any of: angry behaviour; challenging, insulting or provocative behaviour;<br/>tense posturing; loud, aggressive speech; frequently changing body position, pacing;<br/>aggressive acts (pounding walls, throwing objects, hitting)?"}
    U -- Yes --> URG["Give urgent attention · Manage urgently"]
    URG --> SAFE["Ensure safety · verbally calm · consider involuntary admission ⮌158 ·<br/>restrain/sedate only if absolutely needed (assess causes ⮌36)"]
    SAFE --> ORAL{"Try to avoid IM/IV sedation (esp. > 65 years or substance user).<br/>Will patient accept oral medication?"}
    ORAL -- Yes --> PO["Diazepam 5mg oral or buccal midazolam 7.5-15mg · assess after 30 minutes"]
    PO -- "Patient calm" --> MON["Monitor vitals/consciousness · reassess cause ⮌36"]
    PO -- "Still aggressive/disruptive after 30 minutes" --> CAUSE
    ORAL -- No --> CAUSE{"Decide which medication to use according to likely cause"}
    CAUSE -- "Stimulant withdrawal / Alcohol withdrawal / Seizures" --> BZ["Midazolam IM or diazepam IV (+ thiamine if alcohol withdrawal)"]
    CAUSE -- "Delirium" --> HAL["Haloperidol IM; if unavailable → olanzapine"]
    CAUSE -- "Psychosis / Cause unknown" --> OLZ["Olanzapine (age-adjusted); midazolam if olanzapine intolerance"]
    HAL --> OLZ
    BZ --> RE{"Assess response after 30 minutes"}
    OLZ --> RE
    RE -- "Patient calm" --> MON
    RE -- "Partial/no response" --> REP["Repeat same dose"] --> MON
    MON --> REF["Refer the mentally ill aggressive patient to hospital same day (MHCA 01 / 48)"]
```

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| Presenting complaint | `(or Aggressive behavior, Disruptive behavior)` | trigger of `Check for urgent aggressive/disruptive behaviour signs` |
| Urgent-attention criteria (U = Yes) | complaint **and** `or` of the eight findings | `Urgent: aggressive/disruptive behaviour with red-box signs` |
| Will patient accept oral medication? | not modelled (management) | — |
| Patient calm / still aggressive after 30 minutes | not modelled (management reassessment) | — |
| Decide medication by likely cause | not modelled: the causes only select a medicine; the page states no "X likely" with evidence | — |
| Assess response / repeat dose / monitor / refer | not modelled (management, referral) | — |

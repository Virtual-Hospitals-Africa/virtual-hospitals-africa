# Page 35 – Aggressive/disruptive behaviour: flowchart

Source: APC 2026 page 35 (APC 2026 e-book page 35, red box 1).

```mermaid
flowchart TD
    RB["Aggressive/disruptive patient with any of:<br/>angry behaviour; challenging, insulting or provocative behaviour;<br/>tense posturing; loud, aggressive speech;<br/>frequently changing body position, pacing; aggressive acts"]
    RB --> URG["Give urgent attention"]
    URG --> MU["Manage urgently: safety, verbal calming,<br/>consider involuntary admission, restrain/sedate only if absolutely needed"]
    MU --> Q1["Try to avoid IM/IV sedation. Ensure resuscitation equipment.<br/>Will patient accept oral medication?"]
    Q1 -- Yes --> ORAL["Give diazepam orally or buccal midazolam.<br/>Assess response after 30 minutes"]
    Q1 -- No --> CAUSE["Decide which medication to use according to likely cause"]
    ORAL --> CALM1["Patient calm"]
    ORAL --> STILL["Patient still aggressive/disruptive after 30 minutes"]
    STILL --> CAUSE
    CAUSE --> C1["Stimulant withdrawal / Alcohol withdrawal / Seizures"]
    CAUSE --> C2["Delirium"]
    CAUSE --> C3["Psychosis / Cause unknown"]
    C1 --> M1["Midazolam IM or diazepam IV (+ thiamine if alcohol withdrawal)"]
    C2 --> M2["Haloperidol IM; if unavailable → olanzapine"]
    C3 --> M3["Olanzapine (midazolam if previous olanzapine intolerance)"]
    M1 --> RE["Assess response after 30 minutes"]
    M2 --> RE
    M3 --> RE
    RE --> CALM2["Patient calm"]
    RE --> REP["Partial/no response: repeat same dose"]
    CALM1 --> MON["Monitor vitals and level of consciousness;<br/>reassess underlying cause (page 36)"]
    CALM2 --> MON
    REP --> MON
    MON --> REF["Refer the mentally ill aggressive patient to hospital same day"]
```

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| Red box (complaint + any of six behaviours) | `(and (or Aggressive behavior, Disruptive behavior) (or …ten findings for the six items…))` | `Urgent: aggressive/disruptive patient with signs of escalating aggression`; findings asked by `Check for urgent aggressive/disruptive behaviour signs` |
| Will patient accept oral medication? (Yes/No) | Not modelled: management (sedation route) | — |
| Patient calm / still aggressive after 30 minutes | Not modelled: response to treatment | — |
| Likely cause (stimulant/alcohol withdrawal, seizures, delirium, psychosis, unknown) | Not modelled: the boxes choose a medicine; the page gives no criteria for diagnosing them | — |
| Repeat dose, monitoring, referral | Not modelled: management | — |

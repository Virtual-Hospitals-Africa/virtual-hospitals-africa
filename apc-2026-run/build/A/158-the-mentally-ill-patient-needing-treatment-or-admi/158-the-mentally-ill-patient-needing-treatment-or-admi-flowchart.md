# Page 158 – The mentally ill patient needing treatment or admission: flowchart

Source: `inputs/2026/p158.png`. The red box is triage; the flowchart below it is a legal (Mental Health Care Act) routing algorithm for patients **not** needing emergency referral.

```mermaid
flowchart TD
    RB["Red box: delay in referral may lead to mental illness causing death, irreversible health problem/s,<br/>serious harm to self/others, or serious damage to/loss of property"]
    RB -- Yes --> URG["Urgent: manage and refer with or without consent (MHCA 01, 24 h assessment)"]
    RB -- No --> A["Approach to the mentally ill patient needing admission/treatment, not emergency"]
    A --> C1["Patient able to give informed consent¹"]
    A --> C2["Patient incapable of giving informed consent¹"]
    C1 --> NR1["Does not refuse"] --> VOL["Voluntary user"]
    C1 --> R["Refuses treatment/admission"]
    C2 --> R
    C2 --> NR2["Does not refuse"] --> ASS["Assisted user (MHCA)"]
    R --> Q["Requires treatment/admission for illness that may result in<br/>seriously harming self/others or serious damage to financial interests/reputation?"]
    Q -- No --> OP1["Manage as outpatient"]
    Q -- Yes --> INV["Involuntary user: MHCA 04, two MHCA 05 forms"]
    INV --> AG{"Two MHCA 05 forms agree?"}
    AG -- Yes --> HHE["HHE completes MHCA 07; transfer / outpatient steps"]
    AG -- No --> T["Third MHCA 05"]
    T -- agrees --> HHE
    T -- does not agree --> OP2["Manage as an outpatient"]
    ASS --> INV
```

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| Red box | Mental disorder **and** any of: increased risk of self-injurious behaviour, high risk of harm to others, increased risk of destructive behaviour to property | `Check for urgent risks in the mentally ill patient needing treatment or admission`; `Urgent: mentally ill patient at risk of serious harm or property damage` |
| Red box: death, irreversible health problem/s | Not modelled (no SNOMED concept) | – |
| Consent / refusal / MHCA user type / forms | Legal and management routing, not triage or diagnosis | Not modelled |

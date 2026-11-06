# Page 34 – Self-harm or suicide: flowchart

Source: `inputs/2026/p34.png` (red box; the whole algorithm sits inside it).

```mermaid
flowchart TD
    H["Give urgent attention to the patient who has<br/>attempted/considered self-harm or suicide"]
    H --> Q1["Has patient attempted self-harm or suicide?"]
    Q1 -- Yes --> ABC["First assess and manage airway, breathing, circulation<br/>and level of consciousness 18.<br/>If overdose or exposure to harmful substance 27.<br/>If exposed to carbon monoxide, give 100% face mask oxygen."]
    ABC --> MGMT
    Q1 -- No --> Q2["Does patient have current thoughts or plans to attempt suicide?"]
    Q2 -- Yes --> HIGH["High risk of self-harm or suicide"]
    Q2 -- No --> Q3["Has patient had thoughts/plans of self-harm or suicide in past month<br/>or performed act of self-harm or suicide in past year?"]
    Q3 -- Yes --> Q4["Is patient agitated, violent, distressed or uncommunicative?"]
    Q3 -- No --> LOW["Low risk of self-harm or suicide"]
    Q4 -- Yes --> HIGH
    Q4 -- No --> LOW
    HIGH --> MGMT["Avoid leaving patient alone. Remove means of self-harm.<br/>If aggressive/violent, assess with other staff… Sedate only if necessary 35.<br/>Refer urgently… consider involuntary admission 158."]
    LOW --> BELOW["Manage below (assess / advise sections)"]
```

Note: the Yes branch of Q1 joins the same management box as "High risk" but does not pass through
the "High risk" box. It is Urgent through the header rule and is not diagnosed as high risk
(reconciler decision; see remaining questions).

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| Header: attempted/considered self-harm or suicide | Trigger: `Suicide attempt`, `Intentionally harming self`, `Suicidal thoughts`, `Thoughts of self harm` (covers `Suicidal thoughts`, `Planning suicide`, `Thoughts of deliberate self harm` and their descendants) | `Check for self-harm or suicide risk`; `Urgent: attempted/considered self-harm or suicide` |
| Q1 = Yes | `Suicide attempt` or `Intentionally harming self` recorded in the encounter | `Urgent: attempted/considered self-harm or suicide` (no risk diagnosis) |
| Q2 = Yes | `Suicidal thoughts` or `Planning suicide`, each with qualifier `Current` | `Diagnose probable high risk of self-harm or suicide`, first branch |
| Q3 = Yes → Q4 = Yes | (onset of `Thoughts of self harm`, `Suicidal thoughts` or `Planning suicide` within 1 month, **or** onset of `History of attempted suicide` / `History of deliberate self harm` within 1 year) **and** any of `Feeling agitated`, `Aggressive behavior`, `Distress`, `Does not communicate` | same rule, second branch |
| Q4 = No → Low risk | No attempt, no current suicidal thoughts/plans, and none of the four Q4 findings (explicit `no` records) | `Diagnose probable low risk of self-harm or suicide` |
| Q3 = No → Low risk | Not modelled: "no thoughts in past month" cannot be expressed as a time-limited negative | see remaining-questions, Could not model |
| ABC / overdose / CO / management box | Management, not encoded | — |

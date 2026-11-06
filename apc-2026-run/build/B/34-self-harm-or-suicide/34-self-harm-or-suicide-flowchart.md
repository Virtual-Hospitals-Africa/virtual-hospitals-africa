# Page 34 – Self-harm or suicide: flowchart

Source: `inputs/2026/p34.png` (red box, one flowchart).

```mermaid
flowchart TD
    H["Give urgent attention to the patient who has attempted/considered self-harm or suicide"]
    H --> Q1["Has patient attempted self-harm or suicide?"]
    Q1 -- Yes --> ABC["First assess and manage airway, breathing, circulation, LOC 18<br/>If overdose/harmful substance 27<br/>If carbon monoxide: 100% face mask oxygen"]
    ABC --> MGMT["Avoid leaving patient alone. Remove means of self-harm.<br/>If aggressive/violent: staff safety, sedate only if necessary 35.<br/>Refer urgently. Consider involuntary admission 158."]
    Q1 -- No --> Q2["Does patient have current thoughts or plans to attempt suicide?"]
    Q2 -- Yes --> HIGH["High risk of self-harm or suicide"]
    Q2 -- No --> Q3["Has patient had thoughts/plans of self-harm or suicide in past month<br/>or performed act of self-harm or suicide in past year?"]
    Q3 -- Yes --> Q4["Is patient agitated, violent, distressed or uncommunicative?"]
    Q3 -- No --> LOW["Low risk of self-harm or suicide<br/>Manage below."]
    Q4 -- Yes --> HIGH
    Q4 -- No --> LOW
    HIGH --> MGMT
```

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| Header (presenting complaint) | Suicide attempt, intentional self-harm, suicidal thoughts or thoughts of self-harm recorded | `Check for self-harm or suicide risk` (trigger) |
| Q1 = Yes | `Suicide attempt` (event) or `Intentionally harming self` (event) | `Urgent: attempted self-harm or suicide` |
| Q2 = Yes | `Suicidal thoughts` or `Planning suicide`, each with qualifier `Current` | `Diagnose probable high risk of self-harm or suicide`, first branch |
| Q3 = Yes → Q4 = Yes | (onset of suicidal thoughts / thoughts of self-harm / planning suicide within 1 month, or onset of a past suicide attempt / self-harm act within 1 year) **and** any of feeling agitated, aggressive behaviour, distress, does not communicate | `Diagnose probable high risk of self-harm or suicide`, second branch |
| High risk | `(active_condition High suicide risk)` | `Urgent: high risk of self-harm or suicide` |
| Q3 = No / Q4 = No → Low risk | Not modelled as a rule (routing to "Manage below"; low risk carries no triage priority) | — |
| Management boxes | Management steps, not modelled (no `manage` tasks in this pass) | — |

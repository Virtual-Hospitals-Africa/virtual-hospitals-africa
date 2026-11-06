# Page 45 – Collapse/Falls: flowchart

Source: `inputs/2026/p45.png` (APC 2026, page 45). The red box is a flat "any of" list; the
flowchart below it is "Approach to the patient who has collapsed not needing urgent attention".

```mermaid
flowchart TD
    START["Patient who has collapsed (Collapse/Falls)"]
    START --> RB{"Red box: any of the urgent criteria?<br/>(stroke/TIA signs, recent injury, shock/SBP &lt; 80,<br/>sudden collapse + anaphylaxis features, palpitations / pulse &lt; 50 / irregular,<br/>family history of collapse/sudden death, abnormal ECG / known heart problem,<br/>decreased consciousness, collapse with exercise, seizure,<br/>collapse following vaccination, chest pain, vomited blood / blood in stool,<br/>difficulty breathing, severe back/abdominal pain, glucose &lt; 3 (&lt; 4 if diabetes),<br/>pregnant / missed period + abdominal pain + vaginal bleeding)"}
    RB -- Yes --> URG["Give urgent attention. Manage and refer urgently"]
    RB -- No --> APP["Approach: do ECG (abnormal → refer same day);<br/>check Hb (&lt; 12 woman / &lt; 13 man → anaemia likely 44);<br/>screen for substance use (→165); check BP (≥ 140/90 → 148)"]
    APP --> Q1{"Lying BP after 5 min, then standing after 3 min:<br/>systolic drop ≥ 20 or diastolic drop ≥ 10?"}
    Q1 -- Yes --> OH["Orthostatic hypotension likely"]
    Q1 -- No --> Q2{"Breathing very quickly or deeply immediately<br/>before or during the collapse?"}
    Q2 -- Yes --> HV["Hyperventilation likely"]
    Q2 -- No --> Q3{"Dizziness, light-headedness, nausea, sweating,<br/>weakness or vision changes before the collapse?"}
    Q3 -- Yes --> CF["Common faint likely"]
    Q3 -- No --> OTHER["Collapse with coughing/swallowing/head turning → refer;<br/>known diabetes → 145"]
    OH --> NONE["If none of the above: look for likely cause (vision 48, joints 77, feet 81, legs 80, dementia 166).<br/>Refer if &gt; 65 with possible heart disease, repeated collapse/falls or uncertain cause"]
    HV --> NONE
    CF --> NONE
    OTHER --> NONE
```

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| Presenting complaint | `Collapse` (finding) or `Falls` (finding) | `due_to` of `Check for urgent collapse/falls conditions`, `Check for cause of collapse/falls`, `Measure postural blood pressure drop after collapse/falls`; first `and` term of `Urgent: collapse/falls with danger signs` |
| Red box (any of) | `(and complaint (or …all red-box items…))` | `Urgent: collapse/falls with danger signs`; items checked for in `Check for urgent collapse/falls conditions` |
| Red box: "consider stroke or TIA" | Sudden-onset face/arm/leg weakness or numbness, difficulty talking, visual disturbance | `Collapse/falls: consider stroke`, `Collapse/falls: consider TIA` (possible) |
| Red box: "Sudden collapse and any of … check for anaphylaxis" | Sudden-onset collapse **and** any of the listed features or exposure to a footnote-1 allergen | `Collapse/falls: check for possible anaphylaxis` (possible; triggers the anaphylaxis page's check) and a branch of the Urgent rule |
| Approach: ECG | `Electrocardiogram abnormal` is already a red-box item; "refer same day" is management | — |
| Approach: Hb → anaemia likely | Haemoglobin has no observable/unit in the language | Not encoded (see remaining questions) |
| Approach: substance use, BP ≥ 140/90 | Routing to other pages | Not encoded |
| Q1 = Yes | Level of reduction in systolic BP on standing ≥ 20 mmHg (diastolic drop not representable) | `Diagnose probable orthostatic hypotension after collapse/falls`; measured by `Measure postural blood pressure drop after collapse/falls` |
| Q1 = No → Q2 = Yes | Tachypnoea or excessively deep breathing | `Diagnose probable hyperventilation after collapse/falls` |
| Q2 = No → Q3 = Yes | Any of dizziness, light-headedness, nausea, sweating, weakness (asthenia), visual disturbance | `Diagnose probable common faint after collapse/falls` |
| Q3 = No, bottom box | Referral / routing | Not encoded (management, routing) |

## Notes

- The "No" preconditions of Q2 and Q3 (no postural drop; no fast/deep breathing) are **not**
  encoded, following the gold standard's handling of sequential questions; the three "likely"
  rules can therefore fire together. "Before / during the collapse" timing is not modelled.
- BP drop: only the systolic arm can be expressed (`Level of reduction in systolic blood pressure
  on standing`); there is no diastolic counterpart in SNOMED.

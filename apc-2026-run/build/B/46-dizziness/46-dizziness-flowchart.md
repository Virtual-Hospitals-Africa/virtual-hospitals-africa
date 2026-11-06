# Page 46 – Dizziness: flowchart

Source: `inputs/2026/p46.png` (APC 2026 e-book, page 46). Red box first, then the
"Approach to the patient with dizziness not needing urgent attention" algorithm.

```mermaid
flowchart TD
    D["Patient with dizziness"] --> RB{"Any of (red box):<br/>new sudden weakness/numbness of face, arm or leg; difficulty speaking or visual disturbance<br/>recent head injury · unable to stand without support<br/>new sudden severe dizziness with nausea/vomiting, abnormal eye movements/walk<br/>shock/SBP &lt; 80 · difficulty breathing · pulse &lt; 50 or irregular<br/>chest pain · glucose &lt; 3 (or &lt; 4 if diabetes)"}
    RB -- Yes --> URG["Give urgent attention; manage and refer urgently<br/>(weakness/speech/vision items: consider stroke or TIA → 152)"]
    RB -- No --> APP["Approach: ask about ear symptoms (→50), fainting/collapse (ECG),<br/>substance use (→165), medication review, Hb (anaemia → 44), BP ≥ 140/90 (→148)"]
    APP --> OH{"Lying 5 min then standing 3 min:<br/>systolic drop ≥ 20 or diastolic drop ≥ 10?"}
    OH -- Yes --> OHL["Orthostatic hypotension likely"]
    OH -- No --> HV{"Breathing very quickly or deeply immediately<br/>before or during the collapse?"}
    HV -- Yes --> HVL["Hyperventilation likely"]
    HV -- No --> EAR{"Hearing loss or tinnitus?"}
    EAR -- Yes --> REF["Refer"]
    EAR -- No --> SEC["Sudden dizziness lasting seconds,<br/>precipitated by head movements"]
    EAR -- No --> HRS["Sudden dizziness lasting hours/days with nausea/vomiting.<br/>May have preceding flu-like illness"]
    SEC --> PV["Positional vertigo likely"]
    HRS --> VN["Vestibular neuronitis likely"]
    OHL --> END["If none of the above, check TSH. Refer if no cause found / persists / uncertain"]
    HVL --> END
    PV --> END
    VN --> END
```

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| Presenting complaint | `(clinical_finding Dizziness)` (a recorded common symptom) | trigger of `Check for urgent dizziness conditions`, `Check for causes of dizziness not needing urgent attention`, `Measure lying and standing BP for dizziness` |
| RB = Yes | `(and Dizziness (or …red-box items…))`; shock/SBP < 80 as `(or Shock (< SBP 80))`; glucose as `(or (< glucose 3) (and known diabetes (< glucose 4)))` | `Urgent: dizziness with danger signs` |
| "consider stroke or TIA" | `possible` diagnoses from the sudden weakness/numbness/speech/vision items | `Diagnose possible stroke in dizziness`, `Diagnose possible TIA in dizziness` |
| OH (postural BP drop) | **Not modelled**: the language cannot compare two measurements (a drop). Lying and standing BP are requested by a `measure` task only | `Measure lying and standing BP for dizziness` (no diagnosis rule) |
| HV = Yes | Tachypnoea or deep breathing | `Diagnose probable hyperventilation in dizziness` |
| EAR = Yes | Hearing loss or tinnitus → Refer (management; no rule). Used as `(no …)` in the two branches below | — |
| EAR = No → SEC | Sudden-onset positional vertigo, no hearing loss/tinnitus, no tachypnoea/deep breathing | `Diagnose probable positional vertigo` |
| EAR = No → HRS | Sudden-onset dizziness with nausea or vomiting, no hearing loss/tinnitus, no tachypnoea/deep breathing | `Diagnose probable vestibular neuronitis` |
| Approach bullets, TSH, Refer | management / cross-references; not modelled | — |

## Notes

- The "No" branch of the orthostatic question cannot be expressed, so the hyperventilation,
  positional vertigo and vestibular neuronitis rules do not require "no postural BP drop".
- "Lasting seconds" vs "lasting hours/days" is an episode duration; the language has onset
  comparisons only, so duration is not modelled.

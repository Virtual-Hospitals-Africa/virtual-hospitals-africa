# Page 86 – Itch with no rash: flowchart

Source: `inputs/2026/p86.png`. The red box is a pointer only ("Check if the patient needs urgent
attention 82"); the page's own logic is the flowchart below it.

```mermaid
flowchart TD
    PTR["Check if the patient needs urgent attention ⮌ 82<br/>(red box: pointer only)"]
    PTR --> PRE["Confirm there is no rash, scabies, lice or insect bites.<br/>If generalised itchy rash → 84. If localised itchy rash → 85.<br/>If itch around anus only → 61."]
    PRE --> Q1["Is the skin very dry?"]
    Q1 -- Yes --> DRY["Dry skin (xeroderma/ichthyosis) likely"]
    Q1 -- No --> Q2["Did the patient start any new medication<br/>in the weeks before the itch started?"]
    Q2 -- Yes --> MED["Medication side-effect likely<br/>(discuss with doctor; advise to return if rash develops or itch persists)"]
    Q2 -- No --> JAUN["If yellow skin/eyes, jaundice likely → 94"]
    JAUN --> PERSIST["If itch persists > 2 weeks: test for anaemia 44, HIV 124, diabetes 19;<br/>refer to doctor same day"]
    MED --> SYM["If severe itch: chlorphenamine. If long-term itch: cetirizine"]
    PERSIST --> SYM
    DRY --> ADV["Advise: skin care (avoid hot baths, aqueous cream wash, emulsifying ointment …)<br/>If life-limiting illness, palliative care 191"]
    SYM --> ADV
    ADV --> END["If no better or diagnosis uncertain, discuss/refer"]
```

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| Presenting complaint | `(clinical_finding Itching)` | `Check for causes of itch with no rash` (trigger) |
| "Confirm there is no rash, scabies, lice or insect bites" | Checked for; every diagnosis rule requires `(no …)` of rash (Eruption), scabies, lice and insect bite | All three diagnosis rules |
| Rash → 84 / 85; itch around anus only → 61 | Routing to other pages; not encoded | – |
| Q1 Yes: skin very dry | `Severe dry skin` (child of Xeroderma) | `Diagnose probable dry skin causing itch with no rash` |
| Q1 No → Q2 Yes: new medication in the weeks before itch | `(no Severe dry skin)` and `New medication commenced` | `Diagnose probable medication side-effect causing itch with no rash` |
| Q1 No → Q2 No → yellow skin/eyes | `(no Severe dry skin)`, `(no New medication commenced)`, and Yellow skin or Scleral icterus | `Diagnose probable jaundice in itch with no rash` |
| Itch persists > 2 weeks → tests, refer | Management (tests, referral); not encoded | – |
| Antihistamines, advice, palliative care, discuss/refer | Management; not encoded | – |

## Notes

- "In the weeks before the itch started" cannot be expressed: the language compares an onset with
  `time_ago`, not with another finding's onset. The rule uses the bare finding.

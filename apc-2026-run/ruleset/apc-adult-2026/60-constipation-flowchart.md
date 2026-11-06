# Page 60 – Constipation: flowchart

Source: APC 2026 e-book page 60. The page has no drawn flowchart; this
traces its red box and its multi-step "if … check … if present, X likely" bullets.

```mermaid
flowchart TD
    C["Patient with constipation"]
    C --> U{"No stools or flatus/wind in the past 24 hours<br/>with abdominal pain/distension?"}
    U -- Yes --> URG["Give urgent attention. Refer same day."]
    U -- No --> A["Approach to the patient not needing urgent attention"]
    A --> HB["Check Hb. If &lt; 12 (woman) or &lt; 13 (man): anaemia likely ↻ 44"]
    A --> TSH["Weakness/tiredness, weight gain, low mood, dry skin, cold intolerance → check TSH"]
    A --> G{"&gt; 65 years, bed-bound/receiving palliative care,<br/>or overflow diarrhoea?"}
    G -- Yes --> R{"Solid immobile bulk of stool in rectum?"}
    R -- Yes --> IMP["Impaction likely: refer"]
    C --> CRC{"Any common colorectal cancer symptom?<br/>change in bowel habits, rectal bleeding/blood in stool,<br/>persistent abdominal discomfort (cramps, gas, pain),<br/>tenesmus, unexplained weight loss/weakness/fatigue"}
    CRC -- Yes --> REF["Discuss/refer (colorectal cancer)"]
```

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| Patient with constipation | `(clinical_finding Constipation)`, a recorded common symptom | trigger of `Check for urgent constipation conditions` and `Check for colorectal cancer symptoms in constipation` |
| Urgent box | Constipation **and** Obstipation with onset ≥ 24 hours ago **and** Unable to break wind with onset ≥ 24 hours ago **and** (abdominal pain **or** distension of abdomen) | `Urgent: constipation with no stools or flatus for 24 hours` |
| Anaemia (Hb) | Not modelled: Hb has no observable/unit in the language | none |
| TSH bullet | Not modelled: TSH is a lab value with no unit; no diagnosis is named | none |
| Impaction gate | Constipation **and** (bed-ridden **or** seen by palliative care service **or** chronic constipation with overflow). "> 65 years" cannot be expressed | `Check for faecal impaction in constipation` (task), and the gate inside `Diagnose probable faecal impaction` |
| Bulk of stool in rectum → impaction likely | Hard stool with finding site rectum, plus the gate | `Diagnose probable faecal impaction` |
| Colorectal cancer symptoms | Any of the listed symptoms in a constipated patient → `possible` colorectal cancer | `Diagnose possible colorectal cancer in constipation` |
| Treat / advise sections | Management | none |

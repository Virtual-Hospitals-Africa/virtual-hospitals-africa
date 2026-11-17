# Page 14 – Observation post vaccination: flowchart

Source: `inputs/2026/p14.png` (APC 2026, page 14). The only red box is the pointer
"Treat as anaphylaxis → 28"; the decision logic that leads to it sits outside the red box.

```mermaid
flowchart TD
    START["Observe patient ≥ 15 min after vaccination<br/>(30 min if known severe allergies).<br/>Check for signs or symptoms of an adverse reaction"]
    START --> COL["Collapse → 15"]
    START --> FAINT["Feeling faint/unwell symptoms:<br/>light-headedness or dizziness, feeling warm or cold, sweating,<br/>palpitations, visual 'blurring', reduced hearing, pallor reported by onlookers"]
    START --> SKIN["Skin/mucosal: itchiness, skin rash (hives),<br/>swelling of eyes, lips, tongue, face or hands/feet, nasal congestion"]
    START --> RESP["Respiratory: wheeze or cough, throat tightness, stridor,<br/>shortness of breath, hoarseness, sats &lt; 92%, trouble swallowing, drooling"]
    START --> GI["Gastrointestinal: nausea, vomiting, diarrhoea, cramps"]
    FAINT --> FMG["Lean forward / lie flat, loosen clothing,<br/>cool cloth, reassure (management)"]
    FMG --> IMP{"Do symptom/s improve quickly (minutes)?"}
    IMP -- Yes --> OBS["Observe until symptoms resolve"]
    IMP -- No --> D1
    SKIN --> D1
    RESP --> D1
    GI --> D1
    D1{"Decide when to treat for anaphylaxis:<br/>Are 2 or more body systems involved?"}
    D1 -- Yes --> TREAT["Treat as anaphylaxis → 28 (red box)"]
    D1 -- No --> D2{"Generalised urticaria (raised red rash/hives)<br/>involving the whole body?"}
    D2 -- Yes --> TREAT
    D2 -- No --> D3{"Serious or life-threatening, even if single system?<br/>(hypotension, respiratory distress,<br/>significant swelling of tongue or lips)"}
    D3 -- Yes --> TREAT
    D3 -- No --> ISO["Isolated rash, otherwise well: monitor ≥ 30 min.<br/>No other symptoms and remains well → pseudoallergic self-limiting rash likely.<br/>Other symptoms → discuss with doctor urgently.<br/>In doubt → treat as anaphylaxis → 28"]
```

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| START (check for adverse reaction) | `Vaccination given` (situation) triggers a `check_for` of every listed sign and symptom, plus "Generally unwell" for "otherwise well" | `Check for adverse reaction after vaccination` |
| Collapse → 15 | Cross-reference only; page 15 handles collapse | not encoded |
| IMP (improve quickly?) | **Not modelled**: the language cannot express "improved within minutes". Faint/unwell symptoms count as a body system in D1 whether or not they improved | — |
| D1 = Yes | `any2` of the four groups (faint/unwell, skin/mucosal, respiratory, GI), each group an `or` so it counts once | `Diagnose probable anaphylaxis after vaccination`, `any2` branch |
| D2 = Yes | `Urticaria` with qualifier `Generalized` | same rule, second branch |
| D3 = Yes | `Low blood pressure`, `Respiratory distress`, `Swelling` of tongue or lip with `Severe (severity modifier)` | same rule, remaining branches |
| TREAT | `probable` Anaphylaxis; urgency and treatment are on page 28 (pointer-only red box) | no priority evaluation on this page |
| ISO | Vaccination given, urticaria, and recorded absence (`no`) of every other checked sign including generalised urticaria and "generally unwell" | `Diagnose probable pseudoallergic rash after vaccination` |
| "If in doubt, treat as anaphylaxis" | Not representable (clinical judgment) | — |

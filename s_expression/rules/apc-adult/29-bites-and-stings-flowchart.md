# Page 29 – Bites and stings: flowchart

Source: `inputs/2026/p29.png` (APC 2026 e-book, page 29): red box, then the approach to the patient
not needing urgent attention, which branches by type of bite.

```mermaid
flowchart TD
    START["Patient with a bite/sting"] --> RB{"Any of (red box):<br/>snake bite even if not seen · scorpion sting · deep or large wound needing sutures ·<br/>actively bleeding · venom in eyes · weakness · drooping eyelids ·<br/>difficulty swallowing/speaking · double vision · shock²/systolic BP &lt; 80 ·<br/>spider bite with drooling, restlessness, muscle cramps"}
    START --> ANA{"Sudden onset of generalised itch/rash, face/tongue itch/swelling, tight throat,<br/>hoarseness, cough, difficulty breathing, wheeze, chest pain, dizziness/collapse,<br/>abdominal pain/nausea/vomiting/diarrhoea or exposure to possible allergen³?"}
    ANA -- Yes --> ANAL["Anaphylaxis likely → 28"]
    ANAL --> URG
    RB -- Yes --> URG["Give urgent attention: manage and refer urgently"]
    RB -- No --> APP["Approach to the patient not needing urgent attention:<br/>wash wound, dress, tetanus toxoid, analgesia.<br/>Manage further according to type of bite"]
    APP --> SP["Spider bite or insect bite/sting"]
    APP --> AN{"Animal bite: dog, cat, cow, goat, donkey, horse, sheep,<br/>mongoose, jackal, seal or any contact with a bat?"}
    APP --> HU["Human bite: PEP if broken skin 122; antibiotics"]
    SP --> SPM["Bee sting: remove stinger. Severe pain/itch/redness/swelling: ice, chlorphenamine, calamine"]
    SPM --> PU{"Extensive local response to bite?"}
    PU -- Yes --> PUL["Papular urticaria likely → 84"]
    SPM --> RET
    AN -- No --> RET["Advise to return if worse/no better after 2 days"]
    AN -- Yes --> Q2{"Strange behaviour in animal³, unprovoked attack,<br/>animal's immunisation status unknown?"}
    Q2 -- No --> RET
    Q2 -- Yes --> Q3{"Impaired immunity⁴, any contact with a bat, broken skin with blood,<br/>animal licked broken skin/eyes/mouth?"}
    Q3 -- No --> RAB1["Discuss with ID specialist/NICD; rabies vaccine ×4; antibiotics if bite on hand"]
    Q3 -- Yes --> RAB2["Discuss with ID specialist/NICD; rabies vaccine ×4; rabies immunoglobulin if &lt; 7 days since first vaccine; antibiotics"]
    RET --> CEL{"Skin red, warm, painful?"}
    CEL -- Yes --> CELL["Cellulitis likely → 83"]
```

Footnotes: ¹ obtain description of spider/snake/scorpion. ² If SBP < 80, pulse ≥ 100, respiratory
rate > 30, confusion/restlessness, weakness, shock likely. ³ (allergen) medications, new food or
insect bite/sting within the last few hours; ³ (animal) sick animal or domestic animal with unusual
aggression or wild animal that appears tame. ⁴ Symptomatic HIV, chemotherapy/radiotherapy, dialysis
or long-term corticosteroids.

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| Patient with a bite/sting | `(or Bite - wound, Venomous sting)`. `Insect bite - wound` (common symptom), `Snake bite - wound`, `Spider bite wound` and `Poisoning due to bite of Scorpiones` all descend from `Bite - wound`; `Insect sting` descends from `Venomous sting` | Trigger of `Check for urgent bite/sting conditions` |
| Red box items | Each item a `check_for` finding; deep or large wound as `Deep bite wound` or `Bite - wound` + `Large`; venom in eyes as `Toxic effect of venom` at `Structure of eye proper`; spider bite as `(and Spider bite wound (or drooling, restlessness, cramp))`; shock as `(or Shock, systolic BP < 80)` | `Urgent: bite/sting with danger signs` |
| Anaphylaxis likely | Bite/sting **and** any sudden-onset item of the list | `Diagnose probable anaphylaxis after bite/sting`; consumed by `Urgent: bite/sting with danger signs` via `(active_condition Anaphylaxis)` |
| Papular urticaria likely | Spider/insect bite or insect sting **and** extensive insect bite reaction | `Diagnose probable papular urticaria after bite/sting` |
| Cellulitis likely | Bite/sting **and** erythema **and** warm skin **and** pain of skin | `Diagnose probable cellulitis after bite/sting` |
| Animal-bite rabies questions (Q2, Q3) and human bite | Management routing only (PEP, rabies vaccine/immunoglobulin, antibiotics); no "likely"/"consider" diagnosis | Not modelled (management) |

## Notes

- "Advise to return if worse/no better after 2 days" is a follow-up instruction, not modelled; the
  cellulitis rule fires whenever its findings are recorded, on this or a later visit.
- Footnote 2 ("shock likely") is not modelled as its own diagnosis rule; the red box item is
  encoded as written, `Shock` or systolic BP < 80 (see remaining questions).

# Page 29 – Bites and stings: flowchart

Source: APC 2026 e-book, page 29 (`inputs/2026/p29.png`). The red box is a list ("Give urgent
attention to the patient with a bite/sting and any of: …"); below it, "Approach to the patient
with a bite/sting not needing urgent attention" splits by type of bite.

```mermaid
flowchart TD
    START["Patient with a bite/sting"] --> RB{"Red box: any of snake bite, scorpion sting,<br/>deep/large wound needing sutures, actively bleeding, venom in eyes,<br/>weakness, drooping eyelids, difficulty swallowing/speaking, double vision,<br/>shock/SBP &lt; 80, spider bite with drooling/restlessness/muscle cramps,<br/>sudden-onset allergic symptoms (anaphylaxis likely → 28)?"}
    RB -- Yes --> URG["Manage and refer urgently"]
    RB -- No --> APP["Approach to the patient not needing urgent attention:<br/>wash wound, tetanus toxoid, pain relief"]
    APP --> T{"Type of bite or exposure"}
    T -- "Spider bite or insect bite/sting" --> INS["Bee sting: remove stinger. Severe pain/itch/redness/swelling: ice pack, chlorphenamine, calamine"]
    INS --> PU{"Extensive local response to bite?"}
    PU -- Yes --> PUL["Papular urticaria likely → 84"]
    INS --> RET["Advise to return if worse/no better after 2 days"]
    T -- "Animal bite" --> A1{"Bite from dog, cat, cow, goat, donkey, horse, sheep,<br/>mongoose, jackal, seal, or any contact with a bat?"}
    A1 -- No --> RET
    A1 -- Yes --> A2{"Strange behaviour in animal, unprovoked attack,<br/>animal's immunisation status unknown?"}
    A2 -- No --> RET
    A2 -- Yes --> A3{"Impaired immunity, any contact with a bat,<br/>broken skin with blood, animal licked broken skin/eyes/mouth?"}
    A3 -- No --> RV["Discuss with ID specialist/NICD; rabies vaccine x4;<br/>if bite involves hand, antibiotics"]
    A3 -- Yes --> RVI["Discuss with ID specialist/NICD; rabies vaccine x4;<br/>rabies immunoglobulin if &lt; 7 days since first vaccine; antibiotics"]
    T -- "Human bite" --> HB["If broken skin, PEP → 122; antibiotics"]
    RV --> ABX["Antibiotic regimen"]
    RVI --> ABX
    HB --> ABX
    RET --> CEL{"Skin red, warm, painful?"}
    CEL -- Yes --> CELL["Cellulitis likely → 83"]
```

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| Patient with a bite/sting | `Bite - wound` (covers snake, spider, animal, human and insect bite wounds as descendants), `Insect bite - wound` (the recorded common symptom) or `Insect sting` | due_to of `Check for urgent bite and sting conditions` |
| Red box, anaphylaxis item | Bite/sting **and** sudden onset of any of the listed symptoms | `Diagnose probable anaphylaxis after a bite or sting` |
| Red box (all items) | `(and bite/sting (or …red box items…, (active_condition Anaphylaxis)))` | `Urgent: bite or sting with danger signs` |
| Spider bite or insect bite/sting → extensive local response | `Insect bite reaction` with the `Extensive` qualifier (itself a kind of insect bite wound; SNOMED has no spider or sting equivalent) | `Diagnose probable papular urticaria after a bite or sting` |
| Return box → skin red, warm, painful | Bite/sting **and** erythema **and** warm skin **and** pain of skin | `Diagnose probable cellulitis after a bite or sting` |
| Animal bite questions (A1–A3), human bite | Not modelled: these route to rabies vaccine, immunoglobulin, PEP and antibiotics (management only); no diagnosis is named | — |

## Notes

- The red box's "Manage and refer urgently" list and the whole non-urgent approach are management
  and are not modelled (no `manage` tasks in this pass).
- The cellulitis box is reached from the spider/insect branch and the two low-risk animal-bite "No"
  branches. The rule applies it to any bite/sting, because the language cannot cleanly express the
  animal-bite routing; see the remaining-questions file.

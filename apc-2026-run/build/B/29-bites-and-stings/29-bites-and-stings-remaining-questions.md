# Page 29 – Bites and stings: remaining questions

## Decisions made

- **Presenting complaint.** "Bite/sting" is `Bite - wound` (snake, spider, animal, human and insect
  bite wounds are all descendants), `Insect bite - wound` (the recorded common symptom, listed
  explicitly so that rules using it count as checked for) or `Insect sting`. Only
  `Insect bite - wound` is a recorded common symptom; a general bite or a sting is not yet one.
- **Scorpion sting** is `Poisoning due to bite of Scorpiones` (disorder). SNOMED has no
  "scorpion sting" clinical finding, and this concept is not under `Bite - wound` or
  `Insect sting`. So it is checked for, and it is also added to the bite/sting context of the
  priority rule and the anaphylaxis rule, so that a scorpion sting alone still counts.
- **Shock/SBP < 80** is encoded as this page's own logic: `(or Shock (< systolic BP 80))`.
- **Footnote 2** ("If SBP < 80, pulse ≥ 100, respiratory rate > 30, confusion/restlessness,
  weakness, shock likely") is not encoded as a probable Shock rule. It is ambiguous whether one
  feature is enough, and with "any one" a pulse ≥ 100 alone would make shock likely. The red box
  already lists weakness and SBP < 80 on their own.
- **Spider bite with drooling, restlessness, muscle cramps** is read as spider bite **and any one**
  of the three signs.
- **Anaphylaxis item.** "Sudden onset of … or exposure to possible allergen³, anaphylaxis likely".
  Footnote 3 defines the allergen as medication, new food or insect bite/sting in the last few
  hours. Every patient on this page already has a bite/sting, so the exposure is read as that
  context, not as a criterion on its own (on its own it would make every bite/sting "anaphylaxis
  likely"). The rule is `Diagnose probable anaphylaxis after a bite or sting`: bite/sting **and** a
  sudden onset of any listed symptom. "Sudden onset" is applied to every symptom in the list,
  because the page puts it in front of the whole list. The priority rule uses
  `(active_condition Anaphylaxis)`.
- **Actively bleeding** is plain `Bleeding` (the current encounter). The warning sign's
  `Uncontrolled` qualifier would be narrower than "actively".
- **Weakness** is `Muscle weakness` (neurotoxic envenomation sign). `Asthenia` was considered.
- **Venom in eyes** is `Toxic effect of venom` with the eye (`Structure of eye proper`) as its
  finding site.
- **Deep or large wound** is `Deep bite wound` (morphologic abnormality) or `Bite - wound` with the
  `Large` qualifier.
- **Cellulitis** ("If skin red, warm painful, cellulitis likely") is `Erythema` **and** `Warm skin`
  **and** `Pain of skin` after any bite/sting.
- **Papular urticaria** ("If extensive local response to bite, papular urticaria likely") is
  `Prurigo simplex` (its synonym is papular urticaria), evidenced by `Insect bite reaction` with
  the `Extensive` qualifier.
- Priority is `Urgent`, as written ("Give urgent attention").

## Could not model

- **"Even if bite not seen"** (snake bite): there is no way to say that the wound need not be
  visible. The rule relies on `Snake bite - wound` being recorded from the history.
- **"Needing sutures"**: no qualifier for that. Deep or large bite wounds count whatever the
  suturing need, so the rule may fire slightly more often than the page intends.
- **Papular urticaria after a spider bite or a sting**: SNOMED's `Insect bite reaction` is a kind
  of `Insect bite - wound` and has no spider or sting equivalent. Adding a spider/sting or-group was
  flagged always-true by the checker. The rule fires only after an insect bite, so less often than
  the page intends.
- **Cellulitis routing.** The return/cellulitis box is reached from the spider/insect branch and
  the two low-risk animal-bite "No" branches, not from the human-bite or high-risk animal-bite
  branches. The rule applies to any bite/sting, so it fires more often than the page's routing.
- **Animal-bite rabies questions** (which animal, strange behaviour, unprovoked attack,
  immunisation status, impaired immunity, bat contact, broken skin with blood, licked broken
  skin/eyes/mouth) and the **human-bite branch** lead only to management (rabies vaccine,
  immunoglobulin, PEP, antibiotics) and name no diagnosis, so they are not modelled.
- "Within the last few hours" (footnote 3) is not modelled as a time comparison; the bite/sting is
  taken as recorded in the current encounter.

## SNOMED gaps

- "Scorpion sting": no clinical finding. Substitute: `Poisoning due to bite of Scorpiones` (disorder).
- "Active bleeding": none. Substitute: `Bleeding` (finding).
- "Difficulty speaking": none. Substitute: `Difficulty talking` (finding).
- "Drooling": only a synonym of `Dribbling from mouth` (finding), which is used.
- "Muscle cramp": only a synonym of `Cramp` (finding), which is used.
- "Papular urticaria": only a synonym of `Prurigo simplex` (disorder), which is used.
- "Extensive local response to bite": none. Substitute: `Insect bite reaction` + `Extensive`.
- "Venom in eye": none. Substitute: `Toxic effect of venom` with finding site
  `Structure of eye proper`. `Effect of spitting cobra venom on conjunctiva` exists but is narrower.
- "Wound needing sutures": none.

## Checker issues left in place

- None.

## Questions for a clinician

- Spider bite: does any one of drooling, restlessness or muscle cramps make it urgent, or only all
  three together?
- Footnote 2: should one feature (e.g. pulse ≥ 100 alone) make shock likely after a bite/sting, or
  is it a cluster?
- Is "Toxic effect of venom" in the eye acceptable for "venom in eyes" (mostly spitting cobra), or
  should the record use the spitting-cobra conjunctiva concept?
- A scorpion sting recorded on its own does not trigger the check-for task, because it is not a
  bite wound or insect sting in SNOMED; it does trigger the urgent rule. Should scorpion stings be
  added to the intake as a recorded presenting complaint?
- Should cellulitis after a human bite or a high-risk animal bite also be "likely" here? The page
  routes those patients to antibiotics instead.

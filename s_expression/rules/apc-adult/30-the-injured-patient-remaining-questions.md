# Page 30 – The injured patient: remaining questions

## Decisions made

- **Red box as four Urgent rules.** Each group ("Bruising and blood in urine", "Wound and any of",
  "Fracture and any of", "Head injury and any of") is its own `system_priority_evaluation`,
  `(and <group finding> (or <signs>))`, with a matching `check_for` task triggered by the group
  finding. All are `Urgent`, as the page says "Give urgent attention"; nothing is escalated.
- **Presenting complaint** is `Traumatic injury` (disorder), the concept VHA's warning-sign table
  already uses. `Wound`, `Fracture of bone` and `Injury of head` are *not* SNOMED descendants of it
  (their common parent is `Traumatic or non-traumatic injury`), so each group has its own task
  triggered by its own finding, and the top task checks for all three.
- **Shock (footnote 1)** is encoded as this page's own logic: `Diagnose probable shock in the
  injured patient` = an injury finding **and** any one of SBP < 80, pulse ≥ 100, respiratory rate
  > 30, confusion, restlessness, weakness. No shared shock definition is used. The red box's
  "If shock/SBP < 80, give sodium chloride …" is management and not encoded.
- **Concussion likely** (lower "Head injury" box) → `Diagnose probable concussion after head
  injury`: head injury **and** (mild headache, dizziness or clouded consciousness).
- **> 2 rib fractures** = Fracture of three / four / five / six / seven / eight OR more ribs.
  `Fracture of multiple ribs` was not used because it includes two ribs.
- **Clear fluid from nose/ear** is encoded literally (Nasal discharge / Ear discharge + `Clear`),
  not as CSF rhinorrhoea/otorrhoea, which would be an interpretation.
- **"Suspected" fractures** (femur, pelvis, spine, skull) are recorded as the fracture finding
  itself.
- **Drug/alcohol intoxication** = `Intoxication` (covers both as descendants) plus `Alcohol
  intoxication` listed explicitly for the health worker.
- **Bruising** = `Contusion` (no "Bruising" FSN).
- **Bottom of the red box** (BP < 90/60, pulse > 100 or < 50, respiratory rate > 20 or < 9,
  SpO₂ < 94% or drop in GCS → reassess ABC) is monitoring of an already urgent patient and routes
  to page 16; accounted for as management, not as extra urgency criteria. BP < 90/60 therefore
  does not appear in a rule on this page.
- No `measure` task: GCS has no unit in the language, and BP, pulse, RR and SpO₂ are routine vitals.
- No flowchart file: the page has grouped "and any of" lists, not Yes/No branches.

## Could not model

- **"Vomiting ≥ 2 times"**: the language cannot count episodes. Any vomiting (`Finding of
  vomiting`) is used, so the head-injury rule fires **more often** than the page intends.
- **"below injury" / "below fracture"**: the location of poor perfusion, weakness or numbness
  relative to the injury cannot be expressed; limb-level findings are used (fires more often).
- **Poor perfusion (cold, pale, numb, no pulse)**: encoded as any of `Limb ischemia` (the named
  sign), `Cold extremity`, `Numbness of limbs` or `Peripheral pulse absent` (merged from both
  builds). "Pale" has no limb concept and is not encoded (fires less often for pallor alone).
  Reading each listed part as enough on its own fires more often than a reading where several are
  needed.
- **"Mild" headache** depends on the health worker recording the `Mild` qualifier; an unqualified
  headache will not trigger the concussion rule (dizziness or fogginess still will).
- **"not needing urgent attention"** context of the concussion box is not modelled; concussion is
  also diagnosed in patients who meet red-box criteria.
- "Refer same day if pregnant, known bleeding disorder, on anticoagulant, high-speed collision …"
  is a referral rule (management), not encoded.

## SNOMED gaps

- **Muscle tightness** (fracture group, "Increasing pain, muscle tightness, numbness in limb"): no
  fitting concept (`Muscle tension` is a stress/tone finding; `Tightness in arm` is site-specific).
  Not encoded; increasing limb pain and limb numbness are.
- **Penetrating wound of head / of chest**: no precoordinated concepts; used `Penetrating wound` +
  `finding_site` `Head structure` / `Thoracic structure` (both confirmed body structures).
  `Chest structure` does not exist as an FSN.
- **Drug intoxication**: no FSN; `Intoxication` used.
- **Pale limb**: no limb pallor finding (`Pallor` does not exist; only face/organ pallor). Not encoded.
- **"Respond poorly to light"**: `Sluggish pupil movement` and `No pupillary reaction to light` used.
  `Abnormal pupil reaction` was rejected: its only SNOMED child is poor dilation to mydriatic drops.
- **Weakness**: no "Weakness" finding; `Asthenia` used. **Bruising**: `Contusion` used.
  **Hemotympanum**: FSN is `Hematotympanum`.

## Checker issues left in place

- None.

## Questions for a clinician

1. Footnote 1 ("If SBP < 80, pulse ≥ 100, respiratory rate > 30, confusion/restlessness,
   weakness, shock likely"): is any **one** sign enough, or are several needed together? The rule
   currently uses any one, so pulse ≥ 100 alone in an injured patient gives probable shock.
2. "Increasing pain, muscle tightness, numbness in limb": any one, or all together (compartment
   syndrome picture)? Currently any one.
3. Poor perfusion: is any one of cold, numb or absent pulse below the injury enough (as encoded),
   or should several be present together?
4. Is "any vomiting" an acceptable stand-in for "vomiting ≥ 2 times" after head injury, or should
   it be narrower (e.g. `Persistent vomiting`)?
5. Should "Bruising and blood in urine" require bruising in a particular area (e.g. loin/flank)?
   The page does not say; any contusion is used.
6. Should "clear fluid leaking from nose/ear" be recorded as CSF rhinorrhoea/otorrhoea rather
   than clear nasal/ear discharge? (Encoded literally as clear discharge.)
7. Should probable concussion exclude patients who have any urgent head-injury sign?

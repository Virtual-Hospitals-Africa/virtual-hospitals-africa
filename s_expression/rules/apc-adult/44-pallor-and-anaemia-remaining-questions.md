# Page 44 – Pallor and anaemia: remaining questions

## Decisions made

- **Presenting complaint.** "Pallor/anaemia" is `(or Pale complexion, Pale conjunctiva, Pale
  discoloration of entire skin of body, Anemia)`, all as `clinical_finding`. The page defines pallor
  as pale conjunctiva or palms. There is no pale-palm concept, so `Pale complexion` (VHA vocabulary)
  and `Pale discoloration of entire skin of body` (synonym "Abnormal pallor skin of body") stand in
  for skin pallor. `Pale conjunctiva` is not a descendant of `Pale complexion`, so it is listed
  separately. Anaemia uses the `clinical_finding` form because no rule can diagnose it at `probable`
  (the Hb thresholds can't be represented). None of these is a recorded common symptom or warning
  sign yet.
- **Shock.** Encoded exactly as the page writes "Shock¹/SBP < 80": `(or (clinical_finding Shock)
  (< SBP 80))`. Footnote 1 ("If SBP < 80, pulse ≥ 100, respiratory rate > 30,
  confusion/restlessness, weakness, shock likely") is not built into a shock definition. Pulse ≥ 100
  is already a separate red-box item, and the footnote doesn't say whether it means any or all of
  these signs.
- **Priority level** is `Urgent`, as the red box says ("Give urgent attention"). Chest pain and
  purpuric rash have higher priorities of their own as warning signs elsewhere, and this page
  doesn't override them.
- **Dizzy/faint** = Dizziness or Feeling faint. **Widespread/easy bruising** = Easy bruising or
  Multiple bruising. **Black or bloody stools** = Melena or Hematochezia. **Swollen legs** =
  Leg swelling symptom (VHA vocabulary, 8 uses); its parent Swelling of lower limb was the
  alternative. **Purple/red rash that does not disappear with pressure** = Purpuric rash.
- **Malaria likely.** Encoded as a `probable` Malaria rule: pallor/anaemia **and**
  `(active_condition Fever)` **and** `(finding "Disease that is endemic in recent area visited"
  Malaria)`. A separate check_for task asks about the malaria area only when pallor/anaemia and
  fever are both present, which matches the page's conditional wording.
- "Not needing urgent attention" is not encoded as a negation: the malaria rule fires whether or
  not the urgent rule also fires.
- **No measure task.** The page's only measurements beyond routine vitals are Hb and the FBC/MCV,
  which can't be represented.

## Could not model

- **Hb < 6** (red box): there is no haemoglobin observable or unit. The urgent rule therefore fires
  **less often** than the page intends, because Hb < 6 with no other sign is missed.
- **"Anaemia likely if" Hb < 12 (non-pregnant woman), < 11 (pregnant woman), < 13 (man)**: this
  needs Hb. No probable anaemia rule was written.
- **The whole MCV algorithm**: iron deficiency anaemia likely (MCV low), systemic disease or
  long-term condition likely (MCV normal), macrocytic anaemia likely (MCV high), and folate
  deficiency likely (MCV high and postpartum or alcohol misuse). All of these depend on the MCV
  result, which has no observable. Encoding them without MCV would fire them for every
  pallor/anaemia patient (much **more often**), so they were left out. The yes/no sub-questions
  (man or woman with no periods; postpartum or alcohol misuse⁴) feed only these rules, so they
  aren't checked for.
- **"Fever now or in past 3 days"**: only fever now is captured (`active_condition Fever`). A fever
  that resolved within the past 3 days is missed, so the rule fires **less often**.
- **"In a malaria area in past 3 months"**: the 3-month window is not modelled. The endemic-area
  finding is taken as recent.
- **Footnote 2** (black stools from iron tablets; refer only if they started before iron treatment):
  this timing relative to treatment can't be expressed. Melena counts whenever it is recorded
  (fires **more often**).
- HIV test, TB check and pregnancy check are cross-references to pages 124, 102 and 174. Pregnancy
  is used here only to pick the Hb threshold and to gate the FBC, and both of those are
  unrepresentable.
- Management (oxygen, sodium chloride 0.9%, iron, folate, advice, referral, palliative care) is out
  of scope.

## SNOMED gaps

- **Pale palms**: there is no "Pallor of skin of palm" concept, and `Palm (region) structure` has no
  general "pale skin" finding to attach to. `Pale complexion` and `Pale discoloration of entire skin
  of body` are used instead.
- **Widespread bruising**: there is no exact concept, so `Multiple bruising` was used.
- **"Malaria area"**: there is no situation or finding for living in or travelling to a malarial
  area. The observable `Disease that is endemic in recent area visited` with the value `Malaria` was
  used. Alternatives: `(finding Exposure to (contextual qualifier), Plasmodium organism)`, or the
  situation `History of travel with high risk of exposure to communicable disease` with onset within
  3 months (VHA vocabulary, 2 uses; not malaria-specific and misses residents of malaria areas).
- **"Black stools"**: `Dark stools` (finding) exists; `Melena` (disorder) was chosen.
- **Folate deficiency anaemia**: there is no exact concept (`Megaloblastic anemia due to folate
  deficiency` exists). This doesn't matter, because the rule isn't encoded.

## Checker issues left in place

- None.

## Questions for a clinician

- Should "faint" also include Syncope (actually fainted), not just feeling faint?
- Does footnote 1 mean shock is likely when **any** of SBP < 80, pulse ≥ 100, RR > 30,
  confusion/restlessness or weakness is present? If so, confusion/restlessness and weakness would
  make a pallor patient urgent too, which this encoding doesn't do.
- Can the app record the malaria-area question as `Disease that is endemic in recent area visited
  = Malaria`, or should a shared "malaria area exposure" finding be agreed across pages (page 39
  probably needs the same one)?
- **Reconciler, unsettled:** the page defines pallor as "pale conjunctiva or palms". Should a
  recorded whole-body skin pallor (`Pale discoloration of entire skin of body`) also count as
  pallor here, as the final build does, or only pale conjunctiva/complexion?
- **Reconciler, unsettled:** for "in a malaria area in past 3 months", is the malaria-specific
  endemic-area observable (no time window, used here) better than high-risk travel with onset
  within 3 months (time window, but not malaria-specific and misses residents)? How should
  residents of malaria areas (e.g. parts of Limpopo, Mpumalanga, KZN) be captured?
- Should black stools count for urgency when the patient is already on iron (footnote 2)?
- Could Hb and MCV be added as lab observables? Most of this page's diagnostic logic depends on
  them.

# Page 80 – Leg symptoms: remaining questions

## Decisions made

- **Presenting complaint** is `(clinical_finding (snomed_concept "Finding of lower limb" "finding"))`.
  It is not a recorded common symptom or warning sign, so the tasks fire only when a leg finding
  (pain, swelling, calf swelling, numbness, weakness of the leg, which are all descendants) is
  recorded. `Intermittent claudication`, `Unable to weight-bear` and `Joint swelling` are **not**
  descendants of it.
- **Red box → one Urgent priority rule** over four `probable` diagnoses (fracture of lower limb,
  DVT, acute lower limb ischaemia, critical lower limb ischaemia). The page says "Give urgent
  attention", so the level is `Urgent`, although the adult warning sign "Severe limb ischemia" is
  Very urgent.
- **DVT risk factors** ("especially if BMI > 30, smoker, immobile, pregnant, on oestrogen, leg
  trauma, recent hospitalisation, TB or cancer") strengthen the likelihood but are not required by
  the page, so they are not encoded. No BMI measure task follows from this.
- **"One calf"** is the `Unilateral` qualifier on `Swollen calf`.
- **"Muscle pain in legs or buttocks on exercise"** is `Intermittent claudication`, both in the
  critical limb ischaemia rule (red box) and in the PVD rule (flowchart, "relieved by rest").
- **Flowchart "Is there leg swelling? No"** is `(no (clinical_finding (snomed_concept "Swelling of
  lower limb" "finding")))` in the sciatica and PVD rules.
- **"Recent injury" / "following injury"** are `Injury of lower limb`, read as recorded in the
  current encounter; no time comparison.
- **Joint problem likely** is `Arthropathy`, probable, on any of joint warm, tender, swollen,
  difficulty walking, difficulty standing up.
- **Sprain/strain likely** is `Sprain of ligament of lower limb` only.
- No `manage` tasks; treatment, referral and advice text accounted for as management.

## Could not model

- "Unable to do all actions comfortably" (walk, sit and stand up with arms folded): only walking
  and standing up are expressed; sitting is not. Fires less often than the page intends for a
  patient whose only difficulty is sitting.
- "Swelling over **one** joint": `Joint swelling` does not express the count; the sprain rule may
  fire for multiple swollen joints with injury (more often than intended).
- "Down **back of** lower leg": the radiating-pain concepts are per side and do not say posterior.
- Statin with muscle pain/cramps or weakness → discuss with doctor: a management step, not a
  diagnosis.
- Both legs swollen, no orthopnoea → check pregnancy, urine dipstick, refer; no injury → skin
  changes → 82 / refer; foot only → 81: routing and management, not modelled.

## SNOMED gaps

- `Pallor` (finding) and `Pallor of skin` do not exist. Used `White discoloration of skin` with
  finding site `Skin structure of lower limb`.
- No sideless "pain radiating to leg"; used `Pain radiating to left leg` / `… right leg`.
- No `Irritation of sciatic nerve`; used `Sciatica` (disorder).
- No `Disorder of joint`; used `Arthropathy`.
- No `Sprain` (disorder) or combined sprain/strain of leg; used `Sprain of ligament of lower limb`.
- No `Gangrene of lower limb` (non-gas); used `Gangrenous disorder` with finding site
  `Lower limb structure`.
- `Ulcer of lower limb` does not exist; used `Ulcer of lower extremity`.

## Checker issues left in place

- None.

## Questions for a clinician

- Should the DVT risk factors raise anything (e.g. make DVT probable on calf pain alone when present)?
- Is `Intermittent claudication` acceptable for "muscle pain in legs or buttocks on exercise" in the
  critical limb ischaemia criterion, where the page does not say "relieved by rest"?
- Is White discoloration of the leg skin an acceptable recording of leg pallor?
- Should acute limb ischaemia be Very urgent (as the "Severe limb ischemia" warning sign) rather than Urgent?
- Should "Sprain/strain" also diagnose a muscle strain?

# Page 80 – Leg symptoms: remaining questions

Final (reconciled) build. Base: builder A, with builder B's trigger, sitting-down item, pallor site
and strain rule. See `reconcile.json` for every difference and why it was resolved.

## Decisions made

- **Presenting complaint** is `(or (clinical_finding (snomed_concept "Finding of lower limb" "finding"))
  (clinical_finding (snomed_concept "Muscle pain" "finding")))` in both tasks and the priority rule.
  *Finding of lower limb* is not a recorded common symptom; its descendants (leg pain, calf pain and
  swelling, leg numbness/weakness, leg ulcer, bilateral leg swelling, buttock pain) match.
  *Muscle pain* is a recorded common symptom and covers *Intermittent claudication*, which is not
  under *Finding of lower limb*. Side effect: muscle pain anywhere opens the leg checks.
  `Unable to weight-bear` and `Joint swelling` are under neither.
- **Red box → one Urgent priority rule** over four `probable` diagnoses (fracture of lower limb,
  deep venous thrombosis, acute lower limb ischaemia, critical lower limb ischaemia). The page says
  "Give urgent attention", so the level is `Urgent`, although the adult warning sign "Severe limb
  ischemia" is Very urgent.
- **DVT risk factors** ("especially if BMI > 30, smoker, immobile, pregnant, on oestrogen, leg
  trauma, recent hospitalisation, TB or cancer") strengthen the likelihood but are not required by
  the page, so they are not encoded. Requiring one would make the rule fire less often than the page
  intends; checking for them without using them would break constraint 2. No BMI measure task.
- **DVT concept** is `Deep venous thrombosis` (the page's words, and the form VHA's vocabulary uses);
  descendants such as *Deep venous thrombosis of lower extremity* still match the priority rule.
- **"One calf"** is the `Unilateral` qualifier on `Swollen calf`, plus `Pain in calf`.
- **Acute limb ischaemia**: leg pain with *Sudden onset*, *Severe* and *At rest* qualifiers, and any
  of numbness, weakness, pallor (white discoloration of skin, site *Lower limb structure*) or absent
  pulse (*Absent pulse*, site *Lower limb structure*) in the leg.
- **"Muscle pain in legs or buttocks on exercise"** is `Intermittent claudication`, both in the
  critical limb ischaemia rule (red box) and in the PVD rule (flowchart, "relieved by rest").
- **Critical limb ischaemia**: claudication plus any of leg pain at rest, `Ulcer of lower extremity`,
  or `Gangrenous disorder` sited to the lower limb.
- **Flowchart "Is there leg swelling? No"** is `(no (clinical_finding (snomed_concept "Swelling of
  lower limb" "finding")))` in the sciatica and PVD rules, following the page's branch. This needs
  an explicit "No" record of leg swelling, so these two rules fire only after the swelling question
  is answered (the task checks for it).
- **"Recent injury" / "following injury"** are `Injury of lower limb`, read as recorded in the
  current encounter; "recent" has no number, so no time comparison.
- **Joint problem likely** is `Arthropathy`, probable, on any of joint warm, tender, swollen,
  difficulty walking, difficulty sitting down, difficulty standing up.
- **Sprain/strain likely** is two probable rules with the same evidence (joint swelling and injury
  of lower limb): `Sprain of ligament of lower limb` and `Strain of muscle of lower limb`.
- No `manage` tasks; treatment, referral and advice text accounted for as management.

## Could not model

- "With arms folded" (the joint screen manoeuvre) is not expressed.
- "Swelling over **one** joint": `Joint swelling` does not express the count; the sprain/strain rules
  may fire for multiple swollen joints with injury (more often than intended).
- "Down **back of** lower leg": the radiating-pain concepts are per side and do not say posterior.
- Statin with muscle pain/cramps or weakness → discuss with doctor: a management step, not a
  diagnosis.
- Both legs swollen, no orthopnoea → check pregnancy 174, urine dipstick, BP 148, refer same week;
  no injury → skin check → 82 / refer; foot only → 81: routing and management, not modelled.

## SNOMED gaps

- `Pallor` (finding) and `Pallor of skin` do not exist. Used `White discoloration of skin` with
  finding site `Lower limb structure`.
- No sideless "pain radiating to leg"; used `Pain radiating to left leg` / `… right leg`.
- No `Irritation of sciatic nerve`; used `Sciatica` (disorder).
- No `Disorder of joint`; used `Arthropathy`.
- No combined sprain/strain of leg; used `Sprain of ligament of lower limb` and
  `Strain of muscle of lower limb`.
- No `Gangrene of lower limb` (non-gas); used `Gangrenous disorder` with finding site
  `Lower limb structure`.
- `Ulcer of lower limb` does not exist; used `Ulcer of lower extremity`.

## Checker issues left in place

- None.

## Questions for a clinician

- Should the DVT rule require at least one of the listed risk factors, or (as built) fire on
  unilateral calf swelling and pain alone?
- Is `Intermittent claudication` acceptable for "muscle pain in legs or buttocks on exercise" in the
  critical limb ischaemia criterion, where the page does not say "relieved by rest"?
- Is white discoloration of the leg skin an acceptable recording of leg pallor?
- Should acute/critical limb ischaemia be Very urgent (as the "Severe limb ischemia" warning sign)
  rather than Urgent as the page states?
- Is it acceptable that `Muscle pain` (a common symptom) opens the leg checks even when the muscle
  pain is not in the leg? Without it, exercise leg pain recorded as claudication would not open them.
- Should the sciatica and PVD rules require an explicit "no leg swelling" (as built, following the
  flowchart's No branch), or fire regardless of swelling?
- Is *Arthropathy* from difficulty walking/sitting/standing alone too broad? The page calls these
  "joint problem likely", but they can have non-joint causes.
- Is joint swelling after a leg injury enough for "sprain/strain likely", given that the red box
  sends "unable to bear weight following injury" to fracture?

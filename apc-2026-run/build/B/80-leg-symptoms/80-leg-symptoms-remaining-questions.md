# Page 80 – Leg symptoms: remaining questions

## Decisions made

- **Trigger.** "Leg symptoms" is not a recorded common symptom. Both tasks and the priority rule use
  `(or (clinical_finding "Finding of lower limb") (clinical_finding "Muscle pain"))`. Descendants of
  *Finding of lower limb* match (leg pain, calf pain/swelling, numbness, leg ulcer, bilateral leg
  swelling, buttock pain). *Muscle pain* is a common symptom and covers *Intermittent claudication*,
  which is not under *Finding of lower limb*. As a side effect, muscle pain elsewhere also opens the
  leg check.
- **Red box → four probable diagnoses** (fracture of lower limb, DVT of lower extremity, acute lower
  limb ischaemia, critical lower limb ischaemia). The priority rule is `Urgent`, as
  `(and <leg symptom> (or <four active_conditions>))`. The page says "Give urgent attention" only. The
  VHA warning sign "Severe limb ischemia" carries *Very urgent*, but this page does not escalate, so
  the rule stays at Urgent.
- **"Swelling and pain in one calf"**: *Swollen calf* with the *Unilateral* qualifier, plus *Pain in
  calf*.
- **DVT risk factors** ("especially if BMI > 30, smoker, immobile, pregnant, on oestrogen, leg trauma,
  recent hospitalisation, TB or cancer") are not encoded. They raise the likelihood but are not
  required for "DVT likely". A risk-factor requirement would make the rule fire less often than the
  page intends. Checking for them without using them would break constraint 2.
- **Acute limb ischaemia**: leg pain with *Sudden onset*, *Severe* and *At rest* qualifiers, together
  with any of numbness, weakness, pallor or absent pulse in the leg.
- **Critical limb ischaemia**: *Intermittent claudication* plus any of leg pain *At rest*, leg ulcer,
  or gangrene sited to the lower limb.
- **Peripheral vascular disease**: *Intermittent claudication* alone. In SNOMED this concept is
  muscle pain, provoked by exertion, relieved by rest, which is exactly the page's box.
- **Joint screen** ("joint problem likely 77"): probable *Arthropathy* from any of: joint warm,
  tender or swollen, or difficulty walking, sitting down or standing up.
- **Sciatic nerve irritation**: *Pain in buttock* and pain radiating to the left or right leg.
  Probable *Sciatica*.
- **Heart failure**: *Swelling of bilateral lower limbs* and *Orthopnea*.
- **Sprain/strain**: two probable rules with the same evidence, *Joint swelling* and *Injury of lower
  limb*.
- No `measure` tasks. BMI appears only among the DVT risk factors that were not encoded.

## Could not model

- **"Is there leg swelling? = No"** before the sciatica and PVD branches. It is not required as
  `(no …)`, because that would need an explicit "No" record, and those rules would then fire less
  often. As built, they can fire even when the leg is swollen.
- **"back of" the lower leg** (sciatica radiation) has no matching SNOMED concept.
- **"Swelling over one joint"**: "one" (a single joint) is not expressed.
- **"Recent" injury** has no number on the page, so there is no time comparison.
- **Management and routing**, accounted as not encoded or covered by cited elements:
  - "Refer urgently"
  - the statin + muscle pain → discuss step (no diagnosis is named)
  - the "both legs swollen, no orthopnoea" branch: pregnancy check 174, urine dipstick, BP 148, refer
    same week
  - the skin check → 82 / Refer
  - foot only → 81
  - all medicines and advice

## SNOMED gaps

- **Pallor (finding)** does not exist. *White discoloration of skin* with finding_site *Lower limb
  structure* is used instead (low confidence).
- **"Pain radiating to leg"** has no sideless concept. The left/right pair is used instead.
- **"Joint problem"** / **Disorder of joint** do not exist. *Arthropathy* is used instead.
- **"Sprain/strain" of the lower limb** has no single concept. *Sprain of ligament of lower limb* and
  *Strain of muscle of lower limb* are used instead.
- **"Irritation of sciatic nerve"** has no exact concept. *Sciatica* is used instead.

## Checker issues left in place

- None.

## Questions for a clinician

- Should the DVT rule require at least one of the listed risk factors, or (as built) fire on unilateral
  calf swelling and pain alone?
- Is *Arthropathy* from difficulty walking/sitting/standing alone too broad? Those difficulties can
  have non-joint causes, but the page calls them "joint problem likely".
- Should critical/acute limb ischaemia be *Very urgent* (matching VHA's "Severe limb ischemia"
  warning sign) rather than Urgent as the page states?
- Is a recorded joint swelling after a leg injury enough for "sprain/strain likely", given that the
  red box sends "unable to bear weight following injury" to fracture?

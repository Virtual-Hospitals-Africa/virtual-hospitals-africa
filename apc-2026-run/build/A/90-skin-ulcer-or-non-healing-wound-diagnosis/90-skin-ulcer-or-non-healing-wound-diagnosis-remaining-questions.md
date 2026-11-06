# Page 90 – Skin ulcer or non-healing wound: diagnosis — remaining questions

## Decisions made

- **Presenting complaint** is `Skin ulcer` (disorder) or `Wound, non-healed` (morphologic abnormality). Neither is a recorded common symptom or warning sign, so the tasks fire only when one of them is recorded.
- **Red box, bullet 1:** "Infection" is encoded as `Infected ulcer of skin` or `Local infection of wound`. The parenthesis "(surrounding skin red/warm/swollen)" is read as how to recognise infection, not as separate criteria. The page's numbers are encoded exactly: systolic BP < 80, pulse > 100 (strict), temperature ≥ 38°C. "Confused" is `Acute confusion`. "Crepitus" is `Subcutaneous crepitus`, following the footnote ("under the skin").
- **Red box, bullet 2:** "critical limb ischaemia likely" is a `probable` rule for `Critical lower limb ischemia`: `Intermittent claudication` and (`Pain provoked by rest` or `Gangrenous disorder`). The urgent rule references `(active_condition …)`. The probable rule does not repeat the ulcer, but the urgent rule requires it.
- **Flowchart:** each "X likely" is a `probable` rule. Each later rule requires every earlier question answered No, encoded with `(no X)`:
  - Q1 No: (not bedridden and not confined to chair) or no ulcer at any of the pressure sites.
  - Q2 Yes: an ulcer on the lower leg or the foot.
  - Q3 No: no claudication, no weak foot pulse and no absent foot pulse.
  - Q4 No: no hyperpigmentation, no varicose veins and no chronic leg swelling.
  So the rules are mutually exclusive, as on the page. One consequence: a negation fires only if the health worker answered "no" explicitly.
- **Pressure ulcer sites** come from the figure, which has no text. Its dots are read as: occiput, upper spine, scapulae, elbows, sacrum, hips, ankles and heels. Each site is `Skin ulcer` with a `finding_site`.
- "In wheelchair" is `Confined to chair` (finding). SNOMED has no wheelchair-user finding.
- "Reduced foot pulses" is `Weak arterial pulse` with `finding_site` `Foot structure`. "Absent" is `Foot pulse absent`.
- "Darkening of skin around ulcer" is `Hyperpigmentation of skin`. The "around ulcer" part is not expressed.
- There are no `measure` tasks. Glucose is a routine vital, and "check glucose 19" is a cross-reference in the No box.

## Could not model

- **The No-to-Q2 / No-to-Q5 box** (ask about trauma, surgery, rash, burn, cancer, radiation; test for diabetes, HIV, TB) is investigation and cross-references, so it is not encoded. Neither are routine care (→91), doctor review or referral (management). "If genital ulcer → 62" is a cross-reference.
- **"Cause uncertain"** has no diagnosis to express.
- **"Surrounding skin" and "around ulcer"** cannot be tied to the ulcer's location.

## SNOMED gaps

- **No FSN for "non-healing wound"** as a disorder or finding. Used `Wound, non-healed` (morphologic abnormality).
- **No wheelchair-dependence finding.** Used `Confined to chair`.
- **No "reduced foot pulse".** Used `Weak arterial pulse` + foot site.
- **No "ulcer of lower leg"** disorder at the right level. Used `Skin ulcer` + `Structure of lower limb from knee to ankle`.
- **No "Critical limb ischaemia"** without "lower". Used `Critical lower limb ischemia`, since the page's context is the legs.

## Checker issues left in place

`PROBABLE DIAGNOSIS EVIDENCE NOT CHECKED FOR` is reported for the `(no X)` form of findings that carry a `finding_site` or qualifier. The gate's `positive()` regex expects the `"No"` value at the end, but it renders before the attribute. Every positive X is in the check_for of "Check for the cause of a skin ulcer or non-healing wound". Exact strings:

- `(no (finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Skin ulcer" "disorder") (snomed_concept "No" "qualifier value") (attribute (snomed_concept "Finding site" "attribute") (snomed_concept "Occipital region structure" "body structure"))))`
- `(no (finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Skin ulcer" "disorder") (snomed_concept "No" "qualifier value") (attribute (snomed_concept "Finding site" "attribute") (snomed_concept "Structure of vertebral column" "body structure"))))`
- `(no (finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Skin ulcer" "disorder") (snomed_concept "No" "qualifier value") (attribute (snomed_concept "Finding site" "attribute") (snomed_concept "Structure of scapular region of back" "body structure"))))`
- `(no (finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Skin ulcer" "disorder") (snomed_concept "No" "qualifier value") (attribute (snomed_concept "Finding site" "attribute") (snomed_concept "Elbow region structure" "body structure"))))`
- `(no (finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Skin ulcer" "disorder") (snomed_concept "No" "qualifier value") (attribute (snomed_concept "Finding site" "attribute") (snomed_concept "Sacral region back structure" "body structure"))))`
- `(no (finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Skin ulcer" "disorder") (snomed_concept "No" "qualifier value") (attribute (snomed_concept "Finding site" "attribute") (snomed_concept "Hip region structure" "body structure"))))`
- `(no (finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Skin ulcer" "disorder") (snomed_concept "No" "qualifier value") (attribute (snomed_concept "Finding site" "attribute") (snomed_concept "Ankle region structure" "body structure"))))`
- `(no (finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Skin ulcer" "disorder") (snomed_concept "No" "qualifier value") (attribute (snomed_concept "Finding site" "attribute") (snomed_concept "Heel structure" "body structure"))))`
- `(no (finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Weak arterial pulse" "finding") (snomed_concept "No" "qualifier value") (attribute (snomed_concept "Finding site" "attribute") (snomed_concept "Foot structure" "body structure"))))`
- `(no (finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Swelling of lower limb" "finding") (snomed_concept "No" "qualifier value") (qualifier (snomed_concept "Chronic" "qualifier value"))))`

## Questions for a clinician

- **Pressure ulcer sites:** is the figure's dot list (occiput, upper spine, scapulae, elbows, sacrum, hips, ankles, heels) the intended set? Should the hip dots be the buttocks or the trochanters?
- **Infection:** should infection also be recognised from the parenthetical signs alone, without a recorded infection diagnosis? That would mean redness, warmth or swelling of the surrounding skin.
- **Q3 wording:** should "muscle pain in legs/buttocks on exercise" alone (without reduced pulses) make an arterial ulcer likely? The page says "or", and that is what is encoded.
- **Venous and diabetic negations:** these rules need explicit "no" answers to the earlier questions. Is that acceptable, or should they fire without them?

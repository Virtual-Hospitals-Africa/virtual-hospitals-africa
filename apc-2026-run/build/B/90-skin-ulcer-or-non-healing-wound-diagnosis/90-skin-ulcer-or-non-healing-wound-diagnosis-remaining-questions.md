# Page 90 – Skin ulcer or non-healing wound: diagnosis: remaining questions

## Decisions made

- **Presenting complaint:** `Skin ulcer` (disorder) or `Chronic wound` (disorder). There is no
  "non-healing wound" concept; `Chronic wound` is the closest. Neither is a recorded common symptom
  or warning sign, so the check task relies on the complaint being recorded as a finding.
- **SBP < 80** is encoded exactly as the red box writes it (systolic BP < 80), as this page's own
  logic. No shared shock definition.
- **Infection (surrounding skin red/warm/swollen):** encoded as a recorded infected ulcer of skin or
  local wound infection, **or** any one of erythema, warm skin or swelling. These have no site, so
  they would also match redness or swelling elsewhere.
- **Critical limb ischaemia likely:** `probable` `Critical lower limb ischemia` = ulcer/wound **and**
  intermittent claudication **and** (pain provoked by rest **or** gangrenous disorder). The urgent
  rule uses `(active_condition …)`.
- **Pressure ulcer likely:** ulcer/wound and (bed-ridden or dependence on wheelchair). The "common
  pressure ulcer site" half is not encoded (see Could not model).
- **Q1 = No is not required** on the arterial, venous and diabetic rules, because the No branch
  cannot be expressed without the site half. A bed-ridden patient with a leg ulcer may get both a
  pressure-ulcer and an arterial/venous/diabetic diagnosis.
- **Lower leg or foot:** the ulcer/wound with `finding_site` `Structure of lower limb from knee to
  ankle` or `Foot structure` (both confirmed). This form is in the `check_for`.
- **No branches:** the venous rule needs explicit "No" records for claudication, absent foot pulse
  and abnormal foot pulse; the diabetic rule also needs "No" for the three venous signs. This
  follows the flowchart exactly, but it only fires when the health worker answers those questions.
- **Diagnosis concepts:** `Pressure injury` (synonym pressure ulcer), `Ischemic ulcer of lower limb`,
  `Venous ulcer of lower limb`, `Skin ulcer due to diabetes mellitus`.
- The "cause uncertain" box (history, glucose, HIV and TB tests), the genital-ulcer pointer (→ 62)
  and the bottom box (routine care, doctor review, referral) are routing or management only.

## Could not model

- **"Common pressure ulcer site (see below)":** the sites are only shown as dots on a body picture,
  with no text. The pressure-ulcer rule therefore fires **more often** than the page intends (for any
  ulcer in a bed-ridden or wheelchair-dependent patient).
- **"Surrounding skin" / "around ulcer":** no body-structure concept for the skin around a lesion.
  Erythema, warm skin, swelling and hyperpigmentation are unsited, so the rules fire more often.
- The red box's management line (sodium chloride 0.9% for SBP < 80) is management.

## SNOMED gaps

- "Non-healing wound": no concept; `Chronic wound` (disorder) is used.
- "Reduced foot pulses": no concept; `Abnormal foot pulse` (broader) is used, together with
  `Foot pulse absent` (not its descendant).
- "Pain at rest": `Pain provoked by rest` (finding) is used. Alternatives were `Ischemic foot with
  rest pain` and `Pain at rest due to peripheral vascular disease`, which presuppose the diagnosis.
- "Lower leg": `Lower leg structure` does not resolve; `Structure of lower limb from knee to ankle`
  is used.
- "Bedridden": `Bed-ridden` (finding). "In wheelchair": `Dependence on wheelchair` (finding).

## Checker issues left in place

- `PROBABLE DIAGNOSIS EVIDENCE NOT CHECKED FOR`:
  `(no (finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Leg swelling symptom" "finding") (snomed_concept "No" "qualifier value") (qualifier (snomed_concept "Chronic" "qualifier value"))))`.
  The qualified finding (`Leg swelling symptom` + `Chronic`) is in the `check_for`. The checker does
  not match the `(no …)` form of a qualified finding to it. The diabetic branch needs Q4 = No, so the
  rule stays as written.

## Questions for a clinician

- Should "red/warm/swollen" need all three signs, or is any one enough (as encoded)?
- Should the pressure-ulcer rule be limited to the pictured sites (sacrum, buttocks, hips, heels,
  elbows, shoulder blades, spine, occiput)? If so, which list?
- Is `Abnormal foot pulse` acceptable for "reduced" foot pulses?
- Should a patient with a recorded diabetic foot ulcer still need all the venous/arterial "No"
  answers before "Diabetic ulcer likely"?

# Page 26 – Palpitations: remaining questions

## Decisions made

- **Trigger.** Both tasks and every rule are anchored on `(clinical_finding Palpitations)`.
  Palpitations is not a recorded common symptom or warning sign, so these rules only fire once the
  complaint is recorded as a finding.
- **Red box → one `Urgent` priority rule** (`Urgent: palpitations with danger signs`),
  `(and Palpitations (or …))`. The page does not escalate any item, so nothing is `Very urgent` or
  `Emergency` here (chest pain keeps its own warning-sign level elsewhere).
- **BP ≥ 180/110 or < 90/60**: systolic ≥ 180 or diastolic ≥ 110; systolic < 90 or diastolic < 60
  (Will's convention for the pair).
- **Pulse > 150 / < 50**: strict comparisons on `Pulse, function` (bpm), as written.
- **Glucose < 3 (< 4 if diabetes)**: `< 3 mmol/L` or (known diabetes and `< 4 mmol/L`). Diabetes uses
  the `clinical_finding … Known present` form in both the check and the priority rule.
- **Faint or loss of consciousness**: `Syncope` and `Loss of consciousness` (Syncope is a descendant
  of LOC; both are listed so the health worker sees the page's word).
- **Dizziness or light-headedness**: `Dizziness` and `Lightheadedness` (not related by is-a in SNOMED).
- **Confusion**: `Clouded consciousness` (VHA's AVPU "Confused" record).
- **Calf or thigh pain and/or swelling**: Pain in calf, Thigh pain, Swollen calf, and Swelling at
  Thigh structure, joined by `or`.
- **Heart failure likely** → `probable` Heart failure (Palpitations + Orthopnea + Leg swelling
  symptom), referenced from the priority rule as `(active_condition Heart failure)`.
- **Consider stroke/TIA** → two `possible` rules (Cerebrovascular accident, Transient ischemic
  attack). The four findings themselves are in the priority rule. "New sudden" is encoded as the
  `Sudden onset` qualifier on all four. "Asymmetric" is the `Asymmetry` qualifier on weakness and
  numbness only.
- **Dehydration likely** → `probable` Dehydration: Palpitations and any of thirst, dry mouth, poor
  skin turgor, decreased urine output. A second task, `Check for causes of palpitations`, checks for
  these four.
- **Consider thyroid or electrolyte abnormalities ("if none of the above")** → two `possible` rules.
  The representable part of "none of the above" is temperature < 38 °C and an explicit No for each
  dehydration sign.
- **Fever ≥ 38 °C → 38, pregnant → 175, anxiety → 98**: these are cross-references to other pages and
  are not re-encoded here.
- No `measure` task: glucose, temperature, pulse, RR, BP and SpO₂ are routine vitals. Hb and ECG
  have no representation.
- Shock is not mentioned on this page.

## Could not model

- **Hb < 8** (red box). It has no observable or unit. It is left out of the priority rule, which
  therefore fires **less often** than the page intends (a patient whose only danger sign is Hb < 8 is
  not flagged).
- **ECG results** (PVCs, sinus tachycardia, sinus rhythm, atrial fibrillation, other arrhythmia).
  There is no ECG finding in the language, so the AF and "other arrhythmia" branches (blood
  thinners, cardiology appointment) are not modelled.
- **Anaemia likely** (pallor, then fingerprick Hb < 12 woman / < 13 man). It needs Hb. Pallor alone
  is not the page's criterion, so no rule is written.
- **Pregnancy** (urine pregnancy test for a woman of child-bearing potential). This is a test
  result and a cross-reference to 175. It is not in the thyroid/electrolyte exclusion, so those
  `possible` rules fire **more often** than intended (also when pregnancy explains the palpitations).
- **Medication side effects** (QT-prolonging drugs). This is a review and management step. It is
  not in the exclusion either, so those rules fire **more often**.
- **"Not needing urgent attention"** scoping: the thyroid/electrolyte and dehydration rules do not
  exclude red-box patients.
- **Anxiety** ("decide this only once all other causes are excluded"). The exclusion of ECG, Hb,
  pregnancy and medication causes cannot be expressed, so no `possible` anxiety rule is written.
- **Cardiology appointment** for known heart disease, history of fainting or family history of sudden
  death. This is referral (management).
- **Triggers** (smoking, alcohol, caffeine, stimulants) and the 2-day review. These are advice and
  follow-up.

## SNOMED gaps

- "Confusion" (finding) does not exist. `Clouded consciousness` is used.
- "Light-headedness" does not exist. `Lightheadedness` is used.
- "Thirst" (finding) does not exist. `Thirst due to water deprivation` (VHA vocabulary) is used;
  `Increased thirst` was the alternative.
- No precoordinated thigh-swelling concept exists. `Swelling` with finding_site `Thigh structure`
  is used, and the site was verified.
- "Dry mouth" does not exist. `Xerostomia` is used.

## Checker issues left in place

- None.

## Questions for a clinician

- Should the thyroid/electrolyte `possible` rules require an explicit "No" to each dehydration
  sign and a temperature < 38 °C? The alternative is to fire on any palpitations patient, since most
  of "none of the above" cannot be checked.
- Does "New sudden" apply to difficulty speaking and visual disturbance as well as to
  weakness/numbness? Should "asymmetric" be recorded as `Asymmetry` or as `Unilateral`?
- Is `Clouded consciousness` the right record for "Confusion", or should `Acute confusion` also
  count?
- Should "Faint" also include `Feeling faint` (presyncope), or only syncope / loss of consciousness?

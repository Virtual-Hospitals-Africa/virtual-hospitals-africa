# Page 26 – Palpitations: remaining questions

## Decisions made

- **Red box → one Urgent priority rule**, `(and Palpitations (or …))`, with BP ≥ 180/110 as systolic ≥ 180 or diastolic ≥ 110 and BP < 90/60 as systolic < 90 or diastolic < 60 (Will's convention). Pulse > 150 / < 50 and glucose < 3 are strict as on the page.
- **"< 4 if diabetes"**: glucose < 4 AND `(clinical_finding Diabetes mellitus (qualifier Known present))`, the same form in the `check_for` and the priority rule.
- **Heart failure likely** → probable Heart failure rule (palpitations + Orthopnea + Leg swelling symptom); the priority rule references `(active_condition Heart failure)` per Will's briefing. This also matches a recorded history of heart failure, so it fires somewhat more often than the page's wording.
- **Consider stroke/TIA** → two `possible` rules (Cerebrovascular accident; Transient ischemic attack). The focal signs themselves are in the priority rule, since a `possible` diagnosis cannot be referenced there.
- **"New sudden"** → `Sudden onset` qualifier on all four focal items. **"Asymmetric" not encoded** (fires more often than the page intends for weakness/numbness).
- **Faint** → `Syncope`; **Confusion** → `Clouded consciousness` (vocabulary form; Acute confusion is a descendant); **light-headedness** → `Lightheadedness`, listed alongside `Dizziness` because it is not a descendant.
- **Thigh swelling** → `Swelling` with `finding_site Thigh structure` (no precoordinated concept; body structure verified).
- **Dehydration likely** → probable Dehydration, anchored on palpitations, in a separate `check_for` task for the non-urgent approach section.
- No `measure` task: BP, pulse, RR, SpO₂ and glucose are routine vitals.

## Could not model

- **Hb < 8** (red box): no haemoglobin unit/observable. The priority rule fires less often than intended (a patient with only Hb < 8 is not flagged).
- **ECG branches** (PVCs, sinus tachycardia, sinus rhythm, AF, other arrhythmia, ECG unavailable): ECG results are not recorded; the dehydration check is therefore not gated on the ECG result (fires for all palpitations patients).
- **Anaemia likely** (pallor + fingerprick Hb < 12 woman / < 13 man): needs Hb; pallor alone is not the page's criterion, so not encoded.
- **Pregnancy test**, **medication/QT review**, **"if none of the above, consider thyroid or electrolyte abnormalities"** and **anxiety "once all other causes are excluded"**: test/management steps, or evidence ("none of the above") that needs Hb, test results and a medication review.
- **Cardiology appointment** criteria (known heart disease, history of fainting, family history of sudden death): referral only; no rule would consume these findings.
- Fever ≥ 38°C is a pointer to the fever page (routine vital).

## SNOMED gaps

- No "Confusion" (finding) → `Clouded consciousness`.
- No "Thirst" (finding) → `Thirst due to water deprivation` (vocabulary); alternatives `Increased thirst`, `Excessive thirst`.
- No "Dry mouth" (finding) → `Xerostomia`. No "Poor skin turgor" → `Decreased skin turgor`.
- No "Swelling of thigh" → `Swelling` + `Thigh structure`.

## Checker issues left in place

- None.

## Questions for a clinician

- Should "asymmetric" be required (e.g. an `Asymmetry` or `Unilateral` qualifier) on weakness/numbness?
- Should a known history of heart failure with palpitations be Urgent, or only the current orthopnea + leg swelling combination?
- Is `Clouded consciousness` the right recorded form for "Confusion" here?

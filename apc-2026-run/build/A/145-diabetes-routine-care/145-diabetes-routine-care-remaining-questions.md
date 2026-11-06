# Page 145 – Diabetes: routine care: remaining questions

## Decisions made

- **Trigger.** The patient with diabetes is `(clinical_finding Diabetes mellitus)`, the form used as a
  warning-sign anchor. It is used as the trigger and inside the priority rule.
- **Glucose bullets are Urgent.** They sit in the urgent red box and send to page 19. Glucose < 4, and
  glucose ≥ 11.1 with ketones present, are branches of `Urgent: diabetes with danger signs or abnormal glucose`.
- **"≥ 11.1 with symptoms → 19" is not a separate branch.** The symptoms are the red-box items, which
  already make the patient Urgent. The ketone-check task fires at glucose ≥ 11.1 whether or not
  symptoms are present (so it fires a little more often than the page's "without symptoms").
- **Dehydration** is encoded as its four listed signs, each enough on its own: dry mouth
  (Xerostomia), poor skin turgor, BP < 90/60 (systolic < 90 or diastolic < 60, Will's convention),
  pulse ≥ 100.
- **Concept choices for the page's lay words:** Confusion → Acute confusion; unusual behaviour →
  Abnormal behavior; weakness → Asthenia; shaking → Tremor; rapid deep breathing → Kussmaul's
  respiration; thirst → Excessive thirst; hunger → Hungry.
- **Priority level** is `Urgent` throughout, as the page says. Chest pain and seizure keep their
  own higher warning-sign levels elsewhere.
- **Measure task** for weight, BMI and waist circumference from the routine-care table. Fingerprick
  glucose and BP are routine vitals, so no task.

## Could not model

- **Timing** ("every visit", "at diagnosis, yearly", "3-6 monthly") cannot be expressed; the
  measure task fires whenever diabetes is recorded.
- **Lab values** (HbA1c, eGFR/creatinine, potassium, urine albumin/creatinine ratio, cholesterol,
  triglycerides) have no observable or unit in the language. Their thresholds (e.g. potassium > 5.5,
  eGFR < 30, total cholesterol > 7.5) are not encoded.
- **Waist-hip ratio** has no unit; WC/WHR targets are sex-specific aims, not triggers.
- **Fasting vs 2-hour postprandial glucose** (> 8 / > 10, step up treatment) cannot be told apart from
  a random glucose; it is a management step anyway.
- Routing rows (TB symptoms → 102, mental health → 98, substance use → 165, palliative care → 191,
  BP ≥ 140/90 → 148, BMI ≥ 25 → 156) are management or cross-references and are not encoded.

## SNOMED gaps

- "Confusion" (finding): none; used Acute confusion.
- "Weakness" (finding): none; used Asthenia.
- "Shaking" (finding): none; used Tremor (synonym match).
- "Rapid deep breathing": no precoordinated concept; used Kussmaul's respiration.
- "Thirst" (finding): only the grouper "Thirst finding" (includes normal thirst); used Excessive thirst.
- "Hunger" (finding): none; used Hungry.
- "Dry mouth" (finding): none; used Xerostomia.
- "Ketones in urine": none; used Ketonuria.

## Checker issues left in place

- None.

## Questions for a clinician

- Should glucose < 4 and ketonuria with glucose ≥ 11.1 be `Urgent`, or higher (page 19 may escalate
  some of these to Emergency/Very urgent)?
- Is "rapid deep breathing" best recorded as Kussmaul's respiration, or should health workers record
  Tachypnea and Deep breathing separately?
- Dehydration: does any single listed sign (e.g. pulse ≥ 100 alone) make a patient with diabetes
  urgent, or must the signs together indicate dehydration?

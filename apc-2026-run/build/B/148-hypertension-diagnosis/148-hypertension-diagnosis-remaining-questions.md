# Page 148 – Hypertension: diagnosis: remaining questions

## Decisions made

- **Trigger.** The red box applies to "systolic BP ≥ 180 and/or diastolic BP ≥ 110". The check task is
  triggered by `(or (>= SBP 180) (>= DBP 110))` on the routine vitals; "and/or" is encoded as `or`.
- **Four probable diagnoses from the red box**, each gated by its own BP threshold:
  - Stroke (`Cerebrovascular accident`): BP ≥ 180/110 **and** any sudden-onset item.
  - Hypertensive emergency: SBP ≥ 180 or **DBP ≥ 130**, and severe headache, known kidney failure,
    chest pain/unstable angina, or shortness of breath/severe heart failure.
  - Hypertensive urgency: SBP ≥ 180 or DBP ≥ 110, and severe headache, known kidney impairment,
    or difficulty breathing worse lying flat / leg swelling.
  - Heart failure: BP ≥ 180/110 and orthopnoea or leg swelling ("heart failure likely").
  As written, severe headache with SBP ≥ 180 makes both emergency and urgency probable; the page
  lists severe headache in both columns, so this overlap is the page's.
- **Priority.** One `Urgent` evaluation: BP ≥ 180/110 **and** any red-box symptom. No escalation to
  "Very urgent" for hypertensive emergency: the page says "Give urgent attention" for the whole box
  and distinguishes the two only by referral timing (urgent vs same day). Chest pain, seizure and
  severe dyspnoea already carry their own warning-sign priority.
- **Sudden onset** is applied to every item after "Sudden onset of:", including seizure/s and
  dizziness, and "severe headache" there carries both Severe and Sudden onset qualifiers.
- **"Shortness of breath/severe heart failure"** is `Dyspnea` + Severe (the warning-sign form) or
  `Heart failure` + Severe.
- **Lower chart not encoded** (mild/moderate/severe hypertension, follow-up interval): see below.
- No `measure` tasks: BP is a routine vital. Mid-upper arm circumference (cuff size) and CVD risk
  factors (BMI, waist circumference) are used only for cuff choice and follow-up frequency, which
  are management.

## Could not model

- **eGFR** ("eGFR < 15", "eGFR < 60") has no unit or observable in the language. The known
  diagnoses are used instead (`Chronic kidney disease stage 5` / `Renal impairment`, Known present).
  A patient with a recorded low eGFR but no recorded kidney diagnosis will not match, so the rules
  fire **less often** than the page intends.
- **Averaging readings** ("Use average of last 2 readings", third reading when readings differ by
  > 5mmHg or BP ≥ 180/110). The rules use a single recorded reading, so they may fire **more often**
  than the page intends.
- **Diagnose mild / moderate / severe hypertension.** These require BP on 2 further occasions at least
  2 days apart (or ≥ 3 readings after 1 hour's rest for ≥ 180/110), and the page says "Avoid
  diagnosing hypertension on one reading alone." The language cannot compare readings across
  separate occasions. SNOMED also has no "Mild/Moderate/Severe hypertension" FSN (only "Stage 1/2
  hypertension" findings). Not encoded.
- **Follow-up frequency** (BP after 5 years / 1 year) depends on a CVD risk score (page 142) and is
  management.
- Age-specific management (< 30 years refer; > 65 years treat only when BP > 160/90) is management.

## SNOMED gaps

- "Unstable angina" (disorder): not an FSN; used `Preinfarction syndrome` (its FSN; "unstable angina"
  is a synonym).
- "Kidney failure" (disorder): not an FSN; used `Chronic kidney disease stage 5` (eGFR < 15).
- "Difficulty speaking" (finding): not an FSN; used `Difficulty talking` (vocabulary term).
- "Mild hypertension", "Moderate hypertension", "Severe hypertension" (disorder): none exist.

## Checker issues left in place

- None.

## Questions for a clinician

- Should hypertensive emergency (SBP ≥ 180 or DBP ≥ 130 with the listed features) be "Very urgent"
  rather than "Urgent", given "Manage and refer urgently"?
- Should "Sudden onset" be required for seizure and dizziness in the stroke list, or should any
  recorded seizure/dizziness with BP ≥ 180/110 count?
- Is "known kidney failure" meant as chronic (CKD stage 5) only, or should acute kidney failure count?
- Should a single reading of BP ≥ 140/90 at least raise a `possible` hypertension diagnosis to prompt
  repeat readings? The page does not say "consider", so it was not encoded.

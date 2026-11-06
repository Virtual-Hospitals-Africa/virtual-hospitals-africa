# Page 15 – Collapse following vaccination: remaining questions

## Decisions made

- **Red box is a pointer.** "Treat as anaphylaxis → 28" is accounted for as `cross_reference_only`. No anaphylaxis rule is written on this page; the anaphylaxis page owns that logic.
- **"Fainting episode likely" → probable `Syncope` (finding).** "Fainting episode" is the SNOMED synonym of Syncope. `Vasovagal syncope` would be narrower than the page.
- **Fainting rule evidence.** Collapse + Vaccination given + BP not < 90/60 (SBP ≥ 90 and DBP ≥ 60) + pulse not > 120 + none of the delayed-collapse signs (wheeze, stridor, cough, swelling, rash). The vitals encode the page's contrast "BP briefly low but rapidly normal again" vs "BP < 90/60 and remains low", and "Pulse may be slow" vs "Pulse > 120", read at the time of assessment. "No other signs or symptoms present" is read as absence of each delayed-collapse sign the page names.
- **Trigger.** The check task fires on Collapse **and** Vaccination given, matching the page title.
- **No priority evaluation.** The page has no "give urgent attention" list. Cardiac arrest (no pulse/not breathing → CPR) is already an Emergency warning sign.
- **Swelling and rash have no site.** The general `Swelling` (finding) and `Eruption` (morphologic abnormality, the gold page's rash form) are used.

## Could not model

- **Timing of collapse relative to vaccination** ("at the time of vaccination (before, during or immediately after)" vs "5–10 minutes after vaccination (up to 1 hour)"). The language compares an onset only with `time_ago`, not with another event's time. As a result, the fainting rule can fire for a delayed collapse that has none of the listed signs and normal vitals. It fires **more often** than the page intends.
- **Loss-of-consciousness duration** (20 s – 1 min vs > 1 min) and **relief by lying down and raising legs**. SNOMED's `Brief loss of consciousness` / `Prolonged loss of consciousness` have no defined duration that matches 1 minute, and the language has no duration measure. Not encoded; the rule fires **more often** than the page intends.
- **"BP briefly low"** (a trajectory). Only the current reading is compared.
- Breathing "may be rapid and deep (hyperventilation)" and "pulse may be slow" are permissive ("may") and are not required.
- Management, "Refer if" items, AEFI reporting and the QR code are management or notes, not encoded.

## SNOMED gaps

- None. All concepts were confirmed with `snomed exists`: Collapse (finding), Vaccination given (situation), Syncope (finding), Wheezing, Stridor, Cough, Swelling (finding), Eruption (morphologic abnormality), Systolic/Diastolic blood pressure and Pulse, function (observable entity).

## Checker issues left in place

- None.

## Questions for a clinician

1. Should the delayed-collapse picture be encoded on this page as a `possible` (or `probable`) **Anaphylaxis** rule, so that it routes the patient into the anaphylaxis page's check and Urgent priority? At present it relies on the anaphylaxis page's own rules picking up the same findings.
2. `Vaccination given` is not a recorded common symptom or warning sign, so the check task fires only if a vaccination is recorded in the encounter. Should it fire on any collapse, and ask about vaccination?
3. Is "BP rapidly normal again" safely encoded as "current BP not < 90/60"? A patient assessed during the brief low-BP phase of a simple faint would not be labelled fainting.
4. Should a cough alone (common, often pre-existing) be enough to rule out a fainting episode?

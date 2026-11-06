# Page 35 – Aggressive/Disruptive Behaviour: remaining questions

## Decisions made

- **Trigger** is `(or (clinical_finding Aggressive behavior) (clinical_finding Disruptive behavior))`.
  Aggressive behavior is the recorded form of VHA's `Aggression` warning sign; Disruptive behavior
  is not a recorded common symptom or warning sign, so that half fires only if recorded elsewhere.
- **Priority level is `Urgent`** because the red box says "Give urgent attention". Note that the
  `Aggression` warning sign already carries `Very urgent` in `warning_signs.ts`, so in practice an
  aggressive patient will already be Very urgent; this rule matters mainly for the disruptive
  (non-aggressive) path and records the page's own level.
- **No diagnosis rules.** "Stimulant withdrawal, Alcohol withdrawal, Seizures, Delirium, Psychosis,
  Cause unknown" appear only in "Decide which medication to use according to likely cause". The page
  gives no evidence for any of them, so no `probable`/`possible` rule can follow the page.
- **No `measure` task.** The monitoring line lists temperature, BP, respiratory and pulse rate (routine
  vitals) and level of consciousness, all after sedation (management).
- Mapping of red-box items: Angry behaviour → Feeling angry; Challenging, insulting or provocative →
  Challenging behavior + Provocative behavior; Tense posturing → Feeling tense; Loud, aggressive speech
  → Verbal aggression; Frequently changing body position, pacing → Restlessness + Pacing up and down;
  Aggressive acts → Physical aggression.

## Could not model

- The whole sedation algorithm (oral acceptance, 30-minute reassessment, medication by likely cause,
  repeat dose, age > 65 dose adjustment, olanzapine intolerance), restraint, monitoring, involuntary
  admission and referral: management, out of scope for this pass.
- Examples given in the criteria ("gripping arm rails tightly, clenching fists", "pounding walls,
  throwing objects, hitting") are not encoded individually; the general concept is used.

## SNOMED gaps

- **Insulting behaviour:** no concept found (`Insulting behavior` NO; search "insult" empty).
  Partly covered by Verbal aggression and Provocative behavior.
- **Angry behaviour:** `Angry behavior` NO. Used `Feeling angry` (mood finding).
- **Tense posturing / clenched fists:** `Tense posture`, `Clenched fist`, `Clenching fists` NO. Used
  `Feeling tense` (low confidence; emotional state rather than observed posture).
- **Loud speech:** `Loud speech`, `Loud voice` NO. `Finding of shouting` exists but was not added;
  Verbal aggression used.
- **Frequently changing body position:** no concept; used `Restlessness`.

## Checker issues left in place

- None.

## Questions for a clinician

- Should this page's rule be `Very urgent` to match the existing `Aggression` warning sign, or is
  `Urgent` (as printed) correct for the disruptive-only patient?
- Is `Feeling tense` an acceptable code for observed tense posturing (gripping, clenched fists), or
  should this be a request for a new concept?
- Should "loud" speech alone (e.g. `Finding of shouting`) qualify, or only aggressive speech?

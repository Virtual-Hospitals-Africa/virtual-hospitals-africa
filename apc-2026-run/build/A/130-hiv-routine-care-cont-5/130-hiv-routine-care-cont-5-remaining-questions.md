# Page 130 – HIV: Routine care (cont. 5): remaining questions

## Decisions made

- **Trigger.** The page is Step 4 of starting ART, so it applies to an HIV-positive patient about to
  start ART. Both tasks and all rules are keyed on
  `(clinical_finding (snomed_concept "Human immunodeficiency virus infection" "disorder"))`, the same
  form in the trigger and the rules (no rule diagnoses HIV at `probable`). HIV infection is not a
  recorded common symptom or warning sign.
- **Red box → Urgent.** "Delay starting ART and refer same day" becomes `Urgent: HIV danger signs
  before starting ART`: HIV **and** any red-box item. Respiratory rate ≥ 30 and pulse ≥ 120 use the
  routine vitals (`Respiratory rate`, `Pulse, function`, bpm), so they need no `measure` task.
  Seizure, haemoptysis and aggressive behaviour are also VHA warning signs with their own higher
  levels; this rule does not change those.
- **Red-box wording.** Breathlessness at rest or while talking → `Dyspnea at rest` or `Unable to
  complete a sentence in one breath`. Drowsy/confused → `Drowsy` or `Acute confusion`. Aggressive or
  agitated → `Aggressive behavior` or `Feeling agitated`. Neck stiffness → `Stiff neck`. New sudden
  weakness/numbness or visual disturbance → `Muscle weakness`, `Numbness`, `Visual disturbance`, each
  with the `Sudden onset` qualifier (the gold standard's way of writing "sudden").
- **"Exclude TB" → possible Tuberculosis.** Q1 = No (not known with TB) and Q2 = Yes (cough, weight
  loss, night sweats, fever, chest pain or blood-stained sputum) → `possible` Tuberculosis, per Will's
  briefing ("exclude X" → possible). Known TB is `Tuberculosis` + `Known present`, used as `(no …)`.
  Fever is `(active_condition Fever)`, per the anchoring rules.
- **Signs of meningitis → Urgent.** Q6 "signs of meningitis (severe headache with neck
  stiffness/vomiting)" → "refer urgently" is encoded as `Urgent: HIV with signs of meningitis before
  starting ART`: HIV and severe headache and (stiff neck or vomiting). It is **not** gated on the
  branches that lead to Q6 (no known TB, no TB symptoms, no known cryptococcal meningitis, CrAg not
  positive). So it fires more often than the flowchart path does: also for a patient with TB
  symptoms or known TB. I judged this safer than missing an urgent referral; a clinician should
  confirm.
- **Not encoded (management or ART timing):** the known-TB branch (TB meningitis/tuberculoma,
  CD4 < 50 / RR-TB / pregnant or breastfeeding → when to start ART), known cryptococcal meningitis
  (start ART after 4-6 weeks), jaundice (check ALT and bilirubin), other acute illness such as
  pneumonia or PJP (treat 1-2 weeks first), "start ART same day", Step 5 dosing and the footnote.
  None of these changes triage or a diagnosis on this page.
- No shock or BP < 90/60 criteria appear on this page.

## Could not model

- **"About to start ART" / not on ART.** The language has no state for this. The rules fire for any
  patient with recorded HIV infection, including patients already on ART (**more often** than the
  page intends).
- **"Unable to walk unaided".** `Unable to walk` is used, so a patient who can walk only with help
  is missed (**less often**).
- **"Coughs up ≥ 1 tablespoon of fresh blood".** The volume and "fresh" cannot be expressed;
  `Hemoptysis` fires for any amount (**more often**).
- **CD4 count and CrAg result** (Q5, Q7: "Is CD4 result available?", "If CD4 < 200, check CrAg",
  "CD4 < 50") are lab values with no observable or unit in the language. The CrAg-positive branch
  ("If symptomatic (headache, confusion, blurred/double vision, neck stiffness) or pregnant, refer
  urgently") depends on the CrAg result and is not encoded. Symptomatic patients with neck stiffness
  or confusion are still caught as Urgent by the red-box rule; headache or blurred/double vision
  alone with a positive CrAg is not (**less often**).

## SNOMED gaps

- "Weight loss" (finding) does not exist; used `Weight decreased` (finding).
- "Neck stiffness" is a synonym only; used the FSN `Stiff neck` (finding).
- No concept for breathlessness while talking; used `Unable to complete a sentence in one breath`.
- No "unaided" walking concept; used `Unable to walk`.

## Checker issues left in place

- `CHECKED FOR BUT NEVER USED AS EVIDENCE`:
  `(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Tuberculosis" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))`.
  It *is* used, as `(no …)` in `Diagnose possible TB in HIV patient before starting ART`. For a
  finding with a qualifier, the rendered `(no …)` puts `(snomed_concept "No" "qualifier value")`
  before the `(qualifier …)`, and the gate's `NO_RE` only matches a trailing "No", so the gate (and
  VHA's test) do not see the use. Faithful encoding kept.

## Questions for a clinician

1. Should "signs of meningitis → refer urgently" apply on every branch (as encoded), or only on the
   flowchart path that reaches that question?
2. Is `Urgent` the right level for the red box ("refer same day"), or should some items be higher?
3. Should a recorded `Difficulty walking` also count as "unable to walk unaided"?
4. Should the possible-TB rule also apply to a patient known with TB (the page sends those patients
   down a different branch, so it is excluded here)?

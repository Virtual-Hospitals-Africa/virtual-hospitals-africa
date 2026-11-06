# Page 130 – HIV: Routine care (cont. 5): remaining questions

Final build reconciled from builders A and B (base: A). See `reconcile.json` for each difference.

## Decisions made

- **Trigger.** The page is Step 4 of starting ART, so it applies to an HIV-positive patient about to
  start ART. Both tasks and all rules are keyed on
  `(clinical_finding (snomed_concept "Human immunodeficiency virus infection" "disorder"))`, the same
  form in the trigger and the rules (no rule diagnoses HIV at `probable`). HIV infection is not a
  recorded common symptom or warning sign.
- **Red box → Urgent.** "Delay starting ART and refer same day" becomes `Urgent: HIV danger signs
  before starting ART`: HIV **and** any red-box item. The page doesn't escalate further, so seizure,
  haemoptysis and aggression stay at `Urgent` here (their global warning signs carry their own,
  higher levels; this rule doesn't change those). Respiratory rate ≥ 30 and pulse ≥ 120 use the
  routine vitals (`Respiratory rate`, `Pulse, function`, bpm), so they need no `measure` task.
- **Red-box wording.** Breathlessness at rest or while talking → `Dyspnea at rest` or `Unable to
  complete a sentence in one breath`. Unable to walk unaided → `Unable to walk` (VHA's mobility
  vital) or `Dependent for walking` (covers "unaided"). Drowsy/confused → `Drowsy`, `Acute
  confusion` (VHA's "Confusion" warning-sign anchor) or `Clouded consciousness` (VHA's ACVPU
  "Confused" form). Both confusion concepts are kept so that confusion fires the rule whichever form
  records it. Aggressive or agitated → `Aggressive behavior` or `Feeling agitated`. Neck stiffness →
  `Stiff neck`. New sudden weakness/numbness or visual disturbance → `Muscle weakness`, `Numbness`,
  `Visual disturbance`, each with the `Sudden onset` qualifier (the gold standard's way of writing
  "sudden").
- **"Exclude TB" → possible Tuberculosis.** Q1 = No (not known with TB) and Q2 = Yes (cough, weight
  loss, night sweats, fever, chest pain or blood-stained sputum) → `possible` Tuberculosis, per Will's
  briefing ("exclude X" → possible). Known TB is `Tuberculosis` + `Known present`, used as `(no …)`.
  Fever is `(active_condition Fever)`, per the anchoring rules.
- **Signs of meningitis → Urgent.** "Signs of meningitis (severe headache with neck
  stiffness/vomiting)" → "If signs of meningitis, refer urgently" is encoded as `Urgent: HIV with
  signs of meningitis before starting ART`: HIV and severe headache and (stiff neck or vomiting).
  It is **not** gated on the branches that lead to that question (no known TB, no TB symptoms, no
  known cryptococcal meningitis, CD4/CrAg path), because the CD4 and CrAg conditions can't be
  expressed. So it fires more often than the flowchart path does. Builder B left this node
  unencoded as management; the reconciler kept it because "refer urgently" is triage. This is
  **unsettled**: see the clinician questions.
- **Not encoded (management or ART timing):** the known-TB branch (TB meningitis/tuberculoma,
  CD4 < 50 / RR-TB / pregnant or breastfeeding → when to start ART), known cryptococcal meningitis
  (start ART after 4-6 weeks), jaundice (check ALT and bilirubin), other acute illness such as
  pneumonia or PJP (treat 1-2 weeks first), "start ART same day", Step 5 dosing and the footnote.
- No shock or BP < 90/60 criteria appear on this page.

## Could not model

- **"About to start ART" / not on ART.** The language has no state for this. The rules fire for any
  patient with recorded HIV infection, including patients already on ART (**more often** than the
  page intends).
- **"Coughs up ≥ 1 tablespoon of fresh blood".** The volume and "fresh" can't be expressed;
  `Hemoptysis` fires for any amount (**more often**).
- **CD4 count and CrAg result** ("Is CD4 result available?", "If CD4 < 200, check CrAg",
  "CD4 ≥ 200", "CD4 < 50") are lab values with no observable or unit in the language. The
  CrAg-positive branch ("If symptomatic (headache, confusion, blurred/double vision, neck
  stiffness) or pregnant, refer urgently") depends on the CrAg result and isn't encoded.
  Symptomatic patients with neck stiffness or confusion are still caught as Urgent by the red-box
  rule; headache or blurred/double vision alone with a positive CrAg is not (**less often**).
- **Path gating of "signs of meningitis"** (see Decisions made): the rule fires **more often** than
  the flowchart path.

## SNOMED gaps

- "Confusion" (finding) doesn't exist. Used `Acute confusion` and `Clouded consciousness`.
- "Agitation" (finding) doesn't exist. Used `Feeling agitated`.
- "Weight loss" (finding) doesn't exist. Used `Weight decreased` (finding).
- "Neck stiffness" is a synonym only. Used the FSN `Stiff neck` (finding).
- There's no concept for breathlessness while talking. Used `Unable to complete a sentence in one breath`.
- There's no "unable to walk unaided" concept. Used `Unable to walk` or `Dependent for walking`.

## Checker issues left in place

> **Note, 2026-11-05.** The gate's `(no X)` pattern was fixed on 2026-11-05: it now recognizes `(no X)` when X has a qualifier or finding site. The gate no longer reports the findings below. Will's PR #1310 test may still flag the `(no X)` forms, because it wants `(no X)` itself checked for; see `RUN-REPORT.md`, "What the test result means".

- `CHECKED FOR BUT NEVER USED AS EVIDENCE`:
  `(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Tuberculosis" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))`.
  It *is* used, as `(no …)` in `Diagnose possible TB in HIV patient before starting ART`. For a
  finding with a qualifier, the rendered `(no …)` puts `(snomed_concept "No" "qualifier value")`
  before the `(qualifier …)`, and the gate's `NO_RE` only matches a trailing "No", so the gate (and
  VHA's test) don't see the use. Faithful encoding kept.

## Questions for a clinician

1. Should "signs of meningitis → refer urgently" apply on every branch (as encoded), only on the
   flowchart path that reaches that question, or not be a priority rule at all?
2. Is `Urgent` the right level for the red box ("refer same day"), or should some items be higher?
3. Is it right to encode "confused" as both `Acute confusion` and `Clouded consciousness`, or should
   only one be used?
4. Should a recorded `Difficulty walking` also count as "unable to walk unaided"?
5. Should "New sudden" also add the `New` qualifier, or is `Sudden onset` alone enough?
6. Should the danger-sign check be limited to patients not yet on ART? If so, which recorded concept
   would mark that?
7. Should the possible-TB rule also apply to a patient known with TB? The page sends those patients
   down a different branch, so they are excluded here.

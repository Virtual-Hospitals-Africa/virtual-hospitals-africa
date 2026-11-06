# Page 35 – Aggressive/disruptive behaviour: remaining questions

## Decisions made

- **Scope.** Only the triage part of the red box is encoded: one `check_for` task and one `Urgent`
  priority evaluation. Everything below "Manage urgently:" (safety, verbal calming, involuntary
  admission, restraint, the sedation flowchart, monitoring, referral) is management and is
  accounted for as `management_step` / `flowchart_routing`.
- **Priority level is `Urgent`**, as the page says ("Give urgent attention"). VHA's `Aggression`
  warning sign (`Aggressive behavior`) already carries `Very urgent`; the page does not escalate,
  so this rule does not either.
- **Presenting complaint** = `(or Aggressive behavior, Disruptive behavior)`, used as the task's
  `due_to` and as the first conjunct of the priority rule. `Aggressive behavior` is the recorded
  warning sign; `Disruptive behavior` is not a recorded common symptom or warning sign, so that
  half fires only if a worker records it directly.
- **Item mapping (six red-box items → ten findings):**
  - Angry behaviour → `Anger reaction` (an observed behaviour; `Feeling angry` is a mood finding).
  - Challenging, insulting or provocative behaviour → `Challenging behavior`, `Verbally abusive
    behavior` (for "insulting"), `Provocative behavior`.
  - Tense posturing → `Feeling physically tense` (low confidence; see SNOMED gaps).
  - Loud, aggressive speech → `Verbal aggression`.
  - Frequently changing body position, pacing → `Restlessness`, `Pacing up and down`.
  - Aggressive acts like pounding walls, throwing objects, hitting → `Physical aggression`,
    `Destructive behavior`.
- **The "likely cause" boxes** (stimulant withdrawal, alcohol withdrawal, seizures, delirium,
  psychosis, cause unknown) only choose a medicine. The page gives no criteria for them, so no
  diagnosis rules were written.
- No `measure` task: the monitoring line lists routine vitals and level of consciousness, as
  post-sedation management.

## Could not model

- The sedation algorithm (oral medication acceptance, 30-minute reassessment, choice of medicine
  by cause, repeat dosing): management, out of scope for this pass.
- "Especially if > 65 years or substance user" (avoid IM/IV sedation): medication advice.
- Involuntary-admission criteria (signs of mental illness and refuses treatment and a danger…):
  a legal/management decision that points to page 158.

## SNOMED gaps

- **Tense posturing (gripping arm rails tightly, clenching fists):** no concept for observed tense
  posture. Searched "tense posture", "clench", "clenched fist", "gripping", "posturing",
  "tension". Substitute: `Feeling physically tense` (finding), which is patient-reported. Others
  rejected: `Tension` (emotional state), `Muscle tension` (increased tone), `Posturing behavior`
  (catatonic sense), `Clenching teeth`.
- **Insulting behaviour:** no concept; substitute `Verbally abusive behavior`.
- **Loud speech:** no "loud speech" concept; `Verbal aggression` used for the item as a whole.
  `Finding of shouting` exists but was not added.
- **Pounding walls / throwing objects:** no specific concept; `Destructive behavior` used.

## Checker issues left in place

- None.

## Questions for a clinician

- Should the priority be `Very urgent` to match VHA's `Aggression` warning sign, or `Urgent` as
  the page says? In practice the warning sign already raises recorded aggression to Very urgent.
- Is `Feeling physically tense` acceptable for observed tense posturing, or should the item be left
  unencoded?
- Should `Disruptive behavior` be added as a recorded presenting complaint or warning sign so that
  the disruptive (non-aggressive) patient reaches this page?
- Should "loud" speech alone (e.g. `Finding of shouting`) qualify, or only aggressive speech?
- Reconciler: is `Anger reaction` (behavioural) or `Feeling angry` (mood) the better code for
  "Angry behaviour"? The two builders split on this; the final build uses `Anger reaction`.
- Reconciler: `Feeling physically tense` (final) vs the broader `Feeling tense` for "tense
  posturing" — the builders split; neither describes an observed posture.

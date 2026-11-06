# Page 32 – Sexual assault and/or rape: remaining questions

## Decisions made

- **Presenting complaint.** `Victim of sexual aggression` (finding; synonym "sexual assault victim")
  is the trigger. `Victim of rape` is its descendant, so one concept covers "sexually assaulted
  and/or raped". The complaint is not a recorded common symptom or warning sign, so a health worker
  must record it before anything on this page fires.
- **"Suspect sexual assault / suspect rape"** (top of page) became two `possible` diagnosis rules:
  `Victim of forced sexual activity` → possible `Victim of sexual aggression`; any of six SNOMED
  "sexual assault with … penetration" events (vagina, anus, mouth) → possible `Victim of rape`.
  Both possible diagnoses also trigger the check task and the priority rule. The diagnosed concepts
  are findings, because SNOMED has no disorder concept for sexual assault or rape.
- **"(excluding penetration)"** is not encoded in the sexual assault rule: a penetrative assault is
  rape, which is itself a sexual assault, so excluding it would only lose cases.
- **Red box → `Urgent: sexual assault/rape with urgent signs`**: complaint AND any of: within the
  last 5 days (onset), pregnant, injury, suicidal thoughts/plans, overdose, self harm. The page does
  not escalate beyond urgent, so `Urgent`.
- **Time window** written as `(<= (onset X) (time_ago 5 days))`, applied to the complaint finding
  and to each finding that feeds the possible diagnoses.
- `Overdose` (disorder) follows the page wording; it is a child of `Poisoning`, the warning-sign
  concept, so a patient recorded only with the warning sign "Poisoning" does not match here.
- `Planning suicide` is a descendant of `Suicidal thoughts`; kept separately to mirror "thoughts/plans".
- **No `manage` tasks.** All of "Manage and refer urgently" (fluids, oxygen, PEP, STI prophylaxis,
  emergency contraception, Thuthuzela referral) is management and is not encoded.

## Could not model

- **"within last 5 days if woman or last 3 days if man"**: the language has no patient sex. The
  5-day window is used for everyone, so the rule **fires more often** than the page intends (men
  assaulted 3–5 days ago become Urgent).
- **"Injuries needing attention"**: no qualifier for "needing attention"; any `Traumatic injury`
  counts, so the rule **fires more often** than the page intends.
- **Onset semantics**: the window only works if the recorded onset of the finding is the time of the
  assault, not the time it was recorded.
- The "Manage and refer urgently" referral criteria (severe bleeding, multiple injuries, severe
  abdominal pain, difficulty breathing, strangled/choked, foreign object) are a referral step and
  are not encoded.
- The "Assess / Advise / Treat / Review" sections below the red box are routine care and
  cross-references; not modelled.

## SNOMED gaps

- No disorder concept for sexual assault or rape; the `Victim of …` findings are used.
- No specific event for penile–vaginal penetration (only `Rape` itself); such a case is covered by
  recording `Victim of rape` directly.
- No concept for "intentional penetration with any object" in general; the six specific
  penetration events are used.

## Checker issues left in place

- None.

## Questions for a clinician

- Should men be given the 3-day window once patient sex is available to rules (and should "woman"
  cover all patients with a vagina)?
- Should any of the "manage and refer urgently" criteria (e.g. strangled/choked, severe bleeding,
  difficulty breathing) raise the priority above Urgent?
- Is "injuries needing attention" any injury, or should a minor injury not make the visit urgent?
- Will health workers record the assault as `Victim of sexual aggression` / `Victim of rape`, or as
  `Sexual assault` / `Rape` events? If events, the trigger should include them.

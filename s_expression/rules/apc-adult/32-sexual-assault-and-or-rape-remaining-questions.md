# Page 32 – Sexual assault and/or rape: remaining questions

## Decisions made

- **Trigger.** The presenting complaint is `(or Sexual assault (event), Rape (event))`. Rape is a
  descendant of Sexual assault, so the `or` is redundant for matching. It is written out to mirror
  the page's "and/or". Neither concept is a recorded common symptom or warning sign, so the
  `check_for` task only runs when a health worker records one of these events.
- **Woman/man windows.** "Within last 5 days if woman or last 3 days if man" is encoded as
  `(and Female (<= (onset assault/rape) (time_ago 5 days)))` or
  `(and Male (<= (onset …) (time_ago 3 days)))`. Female and Male are the `finding` concepts under
  "Finding related to biological sex". The language has no sex or gender predicate. Following the
  brief, "within" uses `<=`. The onset comparison is written for both Sexual assault and Rape
  because I'm not sure that onset matching follows descendants.
- **Priority level.** The page says "Give urgent attention", so the priority is `Urgent`. Overdose is
  a descendant of Poisoning, which is a `Very urgent` warning sign and fires on its own.
- **"Injuries needing attention ↻ 30"** is encoded as Traumatic injury (disorder), the concept the
  warning-sign anchors use.
- **"Manage and refer urgently" list** (severe bleeding, multiple injuries, severe abdominal pain,
  pregnant, difficulty breathing, strangled/choked, foreign object) is treated as a referral
  decision (`management_step`) and not encoded. Per the brief, there are no referral steps in this
  pass. "Pregnant" is still encoded, because it is also an urgent-attention criterion.
- **No diagnosis rules.** The "Suspect sexual assault / suspect rape" lines define the event
  (consent, penetration). The only evidence for them is the patient's account, which is the event
  finding itself, so a `possible` rule would be circular. No "X likely" statement appears on the page.
- **Self harm** is `Intentionally harming self` (event), the concept VHA's current rules use most
  (vocabulary: 2 uses, against 1 for `Self-injurious behavior`). The two are not is-a related.
- **Reconciled build.** This is builder B's encoding; builder A's alternative (a `Victim of sexual
  aggression` trigger, a single 5-day window, two `possible` diagnosis rules) was not taken. See
  `reconcile.json`. The SNOMED "Sexual assault with … penetration" events A used are descendants of
  `Sexual assault` (event), so they are covered by this trigger if matching follows descendants.
- **No flowchart file.** The page has no flowchart or Yes/No branches.

## Could not model

- **Patient sex** is not a language primitive. The rule needs a recorded Female/Male finding. If
  the app stores sex only on the patient's demographic record, the time-window branches never fire,
  so the rule fires **less often** than the page intends. The other criteria are unaffected.
- **"Needing attention"** has no qualifier. Any recorded traumatic injury makes the patient Urgent,
  so the rule fires **more often** than the page intends.
- **Onset semantics.** This assumes that the onset of the Sexual assault/Rape record is when the
  assault happened. If onset is instead the time the finding was recorded, the window is always
  met at the visit, so the rule fires **more often** than the page intends.
- The management steps (fluids, oxygen, PEP, STI prophylaxis, emergency contraception, Thuthuzela
  referral) are out of scope.

## SNOMED gaps

- No disorder concept for sexual assault or rape (builder A); events are used here.
- All concepts were confirmed with `snomed exists`: Sexual assault (event), Rape (event),
  Female (finding), Male (finding), Pregnancy (finding), Traumatic injury (disorder), Suicidal
  thoughts (finding), Planning suicide (finding), Overdose (disorder) and Intentionally harming
  self (event).

## Checker issues left in place

- None.

## Questions for a clinician

- Should the "manage and refer urgently" criteria (severe bleeding, strangled/choked, difficulty
  breathing, etc.) also raise the priority, possibly to Emergency, or is Urgent from the
  red-box criteria enough?
- How does VHA record patient sex? Is there a finding that a rule can test, or only a demographic
  field?
- The page says "Suspect sexual assault if … Suspect rape if …". Should these become `possible`
  diagnosis rules (one builder encoded them from specific SNOMED penetration events and
  `Victim of forced sexual activity`), or are they only definitions of the presenting complaint, as
  this build assumes?
- Will health workers record the assault as `Sexual assault` / `Rape` events, or as
  `Victim of sexual aggression` / `Victim of rape` findings? If findings, the trigger should include them.
- Should "woman" cover all patients with a vagina, and should the 3-day window for men apply only
  once sex is recorded as a finding?
- For "Injuries needing attention", should only certain injuries count (as on page 30), rather than
  any traumatic injury?

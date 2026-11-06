# Page 59 – Cholera: remaining questions

## Decisions made

- **Two tasks.** Diarrhoea (common symptom) triggers `Check for cholera` (watery diarrhoea, exposure
  to *Vibrio cholerae*). Once cholera is probable, `Check for dehydration in cholera` collects the
  dehydration signs from the page's two questions.
- **Cholera likely** = watery diarrhoea (Diarrhea + `Watery` qualifier) **and** exposure to
  *Vibrio cholerae* (the page-20 `Exposure to (contextual qualifier)` pattern) with onset within
  5 days, written `(<= (onset …) (time_ago 5 days))` per the time-comparison rule. Vomiting is
  "with or without", so it is not required.
- **Severe dehydration.** "Manage as severe dehydration and refer urgently" is encoded as a probable
  `Severe dehydration` diagnosis (Q1 = Yes) plus `Urgent: severe dehydration in cholera`. The page
  has no "give urgent attention" box; "refer urgently" is read as `Urgent`, not escalated further.
- **Some dehydration likely** → probable `Dehydration` (disorder). Q1 = No is written with recorded
  absences: each "any of" item `(no …)`, and an `any2` of absences over the three "≥ 2 of" groups
  (at most one present). VHA's evidence code rejects `(not …)` ("Not supported not"), so this is the
  closest faithful form. It means the rule needs the Q1 items explicitly recorded absent, which the
  dehydration `check_for` asks for.
- "Unable to drink (or drinking poorly)" is one group: `Unable to drink` or `Difficulty drinking`.
- "Drowsy/decreased consciousness" is `Drowsy` or `Decreased level of consciousness`; "confused" is
  `Clouded consciousness` (its synonym; `Acute confusion` is a descendant and matches).
- The dehydration rules are scoped to `(active_condition Cholera)`, as the algorithm sits under the
  cholera assessment on this page.
- Glucose (< 3, < 4 if diabetes → page 19) is a routine vital and a cross-reference; no task added.

## Could not model

- **Reassess hourly → red box 4** (signs of dehydration incl. weak pulse/pulse ≥ 100, not passing
  urine, unable to walk unaided, or ongoing diarrhoea/vomiting → manage as severe dehydration). The
  language cannot express "on reassessment after ORS". Folding these signs into the initial severe
  rule would make e.g. pulse ≥ 100 alone mean severe dehydration. Effect: post-treatment worsening
  does not raise a severe-dehydration diagnosis; fires less often than the page intends.
- **Red box 3** (reassess every 15–30 minutes; "awake, able to drink and pulse < 100" → also manage
  as some dehydration): treatment-response logic, management.
- "Dehydration unlikely" (Q2 = No): an unlikely outcome with management only.
- "In cholera outbreak area": modelled as exposure to the organism; the onset of an exposure record
  may be its recording time, so the 5-day window may add little in practice.
- Isolation, PPE, disinfection, stool specimen, ciprofloxacin, transport/discharge, notification:
  management.

## SNOMED gaps

- No "Confusion" finding FSN → `Clouded consciousness`.
- No "Weak pulse" → `Weak arterial pulse` (vocabulary).
- No "drinking poorly" → `Difficulty drinking`.
- No "Thirst"/"Thirsty" finding → `Increased thirst` (vocabulary's `Thirst due to water deprivation`
  not used: wrong mechanism).
- No "Dry mouth" FSN → `Xerostomia`.
- No "Watery diarrhoea" / "cholera outbreak area" concepts → `Diarrhea` + `Watery` qualifier;
  `Exposure to (contextual qualifier)` + `Vibrio cholerae` (organism).
- No "some dehydration" concept → `Dehydration` (disorder).

## Checker issues left in place

- None.

## Questions for a clinician

- Is "some dehydration" better recorded as `Moderate dehydration` (or `Mild dehydration`) than the
  general `Dehydration`?
- Should severe dehydration in cholera be `Very urgent` or `Emergency` rather than `Urgent`, given
  IV lines and urgent referral?
- Should the some-dehydration rule fire when Q1 items are simply unrecorded (rather than recorded
  absent)? The language currently can only express the latter.
- Is exposure to *Vibrio cholerae* an acceptable record of "been in cholera outbreak area", or
  should a travel/residence situation concept be used?

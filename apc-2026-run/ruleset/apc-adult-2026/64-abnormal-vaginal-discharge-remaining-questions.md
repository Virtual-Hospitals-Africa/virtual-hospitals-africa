# Page 64 – Abnormal vaginal discharge: remaining questions

## Decisions made

- **Trigger.** The check_for task and the urgent rule are triggered by `Vaginal discharge` (finding).
  It is not a recorded common symptom or warning sign, so the rules only fire once a health worker
  records it.
- **Shock/SBP < 80** is encoded as `(or Shock (< SBP 80))` on this page only, per the all-pages
  decision. Footnote 1 ("If SBP < 80, pulse ≥ 100, respiratory rate > 30, confusion/restlessness,
  weakness, shock likely") is not expanded into a shock definition.
- **Pulse > 100** is strict, as the red box writes it.
- **Recent delivery/TOP/miscarriage**: `Delivery finding`, `Induced termination of pregnancy` and
  `Miscarriage`, each with the `Recent` qualifier. (Builder B used `Postpartum state` for recent
  delivery; the reconciler kept `Delivery finding` + `Recent`, which follows the page's words and
  VHA's existing vocabulary.)
- **Pregnant or missed/overdue period**: `Pregnancy`, `Missed period` or `Menstrual period late`
  (for "overdue").
- **Peritonitis (guarding, rigidity, rebound tenderness)** is encoded as an `or` of the
  `Peritonitis` disorder and the three listed signs.
- **"Treat for X" read as probable X**, as the gold standard does for "Treat for anaphylaxis":
  cervicitis (`Inflammation of cervix`), bacterial vaginosis, vaginal candidiasis
  (`Candidiasis of vagina`) and LAP syndrome (`Female pelvic inflammatory disease`).
- **"Assess for UTI → 69"** is read as "consider UTI": a possible diagnosis of
  `Urinary tract infectious disease`.
- **LAP syndrome** comes from both paths that reach "pain on moving the cervix = Yes". These are
  sexually active, or not sexually active with a vulva that is not red, scratched or inflamed.
- **Bacterial vaginosis** covers the whole path "not sexually active → not curd-like/vulva not
  red, scratched or inflamed". The page starts BV treatment there before the speculum examination,
  and the later branches add treatment on top of it.
- The diagnosis rules do not require the absence of the red-box items ("not needing urgent
  attention"). This follows the gold standard, and the urgent priority is evaluated separately.
- **Itchy discharge** is `Pruritus of vagina` (disorder), a precoordinated concept.
- **Pain on moving the cervix** is `Pain on movement of cervix` (finding).
- Cervical redness and swelling and vulval scratch marks use `finding_site` on a
  general finding (Erythema, Swelling, Scratch marks), because there is no
  precoordinated concept. All body structures were checked with `snomed exists`.

## Could not model

- **"In the last 3 months"** (sexual activity): the finding `Sexually active` is taken as current.
  The rules fire more often than the page intends for someone who was sexually active more than
  3 months ago. An onset comparison would mean "became sexually active within 3 months", which is
  wrong.
- **"Curd-like" discharge**: no concept, so it is left out. Both candidiasis branches fire less
  often than intended, because a curd-like discharge with normal vulva is not caught. On the
  not-sexually-active path, such a patient falls to bacterial vaginosis instead.
- The HIV testing, PrEP and "assess and advise ↻ 62" steps, as well as all drugs, partner
  notification, return and referral advice, are management.

## SNOMED gaps

- Curd-like vaginal discharge: none found ("curd" only finds substances; `Finding of consistency
  of vaginal discharge` has only `Leukorrhea` as a child).
- Lower abdominal pain (LAP) syndrome: no concept; `Female pelvic inflammatory disease` used.
- Sexually active in the last 3 months: only "last month", "last six months" and "last year"
  exist; `Sexually active` used.
- Overdue period: `Menstrual period late` used.
- Cervicitis: no FSN "Cervicitis"; `Inflammation of cervix` used.

## Checker issues left in place

> **Note, 2026-11-05.** The gate's `(no X)` pattern was fixed on 2026-11-05: it now recognizes `(no X)` when X has a qualifier or finding site. The gate no longer reports the findings below. Will's PR #1310 test may still flag the `(no X)` forms, because it wants `(no X)` itself checked for; see `RUN-REPORT.md`, "What the test result means".

- `PROBABLE DIAGNOSIS EVIDENCE NOT CHECKED FOR`:
  `(no (finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Scratch marks" "finding") (snomed_concept "No" "qualifier value") (attribute (snomed_concept "Finding site" "attribute") (snomed_concept "Vulval structure" "body structure"))))`.
  This is a checker artefact: the gate's `(no X)` regex expects the `No` qualifier last, but here
  the `finding_site` attribute comes after it. The positive form is in the check_for, so in
  substance the finding is checked for.

## Questions for a clinician

- Is `Female pelvic inflammatory disease` an acceptable diagnosis for "LAP syndrome"? Or should
  the syndromic endpoint stay undiagnosed?
- Should the syndromic "Treat for …" endpoints be `probable` diagnoses, or only `possible`?
- Is "discharge itchy" better recorded as `Pruritus of vagina` (used) or `Pruritus of vulva`?
- In the not-sexually-active branch, should a patient with an itchy (not curd-like, no vulval
  signs) discharge go to candidiasis? The page lists itch only on the sexually-active branch; the
  encoding follows that.
- "Recent" for delivery/TOP/miscarriage has no time window on the page; how recent is meant
  (e.g. 6 weeks)? Is `Delivery finding` + `Recent` or `Postpartum state` the better record?
- Should a recorded sexual-activity finding carry a time window, so that "in the last 3 months"
  can be checked?

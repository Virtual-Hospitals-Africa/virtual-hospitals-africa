# Page 64 – Abnormal vaginal discharge: remaining questions

## Decisions made

- **Trigger** is `Vaginal discharge` (finding), from the box header ("patient with vaginal discharge").
  It is not a recorded common symptom or warning sign. Descendants (e.g. `Vaginal discharge problem`)
  match automatically.
- **Shock/SBP < 80** is encoded as this page's own `(or Shock, SBP < 80)`. The footnote definition
  of shock is not imported (decision for all pages).
- **Peritonitis (guarding, rigidity, rebound tenderness)** becomes an `or` of Peritonitis and the three signs.
- **Recent delivery/TOP/miscarriage**: `Postpartum state`; `Induced termination of pregnancy` + `Recent`;
  `Miscarriage` + `Recent`. **Overdue period** is `Menstrual period late`.
- **"Treat for X" nodes are `probable` diagnoses** (cervicitis = `Inflammation of cervix`, vaginal
  candidiasis = `Candidiasis of vagina`, `Bacterial vaginosis`, LAP syndrome = `Female pelvic inflammatory
  disease`), following the gold standard's "Treat for anaphylaxis". "Assess for UTI" is `possible`.
- **"No" branches use explicit `(no X)`**, so they fire only when the health worker recorded "No".
- **The 2nd cervicitis path and the 2nd LAP path** (not sexually active → BV → speculum exam) repeat
  the BV path's conditions (no vulval signs) so they follow the flowchart.
- **"Yes to either → pain on moving the cervix → Yes"** is encoded as just `Sexually active` and
  cervical excitation, since CMT alone already means "yes to either".
- No `measure` task: temperature, pulse and BP are routine vitals. No `manage` tasks.

## Could not model

- **"In the last 3 months"** (sexual activity): not representable. The onset of `Sexually active` is not
  the date of last activity. Rules fire on any recorded sexual activity, so more often than the page intends.
- **Curd-like discharge**: no SNOMED concept (see SNOMED gaps). Effects: the candidiasis rules fire **less
  often** (a curd-like discharge without vulval signs or itch is missed). The BV rule, and the cervicitis and
  LAP rules on the not-sexually-active path, fire **more often** (absence of curd-like is not required).
- Medicines, partner notification, return/referral advice, "Perform vaginal and speculum examinations"
  as an action, and the cross-references (62, 124, 126, 119, 69) are management or routing.

## SNOMED gaps

- Curd-like vaginal discharge: none found (`curd`, `cottage cheese`, children of `Finding of consistency of
  vaginal discharge` only give `Leukorrhea`). Not encoded.
- Cervical motion tenderness: no exact name; used `Cervical excitation present` (finding).
- Cervicitis: FSN is `Inflammation of cervix` (disorder).
- Overdue period: used `Menstrual period late` (finding).
- Scratched vulva: no precoordinated concept; used `Scratch marks` + finding_site `Vulval structure`.
- Cervical redness / swelling: `Erythema` / `Swelling` + finding_site `Cervix uteri structure`.
- Itchy discharge: used `Pruritus of vagina` (disorder).
- Lower abdominal pain (LAP) syndrome: no concept; used `Female pelvic inflammatory disease`.

## Checker issues left in place

- `PROBABLE DIAGNOSIS EVIDENCE NOT CHECKED FOR`:
  `(no (finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Scratch marks" "finding") (snomed_concept "No" "qualifier value") (attribute (snomed_concept "Finding site" "attribute") (snomed_concept "Vulval structure" "body structure"))))`.
  The positive form is in the `check_for`. The gate's `(no X)` normaliser (`NO_RE` in `tools/gate.ts`)
  expects the `No` qualifier to come last, so it misses a `(no …)` whose finding has a `finding_site`.
  This is a gate limitation, not a missing check. It affects the cervicitis, BV and LAP rules.

## Questions for a clinician

- Is mapping "LAP syndrome" to Female pelvic inflammatory disease acceptable, or should it be a
  syndrome-level finding?
- Should "Treat for X" be `probable` (as encoded) or `possible`, given this is syndromic management
  without confirmation?
- In the not-sexually-active branch, should a patient with an itchy (not curd-like, no vulval signs)
  discharge go to candidiasis? The page lists itch only on the sexually-active branch; the encoding follows that.
- "Recent" for delivery/TOP/miscarriage has no time window on the page; how recent is meant (e.g. 6 weeks)?

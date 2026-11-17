# Page 87 – Generalised non-itchy rash: remaining questions

## Decisions made

- **Red box is pointer-only** ("Check if the patient needs urgent attention ⮌ 82"). No priority
  evaluation on this page; the element is accounted for as `cross_reference_only`. The page's own
  diagnostic logic (bullets and the syphilis/HIV flowchart) is encoded.
- **Trigger** is `Generalized rash` (disorder). "Non-itchy" is not required: `(no Itching)` would only
  fire when itch was explicitly answered No. So the check_for also fires for itchy generalised rash.
  The rash is not a recorded common symptom or warning sign.
- **Tick bite fever likely → probable `Spotted fever group rickettsial disease`**, the common parent of
  `African tick bite fever` and `South African tick-bite fever` (both are "tick bite fever" in SA).
  "Tick present" = `Infestation caused by Ixodidae` or `… Argasidae` (no generic tick-infestation concept).
  "Body pain" = `Generalized aches and pains`.
- **The tick-bite-fever rule also requires the generalised rash** (page context, as in every other
  diagnosis rule here; reconciler merge from build A).
- **Consider mpox → possible `Monkeypox`.** Rash/lesion part: `Skin lesion` (the generalised rash is a
  descendant, so it matches) or lesions of genitalia, anus (`Lesion` morphology + finding_site
  `Anal structure`), rectum, mouth (`Oral lesion`), eye. Temperature is strictly `> 38.5` °C as written.
- **Consider drug rash → possible `Eruption caused by drug`**: rash and exposure to `Drug or medicament`
  with onset within 3 months, written `(<= (onset …) (time_ago 3 months))`. The named examples (antiseizure
  medication, ART, TB medication, co-trimoxazole, TPT) are "such as" examples, covered by descendants.
- **Syphilis reactive → probable `Secondary syphilis`** (rash and `Syphilis titer detected`). Applies
  whatever the HIV result is, as the page's branches are side by side.
- **HIV positive → "Give routine HIV care"** is management only; not encoded.
- **Syphilis and HIV negative** = `Syphilis titer not detected` and `Human immunodeficiency virus not detected`.
  - At risk of HIV in past 6 weeks = exposure to `Human immunodeficiency virus` (organism) with onset
    `<=` 6 weeks → possible `Acute human immunodeficiency virus infection` ("may be part of HIV
    seroconversion illness").
  - Not at risk → probable `Viral exanthem` ("Non-specific viral rash likely"): exposure answered No,
    or exposure onset `>=` 6 weeks ago.
- **Drug rash evidence** is exposure to `Drug or medicament` with an onset, not a
  "New medication commenced" finding: the exposure pattern is the gold standard's, and its onset is
  what the 3-month comparison needs (reconciler chose B over A).
- Time comparisons use only `<=` / `>=`, per the all-pages decision.
- No `measure` task: temperature is a routine vital.

## Could not model

- "Unexplained" rash (mpox): not expressible; the mpox rule fires more often than the page intends.
- "Patient may have temperature ≥ 38°C, headache, lymphadenopathy, muscle pain/body aches" under the
  viral rash box is descriptive, not a criterion; not encoded.
- "Rash often on palms and soles. May have wart-like lesions on genitals and patchy hair loss" is
  descriptive of secondary syphilis; not used as criteria.
- "If rash persists ≥ 2 weeks or diagnosis uncertain, discuss/refer", "Repeat HIV test after 6 weeks",
  safe sex advice, paracetamol, treat syphilis, routine HIV care: management/referral steps.
- "Tick present" uses hard- and soft-tick infestation concepts; a tick seen but not recorded as an
  infestation will not match.
- Exactly 6 weeks: the `<=` and `>=` onset comparisons overlap at the boundary instant; negligible.
- "Test for syphilis and HIV" is an instruction to test; only the results are used as evidence.

## SNOMED gaps

- No generic "tick present / tick infestation" concept; used Ixodidae and Argasidae infestations.
- No precoordinated "lesion of anus" disorder; used `Lesion` (morphologic abnormality) with finding_site
  `Anal structure` (body structure; checked with `snomed exists`).
- "Syphilis reactive" / "negative": no reactive-test finding; used `Syphilis titer detected` / `not detected`.
- "Body pain": used `Generalized aches and pains`. "Non-specific viral rash": used `Viral exanthem`.
- "Tick bite fever" has no exact concept; used the spotted-fever-group parent.
- "At risk of HIV" has no concept matching the footnote; used the exposure-to-HIV-organism finding pattern.

## Checker issues left in place

- None.

## Questions for a clinician

- Is `Spotted fever group rickettsial disease` acceptable for "tick bite fever", or should it be the
  specific `African tick bite fever` (build A's choice) or `Boutonneuse fever` (R. conorii, "South
  African tick-bite fever")? The parent covers both but also non-African rickettsioses.
- Should the check_for require the rash to be non-itchy (i.e. only fire when itch is answered No)?
- Does the intake record syphilis/HIV results as `Syphilis titer detected/not detected` and
  `Human immunodeficiency virus not detected`, or as test procedures with values? If the latter, the
  syphilis and viral-rash rules need a different evidence form.
- Is "Syphilis titer detected" an acceptable recording of a reactive syphilis test (RPR/rapid test)?
- Should "HIV positive" produce a diagnosis (e.g. probable HIV infection) here, or is routine HIV
  care on page 126 enough?
- Is the "No" branch (no HIV risk) correctly read as "no exposure, or exposure more than 6 weeks ago"?
- Should the mpox check ask about lesions of genitals/anus/rectum/mouth/eyes when the patient already
  has a generalised rash (which already satisfies the "rash or lesion" part)? They are asked because the
  page lists them, but they cannot change the outcome on this page.
- Will an HIV-exposure finding record an onset date for the 6-week comparison? Without it, the
  seroconversion rule cannot fire and the viral-rash rule fires only on an explicit No.

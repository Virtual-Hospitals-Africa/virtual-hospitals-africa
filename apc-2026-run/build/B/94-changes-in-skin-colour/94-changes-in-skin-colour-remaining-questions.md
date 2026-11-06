# Page 94 – Changes in skin colour: remaining questions

## Decisions made

- **Presenting complaint** "Changes in skin colour" is triggered by `Discoloration of skin` (finding). It is
  not a recorded common symptom or warning sign.
- **Red-box trigger** is `(or (clinical_finding Jaundice) (active_condition Jaundice))`: a directly recorded
  jaundice, or the probable jaundice diagnosis made from "Yellow skin: jaundice likely".
- **Shock/BP < 80** is encoded as Shock (disorder) or systolic BP < 80, on this page only. The page writes
  "BP < 80"; read as systolic, matching footnote 1's "SBP < 80". Footnote 1's other criteria are not imported.
- **Drowsy or confused**: `Drowsy` and `Clouded consciousness` (the app's AVPU "Confused" finding).
- **Easy bruising or bleeding**: `Easy bruising` or `Finding of tendency to bleed`.
- **Using any medication**: the gold-standard exposure form for `Drug or medicament`; illegal drugs as `Illicit drug use`.
- **Diagnoses follow the flowchart routing** (colour type plus site or pattern). The descriptive boxes
  (red-brown discolouration, fine scale, present from birth, involves hair and eyes) are not extra criteria.
- **Light patches → tinea versicolor**: the page routes light patches straight to the tinea versicolor box,
  so any hypopigmentation of skin gives a probable diagnosis.
- No `measure` tasks: the page's investigations are lab tests with no observable in the language.

## Could not model

- **Hb < 12 (woman) or < 13 (man)** in the red box: no Hb observable/unit. The urgent rule fires **less
  often** than the page intends (a jaundiced patient whose only danger sign is anaemia is missed).
- **"≥ 4 drinks/session"**: no unit for drinks; left to the meaning of `Drinking binge`.
- **Blood tests, review within 2 days** (ALT ≥ 200, INR ≥ 1.5, ALP, Hb, platelets) and the **Hepatitis A IgM /
  HBsAg** branches ("Patient has acute hepatitis A infection"): lab results, not representable.
- Management (sun protection, sunscreen, selenium sulphide, compression, referrals, notification): out of scope.

## SNOMED gaps

- "Melasma": no FSN; used `Chloasma` (disorder).
- "Tinea versicolor": no FSN; used `Pityriasis versicolor` (disorder).
- "Venous stasis": exists only as a finding; used `Venous stasis` (finding).
- "Confusion" (finding): none; used `Clouded consciousness` (finding).
- "Lower leg structure": none; used `Structure of lower limb from knee to ankle`.
- "Dark patches"/"Light patches"/"Absence of colour": used `Hyperpigmentation of skin`, `Hypopigmentation of skin`,
  `Achromia of skin` (all disorders). `Achromia of skin` is not a descendant of `Hypopigmentation of skin`.

## Checker issues left in place

- None.

## Questions for a clinician

- Should probable tinea versicolor from light patches require fine scale (or a trunk/neck/upper-arm site), so
  that post-inflammatory hypopigmentation is not labelled tinea versicolor?
- Should albinism require "present from birth" (`Congenital`) in addition to generalised absence of colour?
- Is `Clouded consciousness` the right recorded form for "confused" here, or should `Acute confusion` be checked too?
- Does "Using any medication" mean any current medication at all (as encoded), or only potentially hepatotoxic ones?

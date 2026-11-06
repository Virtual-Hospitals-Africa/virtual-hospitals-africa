# Page 52 – Mouth symptoms: remaining questions

## Decisions made

- **Presenting complaint.** `Mouth symptoms` (finding) triggers both `check_for` tasks and anchors
  the Urgent rule. It is not a recorded common symptom or warning sign yet, so these rules fire only
  once a health worker records it.
- **Red box, bullet 2 (sudden face/tongue swelling + any of …, "check for anaphylaxis 28").** It
  sits inside the urgent box, so it is part of `Urgent: mouth symptoms with danger signs`. Its
  action, "check for anaphylaxis", is also encoded as `Mouth symptoms: possible anaphylaxis`, which
  lets the anaphylaxis page's `check_for` task fire. Anaphylaxis is not diagnosed at `probable` here.
- **BP < 90/60** is read as systolic < 90 or diastolic < 60 (Will's convention).
- **Wheeze** appears in the 2026 list and is encoded as `Wheezing`.
- **Possible allergen (footnote 1):** medication, food or insect bite/sting, encoded as exposure to
  `Drug or medicament`, exposure to `Food` (the general concept, as the page is general), `Insect
  bite - wound` and `Insect sting`.
- **"X likely" headings → probable diagnoses:** oral candidiasis (white patches on oral mucosa);
  oesophageal candidiasis (white patches AND difficulty or pain on swallowing; the box sits under the
  white-patches column); herpes simplex (blister on lip or in mouth); aphthous ulcer (ulcer of
  mouth); angular cheilitis (fissure at angle of mouth); impetigo (cracked corners AND perioral
  crusts AND perioral blisters); contact dermatitis (cracked corners AND severe itching at angle of
  mouth).
- **Impetigo and contact dermatitis** bullets are under the "Red, cracked corners" column, so that
  finding is required as well as the bullet's own finding.
- Herpes simplex uses the general `Herpes simplex` concept, since the page names no site-specific form.

## Could not model

- **Anaemia likely (Hb < 12 g/dL woman / < 13 g/dL man):** Hb has no observable or unit in the
  language. Not encoded; no rule fires (fires less often than the page intends).
- **"Painful"** (blisters, ulcers): no qualifier concept. Rules fire on painless blisters and
  ulcers too (more often than intended).
- **"with central white patch"** (aphthous ulcer): not expressible as an attribute of the ulcer. The
  aphthous rule fires on any mouth ulcer (more often than intended).
- **"Red"** corners of mouth: only the fissure is encoded (more often).
- **"within the past few hours"** for allergen exposure: not modelled; exposures recorded in the
  encounter are taken as recent (more often).
- **Abacavir → check for AHR 131, lip swelling → 49, gum/tooth → 54, thirst etc. → diabetes 19,
  runny nose → 51, anaemia → 44, impetigo → 93:** pointers to other pages, not encoded as rules here.
- **Dry mouth column:** management and pointers only; `Xerostomia` is not checked for because no
  rule on this page consumes it.

## SNOMED gaps

- No "Painful" qualifier value (`Painful` qualifier value: NO). Not substituted.
- No precoordinated "white-centred ulcer"; `Ulcer of mouth` (disorder) used.
- `Oesophageal candidiasis` / `Esophageal candidiasis`: NO; `Candidiasis of esophagus` (disorder) used.
- Body structures used, all confirmed by `snomed exists`: `Face structure`, `Tongue structure`,
  `Lip structure`, `Oral cavity structure`, `Structure of angle of mouth`, `Skin structure of
  perioral region of face`.

## Checker issues left in place

- None.

## Questions for a clinician

- Should every mouth ulcer suggest aphthous ulcer at `probable`, given the page's "central white
  patch" cannot be recorded? Would `possible` be safer?
- Should impetigo / contact dermatitis require the cracked corners, or are perioral crusts+blisters
  (or severe itch) enough on their own?
- Is `Mouth symptoms` the right complaint concept for intake, or should a specific finding (e.g. sore
  mouth) be recorded?

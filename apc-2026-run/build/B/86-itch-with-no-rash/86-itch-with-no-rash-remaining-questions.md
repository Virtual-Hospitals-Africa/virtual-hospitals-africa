# Page 86 – Itch with no rash: remaining questions

## Decisions made

- **Red box is a pointer only** ("Check if the patient needs urgent attention ↻ 82"). It is
  accounted for as `cross_reference_only`; this page has no priority evaluation. The page's own
  diagnostic flowchart is encoded.
- **Trigger** is `(clinical_finding Itching)`, cited from the page title, since the red box has no
  header naming the complaint. Itching is not a recorded common symptom or warning sign, so the task
  only fires when another page (or intake) records Itching.
- **Exclusions are part of every "likely" rule.** The page says "Confirm there is no rash, scabies,
  lice or insect bites" before the first question, so each probable rule requires `(no Eruption)`,
  `(no Infestation caused by Sarcoptes scabiei var hominis)`, `(no Louse infestation)` and
  `(no Insect bite - wound)`. Consequence: a rule fires only after the nurse has explicitly recorded
  these as absent.
- **Yes/No branches are chained**: the medication rule requires `(no Severe dry skin)`; the jaundice
  rule requires `(no Severe dry skin)` and `(no New medication commenced)`, following the arrows.
- **"Very dry"** = `Severe dry skin` (disorder), a child of `Xeroderma`.
- **Dry skin (xeroderma/ichthyosis) likely** → probable `Xeroderma` only.
- **Medication side-effect likely** → probable `Adverse reaction caused by drug`.
- **Jaundice likely** → probable `Jaundice` (finding); yellow eyes = `Scleral icterus`.
- **Routing** to 84, 85, 61 and 94, the "itch persists > 2 weeks" tests and same-day referral,
  antihistamines, skin-care advice, palliative care and "discuss/refer" are management or routing
  and are not encoded.

## Could not model

- **"In the weeks before the itch started"**: the language compares an onset with a time ago, not
  two onsets with each other. The medication rule accepts any recorded `New medication commenced`,
  so it fires **more often** than the page intends (e.g. medication started after the itch).
- **"If itch persists > 2 weeks"** could be written as `(>= (onset Itching) (time_ago 2 weeks))`,
  but everything it leads to (tests for anaemia, HIV, diabetes; same-day referral) is management, so
  no rule consumes it.

## SNOMED gaps

- `Scabies` (disorder) does not exist; used `Infestation caused by Sarcoptes scabiei var hominis`.
- No plain "Lice" concept; used `Louse infestation` (disorder).
- `Dry skin` (finding) does not exist; `Xeroderma` (disorder) carries it as a synonym, and
  `Severe dry skin` (disorder) for "very dry".
- No "Yellow eyes" concept; used `Scleral icterus` (finding).

## Checker issues left in place

- None.

## Questions for a clinician

- Should "Dry skin (xeroderma/ichthyosis)" also produce a probable `Ichthyosis` diagnosis, or is
  `Xeroderma` enough?
- Is `Adverse reaction caused by drug` the right diagnosis, or the narrower `Pruritus caused by
  drug`?
- Should the "likely" rules require the exclusions (no rash, scabies, lice, insect bites) to be
  recorded as absent, or fire when they are simply not recorded?
- Should "yellow skin/eyes" also accept the recorded `Jaundice` finding directly?

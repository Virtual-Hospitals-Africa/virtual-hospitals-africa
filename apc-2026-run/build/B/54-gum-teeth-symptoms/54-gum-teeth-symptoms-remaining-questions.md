# Page 54 – Gum/teeth symptoms: remaining questions

## Decisions made

- **Presenting complaint.** "Gum/teeth symptoms" is not a recorded common symptom or warning sign.
  The `check_for` task and the urgent rule are triggered by `(or Tooth finding, Gingivae finding)`;
  descendants match, so toothache, tooth staining/loss, bleeding, swollen, red or enlarged gums all
  fire it.
- **Red box → `Urgent`** (the page says "Refer urgently", not an emergency), structured as
  complaint AND any of: (temperature ≥ 38 °C AND swelling of face / jaw region / gums), unable to
  eat, unable to drink, spontaneous toothache, night-time toothache.
- **"Swelling next to tooth"** is encoded as `Swollen gums` in both the red box and the dental
  abscess rule.
- **"Tooth pain felt without touching tooth/gum or that wakes patient at night"** is `Toothache`
  with the qualifier `Spontaneous` or `Night time`. Neither qualifier says "wakes the patient".
- **Dental caries likely:** staining of tooth OR cavity of tooth OR tooth loss. The "may have tooth
  pain with hot or cold food/drink" is optional ("may") and is not used as evidence.
- **Gum problem likely:** gingival erythema OR bleeding gums OR gingival enlargement → `Gingival
  disease` (probable).
- **Dental abscess likely:** toothache AND (pus in mouth OR swollen gums). Reading the box as
  "tooth pain, with pus and/or swelling".
- No `manage` tasks; treatment, "refer to dentist if …", "refer same day if …" and mouth-care
  advice are management.

## Could not model

- "at gumline" (location of staining) is not expressed.
- "Previous" tooth pain: a recorded toothache stands for previous or current pain; a `history`
  form was not used, because a probable rule's evidence must be checked for in the same file.
- "Wakes patient at night" is approximated by the `Night time` qualifier (fires a bit more often
  than the page intends: night pain that does not wake the patient also matches).

## SNOMED gaps

- No concept for holes/pits in teeth: used `Cavity` (morphologic abnormality) with finding_site
  `Tooth structure` (low confidence).
- No concept for pus in the mouth: used `Pus` (morphologic abnormality) with finding_site
  `Oral cavity structure`.
- No "gum/teeth symptom" concept (searched "gum symptom", "gingival finding"): used `Tooth finding`
  and `Gingivae finding`.
- No "swelling of jaw" (only `Swelling of lower jaw region`): used `Swelling` with finding_site
  `Jaw region structure`.
- No "toothache that wakes at night" or "spontaneous toothache": qualifiers used instead.
- All finding_site body structures (`Face structure`, `Jaw region structure`, `Tooth structure`,
  `Oral cavity structure`) confirmed with `snomed exists`.

## Checker issues left in place

- None.

## Questions for a clinician

- Does the dental abscess box need all three (tooth pain, pus, swelling) or tooth pain with either?
- Is "missing teeth" alone enough to call dental caries likely in an adult (missing teeth may be
  from periodontal disease or extraction)? The page lists it, so it is encoded.
- Should swelling next to a tooth (red box) also be accepted as general facial/jaw swelling only,
  or is gum swelling plus fever enough for urgent referral? Encoded as the page reads: any of the three.

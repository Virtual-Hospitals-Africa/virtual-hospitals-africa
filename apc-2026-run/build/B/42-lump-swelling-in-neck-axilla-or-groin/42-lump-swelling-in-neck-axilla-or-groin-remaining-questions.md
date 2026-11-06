# Page 42 – Lump/swelling in neck, axilla or groin: remaining questions

## Decisions made

- **Anchor.** The main task fires on `Mass of body region`, the recorded common symptom "Lump"
  (its anchor comment names this page). `Mass of neck`, `Mass of axilla` and `Groin mass` are
  descendants of it and are checked for to record the site. The red-box task fires on `Groin mass`
  because the red box applies only to "lump/swelling in groin".
- **Incarcerated/strangulated inguinal hernia.** SNOMED has `Irreducible inguinal hernia`
  (synonym "incarcerated inguinal hernia") and `Strangulated inguinal hernia`, which is *not* a
  descendant of it. Two probable rules with identical evidence, one per concept; the Urgent rule
  references both.
- **"Gets bigger when standing/coughing/passing stool"** is encoded as
  `Cough impulse of mass present` in both the urgent hernia rules and the non-urgent inguinal
  hernia rule.
- **"No stools or flatus/wind for past 24 hours"** is `Constipation` **and** `Unable to break wind`,
  each with `(>= (onset …) (time_ago 24 hours))` (onset at least 24 hours ago = present for the
  past 24 hours).
- **"Lump cannot be reduced"** and **"Pulsating lump"** are `Groin mass` with the `Irreducible` /
  `Pulsatile` qualifier; the pulsating lump is read as a groin lump because the red box's header
  restricts it to lump/swelling in groin.
- **Aneurysm** uses the general `Aneurysm` (disorder); the page does not name a type (e.g. femoral).
- **Priority.** `Urgent` (the page says "Refer urgently", no explicit emergency escalation),
  structured as `(and Groin mass (or …diagnoses…))`.
- **Thyroid mass** is diagnosed as `Mass of thyroid gland` (finding), the exact concept; evidence
  `Mass of neck` and `Thyroid gland moves with swallowing`.
- **Hidradenitis suppurativa**: `Recurrent abscess` **and** an abscess at one of axilla/groin/perineum
  paired with pain at the same site ("painful"; no "painful" qualifier exists).
- **Lymphadenopathy ("If none of above")** requires a lump at one of the three sites **and** an
  explicit `(no …)` for each "above" discriminator: lump on the skin, thyroid moving on swallowing,
  cough impulse, recurrent abscess. A first version used the site abscesses with a `Recurrent`
  qualifier inside `(no …)`; the gate could not match a qualified finding inside `(no …)` and
  flagged an always-true branch, so the precoordinated `Recurrent abscess` is used instead (same
  meaning, not a restructure of the logic).
- **Consider mpox** is a `possible` Monkeypox rule. It is gated on probable lymphadenopathy
  (the bullet sits in that work-up branch), exposure to monkeypox virus, rash or lesion at a listed
  site, and at least one of the listed symptoms or temperature > 38.5 °C. Its findings are in a
  dedicated check task fired by lymphadenopathy.
- No `measure` task: the only measurement (temperature) is a routine vital.
- No `manage` tasks (TSH, refer, HIV/TB/syphilis tests, FBC, node aspiration, reassure, medication review).

## Could not model

- **Enlargement on standing or passing stool**: only the cough impulse is representable. The hernia
  rules fire **less often** than the page intends (a lump that enlarges only on standing/straining
  is missed).
- **"No stools"** has no concept; `Constipation` is broader, but it is paired with
  `Unable to break wind`. Fires about as intended; slightly more often if constipation without total
  absence of stool is recorded.
- **Lymphadenopathy "none of above"** needs four explicit negative findings; if the nurse leaves any
  unrecorded the rule fires **less often** than intended. It also does not exclude the red-box
  causes (pulsatile/irreducible lump); the page puts those under urgent attention first.
- **Mpox**: "in the 21 days before symptom onset" (relative to symptom onset, not to now) and
  "unexplained" rash are not modelled, so the rule fires **more often**. Contact with a
  probable/confirmed case is approximated by exposure to monkeypox virus.
- **Localised vs generalised lymphadenopathy (≥ 2 areas)**, "Is medication or infective cause
  likely?", "Unwell", "lymph node getting bigger quickly", "persists > 4 weeks": routing to
  management (refer same week / reassure), not diagnoses; not modelled.
- **TB symptoms (cough, weight loss, night sweats, fever)** lead only to a referral for node
  aspiration (management); no "consider TB" on this page.
- **Drug hypersensitivity** ("Review medication: … can cause … Discuss with doctor") is a
  medication review, not a "consider"; not modelled.

## SNOMED gaps

- **Bubo** (hot and tender groin node → "treat for bubo 65"): only `Bubo` (morphologic abnormality)
  and `Inguinal bubo` (qualifier value) exist, no disorder; "hot" lymph node has no concept. Left as
  routing to page 65.
- **Lesion of anus** (mpox lesion sites): no concept; anal lesions are not in the mpox rule.
- **"Painful"** qualifier: none; site pain findings used instead.
- **"No stools"/absolute constipation**: none; see above.

## Checker issues left in place

- None.

## Questions for a clinician

- Should an incarcerated/strangulated hernia also be suspected when the lump does *not* show a cough
  impulse but is irreducible and painful (the page's wording requires the enlarging lump)?
- Is the pulsating-lump criterion meant only for groin lumps (as the red-box header says) or for
  neck lumps too (e.g. carotid aneurysm)?
- Is it acceptable that mpox is only considered once lymphadenopathy is diagnosed, or should page
  40's own rule be relied on?
- Should "treat for bubo" be diagnosed here (e.g. as a sexually transmitted infection syndrome) once
  page 65's concept is settled?

# Page 48 – Eye/vision symptoms: remaining questions

## Decisions made

- **Trigger:** `Eye / vision finding` (finding). Any recorded eye finding (a descendant) fires both tasks. "Eye or vision symptoms" isn't a recorded common symptom.
- **Stroke/TIA:** Each listed feature has the `Sudden onset` qualifier, taken from "New sudden". The page doesn't say whether "new sudden" also covers "difficulty speaking or visual disturbance"; I read it as covering both. There is one `probable` rule for `Cerebrovascular accident`, because a rule has one diagnosis and TIA has no separate rule.
- **BP ≥ 180/110 and not pregnant:** systolic ≥ 180 or diastolic ≥ 110 (Will's convention for BP pairs), and `(no Pregnancy)`. `(not …)` makes VHA's evidence code throw "Not supported not", so the rule needs "not pregnant" to be recorded.
- **Pre-eclampsia ("treat as"):** written into the priority rule as (Pregnancy, or Postpartum state with onset `<=` 1 week ago) and (SBP ≥ 140 or DBP ≥ 90). There is no diagnosis rule, because the page says "treat as", not "likely".
- **Acute glaucoma:** The "Manage and refer urgently" line says "acute glaucoma likely", so it gets a `probable` rule. It uses `Acute angle closure`, because `Acute angle-closure glaucoma` isn't an FSN. The rule requires every listed feature (an `and`), with headache/nausea/vomiting as an `or`. I also added it to the urgent priority, since it sits in the red box under "refer urgently".
- **One painful red/watery eye:** `Pain in eye` with the `Unilateral` qualifier, and red eye or watery eye. The language can't say that it's the same eye.
- **Chemical burn:** I used the general `Chemical burn`, as the page words it. It is also a warning sign.
- **Hayfever:** `Allergic rhinitis caused by pollen`, which is the FSN behind the synonym "hay fever". Eczema, hayfever and asthma use the `Known present` qualifier in both the check and the rule.
- **Both eyes involved:** the `Right and left` qualifier on discharge or watery eye, because `Bilateral` isn't a qualifier FSN.
- **Viral conjunctivitis:** no itch, and clear watery discharge, and at least one of fever, sore throat or enlarged lymph nodes. The page puts all four features in one node and doesn't say how many are needed.
- **"No" to prominent itch:** written as `(no Itching of eye)`, so it needs a recorded absence.

## Could not model

- "Asymmetric" weakness or numbness: not modelled, so the rule fires more often than the page intends.
- "Whole" eyelid (orbital cellulitis): only eyelid swelling, redness and pain are modelled, so the rule fires more often.
- "Prominent" itch: any itch counts, so the rule fires more often.
- "If one eye involved and no eczema, hayfever or asthma, localised cause likely": there is no SNOMED concept for a localised cause, so this isn't encoded.
- Poor vision, "Check vision using Snellen E chart and pinhole test": visual acuity has no unit or observable in the language.
- "Itchy/swollen eyelids", and "Discuss/refer if eyelashes touching cornea / eyelids bent in/out": management or referral only.
- Superficial foreign body box: management only.

## SNOMED gaps

- `Difficulty speaking` → `Difficulty talking`.
- `Pain of eyelid` and `Erythema of eyelid` → `Pain` / `Erythema` with `finding_site` `Eyelid structure` (body structure, verified).
- `Acute angle-closure glaucoma` → `Acute angle closure`.
- `Yellow sclera` → `Scleral icterus`.
- `Proptosis` → `Exophthalmos`.
- `Bilateral` (qualifier) → `Right and left`.
- `Hay fever` → `Allergic rhinitis caused by pollen`.
- `Purulent/watery discharge from eye` → `Purulent conjunctival discharge` / `Serous conjunctival discharge`.
- "STI symptoms" → `Sexually transmitted infectious disease` + `Recent`.
- "Localised cause" (of conjunctivitis): none found.

## Checker issues left in place

- None.

## Questions for a clinician

- Does "New sudden" apply to "difficulty speaking or visual disturbance" too? As encoded, sudden visual disturbance alone gives probable stroke/TIA.
- Acute glaucoma: should it need all the listed features, or a painful red eye plus some of them?
- Viral conjunctivitis: is clear watery discharge alone enough?
- "Not pregnant" now needs pregnancy status to be recorded. Is that acceptable, or should the BP ≥ 180/110 branch fire whenever pregnancy isn't recorded?

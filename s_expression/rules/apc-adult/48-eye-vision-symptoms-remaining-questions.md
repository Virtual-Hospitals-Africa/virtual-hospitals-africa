# Page 48 – Eye/vision symptoms: remaining questions

Final build, reconciled from two independent builds (base A). Every resolved difference is in
`reconcile.json`.

## Decisions made

- **Trigger:** `Eye / vision finding` (finding) for both tasks and the priority rule. Any recorded eye finding (a descendant) fires them. "Eye or vision symptoms" isn't a recorded common symptom or warning sign.
- **Two `check_for` tasks:** red-box items go in `Check for urgent eye/vision conditions`; the discriminators from the "not needing urgent attention" approach go in `Check for causes of non-urgent eye/vision symptoms`.
- **Stroke/TIA:** "New sudden asymmetric weakness or numbness of face, arm or leg" uses face, upper-limb and lower-limb concepts, each with the `New`, `Sudden onset` and `Asymmetry` qualifiers. "Difficulty speaking or visual disturbance" carries `New` + `Sudden onset` (asymmetry doesn't apply). There is one `probable` rule for `Cerebrovascular accident`, because a rule has one diagnosis and TIA has no separate rule. The separate red-box item "Sudden loss or change in vision" uses `Visual disturbance` + `Sudden onset` (without `New`).
- **BP ≥ 180/110 and not pregnant:** systolic ≥ 180 or diastolic ≥ 110 (Will's convention for BP pairs), and `(no Pregnancy)`. `(not …)` makes VHA's evidence code throw "Not supported not", so the rule needs "not pregnant" to be recorded.
- **Pre-eclampsia ("treat as"):** written into the priority rule as (Pregnancy, or Postpartum state with onset `(<= … (time_ago 1 weeks))`) and (SBP ≥ 140 or DBP ≥ 90). There is no diagnosis rule, because the page says "treat as", not "likely".
- **Acute glaucoma:** the "Manage and refer urgently" line says "acute glaucoma likely", so it gets a `probable` rule using `Acute angle closure` (`Acute angle-closure glaucoma` isn't an FSN). The rule requires every listed feature (an `and`), with headache/nausea/vomiting as an `or`. It is also in the urgent priority, since it sits in the red box under "refer urgently".
- **One painful red/watery eye:** `Pain in eye`, `Red eye` and `Watery eye` each carry the `Unilateral` qualifier: unilateral pain AND (unilateral red eye OR unilateral watery eye).
- **Shingles involving eye or nose:** `Herpes zoster ophthalmicus`, or `Herpes zoster` with `finding_site Nasal structure` (broader than the precoordinated `Herpes zoster involving tip of nose`, matching "nose").
- **Chemical burn:** the general `Chemical burn`, as the page words it. It is also a warning sign.
- **Eczema, hayfever, asthma:** plain `clinical_finding` forms. Hayfever is `Allergic rhinitis caused by pollen`, the FSN behind the synonym "hay fever".
- **Both eyes involved:** the `Right and left` qualifier on discharge or watery eye, because `Bilateral` isn't a qualifier FSN.
- **Viral conjunctivitis:** no itch, and clear watery discharge, and at least one of fever, sore throat or enlarged lymph nodes. The page puts all four features in one node and doesn't say how many are needed.
- **Stye:** `Lump in eyelid` (finding) and `Pain` with `finding_site Eyelid structure`.
- **"No" to prominent itch:** written as `(no Itching of eye)`, so it needs a recorded absence.

## Could not model

- **"stroke or TIA likely":** one rule gives one diagnosis, so only `Cerebrovascular accident` is diagnosed; TIA is not.
- **"Whole" eyelid (orbital cellulitis):** only eyelid swelling, redness and pain are modelled, so the rule fires more often.
- **"Prominent" itch:** any itch counts, so the rule fires more often.
- **"STI symptoms":** approximated by `Sexually transmitted infectious disease` + `Recent`.
- **"One painful red/watery eye":** the language can't say that the painful eye and the red or watery eye are the same eye.
- **"If one eye involved and no eczema, hayfever or asthma, localised cause likely":** there is no SNOMED concept for a localised cause, so this isn't encoded.
- **Poor vision**, "Check vision using Snellen E chart and pinhole test": visual acuity has no unit or observable in the language, so there is no `measure` task. The referral steps and "check for diabetes / hypertension" are pointers.
- **Management or referral only:** superficial foreign body box, itchy/swollen eyelids, "Discuss/refer if eyelashes touching cornea / eyelids bent in/out".

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
- No concept for a chemical burn of the eye (`Chemical burn of eyelid` is too narrow); general `Chemical burn` used.
- No concept for shingles of the nose as a whole; `Herpes zoster` + `finding_site Nasal structure` (verified) used.
- "Localised cause" (of conjunctivitis): none found.

## Checker issues left in place

- None.

## Questions for a clinician

- Acute glaucoma: should it need all the listed features (current encoding), or a painful red eye plus any one of the others? (The two builders split on this.)
- Viral conjunctivitis: should fever, sore throat or enlarged lymph nodes be required alongside clear discharge (current encoding), or is clear watery discharge alone enough? (The two builders split on this.)
- Does "New sudden" apply to "difficulty speaking or visual disturbance" too? As encoded, a new sudden visual disturbance alone gives probable stroke/TIA, although "sudden change in vision" is also its own urgent criterion.
- "Not pregnant" now needs pregnancy status to be recorded. Is that acceptable, or should the BP ≥ 180/110 branch fire whenever pregnancy isn't recorded?

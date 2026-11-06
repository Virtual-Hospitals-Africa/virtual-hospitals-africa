# Page 48 – Eye/vision symptoms: remaining questions

## Decisions made

- **Trigger.** Both tasks and the priority rule are anchored to `Eye / vision finding` (finding), the
  SNOMED parent of eye and vision findings, so recorded descendants match. It is not a recorded
  common symptom or warning sign.
- **Two `check_for` tasks.** Red-box items go in `Check for urgent eye/vision conditions`. The
  discriminators from the "not needing urgent attention" approach (discharge, watery eye, itch, both
  eyes, eczema/hayfever/asthma, clear or purulent discharge, eyelid lump) go in `Check for non-urgent
  eye discharge, itch and eyelid features`.
- **"X likely" in the red box** became `probable` rules: stroke (Cerebrovascular accident), gonococcal
  conjunctivitis, orbital cellulitis, jaundice and acute glaucoma (`Acute angle closure`). The priority
  rule references them as `active_condition`.
- **Acute glaucoma** sits under "Manage and refer urgently", so it is included in the Urgent priority.
  The logic is: painful eye AND redness AND any of blurred vision, haloes, dilated unreactive pupil,
  headache, nausea or vomiting.
- **Severe pre-eclampsia** ("treat as") is encoded only in the priority rule, as (Pregnancy, or
  Postpartum state with onset within 1 week) AND (systolic ≥ 140 or diastolic ≥ 90). I did not write
  a diagnosis rule. "Within 1 week" is written `(<= (onset …) (time_ago 1 weeks))`, following the shared
  convention for time comparisons.
- **BP pairs** (≥ 180/110, ≥ 140/90) are read as systolic OR diastolic, following Will's convention.
- **Allergic conjunctivitis:** discharging or watery eye AND itching of eye AND (both eyes, or eczema,
  hayfever or asthma). "Both eyes" uses the `Right and left` qualifier, because there is no
  `Bilateral` qualifier value. Hayfever is `Allergic rhinitis caused by pollen`.
- **Viral / bacterial conjunctivitis:** no itching of eye AND serous (clear watery) or purulent
  conjunctival discharge.
- **Stye:** a mass on the eyelid AND pain of the eyelid, both written with `finding_site Eyelid structure`.
- **Shingles involving the nose** is `Herpes zoster` with `finding_site Nasal structure`. This is
  broader than the precoordinated `Herpes zoster involving tip of nose`.
- **Chemical burn** is the warning-sign concept `Chemical burn` with `finding_site Eye region structure`.

## Could not model

- **"stroke or TIA likely":** one rule gives one diagnosis, so only `Cerebrovascular accident` is
  diagnosed. TIA is not.
- **"Localised cause likely"** (one eye, itch, no eczema/hayfever/asthma) has no diagnosis concept, so
  it is not encoded.
- **Words with no qualifier:** "Whole" (eyelid), "prominent" (itch) and "symptoms" (STI symptoms are
  approximated by `Sexually transmitted infectious disease` + `Recent`). Leaving them out makes the
  rules fire more often than the page intends.
- **"One painful red/watery eye":** the language cannot say that the painful eye and the red or watery
  eye are the same eye. Each finding carries the `Unilateral` qualifier separately.
- **Viral conjunctivitis features:** fever, sore throat and enlarged lymph nodes appear in the
  clear-discharge box. They are not required by the rule, which therefore fires more often than a
  strict reading would allow.
- **Poor vision:** Snellen E chart and pinhole test. Visual acuity has no unit in the language, so
  there is no `measure` task. The referral steps and "check for diabetes / hypertension" are pointers.
- **Not modelled because they are management or referral:** superficial foreign body, itchy or
  swollen eyelids, eyelashes touching the cornea, eyelids bent in or out.

## SNOMED gaps

- No `Acute angle-closure glaucoma` FSN exists. I used `Acute angle closure` (disorder).
- No `Bilateral` qualifier exists. I used `Right and left`.
- No concept exists for a lump on the eyelid, eyelid pain or eyelid redness. I used `Mass`
  (morphologic abnormality), `Pain` and `Erythema` with `finding_site Eyelid structure`.
- No concept exists for a chemical burn of the eye. `Chemical burn of eyelid` is too narrow, so I used
  `Chemical burn` with `finding_site Eye region structure`.
- No concept exists for "STI symptoms". I used `Sexually transmitted infectious disease` + `Recent`.

## Checker issues left in place

- None.

## Questions for a clinician

- Acute glaucoma: should every listed feature be required, or is painful red eye plus any one of the
  others enough (the current encoding)?
- Viral conjunctivitis: should fever, sore throat or enlarged lymph nodes be required alongside clear
  discharge?
- New sudden visual disturbance alone diagnoses probable stroke here, as the page lists it. Is that
  intended, given that "sudden change in vision" is also its own urgent criterion?

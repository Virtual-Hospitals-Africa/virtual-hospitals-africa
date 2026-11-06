# Page 81 – Foot symptoms: remaining questions

## Decisions made

- **Presenting complaint.** "Foot symptoms" is not a recorded common symptom or warning sign. The
  trigger is `(clinical_finding "Finding of foot region")`, so any recorded foot finding (foot pain,
  heel pain, foot ulcer, tinea pedis …) fires both check tasks by descendant matching. The same
  form is the complaint in the priority rule (`(and complaint (or …red-box diagnoses…))`).
- **Red box → three probable diagnoses plus one Urgent rule**, as Will's briefing asks when the red
  box names a likely diagnosis: fracture (`Fracture of bone`, since the page says "fracture", not
  "foot fracture"), `Acute lower limb ischemia`, `Critical lower limb ischemia`. The Urgent rule
  references them as `active_condition`. No escalation beyond Urgent; the page says only "Refer
  urgently".
- **Fracture rule** keeps the foot complaint in its evidence so that an unrelated leg injury with
  inability to bear weight is still diagnosed only in the foot-symptoms context of this page.
- **"Sudden severe foot pain at rest"** = Foot pain with *Sudden onset* and *Severe* qualifiers
  **and** Pain provoked by rest at the foot. "Foot pain at rest" in the CLI item uses the same rest
  pain form.
- **"Muscle pain in legs or buttocks on exercise"** = Intermittent claudication. In the PVD branch
  the page omits "on exercise", so plain Muscle pain at lower limb / buttock is used there.
- **Non-urgent approach** encoded as a second check task and five probable rules (tinea pedis,
  peripheral neuropathy, peripheral vascular disease, plantar fasciitis, bunion). Neuropathy and
  PVD require *generalised* foot pain (Foot pain + Generalized qualifier), following the flowchart.
- No `measure` tasks: the page asks for no measurement beyond routine vitals.
- "Check if problem is in the joint … 77" is a pointer to another page and is not modelled.
- The diabetes/PVD "foot at risk" review, foot-care advice, all treatment bullets and "Refer
  urgently" are management.

## Could not model

- **"following injury"** (time order of injury before inability to bear weight): co-occurrence only.
- **"Constant" and "worse at night"** (neuropathy): not encoded; rule fires more often than the page intends.
- **"thickened"** scaly skin (tinea pedis): `Thickened skin` (finding) does not exist; `Hyperkeratosis`
  is a morphologic abnormality only. Scaly skin alone at those sites is accepted; fires more often.
- **"worse on starting walking"** (plantar fasciitis): approximated by Pain provoked by walking.
- **"may have callus, redness or ulcer"** (bunion): optional features, not required, not checked for.
- **"Ensure that shoes fit properly"** (localised pain): management.

## SNOMED gaps

- `Pallor` (finding) not active; `Pale complexion` / `Pallor of skin of face` are face-specific.
  Substitute: `White discoloration of skin` with finding site `Lower limb structure` (low confidence).
- `Peripheral neuropathy` (disorder) not an active FSN. Substitute: `Peripheral nerve disease`.
- `Bunion` (disorder) not an active FSN. Substitute: `Swelling of first metatarsophalangeal joint of
  hallux` (the FSN that `exists` suggests for "Bunion").
- No "acute limb ischaemia" FSN at limb level without side; used `Acute lower limb ischemia`.
- No foot-specific "rest pain" finding; used `Pain provoked by rest` + finding site `Foot structure`.
- All finding_site body structures checked with `snomed exists`: Foot structure, Lower limb
  structure, Buttock structure, Heel structure, Structure of interdigital space of foot, Skin
  structure of sole of foot, Skin structure of lateral/medial border of foot, First
  metatarsophalangeal joint structure.

## Checker issues left in place

- None.

## Questions for a clinician

- Is "no pulse" best checked as absent foot pulses (dorsalis pedis / posterior tibial), or should a
  more proximal leg pulse also count?
- Should the PVD branch ("foot pain with muscle pain in legs or buttocks") require exertional pain
  (claudication), as the red-box CLI item does?
- Is requiring generalised foot pain for peripheral neuropathy right, or should numbness/burning of
  the feet alone suffice?
- Does the app record "Finding of foot region" descendants for the presenting complaint (e.g. foot
  pain), so that these rules fire?

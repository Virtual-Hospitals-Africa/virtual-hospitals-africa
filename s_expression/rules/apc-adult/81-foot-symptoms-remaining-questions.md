# Page 81 – Foot symptoms: remaining questions

Reconciled final build from builders A and B (see `reconcile.json`).

## Decisions made

- **Presenting complaint.** "Foot symptoms" is not a recorded common symptom or warning sign. Both
  tasks and the priority rule use `(clinical_finding "Finding of foot region")`, whose descendants
  (Foot pain, Heel pain, Numbness of foot, Ulcer of foot, Gangrene of foot, Tinea pedis, Deformity
  of foot …) match. Foot pain alone was rejected because it would miss non-pain complaints.
- **Two check tasks**, following the page's layout: the red box (`Check for urgent foot symptom
  conditions`) and the "Approach to the patient with foot symptoms not needing urgent attention"
  (`Check for causes of foot symptoms not needing urgent attention`).
- **Red box → three `probable` rules + one Urgent priority.** Fracture (`Fracture of bone`, since
  the page says "fracture" without a site), `Acute lower limb ischemia`, `Critical lower limb
  ischemia`. `Urgent: foot symptoms with fracture or limb ischaemia` is
  `(and foot-symptom (or active_condition …))`. "Refer urgently" is management.
- **Fracture:** foot symptoms AND Unable to weight-bear AND `Traumatic injury` (the page says
  "injury" without a site; the foot-symptoms condition keeps the rule in this page's context).
- **Acute limb ischaemia:** one Foot pain finding with Sudden onset, Severe and At rest qualifiers,
  AND any of Numbness of lower limb, Weakness of muscle of lower limb, White discoloration of skin
  at Skin structure of lower limb (pallor), Peripheral pulse absent ("no pulse" in the leg).
- **Critical limb ischaemia:** "Muscle pain in legs or buttocks on exercise" = `Intermittent
  claudication`, AND any of foot pain at rest (Foot pain + At rest), ulcer of foot, gangrene of foot.
- **Tinea pedis:** cracks / peeling / scaly skin at Structure of interdigital space of foot, OR
  Thick skin AND Scaly skin at the same site, for sole, heel and border of foot ("sides of feet").
- **Peripheral neuropathy:** generalised foot pain (Foot pain + Generalized) AND any of Burning
  feet, Paresthesia of foot (pins/needles), Numbness of foot. Diagnosis concept `Peripheral nerve
  disease` (no FSN "Peripheral neuropathy").
- **Peripheral vascular disease:** generalised foot pain AND muscle pain at lower limb or buttock.
  The PVD box does not say "on exercise", so claudication is not used there.
- **Plantar fasciitis:** Heel pain AND Pain aggravated by walking.
- **Bunion:** Deformity of foot AND Bony swelling of toe joint at First metatarsophalangeal joint
  structure ("bony lump at base of big toe"). "May have callus, redness or ulcer" is optional and
  not required. Diagnosis concept `Hallux valgus AND bunion`.
- No `measure` task: the page asks for no measurement in its triage/diagnostic logic (light-prick
  sensation and foot pulses appear only in the diabetes/PVD foot-at-risk review box).

## Could not model

- **"following injury"** (injury before inability to bear weight): co-occurrence only.
- **"Constant" and "worse at night"** (neuropathy): not encoded. Fires more often than the page
  intends.
- **"Localised" pain** (plantar fasciitis, bunion): not required as a qualifier; the specific
  findings (heel pain, deformity with bony swelling) carry the branch. Fires more often.
- **"Worse on starting walking"**: encoded as Pain aggravated by walking; "on starting" (first
  steps) is lost. Fires more often.
- **"Ensure that shoes fit properly"** (localised pain): management.
- **Joint check → page 77** (walk, sit, stand with arms folded): routing to another page; no rule.
- **Diabetes/PVD foot at risk** (callus, corns, cracks, ulcers, deformity, abnormal light-prick
  sensation, absent/reduced pulses → review more frequently) and the daily foot-care advice:
  review and management, out of scope for this pass.

## SNOMED gaps

- **Pallor of the leg**: no pallor/pale concept for limb skin (`Pallor`, `Pale skin`, `Pallor of
  skin` do not exist; `Pale complexion` is face-specific). Substitute: `White discoloration of
  skin` at `Skin structure of lower limb`.
- **Peripheral neuropathy** (disorder): not an FSN. Substitute: `Peripheral nerve disease`.
- **Bunion** (disorder): not an FSN. Substitute: `Hallux valgus AND bunion` (a descendant of
  `Swelling of first metatarsophalangeal joint of hallux`, the FSN `exists` suggests).
- **"Worse at night" / "nocturnal"** qualifier: only `Night time` exists, which means "at night",
  not "worse at night"; not used.
- **"Thickened skin"**: not an FSN; `Thick skin` (finding) used.
- No "acute limb ischaemia" FSN at limb level without side; `Acute lower limb ischemia` used.
- All finding_site body structures were checked with `snomed exists`.

## Checker issues left in place

- None.

## Questions for a clinician

- Is `Intermittent claudication` an acceptable reading of "muscle pain in legs or buttocks on
  exercise", including buttock claudication?
- Should the PVD branch ("foot pain with muscle pain in legs or buttocks") require exertional pain
  (claudication), as the red-box CLI item does?
- Should acute limb ischaemia require sudden, severe and at rest all on the same recorded foot
  pain, or would any sudden severe foot pain do?
- Is "no pulse" best checked as any absent peripheral pulse, or restricted to foot pulses
  (dorsalis pedis / posterior tibial)?
- Should a fracture anywhere (not only foot/ankle) be urgent on this page, and does any injury
  count, or only an injury of the leg/foot?
- Is requiring generalised foot pain for peripheral neuropathy right, or should numbness/burning of
  the feet alone suffice?
- Should the bunion rule also require (localised) foot pain, since it sits under "Localised pain"?
- Does the app record "Finding of foot region" descendants for the presenting complaint (e.g. foot
  pain), so these rules fire? Should VHA add a foot complaint to the common symptoms?

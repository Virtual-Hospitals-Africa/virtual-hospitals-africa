# Page 81 – Foot symptoms: remaining questions

## Decisions made

- **Trigger.** "Foot symptoms" is not a recorded common symptom or warning sign. The task and the
  priority rule use `(clinical_finding "Finding of foot region")`, whose descendants (Foot pain,
  Heel pain, Numbness of foot, Ulcer of foot, Gangrene of foot, Tinea pedis, Deformity of foot …)
  match in `due_to`. Foot pain alone was rejected because it would miss non-pain complaints.
- **Red box → three `probable` rules + one Urgent priority.** Fracture, acute lower limb ischaemia
  and critical lower limb ischaemia are each diagnosed at `probable`; `Urgent: foot symptoms with
  fracture or limb ischaemia` is `(and foot-symptom (or active_condition …))`. "Refer urgently" is
  management and not modelled.
- **Fracture** uses the general `Fracture of bone` and `Traumatic injury`: the page says "fracture"
  and "injury" without a site.
- **Acute limb ischaemia:** foot pain carries three qualifiers (Sudden onset, Severe, At rest), all
  required. Leg findings: Numbness of lower limb, Weakness of muscle of lower limb, White
  discoloration of skin at Skin structure of lower limb (pallor), Peripheral pulse absent.
- **Critical limb ischaemia:** "Muscle pain in legs or buttocks on exercise" = `Intermittent
  claudication`, AND any of foot pain at rest, ulcer of foot, gangrene of foot.
- **Tinea pedis:** cracks / peeling / scaly skin at Structure of interdigital space of foot, OR
  thick AND scaly skin at the same site, for sole, heel and border of foot ("sides of feet").
- **Peripheral neuropathy:** Foot pain AND any of Burning feet, Paresthesia of foot (pins/needles),
  Numbness of foot. Diagnosis concept `Peripheral nerve disease` (no FSN "Peripheral neuropathy").
- **Peripheral vascular disease:** Foot pain AND muscle pain at lower limb or buttock (or
  intermittent claudication, the narrower recorded form).
- **Plantar fasciitis:** Heel pain AND Pain aggravated by walking.
- **Bunion:** Foot pain (localised-pain branch) AND Deformity of foot AND a lump (Mass of body
  region, VHA's "Lump" common symptom) at First metatarsophalangeal joint structure. "May have
  callus, redness or ulcer" is optional on the page and not required by the rule. Diagnosis concept
  `Hallux valgus AND bunion`.
- No `measure` task: the page asks for no non-routine measurement in its triage/diagnostic logic
  (light-prick sensation and foot pulses appear only in the diabetes/PVD foot-at-risk review box).

## Could not model

- **"Constant" and "worse at night"** (neuropathy): not encoded. Rule fires more often than the
  page intends (any burning / pins-needles / numbness of the feet with foot pain).
- **"Generalised" / "localised" foot pain**: routing only, not a qualifier. Neuropathy and PVD
  rules may fire for localised pain; bunion may fire with any foot pain. Fires more often.
- **"Worse on starting walking"**: encoded as Pain aggravated by walking; "on starting" (first
  steps) is lost. Fires more often.
- **"Bony" lump**: encoded as a lump at the first MTP joint. Fires more often.
- **Joint check → page 77** (walk, sit, stand with arms folded): routing to another page; no rule.
- **Diabetes/PVD foot at risk** (callus, corns, cracks, ulcers, deformity, abnormal light-prick
  sensation, absent/reduced pulses → review more frequently) and the daily foot-care advice:
  review and management, out of scope for this pass.

## SNOMED gaps

- **Pallor of the leg**: no pallor/pale concept for limb skin (`Pallor`, `Pale skin`, `Pallor of
  skin` do not exist). Substitute: `White discoloration of skin` at `Skin structure of lower limb`.
- **Peripheral neuropathy** (disorder): not an FSN. Substitute: `Peripheral nerve disease`.
- **Bunion** (disorder): not an FSN. Substitute: `Hallux valgus AND bunion`.
- **"Worse at night" / "nocturnal"** qualifier: only `Night time` exists, which means "at night",
  not "worse at night"; not used.
- **"Thickened skin"**: not an FSN; `Thick skin` (finding) used.

## Checker issues left in place

- None.

## Questions for a clinician

- Is `Intermittent claudication` an acceptable reading of "muscle pain in legs or buttocks on
  exercise", including buttock claudication?
- Should acute limb ischaemia require all three of sudden, severe and at rest on the same recorded
  foot pain, or would any sudden severe foot pain do?
- Should "no pulse" be restricted to foot/leg pulses (finding site), or is any absent peripheral
  pulse acceptable in a patient with foot symptoms?
- Should a fracture anywhere (not only foot/ankle) be urgent on this page? The rule uses the
  general fracture concept.
- "Foot symptoms" has no recorded complaint; should VHA add one (e.g. foot pain) to the common
  symptoms so this page fires from intake?

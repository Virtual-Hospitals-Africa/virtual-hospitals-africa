# Page 30 – The injured patient: remaining questions

## Decisions made

- **Structure.** One `check_for` task per red sub-box, chained. "Check for urgent conditions in the
  injured patient" fires on the recorded trauma assessment (`Traumatic injury`) and checks for
  wound, fracture, head injury, bruising and blood in urine (plus the shock signs). Wound, fracture
  and head injury each trigger their own task (`Wound`, `Fracture of bone`, `Injury of head`),
  because in SNOMED `Fracture of bone` and `Injury of head` are not descendants of `Traumatic injury`.
- **Four `Urgent` priority rules**, one per sub-box: bruising **and** blood in urine; wound and any
  of its three items; fracture and any of its seven items; head injury and any of its thirteen
  items. The page does not escalate any item beyond "urgent attention".
- **Shock (footnote 1).** The page's own definition ("If SBP < 80, pulse ≥ 100, respiratory rate >
  30, confusion/restlessness, weakness, shock likely") is encoded as a `probable` Shock rule, read
  as any-of, and scoped to the injured patient (trauma assessment, wound, fracture or head injury)
  because the footnote belongs to the wound box. "If shock/SBP < 80" itself appears only in
  management text (IV fluids), so it is a management step. No shared shock definition was built.
- **Concussion likely** → `probable` Concussion injury of brain: head injury and (mild headache,
  dizziness or mental fogginess). Mental fogginess = `Clouded consciousness` (SNOMED synonym).
- **> 2 rib fractures** → `Fracture of three ribs` … `Fracture of eight OR more ribs`;
  `Fracture of multiple ribs` was not used because it includes two ribs.
- **Penetrating wound to head/neck/chest/abdomen**: precoordinated concepts for neck and abdomen;
  `Penetrating wound` with `finding_site` Head structure / Thoracic structure for head and chest.
- **Suspected** femur/pelvis/spine/skull fracture: the fracture concepts are used; a finding is
  recorded when suspected.
- "Refer same day if pregnant, known bleeding disorder, on anticoagulant, high-speed collision…"
  (not-urgent section) is a referral step and is not encoded.

## Could not model

- **"below injury" / "below fracture"**: the location of poor perfusion, weakness and numbness
  relative to the injury cannot be expressed. Any recorded cold extremity, limb numbness, absent
  peripheral pulse or limb weakness counts (fires more often).
- **Vomiting ≥ 2 times**: episode counts are not representable. `Finding of vomiting` is used, so
  the head-injury rule fires after a single episode (more often than the page intends).
- **Increasing pain, muscle tightness, numbness in limb**: encoded as or of increasing limb pain and
  limb numbness; muscle tightness has no concept (fires less often for that sign alone).
- **GCS < 15, drop in GCS, neck/spine tenderness** appear only in management lines; GCS has no
  unit/observable in the language anyway.
- Concussion is "likely" in the section for head injury *not needing urgent attention*; the rule
  does not negate the urgent head-injury signs.

## SNOMED gaps

- "Pale" limb / pallor below the injury: no limb pallor finding (`Pallor` finding does not exist;
  only `Pale complexion`, face). Not encoded; cold, numb and no pulse are.
- Muscle tightness: `Muscle tightness`, `Stiffness of muscle` do not exist; not encoded.
- "Respond poorly to light": no sluggish-light-reaction concept; `Abnormal pupil reaction` used
  (broader).
- "Weakness" (footnote 1): `Weakness` finding does not exist; `Asthenia` used.
- Drug intoxication: `Drug intoxication` does not exist; general `Intoxication` used (also covers
  poisoning).
- Penetrating wound of head / chest: no precoordinated concepts; `finding_site` used.

## Checker issues left in place

- None.

## Questions for a clinician

1. Footnote 1: does any one sign (e.g. pulse ≥ 100 alone in an injured patient) make shock likely,
   or are several signs needed?
2. Is single-episode vomiting after head injury acceptable as an urgent trigger, given the page says
   ≥ 2 times?
3. Should "clear fluid leaking from nose/ear" be recorded as CSF rhinorrhoea/otorrhoea?
4. Should probable concussion exclude patients who have any urgent head-injury sign?
5. "Bruising and blood in urine": should any bruise count, or only extensive/crush bruising?

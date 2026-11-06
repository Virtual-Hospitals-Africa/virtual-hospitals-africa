# Page 79 – Neck pain (and arm or hand symptoms): remaining questions

## Decisions made

- **Two complaints, one page.** The page has a NECK PAIN section and an ARM OR HAND SYMPTOMS
  section, each with its own red box. Each gets its own `check_for` task and `Urgent` priority rule.
  The arm section also gets a second task, `Check for causes of arm or hand symptoms`, for the
  non-urgent "X likely" columns.
- **Arm or hand complaint trigger.** No SNOMED concept means "arm or hand symptom". The trigger is an
  `or` of Pain in upper limb (hand, wrist, elbow, shoulder and thumb pain are its descendants),
  Muscle weakness of upper limb, Numbness of upper limb and Swelling of upper limb. Numbness and
  swelling are my additions to make the complaint broader than pain; the page doesn't list the symptoms.
- **Meningitis likely** → `probable` Meningitis: Stiff neck **and** any of temperature ≥ 38 °C,
  headache, drowsy, acute confusion, purpuric rash, erythematous rash. The priority rule uses
  `(active_condition Meningitis)`. Neck pain isn't required in the diagnosis rule itself, only in
  the priority rule, because the page's meningitis criterion is "neck stiffness and any of".
- **"Purple/red rash"** encoded as purpuric rash **or** erythematous rash, a literal reading.
- **Neurological symptoms in arms/legs** → Muscle weakness of limb, Numbness of limbs, Clumsiness,
  Stiff limbs, Abnormal gait, Decreased coordination.
- **"Recent injury and x-ray unavailable/abnormal or neurological symptoms"** is read as recent
  injury **and** (x-ray unavailable/abnormal **or** neurological symptoms). Only the
  neurological-symptoms half can be encoded. It adds no firing beyond item 2, but it is kept so
  the item stays traceable. "Recent" is the `Recent` qualifier, because the page gives no time window.
- **Fracture likely** → `probable` Fracture of upper limb: recent upper-limb injury **and**
  (severe arm pain **or** severe arm swelling **or** upper-limb deformity). "Severe" is read as
  applying to both pain and swelling.
- **Consider stroke or TIA** → two `possible` rules (Cerebrovascular accident, Transient ischemic
  attack) on sudden-onset muscle weakness of upper limb. "With/without difficulty speaking or visual
  disturbance" doesn't discriminate, so those findings aren't checked. "New sudden onset" is the
  `Sudden onset` qualifier alone.
- **Joint problem likely (→ 77)** → `probable` Arthropathy: arm/hand complaint **and** any of joint
  warm, tenderness of joint, joint swelling, limitation of joint movement.
- **Referred pain likely** → `probable` Referred pain (a finding) from Pain of shoulder region, as
  the page links "Painful shoulder" straight to "Referred pain likely".
- **Carpal tunnel syndrome likely** → wrist or hand pain qualified `Intermittent` and `Night time`.
- **Tennis or golfer's elbow likely** → one `probable` rule for Elbow tendinopathy, the common
  parent of lateral and medial epicondylitis, from pain provoked by movement at the elbow region.
- **Tenosynovitis likely** → (thumb pain **and** pain on thumb or wrist movement) **or** locking of
  a finger joint.
- **Neck-pain approach (risk factors → Yes/No)** isn't encoded. Both branches are management
  (x-ray, referral, analgesia, physiotherapy) and name no diagnosis.
- Shock / BP < 90/60 don't appear on this page.

## Could not model

- **x-ray unavailable/abnormal** (neck red box, item 3): there is no finding for x-ray availability or
  result. As a result, the rule fires **less often** than the page intends: a recently injured neck
  without neurological symptoms isn't flagged urgent.
- **"relieved by shaking"** (carpal tunnel): there is no qualifier for it, and `Relieved by` exists only as an
  attribute. The rule fires **more often** than the page intends.
- **"May be numbness/tingling in 1st, 2nd and 3rd fingers or weakness of hand"** and **"May have
  decreased grip strength"**: both are optional ("may"), so they aren't used as evidence.
- **The movement tests** (hands behind head and back, fist, palms together) are approximated by
  Limitation of joint movement.
- **Risk-factor question** (>50 years, pain > 6 weeks, steroids, HIV, diabetes, IV drug use, weight
  loss/fever/TB, neck surgery, previous cancer): management routing only, so it isn't modelled.

## SNOMED gaps

- No "arm/upper limb symptom" concept. The trigger is the `or` described above.
- No "Nocturnal"/"At night" qualifier. Used `Night time` (qualifier value).
- No "Difficulty speaking" finding (`Difficulty talking` exists), but it isn't needed (see above).
- No "worse with movement" qualifier. Used `Pain provoked by movement` with `finding_site`
  (Elbow region structure, Thumb structure, Wrist region structure; all body structures checked to exist).
- No "locking of finger" concept. Used `Locking of joint` with `finding_site` Finger structure.

## Checker issues left in place

- None.

## Questions for a clinician

- Should a recent neck injury be urgent on its own, given that x-ray is usually unavailable at a
  primary-care clinic? The page makes it urgent when x-ray is unavailable, which may be the usual case.
- Is "purple/red rash" meant as any red rash, or only a non-blanching (purpuric/petechial) rash?
- Should "Painful shoulder → Referred pain likely" fire for every shoulder pain? It's encoded literally.
- Should "severe" in "severe pain/swelling" apply to the swelling too?

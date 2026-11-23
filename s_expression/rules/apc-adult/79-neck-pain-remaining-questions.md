# Page 79 – Neck pain (and arm or hand symptoms): remaining questions

Final build, reconciled from builders A and B (base A). Every difference and the reason for
choosing it is listed in `reconcile.json`.

## Decisions made

- **Two complaints, one page.** The page has a NECK PAIN section and an ARM OR HAND SYMPTOMS
  section, each with its own red box. Each section gets its own `check_for` task and `Urgent`
  priority rule. The arm section also gets a second task, `Check for causes of arm or hand
  symptoms`, for the non-urgent "X likely" columns.
- **Arm or hand complaint trigger** → `Finding of upper limb` (finding). The page names no specific
  symptom. Hand, wrist, elbow, shoulder and thumb pain, and weakness, numbness and swelling of the
  upper limb, are all descendants (checked with `is_a`). Neither neck pain nor "arm or hand
  symptoms" is a recorded common symptom or warning sign, so both complaints fire only when
  recorded as a finding.
- **Meningitis likely** → `probable` Meningitis: Stiff neck **and** any of temperature ≥ 38 °C,
  headache, drowsy, acute confusion, purpuric rash or erythematous rash. The priority rule uses
  `(active_condition Meningitis)`. Neck pain is required only in the priority rule, because the
  page's meningitis criterion is "neck stiffness and any of".
- **"confused"** → `Acute confusion` (`Confusion` (finding) does not exist).
- **"Purple/red rash"** → purpuric rash **or** erythematous rash, a literal reading.
- **Neurological symptoms in arms/legs** → Muscle weakness of limb, Numbness of limbs, Clumsiness,
  Stiff limbs, Abnormal gait, Decreased coordination.
- **"Recent injury and x-ray unavailable/abnormal or neurological symptoms"** is read as a recent
  neck injury **and** (abnormal cervical spine x-ray **or** neurological symptoms). The abnormal
  x-ray is `Plain X-ray of cervical spine abnormal`. "Recent" is the `Recent` qualifier, because
  the page gives no time window.
- **Fracture likely** → `probable` Fracture of upper limb: recent upper-limb injury **and**
  (severe arm pain **or** severe arm swelling **or** upper-limb deformity). "Severe" is read as
  applying to both pain and swelling.
- **Consider stroke or TIA** → two `possible` rules (Cerebrovascular accident, Transient ischemic
  attack) on sudden-onset muscle weakness of upper limb. "With/without difficulty speaking or
  visual disturbance" doesn't discriminate, so those findings aren't checked. "New" isn't added as
  a second qualifier.
- **Joint problem likely (→ 77)** → `probable` Arthropathy: upper-limb finding **and** any of joint
  warm, tenderness of joint, joint swelling, limitation of joint movement.
- **Referred pain likely** → `probable` Referred pain (a finding) from Pain of shoulder region, as
  the page links "Painful shoulder" straight to "Referred pain likely".
- **Carpal tunnel syndrome likely** → wrist or hand pain qualified `Intermittent` and `Night time`
  ("worse at night" describes that pain).
- **Tennis or golfer's elbow likely** → one `probable` rule for Elbow tendinopathy, the common
  parent of lateral and medial epicondylitis, from pain provoked by movement at the elbow region.
- **Tenosynovitis likely** → (thumb pain **and** pain on thumb or wrist movement) **or** catching
  of a finger joint **or** locking of a finger joint.
- **Neck-pain approach (risk factors → Yes/No)** isn't encoded. Both branches are management
  (x-ray, referral, analgesia, physiotherapy) and name no diagnosis.
- Temperature is a routine vital, so there is no `measure` task. Shock / BP < 90/60 don't appear
  on this page.

## Could not model

- **"x-ray unavailable"** (neck red box, item 3). Only "x-ray abnormal" and "neurological symptoms"
  are encoded. A recent neck injury with **no x-ray available** and no neurological symptoms isn't
  flagged Urgent, so the rule fires **less often** than the page intends. A `(no (procedure …))`
  proxy was rejected as an invented proxy.
- **"relieved by shaking"** (carpal tunnel): there is no qualifier for it, and `Relieved by` exists
  only as an attribute. The rule fires **more often** than the page intends.
- **"unable to do all actions comfortably"** and the movement tests (hands behind head and back,
  fist, palms together) are approximated by Limitation of joint movement. Discomfort without
  limitation is missed (**less often**).
- **"May be numbness/tingling in 1st, 2nd and 3rd fingers or weakness of hand"** and **"May have
  decreased grip strength"** are optional ("may"), so they aren't used as evidence.
- **Risk-factor question** (>50 years, pain > 6 weeks, steroids, HIV, diabetes, IV drug use,
  weight loss/fever/TB, neck surgery, previous cancer): management routing only, so it isn't
  modelled.
- Management (ceftriaxone, collar/immobilisation, analgesia, splints, physiotherapy, referral) is
  out of scope.

## SNOMED gaps

- No "arm/hand symptom" concept → used `Finding of upper limb`.
- `Confusion` (finding) → used `Acute confusion`.
- `Injury of upper limb` → used `Injury of upper extremity`.
- `Disorder of joint` → used `Arthropathy`.
- `Shoulder pain`, `Wrist pain` → used `Pain of shoulder region`, `Pain of wrist region`.
  `Thumb pain` → used `Pain in thumb`.
- No "Nocturnal"/"At night" qualifier → used `Night time` (qualifier value).
- No "worse with movement" qualifier → used `Pain provoked by movement` with `finding_site`
  (Elbow region structure, Thumb structure, Wrist region structure; all checked to exist).
- No "locking of finger" / "trigger finger" concept → used `Locking of joint` and `Joint catching`
  with `finding_site` Finger structure.
- `Epicondylitis`, `Medial epicondylitis` → used `Elbow tendinopathy` (parent of both).
- No concept for "x-ray unavailable" or "relieved by shaking".

## Checker issues left in place

- None.

## Questions for a clinician

- Should a recent neck injury with **no x-ray available** count as urgent on its own? At most
  primary-care clinics that's the usual situation, and the current rule misses it.
- Is "purple/red rash" meant as any red rash, or only a non-blanching (purpuric/petechial) rash?
  Including red rash makes the meningitis rule much broader.
- Painful shoulder alone gives `probable` Referred pain. Is that the intended strength, or should
  it be `possible`?
- Is "severe pain/swelling" meant as severe pain or severe swelling (as encoded), or severe pain
  or any swelling?
- Is "Thumb pain: worse with thumb/wrist movement or catching/locking of finger" correctly read as
  (thumb pain worse with movement) OR (catching/locking of a finger)?
- Is "arm or hand symptoms" meant as any upper-limb finding (as encoded), or a narrower set?

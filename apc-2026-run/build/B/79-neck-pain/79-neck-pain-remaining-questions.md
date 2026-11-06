# Page 79 – Neck pain / Arm or hand symptoms: remaining questions

## Decisions made

- **Two complaints, one file.** The page has two sections, each with a red box. Each gets its own `check_for` task and its own Urgent priority rule. The arm/hand trigger is `Finding of upper limb` (finding); hand, wrist, elbow, shoulder and thumb pain and upper-limb weakness were confirmed as descendants with `is_a`. Neither neck pain nor "arm or hand symptoms" is a recorded common symptom or warning sign, so both tasks fire only when the complaint is recorded as a finding.
- **Meningitis.** "Neck stiffness and any of: temperature ≥ 38°C, headache, drowsy/confused or purple/red rash: meningitis likely" → `probable` Meningitis = Stiff neck AND any of those. The diagnosis rule does not require neck pain; the priority rule does (neck pain AND active meningitis).
- **"confused"** → `Acute confusion` (finding); `Confusion` (finding) does not exist.
- **"purple/red rash"** → `Purpuric rash` OR `Erythematous rash`.
- **Neurological symptoms in arms/legs**: weakness → `Muscle weakness of limb`; numbness → `Numbness of limbs`; clumsiness → `Clumsiness`; stiffness → `Muscle rigidity` at `Limb structure`; change in gait → `Abnormal gait`; difficulty with co-ordination → `Decreased coordination`.
- **Recent injury (neck box)** read as a recent neck injury: `Injury of neck` + `Recent`. The bullet's "or neurological symptoms" branch is kept even though bullet 2 already covers it.
- **Fracture (arm box)**: recent `Injury of upper extremity` AND (severe arm pain OR severe arm swelling OR arm deformity) → `probable` Fracture of upper limb; the priority rule references the active condition.
- **Stroke/TIA**: "New sudden onset of weakness of arm" → `Muscle weakness of upper limb` + `Sudden onset` → `possible` CVA and `possible` TIA. "New" is not added as a second required qualifier. Difficulty speaking and visual disturbance are "with/without" and not criteria.
- **Tennis or golfer's elbow** → one rule diagnosing `Elbow tendinopathy`, the direct parent of `Lateral epicondylitis` and `Medial epicondylitis of elbow joint`.
- **Joint problem likely** → `Arthropathy` (disorder), requiring an upper-limb finding since the check sits in this section.
- Temperature is a routine vital, so there is no `measure` task.

## Could not model

- **"x-ray unavailable"** (neck box bullet 3). Only "x-ray abnormal" (`Plain X-ray of cervical spine abnormal`) and "neurological symptoms" are encoded. A recent neck injury with **no x-ray available** and no neuro symptoms will **not** be flagged Urgent: the rule fires **less often** than the page intends. A `(no (procedure …))` proxy was rejected as inventing a proxy.
- **"relieved by shaking"** (carpal tunnel): no concept; rule fires **more often**.
- **"with or after elbow flexion/extension"** (tennis/golfer's elbow): no movement-aggravated elbow pain concept; elbow pain alone → probable. Fires **more often**.
- **"worse with thumb/wrist movement"** (tenosynovitis): not expressible; thumb pain alone → probable. Fires **more often**.
- **"unable to do all actions comfortably"** approximated as `Limitation of joint movement`; discomfort without limitation is missed (less often).
- **Neck pain approach question** (>50 years, pain progressive or > 6 weeks, oral steroids, HIV, diabetes, IV drug use, unexplained weight loss/fever or TB, neck surgery, previous cancer). Its Yes branch is x-ray and referral, and it names no diagnosis, so it isn't a diagnosis rule and has no consumer. Not encoded.
- Management (ceftriaxone, collar/immobilisation, analgesia, splints, physiotherapy, referral) is out of scope.

## SNOMED gaps

- `Confusion` (finding) → used `Acute confusion`.
- `Stiffness of limb` / `Limb stiffness` → used `Muscle rigidity` + finding site `Limb structure`.
- `Injury of upper limb` → used `Injury of upper extremity`.
- `Disorder of joint` → used `Arthropathy`.
- `Shoulder pain`, `Wrist pain`, `Elbow pain` → used `Pain of shoulder region`, `Pain of wrist region`, `Pain of elbow region`.
- `Thumb pain` → used `Pain in thumb`.
- `Locking of finger`, `Trigger finger` → used `Locking of joint` / `Joint catching` + finding site `Finger structure`.
- `Epicondylitis`, `Medial epicondylitis` → used `Elbow tendinopathy` (parent of both).
- "worse at night" → `Night pain` (finding), not tied to a site.
- No concept for "x-ray unavailable", "relieved by shaking", or movement-aggravated elbow/thumb pain.

## Checker issues left in place

- None.

## Questions for a clinician

- Should a recent neck injury with **no x-ray available** count as urgent on its own? At most clinics that's the usual situation, and the current rule misses it.
- Is "Thumb pain: worse with thumb/wrist movement or catching/locking of finger" correctly read as (thumb pain) OR (catching/locking of a finger)?
- Is "severe pain/swelling" meant as severe pain or severe swelling (as encoded), or severe pain or any swelling?
- Should "red rash" really count for meningitis alongside purple (purpuric) rash? It makes the rule much broader.
- Painful shoulder alone gives `probable` Referred pain. Is that the intended strength, or should it be `possible`?

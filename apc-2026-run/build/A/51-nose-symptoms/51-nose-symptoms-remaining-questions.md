# Page 51 – Nose symptoms: remaining questions

## Decisions made

- **Trigger.** "Nose symptoms" is `(clinical_finding "Nose finding")`. Nasal discharge (a recorded
  common symptom), Nasal obstruction, Bleeding from nose and Posterior rhinorrhea are all
  descendants (checked with `snomed is_a`), so the check task fires on any of them. "Nose finding"
  itself is not a recorded common symptom or warning sign.
- **Red box.** "Head injury with clear watery discharge from nose" is `Injury of head` **and**
  `Nasal discharge` qualified `Clear` + `Watery`, anded with the nose complaint, at `Urgent`. The
  page does not name CSF rhinorrhoea, so `Cerebrospinal fluid rhinorrhea` was not used.
- **Blocked/runny nose** = `Nasal discharge` (runny) or `Nasal obstruction` (disorder; there is no
  "finding" form). This precondition is the first clause of the common cold, acute viral infection
  and sinusitis rules, because those columns sit under the "Blocked/runny nose" box.
- **Common cold vs acute viral infection.** Both need blocked/runny nose and sore throat or fever
  with onset within 3 days. Yes branch: temperature ≥ 38 °C or chill or muscle pain or nausea. No
  branch: temperature < 38 °C **and** chill, nausea and muscle pain each explicitly recorded absent
  (`no`).
- **Time comparisons** follow the brief: "less than 3 days" → `(<= (onset X) (time_ago 3 days))`;
  "> 4 weeks" → `(>= (onset X) (time_ago 4 weeks))` (the database rejects strict comparators).
- **Fever** uses the `(active_condition Fever)` anchor, including inside `onset`.
- **Sinusitis** needs all three listed features (and): tenderness over frontal or maxillary
  sinus ("pain when pushing on forehead/cheeks"), and a recent common cold (`Common cold` +
  `Recent`). "Headache worse on bending forward" could not be encoded (see below).
- **Allergic rhinitis (probable)**: any of sneezing, itchy nose, runny nose, blocked nose with onset
  ≥ 4 weeks ago. "Recurrent/most days" is not separately encoded. "May have itchy eyes, ears or
  throat" is optional on the page and not used as a criterion.
- **Upper airway cough syndrome (postnasal drip)** is diagnosed as `Posterior rhinorrhea`
  (disorder), whose synonym is postnasal drip: runny nose and (persistent cough or frequent throat
  clearing). "and/or" read as or.
- **Allergic rhinitis (possible)** from the bleeding nose column: bleeding from nose and itchy nose.
- **Diphtheria (possible)**: sore throat and fever and pseudomembrane in the nose or pharynx.
  Concept `Diphtheria caused by Corynebacterium diphtheriae` (the FSN for diphtheria; "Diphtheria"
  alone does not exist).
- **No measure task.** The only measurements (temperature, BP in the bleeding column) are routine vitals.
- Management (all treatment bullets, "Check BP" with SBP < 80 / ≥ 140/90 actions, referral) is not encoded.

## Could not model

- "Headache worse on bending forward": no SNOMED concept; the sinusitis rule therefore fires
  **more often** than the page intends (it lacks one of the three features).
- "Mild" fever in the diphtheria criterion: plain Fever is used; the possible rule fires slightly
  more often.
- "Recurrent … most days" for allergic rhinitis: only duration (≥ 4 weeks) is encoded; fires more often.
- "Continually rubbing" the nose: no fitting concept; only "itchy nose" triggers the possible
  allergic rhinitis rule from a nosebleed (fires less often).
- The common cold No branch needs chill, nausea and muscle pain to be recorded as absent, and a
  temperature; if any is unrecorded the rule does not fire (fires less often).

## SNOMED gaps

- Headache worse on bending forward: none found (`search headache bending`, `bending`, `headache worse`).
- Rubbing nose: none found; `Repetitive rubbing of body parts` sits under "Repetitive routines"
  (behaviour), judged not a fit.
- Itchy nose: no precoordinated concept; `Itching` with finding site `Nasal structure` used.
- Blocked nose: only `Nasal obstruction` (disorder).
- Upper airway cough syndrome: no concept; `Posterior rhinorrhea` (postnasal drip) used.
- Throat clearing: only an observable entity; `Clearing throat - hawking` (finding) used.
- Mild fever: no concept; `Fever` used.

## Checker issues left in place

- None.

## Questions for a clinician

- Should the red box be read as CSF rhinorrhoea (`Cerebrospinal fluid rhinorrhea`) rather than
  "clear watery nasal discharge"?
- Are the sinusitis features all required, or is any one with a recent cold enough?
- Should the common cold "No" branch fire when chills/nausea/muscle pain are simply not recorded?

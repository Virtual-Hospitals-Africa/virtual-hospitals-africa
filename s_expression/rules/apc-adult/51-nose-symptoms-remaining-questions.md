# Page 51 – Nose symptoms: remaining questions

## Decisions made

- **Entry trigger.** "Nose symptoms" is not one recorded symptom. Both check_for tasks fire on the
  general `(clinical_finding "Nose finding")`, since descendants match in `due_to` and the page names
  the complaint generally. Nasal discharge (a recorded common symptom), Nasal congestion and Bleeding
  from nose are all descendants (checked with `snomed is_a`). "Nose finding" itself is not a recorded
  common symptom or warning sign. Nasal congestion and Bleeding from nose are in the causes task's
  `check_for`, because rules use them as evidence.
- **Blocked nose** is `Nasal congestion` (finding), the symptom form; `Nasal obstruction` (disorder)
  was the alternative.
- **Red box.** "Head injury with clear watery discharge from nose" is encoded as Injury of head **and**
  Nasal discharge qualified Clear and Watery → `Urgent` ("Give urgent attention … Refer urgently").
  The priority rule doesn't repeat the nose-symptom `or`: the watery nasal discharge is itself a nose
  symptom, and the gate flagged the `or` as always true. Cerebrospinal fluid rhinorrhea was considered
  and rejected because it is the diagnosis the box is screening for, not what the health worker sees.
- **Common cold / acute viral infection.** Both need blocked/runny nose and sore throat or fever with
  onset within 3 days, written `(<= (onset …) (time_ago 3 days))` per the time-comparison decision.
  "No" → temperature < 38 °C and no chill, nausea or muscle pain. "Yes" → any of temperature ≥ 38 °C,
  chill, nausea, muscle pain.
- **Sinusitis.** All of: blocked/runny nose, frontal or maxillary sinus tenderness ("pain when pushing
  on forehead/cheeks"), headache, recent common cold. The page gives no and/or between the features.
- **Allergic rhinitis.** Any of recurrent sneezing, itchy nose, runny nose or blocked nose with onset
  at least 4 weeks ago ("> 4 weeks" written as `>=`). "May have itchy eyes, ears or throat" is
  descriptive and doesn't change the logic, so it is not encoded.
- **Upper airway cough syndrome (postnasal drip).** Runny nose **and** (persistent cough **or**
  frequent throat clearing); "and/or" read as `or`.
- **Bleeding nose.** "If continually rubbing or itchy nose, consider allergic rhinitis" → possible
  allergic rhinitis from bleeding nose plus repetitive rubbing of the nose or itchy nose.
- **Diphtheria.** "Consider diphtheria" → possible: sore throat, mild fever (Fever + Mild) and a
  pseudomembrane in the nose or pharynx.
- No Shock/SBP < 80 rule: the SBP < 80 on this page is a management step in the bleeding-nose column.
- No `measure` tasks: the only measurements (temperature, BP) are routine vitals.

## Could not model

- "Headache worse on bending forward": encoded as general Headache, so the sinusitis rule fires
  **more often** than the page intends on that element.
- "Most days" (allergic rhinitis): only the Recurrent qualifier and onset ≥ 4 weeks.
- "Mild" fever (diphtheria) uses `Fever` + `Mild` qualifier, a form that fires only when the fever is
  recorded with that qualifier; the plain `(active_condition Fever)` anchor would fire more often.
- The common cold "No" branch needs chill, nausea and muscle pain each recorded as absent, and a
  temperature; if any is unrecorded the rule does not fire (fires less often).
- "Thick grey layer": only the Pseudomembrane morphology with finding site.
- Management within the "likely" boxes (medicines, antibiotic criteria such as symptoms ≥ 10 days,
  refer-same-day list, BP checks and fluids for bleeding nose, BIPP gauze, follow-up) is management
  and out of scope.

## SNOMED gaps

- "Upper airway cough syndrome": no FSN; used Posterior rhinorrhea (disorder), synonym postnasal drip.
- "Diphtheria" (disorder): no exact FSN; used Diphtheria caused by Corynebacterium diphtheriae.
- "Throat structure": none; used Pharyngeal structure.
- "Itchy nose" / "Rubbing nose": none; used Itching and Repetitive rubbing of body parts with finding
  site Nasal structure. `Repetitive rubbing of body parts` sits under "Repetitive routines"
  (behaviour), so its fit is uncertain.
- "Head injury": used Injury of head. "Chills": used Chill. "Throat clearing" (finding): used
  Clearing throat - hawking.
- Headache aggravated by bending: none found (see above).

## Checker issues left in place

- None.

## Questions for a clinician

- Sinusitis: should all three features be needed, or is sinus tenderness with a recent cold enough?
- Should the urgent rule use Cerebrospinal fluid rhinorrhea, or is the observable form (clear watery
  nasal discharge after head injury) right for a primary-care nurse?
- Is "mild fever" for diphtheria best captured with a Mild qualifier, or should any fever count?
- Allergic rhinitis: does "Recurrent" apply only to sneezing, or also to itchy/runny/blocked nose? The
  final build requires the Recurrent qualifier on all four (plus onset ≥ 4 weeks).
- Should the common cold "No" branch fire when chills/nausea/muscle pain are simply not recorded?
- Is "Repetitive rubbing of body parts" at the nose an acceptable encoding of "continually rubbing … nose"?

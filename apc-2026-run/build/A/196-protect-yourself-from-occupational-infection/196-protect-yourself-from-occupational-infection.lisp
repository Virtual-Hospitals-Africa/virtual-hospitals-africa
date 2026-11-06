;; Page 196 - Protect yourself from occupational infection
;; Red box: "Give urgent attention to the health worker with a sharps injury or splash to
;; eye/mouth/nose/broken skin with exposure to any of: ..."
;; SNOMED has no concept for a splash to eye/mouth/nose/broken skin; the broader event
;; "Exposure to blood and/or body fluid" stands in for it (see remaining-questions).
(task
  "Check for occupational sharps/splash exposure to body fluids"
  adult
  (or (clinical_finding (snomed_concept "Sharps injury" "disorder"))
      (clinical_finding (snomed_concept "Exposure to blood and/or body fluid" "event")))
  (check_for
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Blood" "substance"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Vaginal secretion" "substance"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Seminal fluid" "substance"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Exudate" "substance"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Breast milk" "substance"))

    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Pleural fluid" "substance"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Pericardial fluid" "substance"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Peritoneal fluid" "substance"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Amniotic fluid" "substance"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Synovial fluid" "substance"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Cerebrospinal fluid" "substance"))
  )
)
(system_priority_evaluation
  "Urgent: occupational sharps/splash exposure to body fluids"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Sharps injury" "disorder"))
        (clinical_finding (snomed_concept "Exposure to blood and/or body fluid" "event")))
    (or (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Blood" "substance"))
        (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Vaginal secretion" "substance"))
        (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Seminal fluid" "substance"))
        (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Exudate" "substance"))
        (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Breast milk" "substance"))
        (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Pleural fluid" "substance"))
        (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Pericardial fluid" "substance"))
        (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Peritoneal fluid" "substance"))
        (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Amniotic fluid" "substance"))
        (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Synovial fluid" "substance"))
        (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Cerebrospinal fluid" "substance")))
  )
)

;; Page 196 - Protect yourself from occupational infection
(task
  "Check for body fluid exposure after a sharps injury"
  adult
  (clinical_finding (snomed_concept "Sharps injury" "disorder"))
  (check_for
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Blood" "substance"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Vaginal secretion" "substance"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Serosanguinous fluid" "substance"))
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
(system_diagnosis_rule
  "Diagnose possible TB from TB symptoms (occupational infection control)"
  (diagnosis
    (snomed_concept "Tuberculosis" "disorder")
    possible
  )
  adult
  ;; Footnote 1: "TB symptoms: cough, fever >= 2 weeks, unexplained weight loss or drenching night sweats"
  (or (clinical_finding (snomed_concept "Cough" "finding"))
      (>= (onset (active_condition (snomed_concept "Fever" "finding"))) (time_ago 2 weeks))
      (clinical_finding (snomed_concept "Unexplained weight loss" "finding"))
      (clinical_finding (snomed_concept "Night sweats" "finding"))
  )
)
(system_priority_evaluation
  "Urgent: sharps injury with exposure to blood or body fluids"
  adult
  Urgent
  ;; Red box: sharps injury (splash to eye/mouth/nose/broken skin has no SNOMED concept) AND exposure to any of the listed fluids
  (and (clinical_finding (snomed_concept "Sharps injury" "disorder"))
       (or
         (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Blood" "substance"))
         (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Vaginal secretion" "substance"))
         (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Serosanguinous fluid" "substance"))
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
)

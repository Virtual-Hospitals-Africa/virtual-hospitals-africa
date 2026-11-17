;; Page 122 - HIV: Post-exposure prophylaxis (PEP)
(task
  "Check for HIV PEP: exposure to infectious fluid or human bite"
  adult
  (or (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Body fluid" "substance"))
      (clinical_finding (snomed_concept "Human bite - wound" "disorder")))
  (check_for
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Blood" "substance"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Pleural fluid" "substance"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Pericardial fluid" "substance"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Peritoneal fluid" "substance"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Amniotic fluid" "substance"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Synovial fluid" "substance"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Cerebrospinal fluid" "substance"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Vaginal secretion" "substance"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Seminal fluid" "substance"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Breast milk" "substance"))

    (clinical_finding (snomed_concept "Bleeding" "finding"))
  )
)
(system_priority_evaluation
  "Urgent: HIV PEP, exposure to infectious fluid or bleeding human bite"
  adult
  Urgent
  (or
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Blood" "substance"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Pleural fluid" "substance"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Pericardial fluid" "substance"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Peritoneal fluid" "substance"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Amniotic fluid" "substance"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Synovial fluid" "substance"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Cerebrospinal fluid" "substance"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Vaginal secretion" "substance"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Seminal fluid" "substance"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Breast milk" "substance"))
    (and (clinical_finding (snomed_concept "Human bite - wound" "disorder"))
         (clinical_finding (snomed_concept "Bleeding" "finding")))
  )
)

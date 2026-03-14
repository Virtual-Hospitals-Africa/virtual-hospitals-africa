;; Page 41 - Acute Covid 19
(task
  "Check for urgent acute Covid-19 conditions"
  adult
  (clinical_finding (snomed_concept "Acute disease caused by severe acute respiratory syndrome coronavirus 2" "disorder"))
  (check_for
    (clinical_finding (snomed_concept "Dyspnea" "finding"))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    (clinical_finding (snomed_concept "Chest pain" "finding") (qualifier (snomed_concept "Worsening" "qualifier value")))
    (clinical_finding (snomed_concept "Tight chest" "finding") (qualifier (snomed_concept "Worsening" "qualifier value")))
    (clinical_finding (snomed_concept "Clouded consciousness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Drowsy" "finding") (qualifier (snomed_concept "Worsening" "qualifier value")))
  )
)
(task
  "Check for urgent acute Covid-19 conditions"
  adult
  (clinical_finding (snomed_concept "Acute disease caused by severe acute respiratory syndrome coronavirus 2" "disorder"))
  (check_for
    (clinical_finding (snomed_concept "Dyspnea" "finding"))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    (clinical_finding (snomed_concept "Chest pain" "finding") (qualifier (snomed_concept "Worsening" "qualifier value")))
    (clinical_finding (snomed_concept "Tight chest" "finding") (qualifier (snomed_concept "Worsening" "qualifier value")))
    (clinical_finding (snomed_concept "Clouded consciousness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Drowsy" "finding") (qualifier (snomed_concept "Worsening" "qualifier value")))
  )
)

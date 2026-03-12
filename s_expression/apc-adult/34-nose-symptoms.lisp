;; Page 34 - Nose Symptoms
(task
  "Check for urgent nose conditions"
  adult
  (clinical_finding (snomed_concept "Nose finding" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Injury of head" "disorder"))
    (clinical_finding (snomed_concept "Cerebrospinal fluid rhinorrhea" "disorder"))
    (clinical_finding (snomed_concept "Nasal discharge" "finding") (qualifier (snomed_concept "Clear" "qualifier value")))
  )
)

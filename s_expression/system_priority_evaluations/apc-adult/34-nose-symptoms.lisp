;; Page 34 - Nose: Head injury with nose symptoms (possible CSF leak)
(system_priority_evaluation
  "Urgent: head injury with nasal symptoms"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Injury of head" "disorder"))
    (clinical_finding (snomed_concept "Cerebrospinal fluid rhinorrhea" "disorder"))
    (clinical_finding (snomed_concept "Nasal discharge" "finding") (qualifier (snomed_concept "Clear" "qualifier value")))
  )
)

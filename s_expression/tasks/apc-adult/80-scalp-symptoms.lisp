;; Page 80 - Scalp Symptoms
(task
  "Check for urgent scalp conditions"
  adult
  (clinical_finding (finding_site (snomed_concept "Scalp structure" "body structure")))
  (check_for
    (clinical_finding (snomed_concept "Loss of scalp hair" "finding"))
    (clinical_finding (snomed_concept "Eruption of scalp" "disorder"))
    (clinical_finding (snomed_concept "Itching of skin" "finding") (finding_site (snomed_concept "Scalp structure" "body structure")))
  )
)

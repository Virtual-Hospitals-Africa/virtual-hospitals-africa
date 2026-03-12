;; Page 39 - Wheeze or Tight Chest
(task
  "Check for urgent wheeze or tight chest conditions"
  adult
  (or
    (clinical_finding (snomed_concept "Wheezing" "finding"))
    (clinical_finding (snomed_concept "Tight chest" "finding")))
  (check_for
    (clinical_finding (snomed_concept "Unable to complete a sentence in one breath" "finding"))
    (clinical_finding (snomed_concept "Accessory respiratory muscles used" "finding"))
    (clinical_finding (snomed_concept "Absent breath sounds" "finding"))
    (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
    (clinical_finding (snomed_concept "Feeling agitated" "finding"))
    (clinical_finding (snomed_concept "Drowsy" "finding"))
    (clinical_finding (snomed_concept "Asthma" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
    (clinical_finding (snomed_concept "Chronic obstructive pulmonary disease" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
  )
)

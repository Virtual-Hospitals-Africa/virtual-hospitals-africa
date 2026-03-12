;; Page 36 - Gum/Teeth Symptoms
(task
  "Check for urgent dental conditions"
  adult
  (clinical_finding (snomed_concept "Toothache" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Facial swelling" "finding"))
    (clinical_finding (snomed_concept "Swelling of lower jaw region" "finding"))
    (clinical_finding (snomed_concept "Unable to eat" "finding"))
    (clinical_finding (snomed_concept "Unable to drink" "finding"))
    (clinical_finding (snomed_concept "Toothache" "finding") (qualifier (snomed_concept "Worsening" "qualifier value")))
  )
)

;; Page 40 - Covid 19 Diagnosis
(task
  "Check for presence of Covid-19"
  adult
  (clinical_finding (snomed_concept "Disease caused by severe acute respiratory coronavirus 2 suspected" "situation"))
  (check_for
    (clinical_finding (snomed_concept "Dyspnea at rest" "finding"))
    (clinical_finding (snomed_concept "Dyspnea" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
    (clinical_finding (snomed_concept "Feeling agitated" "finding"))
    (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
    (clinical_finding (snomed_concept "Trachea displaced" "disorder"))
    (clinical_finding (snomed_concept "Hemoptysis" "finding") (qualifier (snomed_concept "Recent" "qualifier value")))
  )
)

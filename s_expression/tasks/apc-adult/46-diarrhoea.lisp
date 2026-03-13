;; Page 46 - Diarrhoea
(task
  "Check for urgent diarrhoea conditions"
  adult
  (clinical_finding (snomed_concept "Diarrhea" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Thirst due to water deprivation" "finding"))
    (clinical_finding (snomed_concept "Xerostomia due to dehydration" "disorder"))
    (clinical_finding (snomed_concept "Decreased skin turgor" "finding"))
    (clinical_finding (snomed_concept "Sunken eyes" "finding"))
    (clinical_finding (snomed_concept "Signs of dehydration" "finding"))
    (clinical_finding (snomed_concept "Drowsy" "finding"))
    (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
    (clinical_finding (snomed_concept "Diarrhea" "finding") (qualifier (snomed_concept "Watery" "qualifier value")))
    (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
    (<= (timestamp (clinical_finding (snomed_concept "History of travel with high risk of exposure to communicable disease" "situation")))
        (time_ago 5 days))
  )
)

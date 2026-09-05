;; Page 51 - Abnormal Vaginal Discharge
(task
  "Check for urgent female genitalia conditions"
  adult
  (clinical_finding (snomed_concept "Female genitalia finding" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Delivery finding" "finding"))
    (clinical_finding (snomed_concept "Miscarriage" "disorder"))
    (clinical_finding (snomed_concept "Induced termination of pregnancy" "disorder"))
    (clinical_finding (snomed_concept "Pregnancy" "finding"))
    (clinical_finding (snomed_concept "Missed period" "finding"))
    (clinical_finding (snomed_concept "Abnormal vaginal bleeding" "finding"))
    (clinical_finding (snomed_concept "Abdominal mass" "finding"))
    (clinical_finding (snomed_concept "Abdominal guarding" "finding"))
    (clinical_finding (snomed_concept "Abdominal rigidity" "finding"))
    (clinical_finding (snomed_concept "Rebound tenderness" "finding"))
  )
)

;; Page 57 - Abnormal Vaginal Bleeding
(task
  "Check for urgent vaginal bleeding conditions"
  adult
  (clinical_finding (snomed_concept "Abnormal vaginal bleeding" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Pregnancy" "finding"))
    (<= (timestamp (clinical_finding (snomed_concept "Delivery finding" "finding")))
        (time_ago 6 weeks))
    (<= (timestamp (clinical_finding (snomed_concept "Miscarriage" "disorder")))
        (time_ago 6 weeks))
    (<= (timestamp (clinical_finding (snomed_concept "Induced termination of pregnancy" "disorder")))
        (time_ago 6 weeks))
    (clinical_finding (snomed_concept "Pallor of skin of face" "finding"))
    (clinical_finding (snomed_concept "Dizziness" "finding"))
    (clinical_finding (snomed_concept "Feeling faint" "finding"))
    (clinical_finding (snomed_concept "Chest pain" "finding"))
    (clinical_finding (snomed_concept "Pale conjunctiva" "finding"))
  )
)

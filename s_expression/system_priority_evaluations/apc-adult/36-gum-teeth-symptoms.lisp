;; Page 36 - Gum/Teeth: Urgent dental conditions
(system_priority_evaluation
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Toothache" "finding"))
    (or
      (and
        (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
        (clinical_finding (snomed_concept "Facial swelling" "finding"))
      )
      (clinical_finding (snomed_concept "Unable to eat" "finding"))
      (clinical_finding (snomed_concept "Unable to drink" "finding"))
    )
  )
)

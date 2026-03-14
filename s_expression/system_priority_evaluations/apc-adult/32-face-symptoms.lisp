;; Page 32 - Face: Facial cellulitis with fever
(system_priority_evaluation
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Cellulitis of face" "disorder"))
    (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
  )
)
;; Page 32 - Face: Kidney disease signs with facial swelling
(system_priority_evaluation
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Facial swelling" "finding"))
    (or
      (clinical_finding (snomed_concept "Blood in urine" "finding"))
      (clinical_finding (snomed_concept "Proteinuria" "finding"))
    )
  )
)

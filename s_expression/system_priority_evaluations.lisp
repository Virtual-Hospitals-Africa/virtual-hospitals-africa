(system_priority_evaluation
  all_ages
  Emergency
  (< (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 3)
)
(system_priority_evaluation
  (ages "older child" "younger child")
  Emergency
  (and
    (clinical_finding (snomed_concept "Cold hands" "finding"))
    (any2 (clinical_finding (snomed_concept "Weak arterial pulse" "finding"))
          (clinical_finding (snomed_concept "Pulse fast" "finding"))
          (clinical_finding (snomed_concept "Lethargy" "finding"))
    )
  )
)
(system_priority_evaluation
  all_ages
  Urgent
  (diagnosis
    (snomed_concept "Anaphylaxis" "disorder")
    probable
  )
)

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
;; Cross-cutting: Stroke/TIA signs (asymmetric weakness/numbness + speech or visual disturbance)
(system_priority_evaluation
  adult
  Urgent
  (and
    (or
      (clinical_finding (snomed_concept "Numbness of limbs" "finding"))
      (clinical_finding (snomed_concept "Generalized muscle weakness" "finding"))
    )
    (or
      (clinical_finding (snomed_concept "Difficulty talking" "finding"))
      (clinical_finding (snomed_concept "Visual disturbance" "disorder"))
    )
  )
)

;; Cross-cutting: Stroke/TIA signs
(system_diagnosis_rule
  (diagnosis
    (snomed_concept "Cerebrovascular accident" "disorder")
    possible
  )
  adult
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

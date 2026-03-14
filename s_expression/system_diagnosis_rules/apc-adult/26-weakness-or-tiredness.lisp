;; Page 26 - Heart failure likely with orthopnea and leg swelling
(system_diagnosis_rule
  (diagnosis
    (snomed_concept "Heart failure" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Orthopnea" "finding"))
    (clinical_finding (snomed_concept "Leg swelling symptom" "finding"))
  )
)

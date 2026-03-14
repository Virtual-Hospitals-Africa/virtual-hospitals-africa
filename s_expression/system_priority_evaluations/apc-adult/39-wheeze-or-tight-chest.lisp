;; Page 39 - Wheeze: Severe wheeze
(system_priority_evaluation
  adult
  Emergency
  (and
    (clinical_finding (snomed_concept "Wheezing" "finding"))
    (or
      (>= (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 30)
      (>= (measurement (snomed_concept "Heart rate" "observable entity") bpm) 120)
      (clinical_finding (snomed_concept "Feeling agitated" "finding"))
      (clinical_finding (snomed_concept "Drowsy" "finding"))
      (clinical_finding (snomed_concept "Confusional state" "disorder"))
    )
  )
)

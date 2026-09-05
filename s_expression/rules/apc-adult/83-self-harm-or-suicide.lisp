;; Page 83 - Self Harm or Suicide
(task
  "Check for urgent self-harm or suicide conditions"
  adult
  (or
    (clinical_finding (snomed_concept "Self-injurious behavior" "finding"))
    (clinical_finding (snomed_concept "Suicide" "event")))
  (check_for
    (clinical_finding (snomed_concept "Intentionally harming self" "event"))
    (clinical_finding (snomed_concept "Suicide attempt" "event"))
    (clinical_finding (snomed_concept "Suicidal thoughts" "finding"))
    (clinical_finding (snomed_concept "Planning suicide" "finding"))
    (clinical_finding (snomed_concept "Feeling agitated" "finding"))
    (clinical_finding (snomed_concept "Physical aggression" "finding"))
    (clinical_finding (snomed_concept "At increased risk of self-injurious behavior" "finding"))
    (clinical_finding (snomed_concept "High suicide risk" "finding"))
  )
)

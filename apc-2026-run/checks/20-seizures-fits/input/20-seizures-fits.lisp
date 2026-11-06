(task
  "Check for unconsciousness in the fitting patient"
  adult
  (clinical_finding (snomed_concept "Seizure" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Unconscious" "finding"))
  )
)
(system_priority_evaluation
  "Emergency: unconscious and fitting (seizures/fits)"
  adult
  Emergency
  (and
    (clinical_finding (snomed_concept "Seizure" "finding"))
    (clinical_finding (snomed_concept "Unconscious" "finding"))
  )
)

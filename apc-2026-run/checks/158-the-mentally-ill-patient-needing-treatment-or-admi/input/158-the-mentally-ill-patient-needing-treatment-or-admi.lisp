(task
  "Check for urgent risks in the mentally ill patient needing admission"
  adult
  (clinical_finding (snomed_concept "Mental disorder" "disorder"))
  (check_for

    (clinical_finding (snomed_concept "At increased risk of self-injurious behavior" "finding"))
    (clinical_finding (snomed_concept "At increased risk for suicide" "finding"))
    (clinical_finding (snomed_concept "High risk of harm to others" "finding"))


    (clinical_finding (snomed_concept "At increased risk for destructive behavior to property" "finding"))
  )
)
(system_priority_evaluation
  "Urgent: mentally ill patient at risk of harm or property damage if referral delayed"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Mental disorder" "disorder"))
    (or
      (clinical_finding (snomed_concept "At increased risk of self-injurious behavior" "finding"))
      (clinical_finding (snomed_concept "At increased risk for suicide" "finding"))
      (clinical_finding (snomed_concept "High risk of harm to others" "finding"))
      (clinical_finding (snomed_concept "At increased risk for destructive behavior to property" "finding"))
    )
  )
)

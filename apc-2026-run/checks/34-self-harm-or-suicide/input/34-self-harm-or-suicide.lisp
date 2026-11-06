(task
  "Check for self-harm or suicide risk"
  adult

  (or (clinical_finding (snomed_concept "Suicide attempt" "event"))
      (clinical_finding (snomed_concept "Intentionally harming self" "event"))
      (clinical_finding (snomed_concept "Suicidal thoughts" "finding"))
      (clinical_finding (snomed_concept "Thoughts of self harm" "finding"))
  )
  (check_for

    (clinical_finding (snomed_concept "Suicidal thoughts" "finding") (qualifier (snomed_concept "Current" "qualifier value")))
    (clinical_finding (snomed_concept "Planning suicide" "finding") (qualifier (snomed_concept "Current" "qualifier value")))


    (clinical_finding (snomed_concept "Planning suicide" "finding"))
    (clinical_finding (snomed_concept "History of attempted suicide" "situation"))
    (clinical_finding (snomed_concept "History of deliberate self harm" "situation"))


    (clinical_finding (snomed_concept "Feeling agitated" "finding"))
    (clinical_finding (snomed_concept "Aggressive behavior" "finding"))
    (clinical_finding (snomed_concept "Distress" "finding"))
    (clinical_finding (snomed_concept "Does not communicate" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose probable high risk of self-harm or suicide"
  (diagnosis
    (snomed_concept "High suicide risk" "finding")
    probable
  )
  adult
  (or

    (clinical_finding (snomed_concept "Suicidal thoughts" "finding") (qualifier (snomed_concept "Current" "qualifier value")))
    (clinical_finding (snomed_concept "Planning suicide" "finding") (qualifier (snomed_concept "Current" "qualifier value")))

    (and
      (or (<= (onset (clinical_finding (snomed_concept "Thoughts of self harm" "finding"))) (time_ago 1 months))
          (<= (onset (clinical_finding (snomed_concept "Suicidal thoughts" "finding"))) (time_ago 1 months))
          (<= (onset (clinical_finding (snomed_concept "Planning suicide" "finding"))) (time_ago 1 months))
          (<= (onset (clinical_finding (snomed_concept "History of attempted suicide" "situation"))) (time_ago 1 years))
          (<= (onset (clinical_finding (snomed_concept "History of deliberate self harm" "situation"))) (time_ago 1 years))
      )
      (or (clinical_finding (snomed_concept "Feeling agitated" "finding"))
          (clinical_finding (snomed_concept "Aggressive behavior" "finding"))
          (clinical_finding (snomed_concept "Distress" "finding"))
          (clinical_finding (snomed_concept "Does not communicate" "finding"))
      )
    )
  )
)
(system_diagnosis_rule
  "Diagnose probable low risk of self-harm or suicide"
  (diagnosis
    (snomed_concept "At low risk for suicide" "finding")
    probable
  )
  adult

  (and
    (no (clinical_finding (snomed_concept "Suicide attempt" "event")))
    (no (clinical_finding (snomed_concept "Intentionally harming self" "event")))
    (no (clinical_finding (snomed_concept "Suicidal thoughts" "finding") (qualifier (snomed_concept "Current" "qualifier value"))))
    (no (clinical_finding (snomed_concept "Planning suicide" "finding") (qualifier (snomed_concept "Current" "qualifier value"))))
    (no (clinical_finding (snomed_concept "Feeling agitated" "finding")))
    (no (clinical_finding (snomed_concept "Aggressive behavior" "finding")))
    (no (clinical_finding (snomed_concept "Distress" "finding")))
    (no (clinical_finding (snomed_concept "Does not communicate" "finding")))
  )
)
(system_priority_evaluation
  "Urgent: attempted/considered self-harm or suicide"
  adult
  Urgent

  (or (clinical_finding (snomed_concept "Suicide attempt" "event"))
      (clinical_finding (snomed_concept "Intentionally harming self" "event"))
      (clinical_finding (snomed_concept "Thoughts of self harm" "finding"))
      (active_condition (snomed_concept "High suicide risk" "finding"))
  )
)

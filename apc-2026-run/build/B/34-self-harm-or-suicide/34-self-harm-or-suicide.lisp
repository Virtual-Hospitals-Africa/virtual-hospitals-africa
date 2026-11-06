;; Page 34 - Self-harm or suicide
;; See 34-self-harm-or-suicide-flowchart.md for the red-box algorithm.
(task
  "Check for self-harm or suicide risk"
  adult
  ;; Presenting complaint: attempted/considered self-harm or suicide
  (or (clinical_finding (snomed_concept "Suicide attempt" "event"))
      (clinical_finding (snomed_concept "Intentionally harming self" "event"))
      (clinical_finding (snomed_concept "Suicidal thoughts" "finding"))
      (clinical_finding (snomed_concept "Thoughts of self harm" "finding")))
  (check_for
    ;; Q2: current thoughts or plans to attempt suicide
    (clinical_finding (snomed_concept "Suicidal thoughts" "finding") (qualifier (snomed_concept "Current" "qualifier value")))
    (clinical_finding (snomed_concept "Planning suicide" "finding") (qualifier (snomed_concept "Current" "qualifier value")))

    ;; Q3: thoughts/plans in past month, act of self-harm or suicide in past year
    (clinical_finding (snomed_concept "Planning suicide" "finding"))
    (clinical_finding (snomed_concept "Suicide attempt" "event") (qualifier (snomed_concept "In the past" "qualifier value")))
    (clinical_finding (snomed_concept "Intentionally harming self" "event") (qualifier (snomed_concept "In the past" "qualifier value")))

    ;; Q4: agitated, violent, distressed or uncommunicative
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
    ;; Q1 = No, Q2 = Yes: current thoughts or plans to attempt suicide
    (clinical_finding (snomed_concept "Suicidal thoughts" "finding") (qualifier (snomed_concept "Current" "qualifier value")))
    (clinical_finding (snomed_concept "Planning suicide" "finding") (qualifier (snomed_concept "Current" "qualifier value")))
    ;; Q2 = No, Q3 = Yes, Q4 = Yes
    (and
      (or (<= (onset (clinical_finding (snomed_concept "Suicidal thoughts" "finding"))) (time_ago 1 months))
          (<= (onset (clinical_finding (snomed_concept "Thoughts of self harm" "finding"))) (time_ago 1 months))
          (<= (onset (clinical_finding (snomed_concept "Planning suicide" "finding"))) (time_ago 1 months))
          (<= (onset (clinical_finding (snomed_concept "Suicide attempt" "event") (qualifier (snomed_concept "In the past" "qualifier value")))) (time_ago 1 years))
          (<= (onset (clinical_finding (snomed_concept "Intentionally harming self" "event") (qualifier (snomed_concept "In the past" "qualifier value")))) (time_ago 1 years))
      )
      (or (clinical_finding (snomed_concept "Feeling agitated" "finding"))
          (clinical_finding (snomed_concept "Aggressive behavior" "finding"))
          (clinical_finding (snomed_concept "Distress" "finding"))
          (clinical_finding (snomed_concept "Does not communicate" "finding"))
      )
    )
  )
)
(system_priority_evaluation
  "Urgent: attempted self-harm or suicide"
  adult
  Urgent
  ;; Q1 = Yes
  (or (clinical_finding (snomed_concept "Suicide attempt" "event"))
      (clinical_finding (snomed_concept "Intentionally harming self" "event")))
)
(system_priority_evaluation
  "Urgent: high risk of self-harm or suicide"
  adult
  Urgent
  (active_condition (snomed_concept "High suicide risk" "finding"))
)

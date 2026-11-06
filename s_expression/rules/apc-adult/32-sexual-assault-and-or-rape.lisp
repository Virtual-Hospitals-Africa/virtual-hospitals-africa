;; Page 32 - Sexual assault and/or rape
(task
  "Check for urgent sexual assault/rape conditions"
  adult
  (or (clinical_finding (snomed_concept "Sexual assault" "event"))
      (clinical_finding (snomed_concept "Rape" "event")))
  (check_for
    ;; "within last 5 days if woman or last 3 days if man"
    (clinical_finding (snomed_concept "Female" "finding"))
    (clinical_finding (snomed_concept "Male" "finding"))

    (clinical_finding (snomed_concept "Pregnancy" "finding"))

    (clinical_finding (snomed_concept "Traumatic injury" "disorder"))

    (clinical_finding (snomed_concept "Suicidal thoughts" "finding"))
    (clinical_finding (snomed_concept "Planning suicide" "finding"))
    (clinical_finding (snomed_concept "Overdose" "disorder"))
    (clinical_finding (snomed_concept "Intentionally harming self" "event"))
  )
)
(system_priority_evaluation
  "Urgent: sexual assault/rape with urgent features"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Sexual assault" "event"))
        (clinical_finding (snomed_concept "Rape" "event")))
    (or
      ;; Sexual assault/rape within last 5 days if woman
      (and (clinical_finding (snomed_concept "Female" "finding"))
           (or (<= (onset (clinical_finding (snomed_concept "Sexual assault" "event"))) (time_ago 5 days))
               (<= (onset (clinical_finding (snomed_concept "Rape" "event"))) (time_ago 5 days))))
      ;; ... or last 3 days if man
      (and (clinical_finding (snomed_concept "Male" "finding"))
           (or (<= (onset (clinical_finding (snomed_concept "Sexual assault" "event"))) (time_ago 3 days))
               (<= (onset (clinical_finding (snomed_concept "Rape" "event"))) (time_ago 3 days))))
      (clinical_finding (snomed_concept "Pregnancy" "finding"))
      (clinical_finding (snomed_concept "Traumatic injury" "disorder"))
      (clinical_finding (snomed_concept "Suicidal thoughts" "finding"))
      (clinical_finding (snomed_concept "Planning suicide" "finding"))
      (clinical_finding (snomed_concept "Overdose" "disorder"))
      (clinical_finding (snomed_concept "Intentionally harming self" "event"))
    )
  )
)

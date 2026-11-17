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
;; Sexual assault/rape within last 5 days if woman
(system_priority_evaluation
  "Urgent: sexual assault/rape with female and onset of sexual assault ≤ 5 days ago or onset of rape ≤ 5 days ago"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Sexual assault" "event"))
        (clinical_finding (snomed_concept "Rape" "event")))
    (clinical_finding (snomed_concept "Female" "finding"))
    (or (<= (onset (clinical_finding (snomed_concept "Sexual assault" "event"))) (time_ago 5 days))
        (<= (onset (clinical_finding (snomed_concept "Rape" "event"))) (time_ago 5 days)))
  )
)
;; ... or last 3 days if man
(system_priority_evaluation
  "Urgent: sexual assault/rape with male and onset of sexual assault ≤ 3 days ago or onset of rape ≤ 3 days ago"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Sexual assault" "event"))
        (clinical_finding (snomed_concept "Rape" "event")))
    (clinical_finding (snomed_concept "Male" "finding"))
    (or (<= (onset (clinical_finding (snomed_concept "Sexual assault" "event"))) (time_ago 3 days))
        (<= (onset (clinical_finding (snomed_concept "Rape" "event"))) (time_ago 3 days)))
  )
)

(system_priority_evaluation
  "Urgent: sexual assault/rape with pregnancy"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Sexual assault" "event"))
        (clinical_finding (snomed_concept "Rape" "event")))
    (clinical_finding (snomed_concept "Pregnancy" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: sexual assault/rape with traumatic injury"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Sexual assault" "event"))
        (clinical_finding (snomed_concept "Rape" "event")))
    (clinical_finding (snomed_concept "Traumatic injury" "disorder"))
  )
)

(system_priority_evaluation
  "Urgent: sexual assault/rape with suicidal thoughts"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Sexual assault" "event"))
        (clinical_finding (snomed_concept "Rape" "event")))
    (clinical_finding (snomed_concept "Suicidal thoughts" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: sexual assault/rape with planning suicide"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Sexual assault" "event"))
        (clinical_finding (snomed_concept "Rape" "event")))
    (clinical_finding (snomed_concept "Planning suicide" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: sexual assault/rape with overdose"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Sexual assault" "event"))
        (clinical_finding (snomed_concept "Rape" "event")))
    (clinical_finding (snomed_concept "Overdose" "disorder"))
  )
)

(system_priority_evaluation
  "Urgent: sexual assault/rape with intentionally harming self"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Sexual assault" "event"))
        (clinical_finding (snomed_concept "Rape" "event")))
    (clinical_finding (snomed_concept "Intentionally harming self" "event"))
  )
)

(task
  "Check for urgent aggressive/disruptive behaviour signs"
  adult
  (or (clinical_finding (snomed_concept "Aggressive behavior" "finding"))
      (clinical_finding (snomed_concept "Disruptive behavior" "finding")))
  (check_for

    (clinical_finding (snomed_concept "Anger reaction" "finding"))


    (clinical_finding (snomed_concept "Challenging behavior" "finding"))
    (clinical_finding (snomed_concept "Verbally abusive behavior" "finding"))
    (clinical_finding (snomed_concept "Provocative behavior" "finding"))


    (clinical_finding (snomed_concept "Feeling physically tense" "finding"))


    (clinical_finding (snomed_concept "Verbal aggression" "finding"))


    (clinical_finding (snomed_concept "Restlessness" "finding"))
    (clinical_finding (snomed_concept "Pacing up and down" "finding"))


    (clinical_finding (snomed_concept "Physical aggression" "finding"))
    (clinical_finding (snomed_concept "Destructive behavior" "finding"))
  )
)
(system_priority_evaluation
  "Urgent: aggressive/disruptive patient with signs of escalating aggression"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Aggressive behavior" "finding"))
        (clinical_finding (snomed_concept "Disruptive behavior" "finding")))
    (or (clinical_finding (snomed_concept "Anger reaction" "finding"))
        (clinical_finding (snomed_concept "Challenging behavior" "finding"))
        (clinical_finding (snomed_concept "Verbally abusive behavior" "finding"))
        (clinical_finding (snomed_concept "Provocative behavior" "finding"))
        (clinical_finding (snomed_concept "Feeling physically tense" "finding"))
        (clinical_finding (snomed_concept "Verbal aggression" "finding"))
        (clinical_finding (snomed_concept "Restlessness" "finding"))
        (clinical_finding (snomed_concept "Pacing up and down" "finding"))
        (clinical_finding (snomed_concept "Physical aggression" "finding"))
        (clinical_finding (snomed_concept "Destructive behavior" "finding")))
  )
)

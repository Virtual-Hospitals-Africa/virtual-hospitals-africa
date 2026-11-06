;; Page 35 - Aggressive/Disruptive Behaviour
(task
  "Check for urgent aggressive/disruptive behaviour signs"
  adult
  (or (clinical_finding (snomed_concept "Aggressive behavior" "finding"))
      (clinical_finding (snomed_concept "Disruptive behavior" "finding")))
  (check_for
    (clinical_finding (snomed_concept "Feeling angry" "finding"))
    (clinical_finding (snomed_concept "Challenging behavior" "finding"))
    (clinical_finding (snomed_concept "Provocative behavior" "finding"))

    (clinical_finding (snomed_concept "Feeling tense" "finding"))
    (clinical_finding (snomed_concept "Restlessness" "finding"))
    (clinical_finding (snomed_concept "Pacing up and down" "finding"))

    (clinical_finding (snomed_concept "Verbal aggression" "finding"))
    (clinical_finding (snomed_concept "Physical aggression" "finding"))
  )
)
(system_priority_evaluation
  "Urgent: aggressive/disruptive behaviour with red-box signs"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Aggressive behavior" "finding"))
        (clinical_finding (snomed_concept "Disruptive behavior" "finding")))
    (or
      ;; Angry behaviour
      (clinical_finding (snomed_concept "Feeling angry" "finding"))
      ;; Challenging, insulting or provocative behaviour
      (clinical_finding (snomed_concept "Challenging behavior" "finding"))
      (clinical_finding (snomed_concept "Provocative behavior" "finding"))
      ;; Tense posturing like gripping arm rails tightly, clenching fists
      (clinical_finding (snomed_concept "Feeling tense" "finding"))
      ;; Frequently changing body position, pacing
      (clinical_finding (snomed_concept "Restlessness" "finding"))
      (clinical_finding (snomed_concept "Pacing up and down" "finding"))
      ;; Loud, aggressive speech
      (clinical_finding (snomed_concept "Verbal aggression" "finding"))
      ;; Aggressive acts like pounding walls, throwing objects, hitting
      (clinical_finding (snomed_concept "Physical aggression" "finding"))
    )
  )
)

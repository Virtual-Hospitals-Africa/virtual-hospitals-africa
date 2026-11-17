;; Page 35 - Aggressive/disruptive behaviour
(task
  "Check for urgent aggressive/disruptive behaviour signs"
  adult
  (or (clinical_finding (snomed_concept "Aggressive behavior" "finding"))
      (clinical_finding (snomed_concept "Disruptive behavior" "finding")))
  (check_for
    ;; Angry behaviour
    (clinical_finding (snomed_concept "Anger reaction" "finding"))

    ;; Challenging, insulting or provocative behaviour
    (clinical_finding (snomed_concept "Challenging behavior" "finding"))
    (clinical_finding (snomed_concept "Verbally abusive behavior" "finding"))
    (clinical_finding (snomed_concept "Provocative behavior" "finding"))

    ;; Tense posturing like gripping arm rails tightly, clenching fists
    (clinical_finding (snomed_concept "Feeling physically tense" "finding"))

    ;; Loud, aggressive speech
    (clinical_finding (snomed_concept "Verbal aggression" "finding"))

    ;; Frequently changing body position, pacing
    (clinical_finding (snomed_concept "Restlessness" "finding"))
    (clinical_finding (snomed_concept "Pacing up and down" "finding"))

    ;; Aggressive acts like pounding walls, throwing objects, hitting
    (clinical_finding (snomed_concept "Physical aggression" "finding"))
    (clinical_finding (snomed_concept "Destructive behavior" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: aggressive/disruptive patient with signs of escalating aggression: anger reaction"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Aggressive behavior" "finding"))
        (clinical_finding (snomed_concept "Disruptive behavior" "finding")))
    (clinical_finding (snomed_concept "Anger reaction" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: aggressive/disruptive patient with signs of escalating aggression: challenging behavior"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Aggressive behavior" "finding"))
        (clinical_finding (snomed_concept "Disruptive behavior" "finding")))
    (clinical_finding (snomed_concept "Challenging behavior" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: aggressive/disruptive patient with signs of escalating aggression: verbally abusive behavior"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Aggressive behavior" "finding"))
        (clinical_finding (snomed_concept "Disruptive behavior" "finding")))
    (clinical_finding (snomed_concept "Verbally abusive behavior" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: aggressive/disruptive patient with signs of escalating aggression: provocative behavior"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Aggressive behavior" "finding"))
        (clinical_finding (snomed_concept "Disruptive behavior" "finding")))
    (clinical_finding (snomed_concept "Provocative behavior" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: aggressive/disruptive patient with signs of escalating aggression: feeling physically tense"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Aggressive behavior" "finding"))
        (clinical_finding (snomed_concept "Disruptive behavior" "finding")))
    (clinical_finding (snomed_concept "Feeling physically tense" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: aggressive/disruptive patient with signs of escalating aggression: verbal aggression"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Aggressive behavior" "finding"))
        (clinical_finding (snomed_concept "Disruptive behavior" "finding")))
    (clinical_finding (snomed_concept "Verbal aggression" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: aggressive/disruptive patient with signs of escalating aggression: restlessness"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Aggressive behavior" "finding"))
        (clinical_finding (snomed_concept "Disruptive behavior" "finding")))
    (clinical_finding (snomed_concept "Restlessness" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: aggressive/disruptive patient with signs of escalating aggression: pacing up and down"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Aggressive behavior" "finding"))
        (clinical_finding (snomed_concept "Disruptive behavior" "finding")))
    (clinical_finding (snomed_concept "Pacing up and down" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: aggressive/disruptive patient with signs of escalating aggression: physical aggression"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Aggressive behavior" "finding"))
        (clinical_finding (snomed_concept "Disruptive behavior" "finding")))
    (clinical_finding (snomed_concept "Physical aggression" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: aggressive/disruptive patient with signs of escalating aggression: destructive behavior"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Aggressive behavior" "finding"))
        (clinical_finding (snomed_concept "Disruptive behavior" "finding")))
    (clinical_finding (snomed_concept "Destructive behavior" "finding"))
  )
)

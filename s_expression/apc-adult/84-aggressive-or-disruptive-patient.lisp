;; Page 84 - Aggressive or Disruptive Patient
(task
  "Check for urgent aggressive or disruptive conditions"
  adult
  (or
    (clinical_finding (snomed_concept "Aggressive behavior" "finding"))
    (clinical_finding (snomed_concept "Disruptive behavior" "finding")))
  (check_for
    (clinical_finding (snomed_concept "Feeling angry" "finding"))
    (clinical_finding (snomed_concept "Challenging behavior" "finding"))
    (clinical_finding (snomed_concept "Hostile behavior" "finding"))
    (clinical_finding (snomed_concept "Provocative behavior" "finding"))
    (clinical_finding (snomed_concept "Loudness" "finding"))
    (clinical_finding (snomed_concept "Aggressive outburst" "finding"))
    (clinical_finding (snomed_concept "Restlessness" "finding"))
    (clinical_finding (snomed_concept "Pacing up and down" "finding"))
    (clinical_finding (snomed_concept "Posturing behavior" "finding"))
    (clinical_finding (snomed_concept "Feeling tense" "finding"))
    (clinical_finding (snomed_concept "Physical aggression" "finding"))
    (clinical_finding (snomed_concept "Hitting other person" "finding"))
  )
)

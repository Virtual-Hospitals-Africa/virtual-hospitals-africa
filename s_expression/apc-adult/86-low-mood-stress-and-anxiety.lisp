;; Page 86 - Low Mood, Stress and Anxiety
(task
  "Check for urgent low mood, stress and anxiety conditions"
  adult
  (or
    (clinical_finding (snomed_concept "Feeling unhappy" "finding"))
    (clinical_finding (snomed_concept "Stress" "finding"))
    (clinical_finding (snomed_concept "Anxiety" "finding")))
  (check_for
    (clinical_finding (snomed_concept "Intentionally harming self" "event"))
    (clinical_finding (snomed_concept "Suicide attempt" "event"))
    (clinical_finding (snomed_concept "Suicidal thoughts" "finding"))
    (clinical_finding (snomed_concept "Planning suicide" "finding"))
    (clinical_finding (snomed_concept "Feeling agitated" "finding"))
    (clinical_finding (snomed_concept "Physical aggression" "finding"))
    (clinical_finding (snomed_concept "Feeling upset" "finding"))
    (clinical_finding (snomed_concept "Does not communicate" "finding"))
    (<= (timestamp (clinical_finding (snomed_concept "Suicidal thoughts" "finding")))
        (time_ago 1 months))
    (<= (timestamp (clinical_finding (snomed_concept "Planning suicide" "finding")))
        (time_ago 1 months))
    (<= (timestamp (clinical_finding (snomed_concept "Intentionally harming self" "event")))
        (time_ago 1 years))
    (<= (timestamp (clinical_finding (snomed_concept "Suicide attempt" "event")))
        (time_ago 1 years))
    (clinical_finding (snomed_concept "At increased risk of self-injurious behavior" "finding"))
    (clinical_finding (snomed_concept "High suicide risk" "finding"))
  )
)

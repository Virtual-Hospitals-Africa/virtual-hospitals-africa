(task
  "Check for cholera (cholera page)"
  adult
  (clinical_finding (snomed_concept "Diarrhea" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Diarrhea" "finding") (qualifier (snomed_concept "Watery" "qualifier value")))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Vibrio cholerae" "organism"))
  )
)
(task
  "Check for level of dehydration in cholera"
  adult
  (active_condition (snomed_concept "Cholera" "disorder"))
  (check_for

    (clinical_finding (snomed_concept "Drowsy" "finding"))
    (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
    (clinical_finding (snomed_concept "Acute confusion" "finding"))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    (clinical_finding (snomed_concept "Weak arterial pulse" "finding"))


    (clinical_finding (snomed_concept "Unable to drink" "finding"))
    (clinical_finding (snomed_concept "Difficulty drinking" "finding"))
    (clinical_finding (snomed_concept "Decreased skin turgor" "finding"))
    (clinical_finding (snomed_concept "Sunken eyes" "finding"))


    (clinical_finding (snomed_concept "Restlessness" "finding"))
    (clinical_finding (snomed_concept "Increased thirst" "finding"))
    (clinical_finding (snomed_concept "Xerostomia" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose probable cholera"
  (diagnosis
    (snomed_concept "Cholera" "disorder")
    probable
  )
  adult

  (and
    (clinical_finding (snomed_concept "Diarrhea" "finding") (qualifier (snomed_concept "Watery" "qualifier value")))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Vibrio cholerae" "organism"))
    (<= (onset (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Vibrio cholerae" "organism"))) (time_ago 5 days))
  )
)
(system_diagnosis_rule
  "Diagnose probable some dehydration in cholera"
  (diagnosis
    (snomed_concept "Moderate dehydration" "disorder")
    probable
  )
  adult

  (and
    (active_condition (snomed_concept "Cholera" "disorder"))


    (no (clinical_finding (snomed_concept "Drowsy" "finding")))
    (no (clinical_finding (snomed_concept "Decreased level of consciousness" "finding")))
    (no (clinical_finding (snomed_concept "Acute confusion" "finding")))
    (no (clinical_finding (snomed_concept "Difficulty breathing" "finding")))
    (no (clinical_finding (snomed_concept "Weak arterial pulse" "finding")))
    (any2
      (and (no (clinical_finding (snomed_concept "Unable to drink" "finding")))
           (no (clinical_finding (snomed_concept "Difficulty drinking" "finding")))
      )
      (no (clinical_finding (snomed_concept "Decreased skin turgor" "finding")))
      (no (clinical_finding (snomed_concept "Sunken eyes" "finding")))
    )
    (any2
      (clinical_finding (snomed_concept "Restlessness" "finding"))
      (clinical_finding (snomed_concept "Increased thirst" "finding"))
      (clinical_finding (snomed_concept "Xerostomia" "finding"))
      (>= (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 100)
    )
  )
)
(system_priority_evaluation
  "Urgent: cholera with severe dehydration"
  adult
  Urgent

  (and
    (active_condition (snomed_concept "Cholera" "disorder"))
    (or
      (clinical_finding (snomed_concept "Drowsy" "finding"))
      (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
      (clinical_finding (snomed_concept "Acute confusion" "finding"))
      (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
      (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
      (clinical_finding (snomed_concept "Weak arterial pulse" "finding"))
      (any2
        (or (clinical_finding (snomed_concept "Unable to drink" "finding"))
            (clinical_finding (snomed_concept "Difficulty drinking" "finding"))
        )
        (clinical_finding (snomed_concept "Decreased skin turgor" "finding"))
        (clinical_finding (snomed_concept "Sunken eyes" "finding"))
      )
    )
  )
)
(system_priority_evaluation
  "Urgent: cholera with some dehydration"
  adult
  Urgent

  (active_condition (snomed_concept "Moderate dehydration" "disorder"))
)

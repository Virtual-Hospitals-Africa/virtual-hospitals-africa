;; Page 59 - Cholera
(task
  "Check for cholera"
  adult
  (clinical_finding (snomed_concept "Diarrhea" "finding"))
  (check_for
    ;; "watery diarrhoea (with or without vomiting)"
    (clinical_finding (snomed_concept "Diarrhea" "finding") (qualifier (snomed_concept "Watery" "qualifier value")))

    ;; "has been in cholera outbreak area in past 5 days"
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Vibrio cholerae" "organism"))
  )
)
;; Page 59 - Cholera: decide on management according to level of dehydration
(task
  "Check for dehydration in cholera"
  adult
  (active_condition (snomed_concept "Cholera" "disorder"))
  (check_for
    ;; Severe dehydration: any of
    (clinical_finding (snomed_concept "Drowsy" "finding"))
    (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
    (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    (clinical_finding (snomed_concept "Weak arterial pulse" "finding"))

    ;; Severe dehydration: >= 2 of
    (clinical_finding (snomed_concept "Unable to drink" "finding"))
    (clinical_finding (snomed_concept "Difficulty drinking" "finding"))
    (clinical_finding (snomed_concept "Decreased skin turgor" "finding"))
    (clinical_finding (snomed_concept "Sunken eyes" "finding"))

    ;; Some dehydration: >= 2 of (with pulse >= 100, a routine vital)
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
  ;; "If patient has watery diarrhoea (with or without vomiting) and has been in cholera outbreak area in past 5 days, cholera likely."
  (and
    (clinical_finding (snomed_concept "Diarrhea" "finding") (qualifier (snomed_concept "Watery" "qualifier value")))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Vibrio cholerae" "organism"))
    (<= (onset (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Vibrio cholerae" "organism"))) (time_ago 5 days))
  )
)
(system_diagnosis_rule
  "Diagnose probable severe dehydration in cholera"
  (diagnosis
    (snomed_concept "Severe dehydration" "disorder")
    probable
  )
  adult
  ;; Q1 = Yes (see 59-cholera-flowchart.md)
  (and
    (active_condition (snomed_concept "Cholera" "disorder"))
    (or
      (clinical_finding (snomed_concept "Drowsy" "finding"))
      (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
      (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
      (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
      (clinical_finding (snomed_concept "Weak arterial pulse" "finding"))
      (any2
        (or (clinical_finding (snomed_concept "Unable to drink" "finding"))
            (clinical_finding (snomed_concept "Difficulty drinking" "finding")))
        (clinical_finding (snomed_concept "Decreased skin turgor" "finding"))
        (clinical_finding (snomed_concept "Sunken eyes" "finding"))
      )
    )
  )
)
(system_diagnosis_rule
  "Diagnose probable some dehydration in cholera"
  (diagnosis
    (snomed_concept "Dehydration" "disorder")
    probable
  )
  adult
  ;; Q1 = No -> Q2 = Yes (see 59-cholera-flowchart.md)
  (and
    (active_condition (snomed_concept "Cholera" "disorder"))
    ;; Q1 = No, written with recorded negatives: none of the "any of" items, and at most one of the
    ;; ">= 2 of" items present (i.e. at least two of those groups recorded absent).
    (no (clinical_finding (snomed_concept "Drowsy" "finding")))
    (no (clinical_finding (snomed_concept "Decreased level of consciousness" "finding")))
    (no (clinical_finding (snomed_concept "Clouded consciousness" "finding")))
    (no (clinical_finding (snomed_concept "Difficulty breathing" "finding")))
    (no (clinical_finding (snomed_concept "Weak arterial pulse" "finding")))
    (any2
      (and (no (clinical_finding (snomed_concept "Unable to drink" "finding")))
           (no (clinical_finding (snomed_concept "Difficulty drinking" "finding"))))
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
  "Urgent: severe dehydration in cholera"
  adult
  Urgent
  ;; "Manage as severe dehydration and refer urgently"
  (active_condition (snomed_concept "Severe dehydration" "disorder"))
)

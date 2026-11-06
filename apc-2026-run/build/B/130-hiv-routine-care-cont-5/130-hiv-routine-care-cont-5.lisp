;; Page 130 - HIV: Routine care (cont. 5)
;; STEP 4. Check if there is a reason to delay ART (see 130-hiv-routine-care-cont-5-flowchart.md)
(task
  "Check for danger signs before starting ART"
  adult
  (clinical_finding (snomed_concept "Human immunodeficiency virus infection" "disorder"))
  (check_for
    ;; Breathing
    (clinical_finding (snomed_concept "Dyspnea at rest" "finding"))
    (clinical_finding (snomed_concept "Unable to complete a sentence in one breath" "finding"))
    (clinical_finding (snomed_concept "Hemoptysis" "finding"))

    ;; Mobility
    (clinical_finding (snomed_concept "Unable to walk" "finding"))
    (clinical_finding (snomed_concept "Dependent for walking" "finding"))

    ;; Consciousness and behaviour
    (clinical_finding (snomed_concept "Drowsy" "finding"))
    (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
    (clinical_finding (snomed_concept "Seizure" "finding"))
    (clinical_finding (snomed_concept "Aggressive behavior" "finding"))
    (clinical_finding (snomed_concept "Feeling agitated" "finding"))

    ;; Neurological
    (clinical_finding (snomed_concept "Stiff neck" "finding"))
    (clinical_finding (snomed_concept "Muscle weakness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Visual disturbance" "disorder") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
  )
)
(task
  "Check for TB before starting ART"
  adult
  (clinical_finding (snomed_concept "Human immunodeficiency virus infection" "disorder"))
  (check_for
    ;; Is patient known with TB?
    (clinical_finding (snomed_concept "Tuberculosis" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))

    ;; TB symptom screen
    (clinical_finding (snomed_concept "Cough" "finding"))
    (clinical_finding (snomed_concept "Weight decreased" "finding"))
    (clinical_finding (snomed_concept "Night sweats" "finding"))
    (clinical_finding (snomed_concept "Chest pain" "finding"))
    (clinical_finding (snomed_concept "Bloodstained sputum" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose possible TB before starting ART"
  (diagnosis
    (snomed_concept "Tuberculosis" "disorder")
    possible
  )
  adult
  ;; Not known with TB, and any TB symptom → "Exclude TB 102"
  (and
    (clinical_finding (snomed_concept "Human immunodeficiency virus infection" "disorder"))
    (no (clinical_finding (snomed_concept "Tuberculosis" "disorder") (qualifier (snomed_concept "Known present" "qualifier value"))))
    (or
      (clinical_finding (snomed_concept "Cough" "finding"))
      (clinical_finding (snomed_concept "Weight decreased" "finding"))
      (clinical_finding (snomed_concept "Night sweats" "finding"))
      (active_condition (snomed_concept "Fever" "finding"))
      (clinical_finding (snomed_concept "Chest pain" "finding"))
      (clinical_finding (snomed_concept "Bloodstained sputum" "finding"))
    )
  )
)
(system_priority_evaluation
  "Urgent: HIV danger signs before starting ART"
  adult
  Urgent
  ;; Red box: "If any of the following danger signs, delay starting ART and refer same day"
  (and
    (clinical_finding (snomed_concept "Human immunodeficiency virus infection" "disorder"))
    (or
      (>= (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 30)
      (clinical_finding (snomed_concept "Dyspnea at rest" "finding"))
      (clinical_finding (snomed_concept "Unable to complete a sentence in one breath" "finding"))
      (clinical_finding (snomed_concept "Unable to walk" "finding"))
      (clinical_finding (snomed_concept "Dependent for walking" "finding"))
      (clinical_finding (snomed_concept "Drowsy" "finding"))
      (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
      (clinical_finding (snomed_concept "Seizure" "finding"))
      (>= (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 120)
      (clinical_finding (snomed_concept "Hemoptysis" "finding"))
      (clinical_finding (snomed_concept "Aggressive behavior" "finding"))
      (clinical_finding (snomed_concept "Feeling agitated" "finding"))
      (clinical_finding (snomed_concept "Stiff neck" "finding"))
      (clinical_finding (snomed_concept "Muscle weakness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Numbness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Visual disturbance" "disorder") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    )
  )
)

;; Page 130 - HIV: Routine care (cont. 5)
;; STEP 4. Check if there is a reason to delay ART (see 130-hiv-routine-care-cont-5-flowchart.md)

;; Red box: danger signs that delay ART (respiratory rate and pulse rate are routine vitals)
(task
  "Check for HIV: danger signs before starting ART"
  adult
  (clinical_finding (snomed_concept "Human immunodeficiency virus infection" "disorder"))
  (check_for
    (clinical_finding (snomed_concept "Dyspnea at rest" "finding"))
    (clinical_finding (snomed_concept "Unable to complete a sentence in one breath" "finding"))
    (clinical_finding (snomed_concept "Unable to walk" "finding"))

    (clinical_finding (snomed_concept "Drowsy" "finding"))
    (clinical_finding (snomed_concept "Acute confusion" "finding"))
    (clinical_finding (snomed_concept "Seizure" "finding"))
    (clinical_finding (snomed_concept "Aggressive behavior" "finding"))
    (clinical_finding (snomed_concept "Feeling agitated" "finding"))

    (clinical_finding (snomed_concept "Hemoptysis" "finding"))

    (clinical_finding (snomed_concept "Stiff neck" "finding"))
    (clinical_finding (snomed_concept "Muscle weakness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Visual disturbance" "disorder") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
  )
)

;; Flowchart: TB screen (Q1, Q2) and signs of meningitis (Q6)
(task
  "Check for HIV: TB symptoms and signs of meningitis before starting ART"
  adult
  (clinical_finding (snomed_concept "Human immunodeficiency virus infection" "disorder"))
  (check_for
    (clinical_finding (snomed_concept "Tuberculosis" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))

    (clinical_finding (snomed_concept "Cough" "finding"))
    (clinical_finding (snomed_concept "Weight decreased" "finding"))
    (clinical_finding (snomed_concept "Night sweats" "finding"))
    (clinical_finding (snomed_concept "Chest pain" "finding"))
    (clinical_finding (snomed_concept "Bloodstained sputum" "finding"))

    (clinical_finding (snomed_concept "Headache" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
  )
)

;; Q1 = No, Q2 = Yes: "Exclude TB"
(system_diagnosis_rule
  "Diagnose possible TB in HIV patient before starting ART"
  (diagnosis
    (snomed_concept "Tuberculosis" "disorder")
    possible
  )
  adult
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

;; Red box: "delay starting ART and refer same day"
(system_priority_evaluation
  "Urgent: HIV danger signs before starting ART"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Human immunodeficiency virus infection" "disorder"))
    (or
      (>= (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 30)
      (>= (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 120)
      (clinical_finding (snomed_concept "Dyspnea at rest" "finding"))
      (clinical_finding (snomed_concept "Unable to complete a sentence in one breath" "finding"))
      (clinical_finding (snomed_concept "Unable to walk" "finding"))
      (clinical_finding (snomed_concept "Drowsy" "finding"))
      (clinical_finding (snomed_concept "Acute confusion" "finding"))
      (clinical_finding (snomed_concept "Seizure" "finding"))
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

;; Q6: "signs of meningitis (severe headache with neck stiffness/vomiting)" -> "If signs of meningitis, refer urgently"
(system_priority_evaluation
  "Urgent: HIV with signs of meningitis before starting ART"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Human immunodeficiency virus infection" "disorder"))
    (clinical_finding (snomed_concept "Headache" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (or
      (clinical_finding (snomed_concept "Stiff neck" "finding"))
      (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
    )
  )
)

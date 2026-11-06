(task
  "Check for exposure to a malaria area"
  adult
  (or (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
      (clinical_finding (snomed_concept "Headache" "finding"))
      (clinical_finding (snomed_concept "Fatigue" "finding"))
      (clinical_finding (snomed_concept "Muscle pain" "finding"))
      (clinical_finding (snomed_concept "Cough" "finding"))
      (clinical_finding (snomed_concept "Nausea" "finding"))
      (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
      (clinical_finding (snomed_concept "Diarrhea" "finding"))
  )
  (check_for
    (clinical_finding (snomed_concept "History of travel with high risk of exposure to communicable disease" "situation"))

    (clinical_finding (snomed_concept "Headache" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Shivering or rigors" "finding"))
    (clinical_finding (snomed_concept "Pain of joint" "finding"))
    (clinical_finding (snomed_concept "Influenza-like illness" "finding"))
    (clinical_finding (snomed_concept "Dry cough" "finding"))
  )
)
(task
  "Check for urgent signs in suspected malaria"
  adult
  (diagnosis (snomed_concept "Malaria" "disorder") possible)
  (check_for
    (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
    (clinical_finding (snomed_concept "Drowsy" "finding"))
    (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
    (clinical_finding (snomed_concept "Acute confusion" "finding"))
    (clinical_finding (snomed_concept "Seizure" "finding"))
    (clinical_finding (snomed_concept "Post-ictal state" "finding"))

    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    (clinical_finding (snomed_concept "Shock" "disorder"))

    (clinical_finding (snomed_concept "Asthenia" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Diabetes mellitus" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))

    (clinical_finding (snomed_concept "Jaundice" "finding"))
    (clinical_finding (snomed_concept "Bleeds easily" "finding"))
    (clinical_finding (snomed_concept "Easy bruising" "finding"))

    (clinical_finding (snomed_concept "Black urine" "finding"))
    (clinical_finding (snomed_concept "Anuria" "finding"))
    (clinical_finding (snomed_concept "Persistent vomiting" "disorder"))
  )
)
(system_diagnosis_rule
  "Diagnose possible malaria"
  (diagnosis
    (snomed_concept "Malaria" "disorder")
    possible
  )
  adult
  (and

    (<= (onset (clinical_finding (snomed_concept "History of travel with high risk of exposure to communicable disease" "situation"))) (time_ago 3 months))
    (or (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
        (clinical_finding (snomed_concept "Headache" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
        (clinical_finding (snomed_concept "Fatigue" "finding"))
        (clinical_finding (snomed_concept "Shivering or rigors" "finding"))
        (clinical_finding (snomed_concept "Pain of joint" "finding"))
        (clinical_finding (snomed_concept "Muscle pain" "finding"))
        (clinical_finding (snomed_concept "Influenza-like illness" "finding"))
        (clinical_finding (snomed_concept "Dry cough" "finding"))
        (and (clinical_finding (snomed_concept "Nausea" "finding"))
             (clinical_finding (snomed_concept "Finding of vomiting" "finding")))
        (clinical_finding (snomed_concept "Diarrhea" "finding"))
    )
  )
)
(system_diagnosis_rule
  "Diagnose possible complicated (severe) malaria"
  (diagnosis
    (snomed_concept "Complicated malaria" "disorder")
    possible
  )
  adult
  (and
    (diagnosis (snomed_concept "Malaria" "disorder") possible)
    (or (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
        (clinical_finding (snomed_concept "Drowsy" "finding"))
        (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
        (clinical_finding (snomed_concept "Acute confusion" "finding"))
        (> (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 30)
        (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
        (clinical_finding (snomed_concept "Seizure" "finding"))
        (clinical_finding (snomed_concept "Post-ictal state" "finding"))
        (clinical_finding (snomed_concept "Asthenia" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
        (< (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 3)
        (and (clinical_finding (snomed_concept "Diabetes mellitus" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
             (< (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 4))
        (clinical_finding (snomed_concept "Shock" "disorder"))
        (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 80)
        (clinical_finding (snomed_concept "Jaundice" "finding"))
        (clinical_finding (snomed_concept "Bleeds easily" "finding"))
        (clinical_finding (snomed_concept "Easy bruising" "finding"))
        (clinical_finding (snomed_concept "Black urine" "finding"))
        (>= (onset (clinical_finding (snomed_concept "Anuria" "finding"))) (time_ago 12 hours))
        (clinical_finding (snomed_concept "Persistent vomiting" "disorder"))
    )
  )
)
(system_priority_evaluation
  "Urgent: suspected malaria with danger signs"
  adult
  Urgent
  (and
    (diagnosis (snomed_concept "Malaria" "disorder") possible)
    (or (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
        (clinical_finding (snomed_concept "Drowsy" "finding"))
        (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
        (clinical_finding (snomed_concept "Acute confusion" "finding"))
        (> (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 30)
        (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
        (clinical_finding (snomed_concept "Seizure" "finding"))
        (clinical_finding (snomed_concept "Post-ictal state" "finding"))
        (clinical_finding (snomed_concept "Asthenia" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
        (< (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 3)
        (and (clinical_finding (snomed_concept "Diabetes mellitus" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
             (< (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 4))
        (clinical_finding (snomed_concept "Shock" "disorder"))
        (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 80)
        (clinical_finding (snomed_concept "Jaundice" "finding"))
        (clinical_finding (snomed_concept "Bleeds easily" "finding"))
        (clinical_finding (snomed_concept "Easy bruising" "finding"))
        (clinical_finding (snomed_concept "Black urine" "finding"))
        (>= (onset (clinical_finding (snomed_concept "Anuria" "finding"))) (time_ago 12 hours))
        (clinical_finding (snomed_concept "Persistent vomiting" "disorder"))
    )
  )
)

(task
  "Check for collapse following vaccination features"
  adult
  (clinical_finding (snomed_concept "Collapse" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Vaccination given" "situation"))

    (clinical_finding (snomed_concept "Wheezing" "finding"))
    (clinical_finding (snomed_concept "Stridor" "finding"))
    (clinical_finding (snomed_concept "Cough" "finding"))

    (clinical_finding (snomed_concept "Swelling" "finding"))
    (clinical_finding (snomed_concept "Eruption" "morphologic abnormality"))
  )
)
(system_diagnosis_rule
  "Diagnose probable fainting episode following vaccination"
  (diagnosis
    (snomed_concept "Syncope" "finding")
    probable
  )
  adult


  (and
    (clinical_finding (snomed_concept "Collapse" "finding"))
    (clinical_finding (snomed_concept "Vaccination given" "situation"))
    (no (clinical_finding (snomed_concept "Wheezing" "finding")))
    (no (clinical_finding (snomed_concept "Stridor" "finding")))
    (no (clinical_finding (snomed_concept "Cough" "finding")))
    (no (clinical_finding (snomed_concept "Swelling" "finding")))
    (no (clinical_finding (snomed_concept "Eruption" "morphologic abnormality")))

    (>= (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
    (>= (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
    (<= (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 120)
  )
)
(system_diagnosis_rule
  "Diagnose probable anaphylaxis after collapse following vaccination"
  (diagnosis
    (snomed_concept "Anaphylaxis" "disorder")
    probable
  )
  adult

  (and
    (clinical_finding (snomed_concept "Collapse" "finding"))
    (clinical_finding (snomed_concept "Vaccination given" "situation"))
    (or (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
        (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
        (> (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 120)
        (clinical_finding (snomed_concept "Wheezing" "finding"))
        (clinical_finding (snomed_concept "Stridor" "finding"))
        (clinical_finding (snomed_concept "Cough" "finding"))
        (clinical_finding (snomed_concept "Swelling" "finding"))
        (clinical_finding (snomed_concept "Eruption" "morphologic abnormality"))
    )
  )
)

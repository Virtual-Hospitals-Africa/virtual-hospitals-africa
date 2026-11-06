(task
  "Check for urgent palpitations conditions"
  adult
  (clinical_finding (snomed_concept "Palpitations" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Syncope" "finding"))
    (clinical_finding (snomed_concept "Loss of consciousness" "finding"))
    (clinical_finding (snomed_concept "Dizziness" "finding"))
    (clinical_finding (snomed_concept "Lightheadedness" "finding"))
    (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
    (clinical_finding (snomed_concept "Chest pain" "finding"))

    (clinical_finding (snomed_concept "Pulse irregular" "finding"))
    (clinical_finding (snomed_concept "Diabetes mellitus" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))

    (clinical_finding (snomed_concept "Pain in calf" "finding"))
    (clinical_finding (snomed_concept "Thigh pain" "finding"))
    (clinical_finding (snomed_concept "Swollen calf" "finding"))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Thigh structure" "body structure")))

    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    (clinical_finding (snomed_concept "Orthopnea" "finding"))
    (clinical_finding (snomed_concept "Leg swelling symptom" "finding"))

    (clinical_finding (snomed_concept "Muscle weakness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
    (clinical_finding (snomed_concept "Difficulty talking" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Visual disturbance" "disorder") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
  )
)



(task
  "Check for causes of palpitations"
  adult
  (clinical_finding (snomed_concept "Palpitations" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Thirst due to water deprivation" "finding"))
    (clinical_finding (snomed_concept "Xerostomia" "finding"))
    (clinical_finding (snomed_concept "Decreased skin turgor" "finding"))
    (clinical_finding (snomed_concept "Decreased urine output" "finding"))
  )
)

(system_diagnosis_rule
  "Diagnose probable heart failure from palpitations"
  (diagnosis
    (snomed_concept "Heart failure" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Palpitations" "finding"))
    (clinical_finding (snomed_concept "Orthopnea" "finding"))
    (clinical_finding (snomed_concept "Leg swelling symptom" "finding"))
  )
)

(system_diagnosis_rule
  "Diagnose possible stroke from palpitations"
  (diagnosis
    (snomed_concept "Cerebrovascular accident" "disorder")
    possible
  )
  adult
  (and
    (clinical_finding (snomed_concept "Palpitations" "finding"))
    (or
      (clinical_finding (snomed_concept "Muscle weakness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
      (clinical_finding (snomed_concept "Numbness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
      (clinical_finding (snomed_concept "Difficulty talking" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Visual disturbance" "disorder") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    )
  )
)
(system_diagnosis_rule
  "Diagnose possible TIA from palpitations"
  (diagnosis
    (snomed_concept "Transient ischemic attack" "disorder")
    possible
  )
  adult
  (and
    (clinical_finding (snomed_concept "Palpitations" "finding"))
    (or
      (clinical_finding (snomed_concept "Muscle weakness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
      (clinical_finding (snomed_concept "Numbness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
      (clinical_finding (snomed_concept "Difficulty talking" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Visual disturbance" "disorder") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    )
  )
)

(system_diagnosis_rule
  "Diagnose probable dehydration from palpitations"
  (diagnosis
    (snomed_concept "Dehydration" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Palpitations" "finding"))
    (or
      (clinical_finding (snomed_concept "Thirst due to water deprivation" "finding"))
      (clinical_finding (snomed_concept "Xerostomia" "finding"))
      (clinical_finding (snomed_concept "Decreased skin turgor" "finding"))
      (clinical_finding (snomed_concept "Decreased urine output" "finding"))
    )
  )
)



(system_diagnosis_rule
  "Diagnose possible thyroid disorder from palpitations"
  (diagnosis
    (snomed_concept "Disorder of thyroid gland" "disorder")
    possible
  )
  adult
  (and
    (clinical_finding (snomed_concept "Palpitations" "finding"))
    (< (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
    (no (clinical_finding (snomed_concept "Thirst due to water deprivation" "finding")))
    (no (clinical_finding (snomed_concept "Xerostomia" "finding")))
    (no (clinical_finding (snomed_concept "Decreased skin turgor" "finding")))
    (no (clinical_finding (snomed_concept "Decreased urine output" "finding")))
  )
)
(system_diagnosis_rule
  "Diagnose possible electrolyte imbalance from palpitations"
  (diagnosis
    (snomed_concept "Electrolyte imbalance" "disorder")
    possible
  )
  adult
  (and
    (clinical_finding (snomed_concept "Palpitations" "finding"))
    (< (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
    (no (clinical_finding (snomed_concept "Thirst due to water deprivation" "finding")))
    (no (clinical_finding (snomed_concept "Xerostomia" "finding")))
    (no (clinical_finding (snomed_concept "Decreased skin turgor" "finding")))
    (no (clinical_finding (snomed_concept "Decreased urine output" "finding")))
  )
)

(system_priority_evaluation
  "Urgent: palpitations with danger signs"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Palpitations" "finding"))
    (or

      (clinical_finding (snomed_concept "Syncope" "finding"))
      (clinical_finding (snomed_concept "Loss of consciousness" "finding"))

      (clinical_finding (snomed_concept "Dizziness" "finding"))
      (clinical_finding (snomed_concept "Lightheadedness" "finding"))

      (clinical_finding (snomed_concept "Clouded consciousness" "finding"))

      (clinical_finding (snomed_concept "Chest pain" "finding"))

      (>= (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 180)
      (>= (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 110)
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
      (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)

      (clinical_finding (snomed_concept "Pulse irregular" "finding"))
      (> (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 150)
      (< (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 50)

      (< (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 3)
      (and (clinical_finding (snomed_concept "Diabetes mellitus" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
           (< (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 4))

      (clinical_finding (snomed_concept "Pain in calf" "finding"))
      (clinical_finding (snomed_concept "Thigh pain" "finding"))
      (clinical_finding (snomed_concept "Swollen calf" "finding"))
      (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Thigh structure" "body structure")))

      (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
      (>= (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 30)
      (< (measurement (snomed_concept "Hemoglobin saturation with oxygen" "observable entity") %) 94)

      (active_condition (snomed_concept "Heart failure" "disorder"))

      (clinical_finding (snomed_concept "Muscle weakness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
      (clinical_finding (snomed_concept "Numbness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
      (clinical_finding (snomed_concept "Difficulty talking" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Visual disturbance" "disorder") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    )
  )
)

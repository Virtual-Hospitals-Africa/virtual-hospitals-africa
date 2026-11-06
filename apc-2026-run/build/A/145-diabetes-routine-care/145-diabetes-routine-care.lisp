;; Page 145 - Diabetes: routine care
(task
  "Check for urgent signs in the patient with diabetes"
  adult
  (clinical_finding (snomed_concept "Diabetes mellitus" "disorder"))
  (check_for
    (clinical_finding (snomed_concept "Chest pain" "finding"))
    (clinical_finding (snomed_concept "Seizure" "finding"))
    (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
    (clinical_finding (snomed_concept "Drowsy" "finding"))
    (clinical_finding (snomed_concept "Acute confusion" "finding"))
    (clinical_finding (snomed_concept "Abnormal behavior" "finding"))
    (clinical_finding (snomed_concept "Asthenia" "finding"))
    (clinical_finding (snomed_concept "Dizziness" "finding"))
    (clinical_finding (snomed_concept "Tremor" "finding"))

    (clinical_finding (snomed_concept "Sweating" "finding"))
    (clinical_finding (snomed_concept "Palpitations" "finding"))
    (clinical_finding (snomed_concept "Kussmaul's respiration" "finding"))

    (clinical_finding (snomed_concept "Nausea" "finding"))
    (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
    (clinical_finding (snomed_concept "Abdominal pain" "finding"))
    (clinical_finding (snomed_concept "Excessive thirst" "finding"))
    (clinical_finding (snomed_concept "Hungry" "finding"))

    (clinical_finding (snomed_concept "Xerostomia" "finding"))
    (clinical_finding (snomed_concept "Decreased skin turgor" "finding"))
  )
)
(task
  "Check urine dipstick for ketones: diabetes with glucose >= 11.1"
  adult
  (and (clinical_finding (snomed_concept "Diabetes mellitus" "disorder"))
       (>= (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 11.1))
  (check_for
    (clinical_finding (snomed_concept "Ketonuria" "finding"))
  )
)
(task
  "Measure weight, BMI and waist circumference in diabetes routine care"
  adult
  (clinical_finding (snomed_concept "Diabetes mellitus" "disorder"))
  (measure
    (measurement (snomed_concept "Body weight" "observable entity") kg)
    (measurement (snomed_concept "Body mass index" "observable entity") kg/m²)
    (measurement (snomed_concept "Waist circumference" "observable entity") cm)
  )
)
(system_priority_evaluation
  "Urgent: diabetes with danger signs or abnormal glucose"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Diabetes mellitus" "disorder"))
    (or
      (clinical_finding (snomed_concept "Chest pain" "finding"))
      (clinical_finding (snomed_concept "Seizure" "finding"))
      (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
      (clinical_finding (snomed_concept "Drowsy" "finding"))
      (clinical_finding (snomed_concept "Acute confusion" "finding"))
      (clinical_finding (snomed_concept "Abnormal behavior" "finding"))
      (clinical_finding (snomed_concept "Asthenia" "finding"))
      (clinical_finding (snomed_concept "Dizziness" "finding"))
      (clinical_finding (snomed_concept "Tremor" "finding"))
      (clinical_finding (snomed_concept "Sweating" "finding"))
      (clinical_finding (snomed_concept "Palpitations" "finding"))
      (clinical_finding (snomed_concept "Kussmaul's respiration" "finding"))
      (clinical_finding (snomed_concept "Nausea" "finding"))
      (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
      (clinical_finding (snomed_concept "Abdominal pain" "finding"))
      (clinical_finding (snomed_concept "Excessive thirst" "finding"))
      (clinical_finding (snomed_concept "Hungry" "finding"))
      (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
      ;; Dehydration: dry mouth, poor skin turgor, BP < 90/60, pulse >= 100 (each sign counts alone)
      (clinical_finding (snomed_concept "Xerostomia" "finding"))
      (clinical_finding (snomed_concept "Decreased skin turgor" "finding"))
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
      (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
      (>= (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 100)
      ;; Check random fingerprick glucose: < 4 with/without symptoms -> 19
      (< (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 4)
      ;; >= 11.1 without symptoms and ketones present -> 19
      (and (>= (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 11.1)
           (clinical_finding (snomed_concept "Ketonuria" "finding")))
    )
  )
)

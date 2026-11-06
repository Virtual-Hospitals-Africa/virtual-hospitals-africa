;; Page 145 - Diabetes: routine care
(task
  "Check for urgent diabetes conditions"
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

    (clinical_finding (snomed_concept "Dehydration" "disorder"))
    (clinical_finding (snomed_concept "Xerostomia" "finding"))
    (clinical_finding (snomed_concept "Decreased skin turgor" "finding"))
  )
)
(task
  "Check urine dipstick for ketones in diabetes with fingerprick glucose >= 11.1"
  adult
  (and (clinical_finding (snomed_concept "Diabetes mellitus" "disorder"))
       (>= (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 11.1))
  (check_for
    (clinical_finding (snomed_concept "Ketonuria" "finding"))
  )
)
(task
  "Measure waist circumference in routine diabetes care"
  adult
  (clinical_finding (snomed_concept "Diabetes mellitus" "disorder"))
  (measure
    (measurement (snomed_concept "Waist circumference" "observable entity") cm)
  )
)
(system_priority_evaluation
  "Urgent: diabetes with danger signs"
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
      ;; Dehydration: dry mouth, poor skin turgor, BP < 90/60, pulse >= 100 (each sign counts on its own)
      (clinical_finding (snomed_concept "Dehydration" "disorder"))
      (clinical_finding (snomed_concept "Xerostomia" "finding"))
      (clinical_finding (snomed_concept "Decreased skin turgor" "finding"))
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
      (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
      (>= (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 100)
    )
  )
)
(system_priority_evaluation
  "Urgent: diabetes with low or high fingerprick glucose"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Diabetes mellitus" "disorder"))
    (or
      ;; fingerprick glucose < 4 with/without symptoms
      (< (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 4)
      ;; fingerprick glucose >= 11.1 and ketones present on urine dipstick
      ;; (>= 11.1 WITH symptoms is already covered by "Urgent: diabetes with danger signs")
      (and (>= (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 11.1)
           (clinical_finding (snomed_concept "Ketonuria" "finding")))
    )
  )
)

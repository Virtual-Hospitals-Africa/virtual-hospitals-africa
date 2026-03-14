;; Page 57 - Abnormal Vaginal Bleeding: Urgent for haemodynamic signs
(system_priority_evaluation
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Abnormal vaginal bleeding" "finding"))
    (or
      (and
        (clinical_finding (snomed_concept "Pallor of skin of face" "finding"))
        (or
          (>= (measurement (snomed_concept "Heart rate" "observable entity") bpm) 100)
          (>= (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 30)
          (clinical_finding (snomed_concept "Dizziness" "finding"))
          (clinical_finding (snomed_concept "Chest pain" "finding"))
        )
      )
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
      (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
    )
  )
)

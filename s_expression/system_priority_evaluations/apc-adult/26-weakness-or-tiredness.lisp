;; Page 26 - Weakness or Tiredness
(system_priority_evaluation
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Fatigue" "finding"))
    (or
      (clinical_finding (snomed_concept "Chest pain" "finding"))
      (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
      (clinical_finding (snomed_concept "Orthopnea" "finding"))
      (clinical_finding (snomed_concept "Leg swelling symptom" "finding"))
      (clinical_finding (snomed_concept "Signs of dehydration" "finding"))
      (clinical_finding (snomed_concept "Anemia" "disorder"))
      (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
      (>= (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 11.1)
      (> (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 30)
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
      (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
    )
  )
)

;; Page 29 - Dizziness
(system_priority_evaluation
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Dizziness" "finding"))
    (or
      (clinical_finding (snomed_concept "Chest pain" "finding"))
      (clinical_finding (snomed_concept "Orthopnea" "finding"))
      (clinical_finding (snomed_concept "Leg swelling symptom" "finding"))
      (clinical_finding (snomed_concept "Injury of head" "disorder"))
      (clinical_finding (snomed_concept "Unable to stand" "finding"))
      (clinical_finding (snomed_concept "Nausea and vomiting" "disorder"))
      (clinical_finding (snomed_concept "Abnormal ocular motility" "finding"))
      (clinical_finding (snomed_concept "Pulse slow" "finding"))
      (clinical_finding (snomed_concept "Pulse irregular" "finding"))
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
      (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
      (< (measurement (snomed_concept "Heart rate" "observable entity") bpm) 50)
    )
  )
)

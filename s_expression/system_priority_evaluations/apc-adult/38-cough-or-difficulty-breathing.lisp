;; Page 38 - Cough/Breathing: Urgent for other signs
(system_priority_evaluation
  adult
  Urgent
  (and
    (or
      (clinical_finding (snomed_concept "Cough" "finding"))
      (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
      (clinical_finding (snomed_concept "Dyspnea" "finding"))
    )
    (or
      (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
      (clinical_finding (snomed_concept "Feeling agitated" "finding"))
      (clinical_finding (snomed_concept "Tension pneumothorax" "disorder"))
      (clinical_finding (snomed_concept "Hemoptysis" "finding"))
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
      (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
      (< (measurement (snomed_concept "Hemoglobin saturation with oxygen" "observable entity") %) 92)
      (>= (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 30)
      (>= (measurement (snomed_concept "Heart rate" "observable entity") bpm) 120)
      (clinical_finding (snomed_concept "Wheezing" "finding"))
    )
  )
)

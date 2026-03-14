;; Page 46 - Diarrhoea: Urgent for dehydration signs
(system_priority_evaluation
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Diarrhea" "finding"))
    (or
      (clinical_finding (snomed_concept "Signs of dehydration" "finding"))
      (clinical_finding (snomed_concept "Drowsy" "finding"))
      (clinical_finding (snomed_concept "Confusional state" "disorder"))
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
      (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
      (>= (measurement (snomed_concept "Heart rate" "observable entity") bpm) 100)
    )
  )
)

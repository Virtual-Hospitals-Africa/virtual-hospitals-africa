;; Page 67 - Skin Symptoms: Urgent for meningococcal disease signs
(system_priority_evaluation
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Purpuric rash" "disorder"))
    (or
      (clinical_finding (snomed_concept "Stiff neck" "finding"))
      (clinical_finding (snomed_concept "Drowsy" "finding"))
      (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
      (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
      (clinical_finding (snomed_concept "Headache" "finding"))
    )
  )
)
;; Page 67 - Skin Symptoms: Urgent for serious drug reaction signs
(system_priority_evaluation
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Eruption caused by drug" "disorder"))
    (or
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
      (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
      (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
      (clinical_finding (snomed_concept "Abdominal pain" "finding"))
      (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
      (clinical_finding (snomed_concept "Diarrhea" "finding"))
      (clinical_finding (snomed_concept "Jaundice" "finding"))
      (clinical_finding (snomed_concept "Blister of skin" "disorder"))
    )
  )
)

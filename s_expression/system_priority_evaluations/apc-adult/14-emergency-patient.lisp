;; Page 14 - Emergency Patient: Emergency signs
(system_priority_evaluation
  "Emergency: emergency patient with danger signs"
  adult
  Emergency
  (or
    (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
    (clinical_finding (snomed_concept "Seizure" "finding"))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    (clinical_finding (snomed_concept "Hematemesis" "disorder"))
    (clinical_finding (snomed_concept "Bleeding" "finding"))
    (clinical_finding (snomed_concept "Burn" "disorder"))
    (clinical_finding (snomed_concept "Purpuric rash" "disorder"))
    (clinical_finding (snomed_concept "Anaphylaxis" "disorder"))
    (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
    (>= (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 30)
  )
)
;; Page 14 - Emergency Patient: Urgent signs
(system_priority_evaluation
  "Urgent: emergency patient with urgent signs"
  adult
  Urgent
  (or
    (clinical_finding (snomed_concept "Chest pain" "finding"))
    (clinical_finding (snomed_concept "Severe pain" "finding"))
    (clinical_finding (snomed_concept "Bone injury" "disorder"))
    (clinical_finding (snomed_concept "Dislocation of joint" "disorder"))
    (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 100)
  )
)

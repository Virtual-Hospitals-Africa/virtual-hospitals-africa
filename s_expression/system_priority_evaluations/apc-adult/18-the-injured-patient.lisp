;; Page 18 - The Injured Patient: Emergency signs
(system_priority_evaluation
  "Emergency: injured patient with emergency signs"
  adult
  Emergency
  (or
    (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
    (clinical_finding (snomed_concept "Seizure" "finding"))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    (clinical_finding (snomed_concept "Bleeding" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Burn" "disorder"))
    (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
    (>= (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 30)
  )
)
;; Page 18 - The Injured Patient: Urgent signs
(system_priority_evaluation
  "Urgent: injured patient with urgent signs"
  adult
  Urgent
  (or
    (clinical_finding (snomed_concept "Chest pain" "finding"))
    (clinical_finding (snomed_concept "Severe pain" "finding"))
    (clinical_finding (snomed_concept "Bone injury" "disorder"))
    (clinical_finding (snomed_concept "Dislocation of joint" "disorder"))
    (clinical_finding (snomed_concept "Penetrating wound" "disorder"))
    (clinical_finding (snomed_concept "Muscle weakness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 100)
  )
)

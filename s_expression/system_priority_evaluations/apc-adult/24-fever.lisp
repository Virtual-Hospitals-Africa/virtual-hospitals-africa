;; Page 24 - Fever: Emergency if seizure or decreased consciousness
(system_priority_evaluation
  adult
  Emergency
  (and
    (clinical_finding (snomed_concept "Fever" "finding"))
    (or
      (clinical_finding (snomed_concept "Seizure" "finding"))
      (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
    )
  )
)
;; Page 24 - Fever: Urgent for other danger signs
(system_priority_evaluation
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Fever" "finding"))
    (or
      (clinical_finding (snomed_concept "Stiff neck" "finding"))
      (clinical_finding (snomed_concept "Drowsy" "finding"))
      (clinical_finding (snomed_concept "Confusional state" "disorder"))
      (clinical_finding (snomed_concept "Purpuric rash" "disorder"))
      (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
      (clinical_finding (snomed_concept "Tenderness of right lower quadrant of abdomen" "finding"))
      (clinical_finding (snomed_concept "Acute abdominal pain" "finding"))
      (clinical_finding (snomed_concept "Backache" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
      (clinical_finding (snomed_concept "Jaundice" "finding"))
      (clinical_finding (snomed_concept "Easy bruising" "finding"))
      (clinical_finding (snomed_concept "Finding of tendency to bleed" "finding"))
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
      (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
      (> (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 30)
    )
  )
)

(task
  "Check for urgent heart failure conditions"
  adult
  (clinical_finding (snomed_concept "Heart failure" "disorder"))
  (check_for
    (clinical_finding (snomed_concept "Chest pain" "finding"))
    (clinical_finding (snomed_concept "Heart failure" "disorder") (qualifier (snomed_concept "Worsening" "qualifier value") (qualifier (snomed_concept "Rapid" "qualifier value"))))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    (clinical_finding (snomed_concept "Wheezing" "finding") (qualifier (snomed_concept "New" "qualifier value")))
  )
)

(task
  "Measure weight in heart failure routine care"
  adult
  (clinical_finding (snomed_concept "Heart failure" "disorder"))
  (measure
    (measurement (snomed_concept "Body weight" "observable entity") kg)
  )
)

(system_priority_evaluation
  "Urgent: heart failure with urgent signs"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Heart failure" "disorder"))
    (or
      (clinical_finding (snomed_concept "Chest pain" "finding"))
      (clinical_finding (snomed_concept "Heart failure" "disorder") (qualifier (snomed_concept "Worsening" "qualifier value") (qualifier (snomed_concept "Rapid" "qualifier value"))))
      (>= (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 30)
      (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
      (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
      (clinical_finding (snomed_concept "Wheezing" "finding") (qualifier (snomed_concept "New" "qualifier value")))
    )
  )
)

;; Page 151 - Heart failure: routine care
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
;; Page 151 - Heart failure: routine care (Assess: Weight, every visit)
(task
  "Measure weight in heart failure routine care"
  adult
  (clinical_finding (snomed_concept "Heart failure" "disorder"))
  (measure
    (measurement (snomed_concept "Body weight" "observable entity") kg)
  )
)
;; Page 151 - Heart failure: routine care (red box)

(system_priority_evaluation
  "Urgent: heart failure with chest pain"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Heart failure" "disorder"))
    (clinical_finding (snomed_concept "Chest pain" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: heart failure with heart failure (worsening)"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Heart failure" "disorder"))
    (clinical_finding (snomed_concept "Heart failure" "disorder") (qualifier (snomed_concept "Worsening" "qualifier value") (qualifier (snomed_concept "Rapid" "qualifier value"))))
  )
)

(system_priority_evaluation
  "Urgent: heart failure with respiratory rate ≥ 30 bpm"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Heart failure" "disorder"))
    (>= (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 30)
  )
)

(system_priority_evaluation
  "Urgent: heart failure with difficulty breathing"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Heart failure" "disorder"))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: heart failure with systolic blood pressure < 90 mmHg"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Heart failure" "disorder"))
    (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
  )
)

(system_priority_evaluation
  "Urgent: heart failure with diastolic blood pressure < 60 mmHg"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Heart failure" "disorder"))
    (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
  )
)

(system_priority_evaluation
  "Urgent: heart failure with wheezing (new)"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Heart failure" "disorder"))
    (clinical_finding (snomed_concept "Wheezing" "finding") (qualifier (snomed_concept "New" "qualifier value")))
  )
)

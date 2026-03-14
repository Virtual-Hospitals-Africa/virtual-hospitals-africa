;; Page 59 - Urinary Symptoms: Urgent for retention with distension
(system_priority_evaluation
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Unable to void urine" "finding"))
    (clinical_finding (snomed_concept "Distension of abdomen" "finding"))
  )
)
;; Page 59 - Urinary Symptoms: Urgent for kidney stone signs
(system_priority_evaluation
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Blood in urine" "finding"))
    (clinical_finding (snomed_concept "Flank pain" "finding"))
  )
)
;; Page 59 - Urinary Symptoms: Urgent for complicated pyelonephritis signs
(system_priority_evaluation
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Flank pain" "finding"))
    (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
    (or
      (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
      (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
      (>= (measurement (snomed_concept "Heart rate" "observable entity") bpm) 100)
    )
  )
)

;; Page 59 - Urinary Symptoms: Kidney stone likely with blood in urine and flank pain
(system_diagnosis_rule
  (diagnosis
    (snomed_concept "Kidney stone" "disorder")
    possible
  )
  adult
  (and
    (clinical_finding (snomed_concept "Blood in urine" "finding"))
    (clinical_finding (snomed_concept "Flank pain" "finding"))
  )
)
;; Page 59 - Urinary Symptoms: Acute pyelonephritis likely with flank pain, fever and systemic signs
(system_diagnosis_rule
  (diagnosis
    (snomed_concept "Acute pyelonephritis" "disorder")
    possible
  )
  adult
  (and
    (clinical_finding (snomed_concept "Flank pain" "finding"))
    (clinical_finding (snomed_concept "Fever" "finding"))
    (or
      (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
      (>= (measurement (snomed_concept "Heart rate" "observable entity") bpm) 100)
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
    )
  )
)

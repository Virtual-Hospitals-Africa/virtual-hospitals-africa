;; Page 111 - Rifampicin-resistant TB (RR-TB): routine care
(task
  "Check for RR-TB admission criteria and danger symptoms"
  adult
  (clinical_finding (snomed_concept "Rifampicin resistant tuberculosis" "disorder"))
  (check_for
    ;; Red box: discuss or refer to hospital for admission
    (clinical_finding (snomed_concept "Drowsy" "finding"))
    (clinical_finding (snomed_concept "Acute confusion" "finding"))
    (clinical_finding (snomed_concept "Stiff neck" "finding"))
    (clinical_finding (snomed_concept "Headache" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Persistent vomiting" "disorder"))
    (clinical_finding (snomed_concept "Unable to walk" "finding"))
    (clinical_finding (snomed_concept "Noncompliance with medication regimen" "finding"))

    ;; Symptoms (every visit): give urgent attention and refer
    (clinical_finding (snomed_concept "Dyspnea at rest" "finding"))
    (clinical_finding (snomed_concept "Accessory respiratory muscles used" "finding"))
    (clinical_finding (snomed_concept "Hemoptysis" "finding"))
    (clinical_finding (snomed_concept "Muscle weakness of limb" "finding") (qualifier (snomed_concept "New" "qualifier value")))
  )
)
(task
  "Measure BMI in RR-TB routine care"
  adult
  (clinical_finding (snomed_concept "Rifampicin resistant tuberculosis" "disorder"))
  (measure
    (measurement (snomed_concept "Body mass index" "observable entity") kg/m²)
  )
)
(system_priority_evaluation
  "Urgent: RR-TB with criteria for hospital admission"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Rifampicin resistant tuberculosis" "disorder"))
    (or
      (>= (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 30)
      (clinical_finding (snomed_concept "Drowsy" "finding"))
      (clinical_finding (snomed_concept "Acute confusion" "finding"))
      (clinical_finding (snomed_concept "Stiff neck" "finding"))
      (clinical_finding (snomed_concept "Headache" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
      (clinical_finding (snomed_concept "Persistent vomiting" "disorder"))
      (clinical_finding (snomed_concept "Unable to walk" "finding"))
      (clinical_finding (snomed_concept "Noncompliance with medication regimen" "finding"))
      ;; "Hb < 8" has no lab observable in the language; only the BMI half is encoded
      (< (measurement (snomed_concept "Body mass index" "observable entity") kg/m²) 18)
    )
  )
)
(system_priority_evaluation
  "Urgent: RR-TB with danger symptoms at routine visit"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Rifampicin resistant tuberculosis" "disorder"))
    (or
      (>= (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 30)
      (clinical_finding (snomed_concept "Dyspnea at rest" "finding"))
      (clinical_finding (snomed_concept "Accessory respiratory muscles used" "finding"))
      (clinical_finding (snomed_concept "Drowsy" "finding"))
      (clinical_finding (snomed_concept "Acute confusion" "finding"))
      ;; "coughs up >= 1 tablespoon fresh blood": volume not representable; any haemoptysis is used
      (clinical_finding (snomed_concept "Hemoptysis" "finding"))
      (clinical_finding (snomed_concept "Stiff neck" "finding"))
      (clinical_finding (snomed_concept "Persistent vomiting" "disorder"))
      (clinical_finding (snomed_concept "Muscle weakness of limb" "finding") (qualifier (snomed_concept "New" "qualifier value")))
    )
  )
)

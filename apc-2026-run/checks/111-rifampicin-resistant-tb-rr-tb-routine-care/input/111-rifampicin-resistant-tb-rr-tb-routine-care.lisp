(task
  "Check for RR-TB admission and urgent referral criteria"
  adult
  (clinical_finding (snomed_concept "Rifampicin resistant tuberculosis" "disorder"))
  (check_for

    (clinical_finding (snomed_concept "Drowsy" "finding"))
    (clinical_finding (snomed_concept "Acute confusion" "finding"))
    (clinical_finding (snomed_concept "Stiff neck" "finding"))
    (clinical_finding (snomed_concept "Headache" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Persistent vomiting" "disorder"))

    (clinical_finding (snomed_concept "Difficulty walking" "finding"))
    (clinical_finding (snomed_concept "Unable to walk" "finding"))

    (clinical_finding (snomed_concept "Noncompliance with treatment" "finding"))
    (clinical_finding (snomed_concept "Patient requests a hospital referral" "situation"))


    (clinical_finding (snomed_concept "Dyspnea at rest" "finding"))
    (clinical_finding (snomed_concept "Unable to complete a sentence in one breath" "finding"))
    (clinical_finding (snomed_concept "Accessory respiratory muscles used" "finding"))
    (clinical_finding (snomed_concept "Hemoptysis" "finding"))
    (clinical_finding (snomed_concept "Muscle weakness of limb" "finding") (qualifier (snomed_concept "New" "qualifier value")))
  )
)
(task
  "Measure BMI at RR-TB routine visit"
  adult
  (clinical_finding (snomed_concept "Rifampicin resistant tuberculosis" "disorder"))
  (measure (measurement (snomed_concept "Body mass index" "observable entity") kg/m²))
)
(system_priority_evaluation
  "Urgent: RR-TB routine care with criteria for hospital admission"
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
      (clinical_finding (snomed_concept "Difficulty walking" "finding"))
      (clinical_finding (snomed_concept "Unable to walk" "finding"))
      (clinical_finding (snomed_concept "Noncompliance with treatment" "finding"))
      (< (measurement (snomed_concept "Body mass index" "observable entity") kg/m²) 18)
      (clinical_finding (snomed_concept "Patient requests a hospital referral" "situation"))
    )
  )
)
(system_priority_evaluation
  "Urgent: RR-TB with urgent symptoms at routine visit"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Rifampicin resistant tuberculosis" "disorder"))
    (or
      (>= (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 30)
      (clinical_finding (snomed_concept "Dyspnea at rest" "finding"))
      (clinical_finding (snomed_concept "Unable to complete a sentence in one breath" "finding"))
      (clinical_finding (snomed_concept "Accessory respiratory muscles used" "finding"))
      (clinical_finding (snomed_concept "Drowsy" "finding"))
      (clinical_finding (snomed_concept "Acute confusion" "finding"))
      (clinical_finding (snomed_concept "Hemoptysis" "finding"))
      (clinical_finding (snomed_concept "Stiff neck" "finding"))
      (clinical_finding (snomed_concept "Persistent vomiting" "disorder"))
      (clinical_finding (snomed_concept "Muscle weakness of limb" "finding") (qualifier (snomed_concept "New" "qualifier value")))
    )
  )
)

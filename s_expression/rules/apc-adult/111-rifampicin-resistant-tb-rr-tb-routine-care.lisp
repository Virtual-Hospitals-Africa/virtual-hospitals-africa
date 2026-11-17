;; Page 111 - Rifampicin-resistant TB (RR-TB): routine care
(task
  "Check for RR-TB admission and urgent referral criteria"
  adult
  (clinical_finding (snomed_concept "Rifampicin resistant tuberculosis" "disorder"))
  (check_for
    ;; Red box: discuss or refer to hospital for admission
    (clinical_finding (snomed_concept "Drowsy" "finding"))
    (clinical_finding (snomed_concept "Acute confusion" "finding"))
    (clinical_finding (snomed_concept "Stiff neck" "finding"))
    (clinical_finding (snomed_concept "Headache" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Persistent vomiting" "disorder"))

    (clinical_finding (snomed_concept "Difficulty walking" "finding"))
    (clinical_finding (snomed_concept "Unable to walk" "finding"))

    (clinical_finding (snomed_concept "Noncompliance with treatment" "finding"))
    (clinical_finding (snomed_concept "Patient requests a hospital referral" "situation"))

    ;; Symptoms row: give urgent attention and refer
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
  "Urgent: RR-TB routine care with criteria for hospital admission: respiratory rate ≥ 30 bpm"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Rifampicin resistant tuberculosis" "disorder"))
    (>= (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 30)
  )
)

(system_priority_evaluation
  "Urgent: RR-TB routine care with criteria for hospital admission: drowsy"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Rifampicin resistant tuberculosis" "disorder"))
    (clinical_finding (snomed_concept "Drowsy" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: RR-TB routine care with criteria for hospital admission: acute confusion"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Rifampicin resistant tuberculosis" "disorder"))
    (clinical_finding (snomed_concept "Acute confusion" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: RR-TB routine care with criteria for hospital admission: stiff neck"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Rifampicin resistant tuberculosis" "disorder"))
    (clinical_finding (snomed_concept "Stiff neck" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: RR-TB routine care with criteria for hospital admission: headache (severe)"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Rifampicin resistant tuberculosis" "disorder"))
    (clinical_finding (snomed_concept "Headache" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
  )
)

(system_priority_evaluation
  "Urgent: RR-TB routine care with criteria for hospital admission: persistent vomiting"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Rifampicin resistant tuberculosis" "disorder"))
    (clinical_finding (snomed_concept "Persistent vomiting" "disorder"))
  )
)

(system_priority_evaluation
  "Urgent: RR-TB routine care with criteria for hospital admission: difficulty walking"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Rifampicin resistant tuberculosis" "disorder"))
    (clinical_finding (snomed_concept "Difficulty walking" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: RR-TB routine care with criteria for hospital admission: unable to walk"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Rifampicin resistant tuberculosis" "disorder"))
    (clinical_finding (snomed_concept "Unable to walk" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: RR-TB routine care with criteria for hospital admission: noncompliance with treatment"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Rifampicin resistant tuberculosis" "disorder"))
    (clinical_finding (snomed_concept "Noncompliance with treatment" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: RR-TB routine care with criteria for hospital admission: body mass index < 18 kg/m²"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Rifampicin resistant tuberculosis" "disorder"))
    (< (measurement (snomed_concept "Body mass index" "observable entity") kg/m²) 18)
  )
)

(system_priority_evaluation
  "Urgent: RR-TB routine care with criteria for hospital admission: patient requests a hospital referral"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Rifampicin resistant tuberculosis" "disorder"))
    (clinical_finding (snomed_concept "Patient requests a hospital referral" "situation"))
  )
)

(system_priority_evaluation
  "Urgent: RR-TB with urgent symptoms at routine visit: respiratory rate ≥ 30 bpm"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Rifampicin resistant tuberculosis" "disorder"))
    (>= (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 30)
  )
)

(system_priority_evaluation
  "Urgent: RR-TB with urgent symptoms at routine visit: dyspnea at rest"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Rifampicin resistant tuberculosis" "disorder"))
    (clinical_finding (snomed_concept "Dyspnea at rest" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: RR-TB with urgent symptoms at routine visit: unable to complete a sentence in one breath"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Rifampicin resistant tuberculosis" "disorder"))
    (clinical_finding (snomed_concept "Unable to complete a sentence in one breath" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: RR-TB with urgent symptoms at routine visit: accessory respiratory muscles used"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Rifampicin resistant tuberculosis" "disorder"))
    (clinical_finding (snomed_concept "Accessory respiratory muscles used" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: RR-TB with urgent symptoms at routine visit: drowsy"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Rifampicin resistant tuberculosis" "disorder"))
    (clinical_finding (snomed_concept "Drowsy" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: RR-TB with urgent symptoms at routine visit: acute confusion"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Rifampicin resistant tuberculosis" "disorder"))
    (clinical_finding (snomed_concept "Acute confusion" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: RR-TB with urgent symptoms at routine visit: hemoptysis"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Rifampicin resistant tuberculosis" "disorder"))
    (clinical_finding (snomed_concept "Hemoptysis" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: RR-TB with urgent symptoms at routine visit: stiff neck"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Rifampicin resistant tuberculosis" "disorder"))
    (clinical_finding (snomed_concept "Stiff neck" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: RR-TB with urgent symptoms at routine visit: persistent vomiting"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Rifampicin resistant tuberculosis" "disorder"))
    (clinical_finding (snomed_concept "Persistent vomiting" "disorder"))
  )
)

(system_priority_evaluation
  "Urgent: RR-TB with urgent symptoms at routine visit: muscle weakness of limb (new)"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Rifampicin resistant tuberculosis" "disorder"))
    (clinical_finding (snomed_concept "Muscle weakness of limb" "finding") (qualifier (snomed_concept "New" "qualifier value")))
  )
)

(task
  "Check for urgent suspected TB conditions"
  adult
  (diagnosis (snomed_concept "Tuberculosis" "disorder") possible)
  (check_for
    (clinical_finding (snomed_concept "Dyspnea at rest" "finding"))
    (clinical_finding (snomed_concept "Unable to complete a sentence in one breath" "finding"))
    (clinical_finding (snomed_concept "Accessory respiratory muscles used" "finding"))
    (clinical_finding (snomed_concept "Hemoptysis" "finding"))

    (clinical_finding (snomed_concept "Drowsy" "finding"))
    (clinical_finding (snomed_concept "Acute confusion" "finding"))
    (clinical_finding (snomed_concept "Stiff neck" "finding"))
    (clinical_finding (snomed_concept "Muscle weakness of limb" "finding") (qualifier (snomed_concept "New" "qualifier value")))

    (clinical_finding (snomed_concept "Persistent vomiting" "disorder"))
    (clinical_finding (snomed_concept "Unable to walk" "finding"))
    (clinical_finding (snomed_concept "Deficiency of macronutrients" "disorder") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Nutritional wasting" "disorder"))
  )
)
(system_diagnosis_rule
  "Diagnose possible TB from TB symptoms, TB contact or abnormal screening CXR"
  (diagnosis
    (snomed_concept "Tuberculosis" "disorder")
    possible
  )
  adult
  (or

    (clinical_finding (snomed_concept "Cough" "finding"))
    (clinical_finding (snomed_concept "Weight decreased" "finding"))
    (clinical_finding (snomed_concept "Night sweats" "finding"))
    (active_condition (snomed_concept "Fever" "finding"))

    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Mycobacterium tuberculosis complex" "organism"))
    (clinical_finding (snomed_concept "Plain X-ray of chest for tuberculosis screening abnormal" "finding"))
  )
)
(system_priority_evaluation
  "Urgent: suspected TB with danger signs"
  adult
  Urgent
  (and
    (diagnosis (snomed_concept "Tuberculosis" "disorder") possible)
    (or
      (>= (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 30)
      (> (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 120)
      (> (measurement (snomed_concept "Body temperature" "observable entity") °C) 39)
      (clinical_finding (snomed_concept "Dyspnea at rest" "finding"))
      (clinical_finding (snomed_concept "Unable to complete a sentence in one breath" "finding"))
      (clinical_finding (snomed_concept "Accessory respiratory muscles used" "finding"))
      (clinical_finding (snomed_concept "Hemoptysis" "finding"))
      (clinical_finding (snomed_concept "Drowsy" "finding"))
      (clinical_finding (snomed_concept "Acute confusion" "finding"))
      (clinical_finding (snomed_concept "Stiff neck" "finding"))
      (clinical_finding (snomed_concept "Muscle weakness of limb" "finding") (qualifier (snomed_concept "New" "qualifier value")))
      (clinical_finding (snomed_concept "Persistent vomiting" "disorder"))
      (clinical_finding (snomed_concept "Unable to walk" "finding"))
      (clinical_finding (snomed_concept "Deficiency of macronutrients" "disorder") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
      (clinical_finding (snomed_concept "Nutritional wasting" "disorder"))
    )
  )
)

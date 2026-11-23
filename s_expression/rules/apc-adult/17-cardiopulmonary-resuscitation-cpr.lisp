;; Page 17 - Cardiopulmonary resuscitation (CPR)
(task
  "Check for reversible causes during CPR"
  adult
  (or (clinical_finding (snomed_concept "Cardiac arrest" "disorder"))
      (clinical_finding (snomed_concept "Absent pulse" "finding")))
  (check_for
    ;; Tension pneumothorax likely
    (clinical_finding (snomed_concept "Hyperresonance" "finding") (qualifier (snomed_concept "Unilateral" "qualifier value")))
    (clinical_finding (snomed_concept "Decreased breath sounds" "finding") (qualifier (snomed_concept "Unilateral" "qualifier value")))
    (clinical_finding (snomed_concept "Trachea displaced" "disorder"))

    ;; Dehydration likely (footnote 2)
    (clinical_finding (snomed_concept "Thirst due to water deprivation" "finding"))
    (clinical_finding (snomed_concept "Xerostomia" "finding"))
    (clinical_finding (snomed_concept "Decreased skin turgor" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose probable tension pneumothorax during CPR"
  (diagnosis
    (snomed_concept "Tension pneumothorax" "disorder")
    probable
  )
  adult
  (and
    (or (clinical_finding (snomed_concept "Cardiac arrest" "disorder"))
        (clinical_finding (snomed_concept "Absent pulse" "finding")))
    (or (clinical_finding (snomed_concept "Hyperresonance" "finding") (qualifier (snomed_concept "Unilateral" "qualifier value")))
        (clinical_finding (snomed_concept "Decreased breath sounds" "finding") (qualifier (snomed_concept "Unilateral" "qualifier value")))
        (clinical_finding (snomed_concept "Trachea displaced" "disorder")))
  )
)
(system_diagnosis_rule
  "Diagnose probable dehydration during CPR"
  (diagnosis
    (snomed_concept "Dehydration" "disorder")
    probable
  )
  adult
  (and
    (or (clinical_finding (snomed_concept "Cardiac arrest" "disorder"))
        (clinical_finding (snomed_concept "Absent pulse" "finding")))
    (or (clinical_finding (snomed_concept "Thirst due to water deprivation" "finding"))
        (clinical_finding (snomed_concept "Xerostomia" "finding"))
        (clinical_finding (snomed_concept "Decreased skin turgor" "finding"))
        (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
        (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60))
  )
)
(system_priority_evaluation
  "Emergency: no pulse, start CPR"
  adult
  Emergency
  (or (clinical_finding (snomed_concept "Cardiac arrest" "disorder"))
      (clinical_finding (snomed_concept "Absent pulse" "finding")))
)

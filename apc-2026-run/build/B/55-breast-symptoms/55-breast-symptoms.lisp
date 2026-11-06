;; Page 55 - Breast symptoms
(task
  "Check for breast symptom conditions"
  adult
  (clinical_finding (snomed_concept "Breast finding" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Breast lump" "finding"))
    (clinical_finding (snomed_concept "Pain of breast" "finding"))
    (clinical_finding (snomed_concept "Generalized aches and pains" "finding"))

    (clinical_finding (snomed_concept "Mother currently breastfeeding" "situation"))
  )
)
;; Page 55 - Breast symptoms: red box (breast abscess likely)
(system_diagnosis_rule
  "Diagnose probable breast abscess"
  (diagnosis
    (snomed_concept "Abscess of breast" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Breast finding" "finding"))
    (or (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
        (clinical_finding (snomed_concept "Generalized aches and pains" "finding"))
    )
    ;; "painful lump in breast/s" = breast lump and breast pain; "which may be fluctuant" is not a requirement
    (clinical_finding (snomed_concept "Breast lump" "finding"))
    (clinical_finding (snomed_concept "Pain of breast" "finding"))
  )
)
;; Page 55 - Breast symptoms: breastfeeding and painful breast/s, temperature >= 38°C or body pain → Yes
(system_diagnosis_rule
  "Diagnose probable mastitis in a breastfeeding patient"
  (diagnosis
    (snomed_concept "Mastitis associated with lactation" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Mother currently breastfeeding" "situation"))
    (clinical_finding (snomed_concept "Pain of breast" "finding"))
    (or (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
        (clinical_finding (snomed_concept "Generalized aches and pains" "finding"))
    )
  )
)
;; Page 55 - Breast symptoms: breastfeeding and painful breast/s, temperature >= 38°C or body pain → No
;; The page's "Engorgement/blocked duct likely" is one outcome; it is written as two rules with the same evidence.
(system_diagnosis_rule
  "Diagnose probable breast engorgement in a breastfeeding patient"
  (diagnosis
    (snomed_concept "Milk engorgement of breast" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Mother currently breastfeeding" "situation"))
    (clinical_finding (snomed_concept "Pain of breast" "finding"))
    (< (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
    (no (clinical_finding (snomed_concept "Generalized aches and pains" "finding")))
  )
)
(system_diagnosis_rule
  "Diagnose probable blocked milk duct in a breastfeeding patient"
  (diagnosis
    (snomed_concept "Obstruction of lactiferous duct" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Mother currently breastfeeding" "situation"))
    (clinical_finding (snomed_concept "Pain of breast" "finding"))
    (< (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
    (no (clinical_finding (snomed_concept "Generalized aches and pains" "finding")))
  )
)
(system_priority_evaluation
  "Urgent: breast symptoms with likely breast abscess"
  adult
  Urgent
  (active_condition (snomed_concept "Abscess of breast" "disorder"))
)

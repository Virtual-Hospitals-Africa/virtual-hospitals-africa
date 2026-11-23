;; Page 55 - Breast symptoms
(task
  "Check for breast symptom conditions"
  adult
  (clinical_finding (snomed_concept "Breast finding" "finding"))
  (check_for
    ;; Red box: painful lump in breast/s with temperature >= 38 or body pain
    (clinical_finding (snomed_concept "Breast lump" "finding"))
    (clinical_finding (snomed_concept "Pain of breast" "finding"))
    (clinical_finding (snomed_concept "Generalized aches and pains" "finding"))

    ;; Approach: is the patient breastfeeding?
    (clinical_finding (snomed_concept "Maternal breastfeeding" "finding"))

    ;; Not breastfeeding, painful breast/s: breast exam normal
    (clinical_finding (snomed_concept "Breast normal" "finding"))
  )
)

;; Page 55 - Breast symptoms: red box
(system_diagnosis_rule
  "Diagnose probable breast abscess"
  (diagnosis
    (snomed_concept "Abscess of breast" "disorder")
    probable
  )
  adult
  (and
    (or (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
        (clinical_finding (snomed_concept "Generalized aches and pains" "finding"))
    )
    (clinical_finding (snomed_concept "Breast lump" "finding"))
    (clinical_finding (snomed_concept "Pain of breast" "finding"))
  )
)

;; Page 55 - Breast symptoms: breastfeeding, painful breast/s with or without lump/s
(system_diagnosis_rule
  "Diagnose probable mastitis associated with lactation"
  (diagnosis
    (snomed_concept "Mastitis associated with lactation" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Maternal breastfeeding" "finding"))
    (clinical_finding (snomed_concept "Pain of breast" "finding"))
    (or (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
        (clinical_finding (snomed_concept "Generalized aches and pains" "finding"))
    )
  )
)
(system_diagnosis_rule
  "Diagnose probable breast engorgement"
  (diagnosis
    (snomed_concept "Milk engorgement of breast" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Maternal breastfeeding" "finding"))
    (clinical_finding (snomed_concept "Pain of breast" "finding"))
    (< (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
    (no (clinical_finding (snomed_concept "Generalized aches and pains" "finding")))
  )
)
(system_diagnosis_rule
  "Diagnose probable blocked milk duct"
  (diagnosis
    (snomed_concept "Obstruction of lactiferous duct" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Maternal breastfeeding" "finding"))
    (clinical_finding (snomed_concept "Pain of breast" "finding"))
    (< (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
    (no (clinical_finding (snomed_concept "Generalized aches and pains" "finding")))
  )
)

;; Page 55 - Breast symptoms: not related to breastfeeding, painful breast/s
(system_diagnosis_rule
  "Diagnose probable mastalgia"
  (diagnosis
    (snomed_concept "Pain of breast" "finding")
    probable
  )
  adult
  (and
    (no (clinical_finding (snomed_concept "Maternal breastfeeding" "finding")))
    (clinical_finding (snomed_concept "Pain of breast" "finding"))
    (clinical_finding (snomed_concept "Breast normal" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: breast symptoms with likely breast abscess"
  adult
  Urgent
  (active_condition (snomed_concept "Abscess of breast" "disorder"))
)

;; Page 83 - Painful skin
;; The red box is a pointer only ("Check if the patient needs urgent attention 82"),
;; so this page has no priority evaluation of its own. The rules below encode the
;; page's "X likely" logic (see 83-painful-skin-flowchart.md).
(task
  "Check for painful skin conditions"
  adult
  (clinical_finding (snomed_concept "Pain" "finding") (finding_site (snomed_concept "Skin structure" "body structure")))
  (check_for
    ;; Red, warm, painful lump (boil/abscess)
    (clinical_finding (snomed_concept "Mass of skin" "finding"))
    (clinical_finding (snomed_concept "Erythema" "finding"))
    (clinical_finding (snomed_concept "Warm skin" "finding"))

    ;; Recurrent boils/abscesses in axilla, groin or perineum (hidradenitis suppurativa)
    (clinical_finding (snomed_concept "Recurrent abscess of skin" "disorder"))
    (clinical_finding (snomed_concept "Abscess of axilla" "disorder"))
    (clinical_finding (snomed_concept "Abscess of groin" "disorder"))
    (clinical_finding (snomed_concept "Abscess of perineum" "disorder"))

    ;; Red, warm, swollen skin: are borders poorly or clearly defined?
    (clinical_finding (snomed_concept "Swelling of skin" "finding"))
    (clinical_finding (snomed_concept "Erythema" "finding") (qualifier (snomed_concept "Poorly defined" "qualifier value")))
    (clinical_finding (snomed_concept "Erythema" "finding") (qualifier (snomed_concept "Well defined" "qualifier value")) (qualifier (snomed_concept "Raised" "qualifier value")))

    ;; Painful blisters in a band along one side (shingles)
    (clinical_finding (snomed_concept "Blister of skin" "disorder") (qualifier (snomed_concept "Zosteriform" "qualifier value")) (qualifier (snomed_concept "Unilateral" "qualifier value")))
  )
)
(system_diagnosis_rule
  "Diagnose probable boil/abscess of painful skin"
  (diagnosis
    (snomed_concept "Abscess of skin and/or subcutaneous tissue" "disorder")
    probable
  )
  adult
  ;; "Red, warm, painful lump which may be fluctuant in the centre. May discharge pus."
  (and (clinical_finding (snomed_concept "Pain" "finding") (finding_site (snomed_concept "Skin structure" "body structure")))
       (clinical_finding (snomed_concept "Mass of skin" "finding"))
       (clinical_finding (snomed_concept "Erythema" "finding"))
       (clinical_finding (snomed_concept "Warm skin" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose probable hidradenitis suppurativa from recurrent painful abscesses"
  (diagnosis
    (snomed_concept "Hidradenitis suppurativa" "disorder")
    probable
  )
  adult
  ;; "If recurrent boils or abscesses: If painful abscesses in axilla, groin or perineum"
  (and (clinical_finding (snomed_concept "Pain" "finding") (finding_site (snomed_concept "Skin structure" "body structure")))
       (clinical_finding (snomed_concept "Recurrent abscess of skin" "disorder"))
       (or (clinical_finding (snomed_concept "Abscess of axilla" "disorder"))
           (clinical_finding (snomed_concept "Abscess of groin" "disorder"))
           (clinical_finding (snomed_concept "Abscess of perineum" "disorder"))
       )
  )
)
(system_diagnosis_rule
  "Diagnose probable cellulitis of painful skin"
  (diagnosis
    (snomed_concept "Cellulitis" "disorder")
    probable
  )
  adult
  ;; "Red, warm, swollen skin" + "Poorly-defined borders"
  (and (clinical_finding (snomed_concept "Pain" "finding") (finding_site (snomed_concept "Skin structure" "body structure")))
       (clinical_finding (snomed_concept "Erythema" "finding"))
       (clinical_finding (snomed_concept "Warm skin" "finding"))
       (clinical_finding (snomed_concept "Swelling of skin" "finding"))
       (clinical_finding (snomed_concept "Erythema" "finding") (qualifier (snomed_concept "Poorly defined" "qualifier value")))
  )
)
(system_diagnosis_rule
  "Diagnose probable erysipelas of painful skin"
  (diagnosis
    (snomed_concept "Erysipelas" "disorder")
    probable
  )
  adult
  ;; "Red, warm, swollen skin" + "Clearly-defined raised borders"
  (and (clinical_finding (snomed_concept "Pain" "finding") (finding_site (snomed_concept "Skin structure" "body structure")))
       (clinical_finding (snomed_concept "Erythema" "finding"))
       (clinical_finding (snomed_concept "Warm skin" "finding"))
       (clinical_finding (snomed_concept "Swelling of skin" "finding"))
       (clinical_finding (snomed_concept "Erythema" "finding") (qualifier (snomed_concept "Well defined" "qualifier value")) (qualifier (snomed_concept "Raised" "qualifier value")))
  )
)
(system_diagnosis_rule
  "Diagnose probable herpes zoster from painful blisters in a band"
  (diagnosis
    (snomed_concept "Herpes zoster" "disorder")
    probable
  )
  adult
  ;; "Painful blisters in a band along one side"
  (and (clinical_finding (snomed_concept "Pain" "finding") (finding_site (snomed_concept "Skin structure" "body structure")))
       (clinical_finding (snomed_concept "Blister of skin" "disorder") (qualifier (snomed_concept "Zosteriform" "qualifier value")) (qualifier (snomed_concept "Unilateral" "qualifier value")))
  )
)

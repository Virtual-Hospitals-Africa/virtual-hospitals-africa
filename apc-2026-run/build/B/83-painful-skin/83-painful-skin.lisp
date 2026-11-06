;; Page 83 - Painful skin
;; The red box is a pointer only ("Check if the patient needs urgent attention 82"), so this page has
;; no priority evaluation of its own. The rules below encode the page's four "likely" panels and the
;; "hidradenitis suppurativa likely" line. "Refer same day" lists are management and are not encoded.
(task
  "Check for painful skin conditions"
  adult
  (clinical_finding (snomed_concept "Pain of skin" "finding"))
  (check_for
    ;; Red, warm, painful lump (boil/abscess)
    (clinical_finding (snomed_concept "Mass of skin" "finding"))
    (clinical_finding (snomed_concept "Erythema" "finding"))
    (clinical_finding (snomed_concept "Warm skin" "finding"))

    ;; Red, warm, swollen skin: are borders poorly or clearly defined?
    (clinical_finding (snomed_concept "Swelling of skin" "finding"))
    (clinical_finding (snomed_concept "Erythema" "finding") (qualifier (snomed_concept "Poorly defined" "qualifier value")))
    (clinical_finding (snomed_concept "Erythema" "finding") (qualifier (snomed_concept "Well defined" "qualifier value")) (qualifier (snomed_concept "Raised" "qualifier value")))

    ;; Painful blisters in a band along one side (shingles)
    (clinical_finding (snomed_concept "Blister of skin" "disorder") (finding_site (snomed_concept "Dermatome" "body structure")) (qualifier (snomed_concept "Unilateral" "qualifier value")))

    ;; Recurrent boils or abscesses in axilla, groin or perineum (hidradenitis suppurativa)
    (clinical_finding (snomed_concept "Recurrent abscess of skin" "disorder") (finding_site (snomed_concept "Axillary region structure" "body structure")))
    (clinical_finding (snomed_concept "Recurrent abscess of skin" "disorder") (finding_site (snomed_concept "Inguinal region structure" "body structure")))
    (clinical_finding (snomed_concept "Recurrent abscess of skin" "disorder") (finding_site (snomed_concept "Perineal structure" "body structure")))
  )
)
(system_diagnosis_rule
  "Diagnose probable boil/abscess (painful skin)"
  (diagnosis
    (snomed_concept "Abscess of skin and/or subcutaneous tissue" "disorder")
    probable
  )
  adult
  ;; "Red, warm, painful lump which may be fluctuant in the centre. May discharge pus."
  ;; Fluctuance and pus are optional ("may"), so they are not required.
  (and (clinical_finding (snomed_concept "Pain of skin" "finding"))
       (clinical_finding (snomed_concept "Mass of skin" "finding"))
       (clinical_finding (snomed_concept "Erythema" "finding"))
       (clinical_finding (snomed_concept "Warm skin" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose probable cellulitis (painful skin)"
  (diagnosis
    (snomed_concept "Cellulitis" "disorder")
    probable
  )
  adult
  ;; Red, warm, swollen skin with poorly-defined borders
  (and (clinical_finding (snomed_concept "Erythema" "finding") (qualifier (snomed_concept "Poorly defined" "qualifier value")))
       (clinical_finding (snomed_concept "Warm skin" "finding"))
       (clinical_finding (snomed_concept "Swelling of skin" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose probable erysipelas (painful skin)"
  (diagnosis
    (snomed_concept "Erysipelas" "disorder")
    probable
  )
  adult
  ;; Red, warm, swollen skin with clearly-defined raised borders
  (and (clinical_finding (snomed_concept "Erythema" "finding") (qualifier (snomed_concept "Well defined" "qualifier value")) (qualifier (snomed_concept "Raised" "qualifier value")))
       (clinical_finding (snomed_concept "Warm skin" "finding"))
       (clinical_finding (snomed_concept "Swelling of skin" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose probable herpes zoster (painful skin)"
  (diagnosis
    (snomed_concept "Herpes zoster" "disorder")
    probable
  )
  adult
  ;; Painful blisters in a band along one side
  (and (clinical_finding (snomed_concept "Pain of skin" "finding"))
       (clinical_finding (snomed_concept "Blister of skin" "disorder") (finding_site (snomed_concept "Dermatome" "body structure")) (qualifier (snomed_concept "Unilateral" "qualifier value")))
  )
)
(system_diagnosis_rule
  "Diagnose probable hidradenitis suppurativa (painful skin)"
  (diagnosis
    (snomed_concept "Hidradenitis suppurativa" "disorder")
    probable
  )
  adult
  ;; "If recurrent boils or abscesses: If painful abscesses in axilla, groin or perineum, hidradenitis suppurativa likely"
  (and (clinical_finding (snomed_concept "Pain of skin" "finding"))
       (or (clinical_finding (snomed_concept "Recurrent abscess of skin" "disorder") (finding_site (snomed_concept "Axillary region structure" "body structure")))
           (clinical_finding (snomed_concept "Recurrent abscess of skin" "disorder") (finding_site (snomed_concept "Inguinal region structure" "body structure")))
           (clinical_finding (snomed_concept "Recurrent abscess of skin" "disorder") (finding_site (snomed_concept "Perineal structure" "body structure")))
       )
  )
)

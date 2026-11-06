;; Page 84 - Generalised itchy rash
;; Red box is pointer-only ("Check if the patient needs urgent attention 82"): no priority evaluation on this page.
;; The rules below encode the page's pattern-recognition grid (six "X likely" boxes).
(task
  "Check for causes of generalised itchy rash"
  adult
  (clinical_finding (snomed_concept "Pruritic rash" "disorder"))
  (check_for
    ;; Insect bites: red itchy crops of bumps
    (clinical_finding (snomed_concept "Papule of skin" "disorder"))

    ;; Scabies: small red bumps and burrows in webspaces of fingers, axillae, waist and genitals
    (clinical_finding (snomed_concept "Burrows in skin" "disorder"))
    (clinical_finding (snomed_concept "Papule of skin" "disorder") (finding_site (snomed_concept "Structure of interdigital web of hand" "body structure")))
    (clinical_finding (snomed_concept "Papule of skin" "disorder") (finding_site (snomed_concept "Axillary region structure" "body structure")))
    (clinical_finding (snomed_concept "Papule of skin" "disorder") (finding_site (snomed_concept "Structure of waist region of trunk" "body structure")))
    (clinical_finding (snomed_concept "Papule of skin" "disorder") (finding_site (snomed_concept "Genital structure" "body structure")))

    ;; Papular pruritic eruption: hyperpigmented, itchy bumps on limbs, trunk or face
    (clinical_finding (snomed_concept "Hyperpigmentation of skin" "disorder"))
    (clinical_finding (snomed_concept "Papule of skin" "disorder") (finding_site (snomed_concept "Limb structure" "body structure")))
    (clinical_finding (snomed_concept "Papule of skin" "disorder") (finding_site (snomed_concept "Trunk structure" "body structure")))
    (clinical_finding (snomed_concept "Papule of skin" "disorder") (finding_site (snomed_concept "Face structure" "body structure")))

    ;; Eczema: patches of dry, scaly, itchy skin on wrists, ankles, inside elbows or behind knees
    (clinical_finding (snomed_concept "Xeroderma" "disorder"))
    (clinical_finding (snomed_concept "Scaly skin" "finding") (finding_site (snomed_concept "Wrist region structure" "body structure")))
    (clinical_finding (snomed_concept "Scaly skin" "finding") (finding_site (snomed_concept "Ankle region structure" "body structure")))
    (clinical_finding (snomed_concept "Scaly skin" "finding") (finding_site (snomed_concept "Antecubital region structure" "body structure")))
    (clinical_finding (snomed_concept "Scaly skin" "finding") (finding_site (snomed_concept "Popliteal region structure" "body structure")))

    ;; Urticaria: very itchy, red, raised wheals that appear suddenly
    (clinical_finding (snomed_concept "Wheal" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))

    ;; Drug rash: diffuse red rash, appeared within 3 months of starting a new medication
    (clinical_finding (snomed_concept "Erythematous rash" "disorder") (qualifier (snomed_concept "Diffuse" "qualifier value")))
    (clinical_finding (snomed_concept "New medication commenced" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose probable insect bites (generalised itchy rash)"
  (diagnosis
    (snomed_concept "Insect bite - wound" "disorder")
    probable
  )
  adult
  (and (clinical_finding (snomed_concept "Pruritic rash" "disorder"))
       (clinical_finding (snomed_concept "Papule of skin" "disorder"))
  )
)
(system_diagnosis_rule
  "Diagnose probable scabies (generalised itchy rash)"
  (diagnosis
    (snomed_concept "Infestation caused by Sarcoptes scabiei var hominis" "disorder")
    probable
  )
  adult
  (and (clinical_finding (snomed_concept "Pruritic rash" "disorder"))
       (clinical_finding (snomed_concept "Burrows in skin" "disorder"))
       (or (clinical_finding (snomed_concept "Papule of skin" "disorder") (finding_site (snomed_concept "Structure of interdigital web of hand" "body structure")))
           (clinical_finding (snomed_concept "Papule of skin" "disorder") (finding_site (snomed_concept "Axillary region structure" "body structure")))
           (clinical_finding (snomed_concept "Papule of skin" "disorder") (finding_site (snomed_concept "Structure of waist region of trunk" "body structure")))
           (clinical_finding (snomed_concept "Papule of skin" "disorder") (finding_site (snomed_concept "Genital structure" "body structure")))
       )
  )
)
(system_diagnosis_rule
  "Diagnose probable papular pruritic eruption (generalised itchy rash)"
  (diagnosis
    (snomed_concept "Papular pruritic eruption of skin due to human immunodeficiency virus infection" "disorder")
    probable
  )
  adult
  (and (clinical_finding (snomed_concept "Pruritic rash" "disorder"))
       (clinical_finding (snomed_concept "Hyperpigmentation of skin" "disorder"))
       (or (clinical_finding (snomed_concept "Papule of skin" "disorder") (finding_site (snomed_concept "Limb structure" "body structure")))
           (clinical_finding (snomed_concept "Papule of skin" "disorder") (finding_site (snomed_concept "Trunk structure" "body structure")))
           (clinical_finding (snomed_concept "Papule of skin" "disorder") (finding_site (snomed_concept "Face structure" "body structure")))
       )
  )
)
(system_diagnosis_rule
  "Diagnose probable eczema (generalised itchy rash)"
  (diagnosis
    (snomed_concept "Eczema" "disorder")
    probable
  )
  adult
  (and (clinical_finding (snomed_concept "Pruritic rash" "disorder"))
       (clinical_finding (snomed_concept "Xeroderma" "disorder"))
       (or (clinical_finding (snomed_concept "Scaly skin" "finding") (finding_site (snomed_concept "Wrist region structure" "body structure")))
           (clinical_finding (snomed_concept "Scaly skin" "finding") (finding_site (snomed_concept "Ankle region structure" "body structure")))
           (clinical_finding (snomed_concept "Scaly skin" "finding") (finding_site (snomed_concept "Antecubital region structure" "body structure")))
           (clinical_finding (snomed_concept "Scaly skin" "finding") (finding_site (snomed_concept "Popliteal region structure" "body structure")))
       )
  )
)
(system_diagnosis_rule
  "Diagnose probable urticaria (generalised itchy rash)"
  (diagnosis
    (snomed_concept "Urticaria" "disorder")
    probable
  )
  adult
  (and (clinical_finding (snomed_concept "Pruritic rash" "disorder"))
       (clinical_finding (snomed_concept "Wheal" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
  )
)
(system_diagnosis_rule
  "Diagnose probable drug rash (generalised itchy rash)"
  (diagnosis
    (snomed_concept "Eruption caused by drug" "disorder")
    probable
  )
  adult
  (and (clinical_finding (snomed_concept "Pruritic rash" "disorder"))
       (clinical_finding (snomed_concept "Erythematous rash" "disorder") (qualifier (snomed_concept "Diffuse" "qualifier value")))
       (<= (onset (clinical_finding (snomed_concept "New medication commenced" "finding"))) (time_ago 3 months))
  )
)

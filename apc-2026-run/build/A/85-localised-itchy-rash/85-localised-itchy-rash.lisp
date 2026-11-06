;; Page 85 - Localised itchy rash
;; The red box is a pointer only ("Check if the patient needs urgent attention 82"): no priority evaluation here.
;; See 85-localised-itchy-rash-flowchart.md for the logic below.
(task
  "Check for localised itchy rash conditions"
  adult
  (clinical_finding (snomed_concept "Pruritic rash" "disorder"))
  (check_for
    ;; Scabies
    (clinical_finding (snomed_concept "Itching" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Papule of skin" "disorder") (qualifier (snomed_concept "Red color" "qualifier value")))
    (clinical_finding (snomed_concept "Burrow" "morphologic abnormality") (finding_site (snomed_concept "Skin structure of interdigital web of hand" "body structure")))
    (clinical_finding (snomed_concept "Burrow" "morphologic abnormality") (finding_site (snomed_concept "Axillary region structure" "body structure")))
    (clinical_finding (snomed_concept "Burrow" "morphologic abnormality") (finding_site (snomed_concept "Structure of waist region of trunk" "body structure")))
    (clinical_finding (snomed_concept "Burrow" "morphologic abnormality") (finding_site (snomed_concept "Genital structure" "body structure")))

    ;; Eczema
    (clinical_finding (snomed_concept "Scaly skin" "finding") (qualifier (snomed_concept "Dry" "qualifier value")) (finding_site (snomed_concept "Wrist region structure" "body structure")))
    (clinical_finding (snomed_concept "Scaly skin" "finding") (qualifier (snomed_concept "Dry" "qualifier value")) (finding_site (snomed_concept "Ankle region structure" "body structure")))
    (clinical_finding (snomed_concept "Scaly skin" "finding") (qualifier (snomed_concept "Dry" "qualifier value")) (finding_site (snomed_concept "Antecubital region structure" "body structure")))
    (clinical_finding (snomed_concept "Scaly skin" "finding") (qualifier (snomed_concept "Dry" "qualifier value")) (finding_site (snomed_concept "Popliteal fossa structure" "body structure")))

    ;; Fixed drug eruption
    (clinical_finding (snomed_concept "Macule" "morphologic abnormality") (qualifier (snomed_concept "Dark color" "qualifier value")) (qualifier (snomed_concept "Round shape" "qualifier value")))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Drug or medicament" "substance"))

    ;; Insect bites: papular urticaria, impetigo
    (clinical_finding (snomed_concept "Blister of skin" "disorder"))
    (clinical_finding (snomed_concept "Hyperpigmentation of skin" "disorder"))
    (clinical_finding (snomed_concept "Crust on skin" "finding") (qualifier (snomed_concept "Yellow color" "qualifier value")))

    ;; Psoriasis
    (clinical_finding (snomed_concept "Skin plaque" "disorder") (qualifier (snomed_concept "Well defined" "qualifier value")) (qualifier (snomed_concept "Raised" "qualifier value")))
    (clinical_finding (snomed_concept "Scaly skin" "finding") (qualifier (snomed_concept "Silver color" "qualifier value")))

    ;; Pityriasis rosea
    (clinical_finding (snomed_concept "Skin lesion" "disorder") (qualifier (snomed_concept "Large" "qualifier value")) (qualifier (snomed_concept "Annular shape" "qualifier value")) (finding_site (snomed_concept "Anterior chest wall structure" "body structure")))
    (clinical_finding (snomed_concept "Skin lesion" "disorder") (qualifier (snomed_concept "Large" "qualifier value")) (qualifier (snomed_concept "Annular shape" "qualifier value")) (finding_site (snomed_concept "Structure of posterior region of trunk" "body structure")))
    (clinical_finding (snomed_concept "Scaly skin" "finding") (qualifier (snomed_concept "Multiple" "qualifier value")) (qualifier (snomed_concept "Small" "qualifier value")))

    ;; Tinea corporis
    (clinical_finding (snomed_concept "Skin lesion" "disorder") (qualifier (snomed_concept "Annular shape" "qualifier value")) (qualifier (snomed_concept "Raised" "qualifier value")))
    (clinical_finding (snomed_concept "Scaly skin" "finding") (qualifier (snomed_concept "Annular shape" "qualifier value")))

    ;; Tinea pedis
    (clinical_finding (snomed_concept "Fissure" "morphologic abnormality") (finding_site (snomed_concept "Skin structure of interdigital web of foot" "body structure")))
    (clinical_finding (snomed_concept "Peeling of skin" "finding") (finding_site (snomed_concept "Skin structure of interdigital web of foot" "body structure")))
    (clinical_finding (snomed_concept "Scaly skin" "finding") (finding_site (snomed_concept "Skin structure of interdigital web of foot" "body structure")))
    (clinical_finding (snomed_concept "Scaly skin" "finding") (qualifier (snomed_concept "Thickened" "qualifier value")) (finding_site (snomed_concept "Skin structure of sole of foot" "body structure")))
    (clinical_finding (snomed_concept "Scaly skin" "finding") (qualifier (snomed_concept "Thickened" "qualifier value")) (finding_site (snomed_concept "Heel structure" "body structure")))
    (clinical_finding (snomed_concept "Scaly skin" "finding") (qualifier (snomed_concept "Thickened" "qualifier value")) (finding_site (snomed_concept "Skin structure of border of foot" "body structure")))
  )
)
(system_diagnosis_rule
  "Diagnose probable scabies (localised itchy rash)"
  (diagnosis
    (snomed_concept "Infestation caused by Sarcoptes scabiei var hominis" "disorder")
    probable
  )
  adult
  ;; Very itchy, small red bumps and burrows in webspaces of fingers, axillae, waist or genitals
  (and (clinical_finding (snomed_concept "Itching" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Papule of skin" "disorder") (qualifier (snomed_concept "Red color" "qualifier value")))
    (or (clinical_finding (snomed_concept "Burrow" "morphologic abnormality") (finding_site (snomed_concept "Skin structure of interdigital web of hand" "body structure")))
         (clinical_finding (snomed_concept "Burrow" "morphologic abnormality") (finding_site (snomed_concept "Axillary region structure" "body structure")))
         (clinical_finding (snomed_concept "Burrow" "morphologic abnormality") (finding_site (snomed_concept "Structure of waist region of trunk" "body structure")))
         (clinical_finding (snomed_concept "Burrow" "morphologic abnormality") (finding_site (snomed_concept "Genital structure" "body structure")))))
)
(system_diagnosis_rule
  "Diagnose probable eczema (localised itchy rash)"
  (diagnosis
    (snomed_concept "Eczema" "disorder")
    probable
  )
  adult
  ;; Patches of dry, scaly, itchy skin on wrists, ankles, inside elbows or behind knees (itchy = the trigger)
  (and (clinical_finding (snomed_concept "Pruritic rash" "disorder"))
    (or (clinical_finding (snomed_concept "Scaly skin" "finding") (qualifier (snomed_concept "Dry" "qualifier value")) (finding_site (snomed_concept "Wrist region structure" "body structure")))
         (clinical_finding (snomed_concept "Scaly skin" "finding") (qualifier (snomed_concept "Dry" "qualifier value")) (finding_site (snomed_concept "Ankle region structure" "body structure")))
         (clinical_finding (snomed_concept "Scaly skin" "finding") (qualifier (snomed_concept "Dry" "qualifier value")) (finding_site (snomed_concept "Antecubital region structure" "body structure")))
         (clinical_finding (snomed_concept "Scaly skin" "finding") (qualifier (snomed_concept "Dry" "qualifier value")) (finding_site (snomed_concept "Popliteal fossa structure" "body structure")))))
)
(system_diagnosis_rule
  "Diagnose probable fixed drug eruption (localised itchy rash)"
  (diagnosis
    (snomed_concept "Fixed drug eruption" "disorder")
    probable
  )
  adult
  ;; Dark coloured round macules after ingestion of a medication
  (and (clinical_finding (snomed_concept "Macule" "morphologic abnormality") (qualifier (snomed_concept "Dark color" "qualifier value")) (qualifier (snomed_concept "Round shape" "qualifier value")))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Drug or medicament" "substance")))
)
(system_diagnosis_rule
  "Diagnose probable insect bites (localised itchy rash)"
  (diagnosis
    (snomed_concept "Insect bite - wound" "disorder")
    probable
  )
  adult
  ;; Q = Yes: red itchy bumps (itchy = the trigger)
  (and (clinical_finding (snomed_concept "Pruritic rash" "disorder"))
    (clinical_finding (snomed_concept "Papule of skin" "disorder") (qualifier (snomed_concept "Red color" "qualifier value"))))
)
(system_diagnosis_rule
  "Diagnose probable papular urticaria (localised itchy rash)"
  (diagnosis
    (snomed_concept "Prurigo simplex" "disorder")
    probable
  )
  adult
  ;; Insect bites box: if blisters/heals with darkened skin, papular urticaria likely (SNOMED synonym of Prurigo simplex)
  (and (clinical_finding (snomed_concept "Pruritic rash" "disorder"))
    (clinical_finding (snomed_concept "Papule of skin" "disorder") (qualifier (snomed_concept "Red color" "qualifier value")))
    (or (clinical_finding (snomed_concept "Blister of skin" "disorder"))
         (clinical_finding (snomed_concept "Hyperpigmentation of skin" "disorder"))))
)
(system_diagnosis_rule
  "Diagnose probable impetigo (localised itchy rash)"
  (diagnosis
    (snomed_concept "Impetigo" "disorder")
    probable
  )
  adult
  ;; Insect bites box: if yellow crusts, impetigo likely
  (and (clinical_finding (snomed_concept "Pruritic rash" "disorder"))
    (clinical_finding (snomed_concept "Papule of skin" "disorder") (qualifier (snomed_concept "Red color" "qualifier value")))
    (clinical_finding (snomed_concept "Crust on skin" "finding") (qualifier (snomed_concept "Yellow color" "qualifier value"))))
)
(system_diagnosis_rule
  "Diagnose probable psoriasis (localised itchy rash)"
  (diagnosis
    (snomed_concept "Psoriasis" "disorder")
    probable
  )
  adult
  ;; Well-defined, raised plaques covered with silvery scale
  (and (clinical_finding (snomed_concept "Skin plaque" "disorder") (qualifier (snomed_concept "Well defined" "qualifier value")) (qualifier (snomed_concept "Raised" "qualifier value")))
    (clinical_finding (snomed_concept "Scaly skin" "finding") (qualifier (snomed_concept "Silver color" "qualifier value"))))
)
(system_diagnosis_rule
  "Diagnose probable pityriasis rosea (localised itchy rash)"
  (diagnosis
    (snomed_concept "Pityriasis rosea" "disorder")
    probable
  )
  adult
  ;; One large ring on chest/back (herald patch), followed by smaller, oval, scaly patches
  (and (or (clinical_finding (snomed_concept "Skin lesion" "disorder") (qualifier (snomed_concept "Large" "qualifier value")) (qualifier (snomed_concept "Annular shape" "qualifier value")) (finding_site (snomed_concept "Anterior chest wall structure" "body structure")))
         (clinical_finding (snomed_concept "Skin lesion" "disorder") (qualifier (snomed_concept "Large" "qualifier value")) (qualifier (snomed_concept "Annular shape" "qualifier value")) (finding_site (snomed_concept "Structure of posterior region of trunk" "body structure"))))
    (clinical_finding (snomed_concept "Scaly skin" "finding") (qualifier (snomed_concept "Multiple" "qualifier value")) (qualifier (snomed_concept "Small" "qualifier value"))))
)
(system_diagnosis_rule
  "Diagnose probable tinea corporis (localised itchy rash)"
  (diagnosis
    (snomed_concept "Tinea corporis" "disorder")
    probable
  )
  adult
  ;; Slow-growing lesion/s with raised edges/ring of scale, clear in centre
  (or (clinical_finding (snomed_concept "Skin lesion" "disorder") (qualifier (snomed_concept "Annular shape" "qualifier value")) (qualifier (snomed_concept "Raised" "qualifier value")))
    (clinical_finding (snomed_concept "Scaly skin" "finding") (qualifier (snomed_concept "Annular shape" "qualifier value"))))
)
(system_diagnosis_rule
  "Diagnose probable tinea pedis (localised itchy rash)"
  (diagnosis
    (snomed_concept "Tinea pedis" "disorder")
    probable
  )
  adult
  ;; Cracks, peeling or scaly lesions between toes, or thickened scaly skin on soles/heels/sides of feet
  (or (clinical_finding (snomed_concept "Fissure" "morphologic abnormality") (finding_site (snomed_concept "Skin structure of interdigital web of foot" "body structure")))
    (clinical_finding (snomed_concept "Peeling of skin" "finding") (finding_site (snomed_concept "Skin structure of interdigital web of foot" "body structure")))
    (clinical_finding (snomed_concept "Scaly skin" "finding") (finding_site (snomed_concept "Skin structure of interdigital web of foot" "body structure")))
    (clinical_finding (snomed_concept "Scaly skin" "finding") (qualifier (snomed_concept "Thickened" "qualifier value")) (finding_site (snomed_concept "Skin structure of sole of foot" "body structure")))
    (clinical_finding (snomed_concept "Scaly skin" "finding") (qualifier (snomed_concept "Thickened" "qualifier value")) (finding_site (snomed_concept "Heel structure" "body structure")))
    (clinical_finding (snomed_concept "Scaly skin" "finding") (qualifier (snomed_concept "Thickened" "qualifier value")) (finding_site (snomed_concept "Skin structure of border of foot" "body structure"))))
)

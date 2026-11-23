;; Page 85 - Localised itchy rash
;; Red box: "Check if the patient needs urgent attention 82" is a pointer only (see page 82); no priority evaluation here.
;; The page's own logic (bullets and the Yes/No algorithm) is below; see 85-localised-itchy-rash-flowchart.md.
(task
  "Check for localised itchy rash conditions"
  adult
  (clinical_finding (snomed_concept "Pruritic rash" "disorder"))
  (check_for
    ;; Scabies: very itchy, small red bumps and burrows in webspaces of fingers, axillae, waist or genitals
    (clinical_finding (snomed_concept "Itching" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Papule of skin" "disorder") (qualifier (snomed_concept "Red color" "qualifier value")))
    (clinical_finding (snomed_concept "Burrows in skin" "disorder") (finding_site (snomed_concept "Structure of interdigital web of hand" "body structure")))
    (clinical_finding (snomed_concept "Burrows in skin" "disorder") (finding_site (snomed_concept "Axillary region structure" "body structure")))
    (clinical_finding (snomed_concept "Burrows in skin" "disorder") (finding_site (snomed_concept "Structure of waist region of trunk" "body structure")))
    (clinical_finding (snomed_concept "Burrows in skin" "disorder") (finding_site (snomed_concept "Genital structure" "body structure")))

    ;; Eczema: patches of dry, scaly, itchy skin on wrists, ankles, inside elbows or behind knees
    (clinical_finding (snomed_concept "Scaly skin" "finding") (qualifier (snomed_concept "Dry" "qualifier value")) (finding_site (snomed_concept "Wrist region structure" "body structure")))
    (clinical_finding (snomed_concept "Scaly skin" "finding") (qualifier (snomed_concept "Dry" "qualifier value")) (finding_site (snomed_concept "Ankle region structure" "body structure")))
    (clinical_finding (snomed_concept "Scaly skin" "finding") (qualifier (snomed_concept "Dry" "qualifier value")) (finding_site (snomed_concept "Antecubital region structure" "body structure")))
    (clinical_finding (snomed_concept "Scaly skin" "finding") (qualifier (snomed_concept "Dry" "qualifier value")) (finding_site (snomed_concept "Popliteal fossa structure" "body structure")))

    ;; Fixed drug eruption: dark coloured round macules after ingestion of a medication
    (clinical_finding (snomed_concept "Macule of skin" "disorder") (qualifier (snomed_concept "Dark color" "qualifier value")) (qualifier (snomed_concept "Round shape" "qualifier value")))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Drug or medicament" "substance"))

    ;; Insect bites branch: blistered / healed with darkening; yellow crusts
    (clinical_finding (snomed_concept "Blister of skin" "disorder"))
    (clinical_finding (snomed_concept "Post-inflammatory hyperpigmentation" "disorder"))
    (clinical_finding (snomed_concept "Crust on skin" "finding") (qualifier (snomed_concept "Yellow color" "qualifier value")))

    ;; Psoriasis: well-defined, raised plaques covered with silvery scale
    (clinical_finding (snomed_concept "Skin plaque" "disorder") (qualifier (snomed_concept "Well defined" "qualifier value")) (qualifier (snomed_concept "Raised" "qualifier value")))
    (clinical_finding (snomed_concept "Scaly skin" "finding") (qualifier (snomed_concept "Silver color" "qualifier value")))

    ;; Pityriasis rosea: one large ring on chest/back (herald patch), then smaller, oval patches
    (clinical_finding (snomed_concept "Skin lesion" "disorder") (qualifier (snomed_concept "Large" "qualifier value")) (qualifier (snomed_concept "Annular shape" "qualifier value")) (finding_site (snomed_concept "Skin structure of chest" "body structure")))
    (clinical_finding (snomed_concept "Skin lesion" "disorder") (qualifier (snomed_concept "Large" "qualifier value")) (qualifier (snomed_concept "Annular shape" "qualifier value")) (finding_site (snomed_concept "Skin structure of back" "body structure")))
    (clinical_finding (snomed_concept "Oval shaped lesion" "finding") (qualifier (snomed_concept "Multiple" "qualifier value")) (qualifier (snomed_concept "Small" "qualifier value")))

    ;; Tinea corporis: lesion/s with raised edges / ring of scale
    (clinical_finding (snomed_concept "Skin lesion" "disorder") (qualifier (snomed_concept "Annular shape" "qualifier value")) (qualifier (snomed_concept "Raised" "qualifier value")))
    (clinical_finding (snomed_concept "Scaly skin" "finding") (qualifier (snomed_concept "Annular shape" "qualifier value")))

    ;; Tinea pedis: cracks, peeling or scaly lesions between toes, or thickened scaly skin on soles/heels/sides of feet
    (clinical_finding (snomed_concept "Fissure in skin" "disorder") (finding_site (snomed_concept "Structure of interdigital web of foot" "body structure")))
    (clinical_finding (snomed_concept "Peeling of skin" "finding") (finding_site (snomed_concept "Structure of interdigital web of foot" "body structure")))
    (clinical_finding (snomed_concept "Scaly skin" "finding") (finding_site (snomed_concept "Structure of interdigital web of foot" "body structure")))
    (clinical_finding (snomed_concept "Scaly skin" "finding") (qualifier (snomed_concept "Thickened" "qualifier value")) (finding_site (snomed_concept "Skin structure of sole of foot" "body structure")))
    (clinical_finding (snomed_concept "Scaly skin" "finding") (qualifier (snomed_concept "Thickened" "qualifier value")) (finding_site (snomed_concept "Skin structure of heel" "body structure")))
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
  ;; "very itchy, small red bumps and burrows in webspaces of fingers, axillae, waist or genitals, scabies likely"
  (and (clinical_finding (snomed_concept "Itching" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Papule of skin" "disorder") (qualifier (snomed_concept "Red color" "qualifier value")))
    (or (clinical_finding (snomed_concept "Burrows in skin" "disorder") (finding_site (snomed_concept "Structure of interdigital web of hand" "body structure")))
      (clinical_finding (snomed_concept "Burrows in skin" "disorder") (finding_site (snomed_concept "Axillary region structure" "body structure")))
      (clinical_finding (snomed_concept "Burrows in skin" "disorder") (finding_site (snomed_concept "Structure of waist region of trunk" "body structure")))
      (clinical_finding (snomed_concept "Burrows in skin" "disorder") (finding_site (snomed_concept "Genital structure" "body structure")))))
)
(system_diagnosis_rule
  "Diagnose probable eczema (localised itchy rash)"
  (diagnosis
    (snomed_concept "Eczema" "disorder")
    probable
  )
  adult
  ;; "patches of dry, scaly, itchy skin on wrists, ankles, inside elbows or behind knees" (itchy = the trigger)
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
  ;; "dark coloured round macules ... after ingestion of a medication"
  (and (clinical_finding (snomed_concept "Macule of skin" "disorder") (qualifier (snomed_concept "Dark color" "qualifier value")) (qualifier (snomed_concept "Round shape" "qualifier value")))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Drug or medicament" "substance")))
)
(system_diagnosis_rule
  "Diagnose probable insect bites (localised itchy rash)"
  (diagnosis
    (snomed_concept "Insect bite - wound" "disorder")
    probable
  )
  adult
  ;; Q = Yes: "red itchy bumps" (itchy = the trigger; blistering / darkening optional: "may have")
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
  ;; Insect bites box: "If blisters/heals with darkened skin, papular urticaria likely" (Prurigo simplex = papular urticaria)
  (and (clinical_finding (snomed_concept "Pruritic rash" "disorder"))
    (clinical_finding (snomed_concept "Papule of skin" "disorder") (qualifier (snomed_concept "Red color" "qualifier value")))
    (or (clinical_finding (snomed_concept "Blister of skin" "disorder"))
      (clinical_finding (snomed_concept "Post-inflammatory hyperpigmentation" "disorder"))))
)
(system_diagnosis_rule
  "Diagnose probable impetigo (localised itchy rash)"
  (diagnosis
    (snomed_concept "Impetigo" "disorder")
    probable
  )
  adult
  ;; Insect bites box: "If yellow crusts, impetigo likely"
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
  ;; Q = No, head/face/trunk/limbs: "Well-defined, raised plaques covered with silvery scale"
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
  ;; Q = No: one large ring on chest/back (herald patch), followed by smaller, oval, scaly patches
  (and (or (clinical_finding (snomed_concept "Skin lesion" "disorder") (qualifier (snomed_concept "Large" "qualifier value")) (qualifier (snomed_concept "Annular shape" "qualifier value")) (finding_site (snomed_concept "Skin structure of chest" "body structure")))
      (clinical_finding (snomed_concept "Skin lesion" "disorder") (qualifier (snomed_concept "Large" "qualifier value")) (qualifier (snomed_concept "Annular shape" "qualifier value")) (finding_site (snomed_concept "Skin structure of back" "body structure"))))
    (clinical_finding (snomed_concept "Oval shaped lesion" "finding") (qualifier (snomed_concept "Multiple" "qualifier value")) (qualifier (snomed_concept "Small" "qualifier value"))))
)
(system_diagnosis_rule
  "Diagnose probable tinea corporis (localised itchy rash)"
  (diagnosis
    (snomed_concept "Tinea corporis" "disorder")
    probable
  )
  adult
  ;; Q = No: "Slow-growing lesion/s with raised edges/ring of scale, clear in centre"
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
  ;; Q = No, feet: "Cracks, peeling or scaly lesions between toes, or thickened scaly skin on soles/heels/sides of feet"
  (or (clinical_finding (snomed_concept "Fissure in skin" "disorder") (finding_site (snomed_concept "Structure of interdigital web of foot" "body structure")))
    (clinical_finding (snomed_concept "Peeling of skin" "finding") (finding_site (snomed_concept "Structure of interdigital web of foot" "body structure")))
    (clinical_finding (snomed_concept "Scaly skin" "finding") (finding_site (snomed_concept "Structure of interdigital web of foot" "body structure")))
    (clinical_finding (snomed_concept "Scaly skin" "finding") (qualifier (snomed_concept "Thickened" "qualifier value")) (finding_site (snomed_concept "Skin structure of sole of foot" "body structure")))
    (clinical_finding (snomed_concept "Scaly skin" "finding") (qualifier (snomed_concept "Thickened" "qualifier value")) (finding_site (snomed_concept "Skin structure of heel" "body structure")))
    (clinical_finding (snomed_concept "Scaly skin" "finding") (qualifier (snomed_concept "Thickened" "qualifier value")) (finding_site (snomed_concept "Skin structure of border of foot" "body structure"))))
)

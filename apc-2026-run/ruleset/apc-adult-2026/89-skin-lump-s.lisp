;; Page 89 - Skin lump/s
(task
  "Check for skin lump/s features"
  adult
  (or (clinical_finding (snomed_concept "Mass of skin" "finding"))
      (clinical_finding (snomed_concept "Mass of subcutaneous tissue" "finding")))
  (check_for
    ;; Mole (red box: refer same week)
    (clinical_finding (snomed_concept "Melanocytic nevus" "disorder"))

    ;; Boil/abscess: painful, firm, red, warm lump which softens in the centre to discharge pus
    (clinical_finding (snomed_concept "Pain of skin" "finding"))
    (clinical_finding (snomed_concept "Mass of skin" "finding") (qualifier (snomed_concept "Firm" "qualifier value")))
    (clinical_finding (snomed_concept "Redness of skin over lesion" "finding"))
    (clinical_finding (snomed_concept "Temperature of skin over lesion warm" "finding"))
    (clinical_finding (snomed_concept "Fluctuant" "finding"))
    (clinical_finding (snomed_concept "Skin discharge" "finding"))

    ;; Warts: round, raised papules with rough surfaces
    (clinical_finding (snomed_concept "Papule of skin" "disorder") (qualifier (snomed_concept "Round shape" "qualifier value")) (qualifier (snomed_concept "Raised" "qualifier value")))
    (clinical_finding (snomed_concept "Rough skin" "finding"))

    ;; Molluscum contagiosum: small pearly bumps with central dimples; does not involve palms/soles
    (clinical_finding (snomed_concept "Papule of skin" "disorder") (qualifier (snomed_concept "Small" "qualifier value")))
    (clinical_finding (snomed_concept "Skin dimple" "finding"))
    (clinical_finding (snomed_concept "Papule of skin" "disorder") (finding_site (snomed_concept "Palm (region) structure" "body structure")))
    (clinical_finding (snomed_concept "Papule of skin" "disorder") (finding_site (snomed_concept "Structure of sole of foot" "body structure")))

    ;; Kaposi's sarcoma: painless, purple/brown lumps on skin
    (clinical_finding (snomed_concept "Mass of skin" "finding") (qualifier (snomed_concept "Painless" "qualifier value")))
    (clinical_finding (snomed_concept "Mass of skin" "finding") (qualifier (snomed_concept "Purple color" "qualifier value")))
    (clinical_finding (snomed_concept "Mass of skin" "finding") (qualifier (snomed_concept "Brown color" "qualifier value")))

    ;; Lump beneath skin: epidermoid cyst / lipoma
    (clinical_finding (snomed_concept "Mass of subcutaneous tissue" "finding") (qualifier (snomed_concept "Smooth" "qualifier value")) (qualifier (snomed_concept "Well defined" "qualifier value")))
    (clinical_finding (snomed_concept "Mass of subcutaneous tissue" "finding") (qualifier (snomed_concept "Round shape" "qualifier value")) (qualifier (snomed_concept "Firm" "qualifier value")))
    (clinical_finding (snomed_concept "Mass of subcutaneous tissue" "finding") (qualifier (snomed_concept "Soft" "qualifier value")) (qualifier (snomed_concept "Painless" "qualifier value")))

    ;; Acne: red papules, pustules, nodules and blackheads
    (clinical_finding (snomed_concept "Papule of skin" "disorder") (qualifier (snomed_concept "Red color" "qualifier value")))
    (clinical_finding (snomed_concept "Pustule" "disorder"))
    (clinical_finding (snomed_concept "Skin nodule" "disorder"))
    (clinical_finding (snomed_concept "Comedone" "disorder"))
  )
)
(task
  "Check for mole features needing same-week referral (skin lump/s)"
  adult
  (clinical_finding (snomed_concept "Melanocytic nevus" "disorder"))
  (check_for
    ;; Is irregular in shape or colour
    (clinical_finding (snomed_concept "Irregular outline of pigmented skin lesion" "disorder"))
    (clinical_finding (snomed_concept "Mixed color of pigmented skin lesion" "disorder"))

    ;; Changed in size, shape or colour
    (clinical_finding (snomed_concept "Change in skin lesion" "finding"))
    (clinical_finding (snomed_concept "Changing shape of pigmented skin lesion" "disorder"))
    (clinical_finding (snomed_concept "Changing color of pigmented skin lesion" "disorder"))

    ;; Bleeds easily / Itches
    (clinical_finding (snomed_concept "Bleeds easily" "finding"))
    (clinical_finding (snomed_concept "Itching of pigmented skin lesion" "disorder"))
  )
)
(task
  "Measure width of mole (skin lump/s)"
  adult
  (clinical_finding (snomed_concept "Melanocytic nevus" "disorder"))
  (measure
    (measurement (snomed_concept "Lesion size, largest dimension" "observable entity") mm)
  )
)
(system_diagnosis_rule
  "Diagnose probable boil (skin lump/s)"
  (diagnosis
    (snomed_concept "Furuncle" "disorder")
    probable
  )
  adult
  (and (clinical_finding (snomed_concept "Pain of skin" "finding"))
       (clinical_finding (snomed_concept "Mass of skin" "finding") (qualifier (snomed_concept "Firm" "qualifier value")))
       (clinical_finding (snomed_concept "Redness of skin over lesion" "finding"))
       (clinical_finding (snomed_concept "Temperature of skin over lesion warm" "finding"))
       (clinical_finding (snomed_concept "Fluctuant" "finding"))
       (clinical_finding (snomed_concept "Skin discharge" "finding")))
)
(system_diagnosis_rule
  "Diagnose probable skin abscess (skin lump/s)"
  (diagnosis
    (snomed_concept "Abscess of skin and/or subcutaneous tissue" "disorder")
    probable
  )
  adult
  (and (clinical_finding (snomed_concept "Pain of skin" "finding"))
       (clinical_finding (snomed_concept "Mass of skin" "finding") (qualifier (snomed_concept "Firm" "qualifier value")))
       (clinical_finding (snomed_concept "Redness of skin over lesion" "finding"))
       (clinical_finding (snomed_concept "Temperature of skin over lesion warm" "finding"))
       (clinical_finding (snomed_concept "Fluctuant" "finding"))
       (clinical_finding (snomed_concept "Skin discharge" "finding")))
)
(system_diagnosis_rule
  "Diagnose probable warts (skin lump/s)"
  (diagnosis
    (snomed_concept "Viral wart of skin and/or mucous membrane caused by human papillomavirus" "disorder")
    probable
  )
  adult
  (and (clinical_finding (snomed_concept "Papule of skin" "disorder") (qualifier (snomed_concept "Round shape" "qualifier value")) (qualifier (snomed_concept "Raised" "qualifier value")))
       (clinical_finding (snomed_concept "Rough skin" "finding")))
)
(system_diagnosis_rule
  "Diagnose probable molluscum contagiosum (skin lump/s)"
  (diagnosis
    (snomed_concept "Infection of skin caused by Molluscum contagiosum" "disorder")
    probable
  )
  adult
  (and (clinical_finding (snomed_concept "Papule of skin" "disorder") (qualifier (snomed_concept "Small" "qualifier value")))
       (clinical_finding (snomed_concept "Skin dimple" "finding"))
       (no (clinical_finding (snomed_concept "Papule of skin" "disorder") (finding_site (snomed_concept "Palm (region) structure" "body structure"))))
       (no (clinical_finding (snomed_concept "Papule of skin" "disorder") (finding_site (snomed_concept "Structure of sole of foot" "body structure")))))
)
(system_diagnosis_rule
  "Diagnose probable Kaposi's sarcoma (skin lump/s)"
  (diagnosis
    (snomed_concept "Kaposi's sarcoma" "disorder")
    probable
  )
  adult
  (and (clinical_finding (snomed_concept "Mass of skin" "finding") (qualifier (snomed_concept "Painless" "qualifier value")))
       (or (clinical_finding (snomed_concept "Mass of skin" "finding") (qualifier (snomed_concept "Purple color" "qualifier value")))
           (clinical_finding (snomed_concept "Mass of skin" "finding") (qualifier (snomed_concept "Brown color" "qualifier value")))))
)
(system_diagnosis_rule
  "Diagnose probable epidermoid cyst (skin lump/s)"
  (diagnosis
    (snomed_concept "Epidermoid cyst of skin" "disorder")
    probable
  )
  adult
  (and (clinical_finding (snomed_concept "Mass of subcutaneous tissue" "finding") (qualifier (snomed_concept "Smooth" "qualifier value")) (qualifier (snomed_concept "Well defined" "qualifier value")))
       (clinical_finding (snomed_concept "Mass of subcutaneous tissue" "finding") (qualifier (snomed_concept "Round shape" "qualifier value")) (qualifier (snomed_concept "Firm" "qualifier value"))))
)
(system_diagnosis_rule
  "Diagnose probable lipoma (skin lump/s)"
  (diagnosis
    (snomed_concept "Lipoma" "disorder")
    probable
  )
  adult
  (and (clinical_finding (snomed_concept "Mass of subcutaneous tissue" "finding") (qualifier (snomed_concept "Smooth" "qualifier value")) (qualifier (snomed_concept "Well defined" "qualifier value")))
       (clinical_finding (snomed_concept "Mass of subcutaneous tissue" "finding") (qualifier (snomed_concept "Soft" "qualifier value")) (qualifier (snomed_concept "Painless" "qualifier value"))))
)
(system_diagnosis_rule
  "Diagnose probable acne (skin lump/s)"
  (diagnosis
    (snomed_concept "Acne" "disorder")
    probable
  )
  adult
  (or (clinical_finding (snomed_concept "Papule of skin" "disorder") (qualifier (snomed_concept "Red color" "qualifier value")))
      (clinical_finding (snomed_concept "Pustule" "disorder"))
      (clinical_finding (snomed_concept "Skin nodule" "disorder"))
      (clinical_finding (snomed_concept "Comedone" "disorder")))
)
(system_priority_evaluation
  "Urgent: mole needing same-week referral (skin lump/s)"
  adult
  Urgent
  (and (clinical_finding (snomed_concept "Melanocytic nevus" "disorder"))
       (or (clinical_finding (snomed_concept "Irregular outline of pigmented skin lesion" "disorder"))
           (clinical_finding (snomed_concept "Mixed color of pigmented skin lesion" "disorder"))
           (clinical_finding (snomed_concept "Change in skin lesion" "finding"))
           (clinical_finding (snomed_concept "Changing shape of pigmented skin lesion" "disorder"))
           (clinical_finding (snomed_concept "Changing color of pigmented skin lesion" "disorder"))
           (> (measurement (snomed_concept "Lesion size, largest dimension" "observable entity") mm) 6)
           (clinical_finding (snomed_concept "Bleeds easily" "finding"))
           (clinical_finding (snomed_concept "Itching of pigmented skin lesion" "disorder"))))
)

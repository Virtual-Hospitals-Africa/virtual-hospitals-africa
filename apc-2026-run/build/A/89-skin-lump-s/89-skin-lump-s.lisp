;; Page 89 - Skin lump/s
(task
  "Check for skin lump/s features"
  adult
  (or (clinical_finding (snomed_concept "Mass of skin" "finding"))
      (clinical_finding (snomed_concept "Mass of subcutaneous tissue" "finding")))
  (check_for
    ;; Mole (red box: refer same week)
    (clinical_finding (snomed_concept "Pigmented skin lesion" "disorder"))

    ;; Boil/abscess
    (clinical_finding (snomed_concept "Pain of skin" "finding"))
    (clinical_finding (snomed_concept "Mass of skin" "finding") (qualifier (snomed_concept "Firm" "qualifier value")))
    (clinical_finding (snomed_concept "Redness of skin over lesion" "finding"))
    (clinical_finding (snomed_concept "Warm skin" "finding"))
    (clinical_finding (snomed_concept "Fluctuant" "finding"))
    (clinical_finding (snomed_concept "Skin discharge" "finding"))

    ;; Warts
    (clinical_finding (snomed_concept "Papule of skin" "disorder") (qualifier (snomed_concept "Round shape" "qualifier value")) (qualifier (snomed_concept "Raised" "qualifier value")))
    (clinical_finding (snomed_concept "Rough skin" "finding"))

    ;; Molluscum contagiosum
    (clinical_finding (snomed_concept "Papule of skin" "disorder") (qualifier (snomed_concept "Small" "qualifier value")))
    (clinical_finding (snomed_concept "Skin dimple" "finding"))

    ;; Kaposi's sarcoma
    (clinical_finding (snomed_concept "Mass of skin" "finding") (qualifier (snomed_concept "Painless" "qualifier value")))
    (clinical_finding (snomed_concept "Mass of skin" "finding") (qualifier (snomed_concept "Purple color" "qualifier value")))
    (clinical_finding (snomed_concept "Mass of skin" "finding") (qualifier (snomed_concept "Brown color" "qualifier value")))

    ;; Lump beneath skin: epidermoid cyst / lipoma
    (clinical_finding (snomed_concept "Mass of subcutaneous tissue" "finding") (qualifier (snomed_concept "Smooth" "qualifier value")) (qualifier (snomed_concept "Well defined" "qualifier value")))
    (clinical_finding (snomed_concept "Mass of subcutaneous tissue" "finding") (qualifier (snomed_concept "Round shape" "qualifier value")) (qualifier (snomed_concept "Firm" "qualifier value")))
    (clinical_finding (snomed_concept "Mass of subcutaneous tissue" "finding") (qualifier (snomed_concept "Soft" "qualifier value")) (qualifier (snomed_concept "Painless" "qualifier value")))

    ;; Acne
    (clinical_finding (snomed_concept "Papule of skin" "disorder") (qualifier (snomed_concept "Red color" "qualifier value")))
    (clinical_finding (snomed_concept "Pustule" "disorder"))
    (clinical_finding (snomed_concept "Skin nodule" "disorder"))
    (clinical_finding (snomed_concept "Comedone" "disorder"))
  )
)
(task
  "Check for mole features needing same-week referral (skin lump/s)"
  adult
  (clinical_finding (snomed_concept "Pigmented skin lesion" "disorder"))
  (check_for
    (clinical_finding (snomed_concept "Irregular outline of pigmented skin lesion" "disorder"))
    (clinical_finding (snomed_concept "Mixed color of pigmented skin lesion" "disorder"))
    (clinical_finding (snomed_concept "Change in skin lesion" "finding"))
    (clinical_finding (snomed_concept "Changing shape of pigmented skin lesion" "disorder"))
    (clinical_finding (snomed_concept "Changing color of pigmented skin lesion" "disorder"))
    (clinical_finding (snomed_concept "Bleeding skin" "finding"))
    (clinical_finding (snomed_concept "Itching of pigmented skin lesion" "disorder"))
  )
)
(task
  "Measure width of mole (skin lump/s)"
  adult
  (clinical_finding (snomed_concept "Pigmented skin lesion" "disorder"))
  (measure
    (measurement (snomed_concept "Diameter of lump" "observable entity") mm)
  )
)
(system_diagnosis_rule
  "Diagnose probable boil/abscess (skin lump/s)"
  (diagnosis
    (snomed_concept "Abscess of skin and/or subcutaneous tissue" "disorder")
    probable
  )
  adult
  (and (clinical_finding (snomed_concept "Pain of skin" "finding"))
       (clinical_finding (snomed_concept "Mass of skin" "finding") (qualifier (snomed_concept "Firm" "qualifier value")))
       (clinical_finding (snomed_concept "Redness of skin over lesion" "finding"))
       (clinical_finding (snomed_concept "Warm skin" "finding"))
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
       (clinical_finding (snomed_concept "Skin dimple" "finding")))
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
  (and (clinical_finding (snomed_concept "Pigmented skin lesion" "disorder"))
       (or (clinical_finding (snomed_concept "Irregular outline of pigmented skin lesion" "disorder"))
           (clinical_finding (snomed_concept "Mixed color of pigmented skin lesion" "disorder"))
           (clinical_finding (snomed_concept "Change in skin lesion" "finding"))
           (clinical_finding (snomed_concept "Changing shape of pigmented skin lesion" "disorder"))
           (clinical_finding (snomed_concept "Changing color of pigmented skin lesion" "disorder"))
           (> (measurement (snomed_concept "Diameter of lump" "observable entity") mm) 6)
           (clinical_finding (snomed_concept "Bleeding skin" "finding"))
           (clinical_finding (snomed_concept "Itching of pigmented skin lesion" "disorder"))))
)

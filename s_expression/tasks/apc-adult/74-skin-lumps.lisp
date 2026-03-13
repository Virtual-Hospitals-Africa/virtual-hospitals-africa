;; Page 74 - Skin Lumps
(task
  "Check for urgent skin lump conditions"
  adult
  (clinical_finding (snomed_concept "Mass of skin" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Pigmented skin lesion" "disorder"))
    (clinical_finding (snomed_concept "Irregular outline of pigmented skin lesion" "disorder"))
    (clinical_finding (snomed_concept "Change in skin lesion" "finding"))
    (clinical_finding (snomed_concept "Pigmented nevus" "morphologic abnormality"))
    (clinical_finding (snomed_concept "Bleeds easily" "finding"))
    (clinical_finding (snomed_concept "Pruritus" "finding"))
    (clinical_finding (snomed_concept "Pain in skin" "finding"))
    (clinical_finding (snomed_concept "Firm mass" "morphologic abnormality"))
    (clinical_finding (snomed_concept "Erythema" "finding"))
    (clinical_finding (snomed_concept "Warm skin" "finding"))
    (clinical_finding (snomed_concept "Mass of skin" "finding"))
    (clinical_finding (snomed_concept "Fluctuant mass" "morphologic abnormality"))
  )
)
(task
  "Measure lesion size"
  adult
  (clinical_finding (snomed_concept "Mass of skin" "finding"))
  (measure
    (measurement (snomed_concept "Lesion size" "observable entity") mm)
  )
)

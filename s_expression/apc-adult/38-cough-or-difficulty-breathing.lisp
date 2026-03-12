;; Page 38 - Cough or Difficulty Breathing
(task
  "Check for urgent cough/breathing conditions"
  adult
  (or
    (clinical_finding (snomed_concept "Cough" "finding"))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding")))
  (check_for
    (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
    (clinical_finding (snomed_concept "Feeling agitated" "finding"))
    (clinical_finding (snomed_concept "Hemoptysis" "finding"))
    (clinical_finding (snomed_concept "Swollen calf" "finding") (qualifier (snomed_concept "Unilateral" "qualifier value")))
    (clinical_finding (snomed_concept "Pain in calf" "finding") (qualifier (snomed_concept "Unilateral" "qualifier value")))
    (clinical_finding (snomed_concept "Wheezing" "finding"))
    (clinical_finding (snomed_concept "Tight chest" "finding"))
    (clinical_finding (snomed_concept "Dyspnea at rest" "finding"))
    (clinical_finding (snomed_concept "Orthopnea" "finding"))
    (clinical_finding (snomed_concept "Swelling of lower limb" "finding"))
    (clinical_finding (snomed_concept "Dyspnea" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Increased vocal resonance" "finding"))
    (clinical_finding (snomed_concept "Decreased breath sounds" "finding"))
    (clinical_finding (snomed_concept "Chest pain" "finding") (qualifier (snomed_concept "Unilateral" "qualifier value")))
    (clinical_finding (snomed_concept "Trachea displaced" "disorder"))
  )
)

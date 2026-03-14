;; Page 66 - Foot Symptoms
(task
  "Check for urgent foot symptom conditions"
  adult
  (clinical_finding (finding_site (snomed_concept "Foot structure" "body structure")))
  (check_for
    (clinical_finding (snomed_concept "Ischemic foot with rest pain" "disorder") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of lower limb" "finding"))
    (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding"))
    (clinical_finding (snomed_concept "Pale complexion" "finding"))
    (clinical_finding (snomed_concept "Peripheral pulse absent" "finding"))
    (clinical_finding (snomed_concept "Intermittent claudication" "finding"))
    (clinical_finding (snomed_concept "Ischemic foot with rest pain" "disorder"))
    (clinical_finding (snomed_concept "Gangrene" "morphologic abnormality"))
    (clinical_finding (snomed_concept "Ulcer" "morphologic abnormality"))
    (clinical_finding (snomed_concept "Intermittent claudication" "finding") (finding_site (snomed_concept "Buttock structure" "body structure")))
    (clinical_finding (snomed_concept "Unable to weight-bear" "finding"))
    (clinical_finding (snomed_concept "Injury of lower limb" "disorder"))
  )
)

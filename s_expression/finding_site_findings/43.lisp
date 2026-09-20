;; Breast symptoms ⇢ 43
(finding_site_findings
  "Breast"
  (finding_site_structure (snomed_concept "Breast structure" "body structure"))
  (clinical_findings
    ;; The patient who is not breastfeeding
    (clinical_finding (snomed_concept "Breast lump" "finding"))
    (clinical_finding (snomed_concept "Pain of breast" "finding"))
    (clinical_finding (snomed_concept "Discharge from nipple" "disorder"))
    (clinical_finding (snomed_concept "Bloody nipple discharge" "disorder"))
    (clinical_finding (snomed_concept "Retraction of nipple" "finding"))
    (clinical_finding (snomed_concept "Swelling of breast" "finding"))
    (clinical_finding (snomed_concept "Mass of axilla" "finding"))
    ;; The patient who is breastfeeding
    (clinical_finding (snomed_concept "Maternal breastfeeding" "finding"))
    (clinical_finding (snomed_concept "Sore nipple" "finding"))
    (clinical_finding (snomed_concept "Fissure of nipple" "disorder"))
    (clinical_finding (snomed_concept "Fever" "finding"))
    (clinical_finding (snomed_concept "Generalized aches and pains" "finding"))
  )
)

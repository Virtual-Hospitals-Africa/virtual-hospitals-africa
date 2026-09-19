;; Scalp symptoms ⇢ 80, hair loss ⇢ 81
(finding_site_findings
  "Hair & scalp"
  (finding_site_structure (snomed_concept "Scalp structure" "body structure"))
  (clinical_findings
    ;; Scalp symptoms ⇢ 80
    (clinical_finding (snomed_concept "Itching of skin" "finding") (finding_site (snomed_concept "Scalp structure" "body structure")))
    (clinical_finding (snomed_concept "Eruption of scalp" "disorder"))
    (clinical_finding (snomed_concept "Pediculosis capitis" "disorder"))
    (clinical_finding (snomed_concept "Scaly scalp" "finding"))
    (clinical_finding (snomed_concept "Erythema" "finding") (finding_site (snomed_concept "Scalp structure" "body structure")))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Scalp structure" "body structure")))
    (clinical_finding (snomed_concept "Blister of skin" "disorder") (finding_site (snomed_concept "Scalp structure" "body structure")))
    (clinical_finding (snomed_concept "Pustule" "morphologic abnormality") (finding_site (snomed_concept "Scalp structure" "body structure")))
    (clinical_finding (snomed_concept "Pitting of nails" "disorder"))
    ;; Hair loss ⇢ 81
    (clinical_finding (snomed_concept "Loss of scalp hair" "finding"))
    (clinical_finding (snomed_concept "Loss of hair" "finding"))
    (clinical_finding (snomed_concept "Hirsutism" "disorder"))
    (clinical_finding (snomed_concept "Irregular periods" "finding"))
    (clinical_finding (snomed_concept "Abnormal weight loss" "finding"))
  )
)

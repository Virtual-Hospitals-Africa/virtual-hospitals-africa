;; Joint symptoms ⇢ 62
(finding_site_findings
  "Joint"
  (finding_site_structure (snomed_concept "Joint structure" "body structure"))
  (clinical_findings
    (clinical_finding (snomed_concept "Pain of joint" "finding"))
    (clinical_finding (snomed_concept "Pain of joint" "finding") (qualifier (snomed_concept "Acute pain" "finding")))
    (clinical_finding (snomed_concept "Pain of joint" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Joint swelling" "finding"))
    (clinical_finding (snomed_concept "Joint warm" "finding"))
    (clinical_finding (snomed_concept "Tenderness of joint" "finding"))
    (clinical_finding (snomed_concept "Erythema" "finding") (finding_site (snomed_concept "Joint structure" "body structure")))
    (clinical_finding (snomed_concept "Limitation of joint movement" "finding"))
    (clinical_finding (snomed_concept "Deformity" "finding"))
    (clinical_finding (snomed_concept "Unable to weight-bear" "finding"))
    (clinical_finding (snomed_concept "Fever" "finding"))
    (clinical_finding (snomed_concept "Injury of musculoskeletal system" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
    ;; Recent genital discharge or painless non-itchy skin rash
    (clinical_finding (snomed_concept "Abnormal urogenital discharge" "finding") (qualifier (snomed_concept "Recent" "qualifier value")))
    (clinical_finding (snomed_concept "Eruption of skin" "disorder"))
  )
)

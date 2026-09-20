;; Back pain ⇢ 63
(finding_site_findings
  "Back"
  (finding_site_structure (snomed_concept "Structure of posterior region of trunk" "body structure"))
  (excluding_structures
    (snomed_concept "Neck structure" "body structure")
  )
  (clinical_findings
    (clinical_finding (snomed_concept "Backache" "finding"))
    (clinical_finding (snomed_concept "Backache" "finding") (qualifier (snomed_concept "Worsening" "qualifier value")))
    ;; Bladder or bowel disturbance — retention or incontinence
    (clinical_finding (snomed_concept "Retention of urine" "disorder"))
    (clinical_finding (snomed_concept "Urinary incontinence" "finding"))
    (clinical_finding (snomed_concept "Incontinence of feces" "finding"))
    ;; Numbness of buttocks, perineum or legs; leg weakness or difficulty walking
    (clinical_finding (snomed_concept "Numbness" "finding") (finding_site (snomed_concept "Buttock structure" "body structure")))
    (clinical_finding (snomed_concept "Numbness" "finding") (finding_site (snomed_concept "Perineal structure" "body structure")))
    (clinical_finding (snomed_concept "Numbness of limbs" "finding"))
    (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding"))
    (clinical_finding (snomed_concept "Difficulty walking" "finding"))
    (clinical_finding (snomed_concept "Injury of musculoskeletal system" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
    ;; Sudden onset severe upper abdominal pain with nausea/vomiting; pulsatile abdominal mass
    (clinical_finding (snomed_concept "Abdominal pain" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Nausea" "finding"))
    (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
    (clinical_finding (snomed_concept "Abdominal mass" "finding") (qualifier (snomed_concept "Pulsatile" "qualifier value")))
    ;; If flank, check urine dipstick
    (clinical_finding (snomed_concept "Flank pain" "finding"))
    (clinical_finding (snomed_concept "Blood in urine" "finding"))
    (clinical_finding (snomed_concept "Fever" "finding"))
    ;; Cough, weight loss, night sweats or fever
    (clinical_finding (snomed_concept "Cough" "finding"))
    (clinical_finding (snomed_concept "Abnormal weight loss" "finding"))
    (clinical_finding (snomed_concept "Night sweats" "finding"))
    (clinical_finding (snomed_concept "Deformity" "finding"))
  )
)

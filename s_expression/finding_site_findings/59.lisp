;; Urinary symptoms ⇢ 59
(finding_site_findings
  "Urinary"
  (finding_site_structure (snomed_concept "Urinary system structure" "body structure"))
  (excluding_structures
    (snomed_concept "Genital structure" "body structure")
  )
  (clinical_findings
    (clinical_finding (snomed_concept "Dysuria" "finding"))
    (clinical_finding (snomed_concept "Increased frequency of urination" "finding"))
    (clinical_finding (snomed_concept "Urgent desire to urinate" "finding"))
    (clinical_finding (snomed_concept "Retention of urine" "disorder"))
    (clinical_finding (snomed_concept "Urinary incontinence" "finding"))
    (clinical_finding (snomed_concept "Abnormal urinary stream" "finding"))
    (clinical_finding (snomed_concept "Oliguria" "finding"))
    (clinical_finding (snomed_concept "Blood in urine" "finding"))
    (clinical_finding (snomed_concept "Proteinuria" "finding"))
    (clinical_finding (snomed_concept "Abdominal discomfort" "finding"))
    (clinical_finding (snomed_concept "Distension of abdomen" "finding"))
    ;; New swelling of face/feet
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")) (qualifier (snomed_concept "New" "qualifier value")))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Foot structure" "body structure")) (qualifier (snomed_concept "New" "qualifier value")))
    ;; Sudden, severe, one-sided pain in flank or groin
    (clinical_finding (snomed_concept "Flank pain" "finding"))
    (clinical_finding (snomed_concept "Flank pain" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")) (qualifier (snomed_concept "Unilateral" "qualifier value")))
    (clinical_finding (snomed_concept "Pain" "finding") (finding_site (snomed_concept "Inguinal region structure" "body structure")))
    (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
    (clinical_finding (snomed_concept "Fever" "finding"))
    (clinical_finding (snomed_concept "Urethral discharge" "finding"))
    (clinical_finding (snomed_concept "Tenderness of prostate" "finding"))
    (clinical_finding (snomed_concept "Generalized aches and pains" "finding"))
  )
)

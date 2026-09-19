;; Constipation and anal symptoms ⇢ 48
(finding_site_findings
  "Anal & rectal"
  (finding_site_structure (snomed_concept "Structure of anus and/or rectum" "body structure"))
  (clinical_findings
    ;; Constipation
    (clinical_finding (snomed_concept "Constipation" "finding"))
    (clinical_finding (snomed_concept "Abdominal pain" "finding"))
    (clinical_finding (snomed_concept "Distension of abdomen" "finding"))
    (clinical_finding (snomed_concept "Irregular bowel habits" "finding"))
    ;; Anal symptoms
    (clinical_finding (snomed_concept "Anal pain" "finding"))
    (clinical_finding (snomed_concept "Perianal lump" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")) (qualifier (snomed_concept "Pain" "finding")))
    (clinical_finding (snomed_concept "Does not defecate" "finding"))
    (clinical_finding (snomed_concept "Painless rectal bleeding" "finding"))
    (clinical_finding (snomed_concept "Rectal discharge" "finding"))
    (clinical_finding (snomed_concept "Tenesmus of anus and/or rectum" "finding"))
    ;; Examine the anal area to look for cause
    (clinical_finding (snomed_concept "Anal fissure" "disorder"))
    (clinical_finding (snomed_concept "Hemorrhoids" "disorder"))
    (clinical_finding (snomed_concept "Ulcer of anus" "disorder"))
    (clinical_finding (snomed_concept "Anal warts" "disorder"))
    (clinical_finding (snomed_concept "Erythema" "finding") (finding_site (snomed_concept "Anal structure" "body structure")))
    (clinical_finding (snomed_concept "Pruritus ani" "disorder"))
    (clinical_finding (snomed_concept "Melena" "disorder"))
    (clinical_finding (snomed_concept "Abnormal weight loss" "finding"))
  )
)

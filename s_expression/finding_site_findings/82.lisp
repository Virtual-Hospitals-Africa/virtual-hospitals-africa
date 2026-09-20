;; Nail symptoms ⇢ 82
(finding_site_findings
  "Nail"
  (finding_site_structure (snomed_concept "Nail unit structure" "body structure"))
  (clinical_findings
    ;; Disfigured nail with swollen nail bed and loss of cuticle
    (clinical_finding (snomed_concept "Nail deformity" "disorder"))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Nail bed structure" "body structure")))
    (clinical_finding (snomed_concept "Nail fold finding" "finding") (finding_site (snomed_concept "Structure of cuticle of nail" "body structure")))
    ;; Pain, redness and swelling of nail folds, there may be pus
    (clinical_finding (snomed_concept "Pain" "finding") (finding_site (snomed_concept "Nail unit structure" "body structure")))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Structure of proximal nail fold" "body structure")))
    (clinical_finding (snomed_concept "Purulent discharge" "morphologic abnormality") (finding_site (snomed_concept "Nail unit structure" "body structure")))
    ;; White/yellow disfigured or crumbling nails
    (clinical_finding (snomed_concept "Yellow nails" "finding"))
    (clinical_finding (snomed_concept "Nails crumble" "finding"))
    ;; Blue/brown/black discolouration of nail, and recent trauma to nail
    (clinical_finding (snomed_concept "Nail discoloration" "finding"))
    (clinical_finding (snomed_concept "Injury of nail" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
    ;; Transverse dents in nails
    (clinical_finding (snomed_concept "Beau's lines" "disorder"))
    ;; Nails long and dirty and patient unkempt
    (clinical_finding (snomed_concept "Nails dirty" "finding"))
    (clinical_finding (snomed_concept "Unkempt appearance" "finding"))
  )
)

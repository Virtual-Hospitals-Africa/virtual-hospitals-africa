;; Page 32 - Face Symptoms
(task
  "Check for urgent ear symptom conditions"
  adult
  (clinical_finding (finding_site (snomed_concept "Nail unit structure" "body structure")))
  (check_for
    (clinical_finding (snomed_concept "Nails dirty" "finding"))
    (clinical_finding (snomed_concept "Unkempt appearance" "finding"))
    (clinical_finding (snomed_concept "Nail deformity" "disorder"))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Nail bed structure" "body structure")))
    (clinical_finding (snomed_concept "Nail fold finding" "finding") (finding_site (snomed_concept "Structure of cuticle of nail" "body structure")))
    (clinical_finding (snomed_concept "Pain" "finding") (finding_site (snomed_concept "Nail unit structure" "body structure")))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Structure of proximal nail fold" "body structure")))
    (clinical_finding (snomed_concept "Purulent discharge" "morphologic abnormality") (finding_site (snomed_concept "Nail unit structure" "body structure")))
    (clinical_finding (snomed_concept "Yellow nails" "finding"))
    (clinical_finding (snomed_concept "Nails crumble" "finding"))
    (clinical_finding (snomed_concept "Nail discoloration" "finding"))
    (clinical_finding (snomed_concept "Beau's lines" "disorder"))
  )
)

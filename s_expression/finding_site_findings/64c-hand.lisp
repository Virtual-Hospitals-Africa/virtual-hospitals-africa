;; Arm or hand symptoms ⇢ 64, the wrist and hand columns
(finding_site_findings
  "Hand"
  (finding_site_structure (snomed_concept "Hand structure" "body structure"))
  (excluding_structures
    (snomed_concept "Nail unit structure" "body structure")
  )
  (clinical_findings
    (clinical_finding (snomed_concept "Hand pain" "finding"))
    (clinical_finding (snomed_concept "Pain" "finding") (finding_site (snomed_concept "Wrist region structure" "body structure")))
    (clinical_finding (snomed_concept "Chest pain" "finding"))
    ;; Recent injury and severe pain/swelling or deformity
    (clinical_finding (snomed_concept "Injury of musculoskeletal system" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
    (clinical_finding (snomed_concept "Severe pain" "finding"))
    (clinical_finding (snomed_concept "Swelling of hand" "finding"))
    (clinical_finding (snomed_concept "Deformity of upper limb" "finding"))
    (clinical_finding (snomed_concept "Joint swelling" "finding"))
    (clinical_finding (snomed_concept "Joint warm" "finding"))
    (clinical_finding (snomed_concept "Tenderness of joint" "finding"))
    ;; Wrist/hand pain worse at night, relieved by shaking, with numbness/tingling or weakness
    (clinical_finding (snomed_concept "Hand pain" "finding") (qualifier (snomed_concept "Wakes up during night" "finding")))
    (clinical_finding (snomed_concept "Numbness of finger" "finding"))
    (clinical_finding (snomed_concept "Numbness and tingling sensation of skin" "finding") (finding_site (snomed_concept "Hand structure" "body structure")))
    (clinical_finding (snomed_concept "Weakness of hand" "finding"))
    ;; Pain at base of thumb worsened by thumb or wrist movement; catching/locking of finger
    (clinical_finding (snomed_concept "Pain in thumb" "finding"))
    (clinical_finding (snomed_concept "Acquired trigger finger" "disorder"))
  )
)

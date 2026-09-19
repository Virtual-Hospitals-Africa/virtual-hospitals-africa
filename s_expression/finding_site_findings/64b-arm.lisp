;; Arm or hand symptoms ⇢ 64
(finding_site_findings
  "Arm"
  (finding_site_structure (snomed_concept "Upper limb structure" "body structure"))
  (excluding_structures
    (snomed_concept "Hand structure" "body structure")
  )
  (clinical_findings
    (clinical_finding (snomed_concept "Pain in upper limb" "finding"))
    (clinical_finding (snomed_concept "Pain in left arm" "finding"))
    (clinical_finding (snomed_concept "Pain in right arm" "finding"))
    (clinical_finding (snomed_concept "Chest pain" "finding"))
    ;; New sudden onset of weakness of arm with/without difficulty speaking or visual disturbance
    (clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "New" "qualifier value")))
    (clinical_finding (snomed_concept "Difficulty talking" "finding"))
    (clinical_finding (snomed_concept "Visual disturbance" "disorder"))
    ;; Recent injury and severe pain/swelling or deformity
    (clinical_finding (snomed_concept "Injury of musculoskeletal system" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
    (clinical_finding (snomed_concept "Severe pain" "finding"))
    (clinical_finding (snomed_concept "Swelling of upper arm" "finding"))
    (clinical_finding (snomed_concept "Deformity of upper limb" "finding"))
    ;; Joint warm/tender/swollen
    (clinical_finding (snomed_concept "Joint swelling" "finding"))
    (clinical_finding (snomed_concept "Joint warm" "finding"))
    (clinical_finding (snomed_concept "Tenderness of joint" "finding"))
    ;; Painful shoulder; elbow pain with or after elbow flexion/extension
    (clinical_finding (snomed_concept "Pain" "finding") (finding_site (snomed_concept "Shoulder region structure" "body structure")))
    (clinical_finding (snomed_concept "Pain" "finding") (finding_site (snomed_concept "Elbow region structure" "body structure")))
  )
)

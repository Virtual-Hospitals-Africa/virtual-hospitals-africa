;; Neck pain ⇢ 64
(finding_site_findings
  "Neck"
  (finding_site_structure (snomed_concept "Neck structure" "body structure"))
  (clinical_findings
    (clinical_finding (snomed_concept "Neck pain" "finding"))
    (clinical_finding (snomed_concept "Neck pain" "finding") (qualifier (snomed_concept "Worsening" "qualifier value")))
    (clinical_finding (snomed_concept "Stiff neck" "finding"))
    ;; Neck stiffness and any of: temperature, headache, drowsy/confused or purple/red rash
    (clinical_finding (snomed_concept "Fever" "finding"))
    (clinical_finding (snomed_concept "Headache" "finding"))
    (clinical_finding (snomed_concept "Drowsy" "finding"))
    (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
    (clinical_finding (snomed_concept "Purpuric rash" "disorder"))
    ;; Neurological symptoms in arms/legs
    (clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding"))
    (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding"))
    (clinical_finding (snomed_concept "Numbness of limbs" "finding"))
    (clinical_finding (snomed_concept "Clumsiness" "finding"))
    (clinical_finding (snomed_concept "Abnormal gait" "finding"))
    (clinical_finding (snomed_concept "Decreased coordination" "finding"))
    (clinical_finding (snomed_concept "Injury of neck" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
    (clinical_finding (snomed_concept "Abnormal weight loss" "finding"))
    (clinical_finding (snomed_concept "Mass of neck" "finding"))
  )
)

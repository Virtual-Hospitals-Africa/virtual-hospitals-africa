;; Page 64 - Arm or Hand Symptoms
(task
  "Check for urgent arm or hand symptom conditions"
  adult
  (or
    (clinical_finding (finding_site (snomed_concept "Upper limb structure" "body structure")))
    (clinical_finding (finding_site (snomed_concept "Hand structure" "body structure")))
  )
  (clinical_finding (finding_site (snomed_concept "Upper limb structure" "body structure")))
  (check_for
    (clinical_finding (snomed_concept "Pain in left arm" "finding"))
    (clinical_finding (snomed_concept "Chest pain" "finding"))
    (clinical_finding (snomed_concept "Pain in right arm" "finding"))
    (clinical_finding (snomed_concept "Hand pain" "finding"))
    (clinical_finding (snomed_concept "Injury of musculoskeletal system" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
    (clinical_finding (snomed_concept "Severe pain" "finding"))
    (clinical_finding (snomed_concept "Joint swelling" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Deformity" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "New" "qualifier value")))
    (clinical_finding (snomed_concept "Difficulty talking" "finding"))
    (clinical_finding (snomed_concept "Visual disturbance" "disorder"))
  )
)

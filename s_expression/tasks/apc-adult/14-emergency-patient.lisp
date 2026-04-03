;; Page 14 - Emergency Patient
(task
  "Check for emergency conditions"
  adult
  (clinical_finding (snomed_concept "Emergency condition" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
    (clinical_finding (snomed_concept "Seizure" "finding"))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    (clinical_finding (snomed_concept "Chest pain" "finding"))
    (clinical_finding (snomed_concept "Hematemesis" "disorder"))
    (clinical_finding (snomed_concept "Bleeding" "finding"))
    (clinical_finding (snomed_concept "Burn" "disorder"))
    (clinical_finding (snomed_concept "Severe pain" "finding"))
    (clinical_finding (snomed_concept "Bone injury" "disorder"))
    (clinical_finding (snomed_concept "Dislocation of joint" "disorder"))
    (clinical_finding (snomed_concept "Purpuric rash" "disorder"))
    (clinical_finding (snomed_concept "Anaphylaxis" "disorder"))
  )
)

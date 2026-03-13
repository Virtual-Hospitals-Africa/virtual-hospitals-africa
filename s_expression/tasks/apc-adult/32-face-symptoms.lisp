;; Page 32 - Face Symptoms
(task
  "Check for urgent face symptom conditions"
  adult
  (clinical_finding (snomed_concept "Facial swelling" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Weakness of face muscles" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "New" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
    (clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "New" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
    (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "New" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of face" "finding"))
    (clinical_finding (snomed_concept "Numbness of limbs" "finding"))
    (clinical_finding (snomed_concept "Difficulty talking" "finding"))
    (clinical_finding (snomed_concept "Visual disturbance" "disorder"))
    (clinical_finding (snomed_concept "Facial swelling" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Tongue swelling" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    (clinical_finding (snomed_concept "Dizziness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Collapse" "finding"))
    (clinical_finding (snomed_concept "Abdominal pain" "finding"))
    (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Substance" "substance"))
    (clinical_finding (snomed_concept "Facial swelling" "finding") (qualifier (snomed_concept "New" "qualifier value")))
    (clinical_finding (snomed_concept "Blood in urine" "finding"))
    (clinical_finding (snomed_concept "Proteinuria" "finding"))
  )
)

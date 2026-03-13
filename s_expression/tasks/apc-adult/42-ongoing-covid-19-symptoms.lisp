;; Page 42 - Ongoing Covid 19 Symptoms
(task
  "Check for urgent ongoing Covid-19 symptoms"
  adult
  (clinical_finding (snomed_concept "Disease caused by severe acute respiratory syndrome coronavirus 2" "disorder"))
  (check_for
    (clinical_finding (snomed_concept "Headache" "finding"))
    (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
    (clinical_finding (snomed_concept "Chest pain" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Weakness of face muscles" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of face" "finding"))
    (clinical_finding (snomed_concept "Numbness of limbs" "finding"))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding") (qualifier (snomed_concept "Worsening" "qualifier value")))
    (clinical_finding (snomed_concept "Orthopnea" "finding"))
    (clinical_finding (snomed_concept "Leg swelling symptom" "finding"))
    (clinical_finding (snomed_concept "Clouded consciousness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Feeling agitated" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
    (clinical_finding (snomed_concept "Hemoptysis" "finding") (qualifier (snomed_concept "Recent" "qualifier value")))
    (clinical_finding (snomed_concept "Swollen calf" "finding"))
    (clinical_finding (snomed_concept "Pain in calf" "finding"))
  )
)

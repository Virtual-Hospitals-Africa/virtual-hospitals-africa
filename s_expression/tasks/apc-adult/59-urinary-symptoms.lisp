;; Page 59 - Urinary Symptoms
(task
  "Check for urgent urinary symptom conditions"
  adult
  (clinical_finding (snomed_concept "Urinary system finding" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Unable to void urine" "finding"))
    (clinical_finding (snomed_concept "Abdominal discomfort" "finding") (finding_site (snomed_concept "Lower abdomen structure" "body structure")))
    (clinical_finding (snomed_concept "Distension of abdomen" "finding") (finding_site (snomed_concept "Lower abdomen structure" "body structure")))
    (clinical_finding (snomed_concept "Left flank pain" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Right flank pain" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Blood in urine" "finding"))
    (clinical_finding (snomed_concept "Oliguria" "finding"))
    (clinical_finding (snomed_concept "Facial swelling" "finding") (qualifier (snomed_concept "New" "qualifier value")))
    (clinical_finding (snomed_concept "Swelling of bilateral feet" "finding") (qualifier (snomed_concept "New" "qualifier value")))
    (clinical_finding (snomed_concept "Proteinuria" "finding"))
    (clinical_finding (snomed_concept "Left inguinal pain" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Right inguinal pain" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Leukocytes in urine" "finding"))
    (clinical_finding (snomed_concept "Nitrite detected in urine" "finding"))
    (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
    (clinical_finding (snomed_concept "Diabetes mellitus" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
    (clinical_finding (snomed_concept "Pregnancy" "finding"))
    (clinical_finding (snomed_concept "Postmenopausal state" "finding"))
  )
)

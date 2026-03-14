;; Page 35 - Mouth or Throat Symptoms
(task
  "Check for urgent mouth or throat conditions"
  adult
  (clinical_finding (finding_site (snomed_concept "Structure of mouth and/or pharynx" "body structure")))
  (check_for
    (clinical_finding (snomed_concept "Pharyngeal swelling" "finding"))
    (clinical_finding (snomed_concept "Unable to open mouth" "finding"))
    (clinical_finding (snomed_concept "Unable to swallow" "finding"))
    (clinical_finding (snomed_concept "Facial swelling" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Tongue swelling" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Wheezing" "finding"))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    (clinical_finding (snomed_concept "Dizziness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Collapse" "finding"))
    (clinical_finding (snomed_concept "Abdominal pain" "finding"))
    (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Substance" "substance"))
  )
)

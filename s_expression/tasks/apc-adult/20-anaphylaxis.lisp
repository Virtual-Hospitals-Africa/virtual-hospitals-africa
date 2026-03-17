;; Page 20 - Anaphylaxis
(task
  "Check for Anaphylaxis"
  adult
  (diagnosis (snomed_concept "Anaphylaxis" "disorder") possible)
  (check_for
		(clinical_finding (snomed_concept “History of anaphylaxis” (situation) “Food anaphylaxis” (disorder) “Symptom started hours ago” (finding)
		(clinical_finding (snomed_concept “History of anaphylaxis” (situation) “Anaphylaxis caused by insect bite and/or insect sting” (disorder) “Symptom started hours ago” (finding)
		(clinical_finding (snomed_concept “History of drug-induced anaphylaxis” (situation) “Symptom started hours ago” (finding)
		(clinical_finding (snomed_concept “Bite of insect” (event) “Exposure to” (contextual qualifier) (qualifier value) “Symptom started hours ago” (finding)
		(clinical_finding (snomed_concept “ Food” (substance) “Exposure to” (contextual qualifier) (qualifier value) ‘Symptom started hours ago” (finding)
		(clinical_finding (snomed_concept “Drug or medicament” (substance) “Exposure to” (contextual qualifier) (qualifier value) (substance) “Symptom started hours ago’ (finding)
    (clinical_finding (snomed_concept "Itching" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Eruption" "morphologic abnormality") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Insect bite - wound" "disorder"))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Tongue structure" "body structure")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Dizziness" "finding"))
    (clinical_finding (snomed_concept "Collapse" "finding"))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Peanut" "substance"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Tree nut" "substance"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Eggs (edible)" "substance"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Milk" "substance"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Fish" "substance"))
  )
)

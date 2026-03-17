(system_diagnosis_rule
  (diagnosis
    (snomed_concept "Anaphylaxis" "disorder")
    probable
  )
  adult
			(clinical_finding (snomed_concept "Collapse" "finding") Sudden (qualifier value))
			OR
			(clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")Sudden (qualifier value)
			OR
   	 (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Tongue structure" "body structure") Sudden (qualifier value))
			AND ANY
    	(clinical_finding (snomed_concept “Generalized pruritus” (finding))
			(clinical_finding (snomed_concept "Generalized rash” (disorder))
			(clinical_finding (snomed_concept “Tightness in throat” (finding))
			(clinical_finding (snomed_concept “Hoarse” (finding))
			(clinical_finding (snomed_concept “Cough” (finding))
			(clinical_finding (snomed_concept “Wheezing” (finding))
			(clinical_finding (snomed_concept "Abdominal pain” (finding))
			(clinical_finding (snomed_concept "Vomiting” (disorder))
			(clinical_finding (snomed_concept “Nausea” (finding))
			(clinical_finding (snomed_concept “Diarrhea” (finding))
    	(clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    	(clinical_finding (snomed_concept "Dizziness" "finding"))
    	(< measurement(clinical_finding (snomed_concept " Systolic blood pressure” (observable entity) “Millimeter of mercury” (qualifier value)90)) 			AND
			(<measurement(clinical_finding (snomed_concept "Diastolic blood pressure” (observable entity) “Millimeter of mercury” (qualifier value) 60))
			(clinical_finding (snomed_concept “Bite of insect” (event) “Exposure to” (contextual qualifier) (qualifier value))
			(clinical_finding (snomed_concept “ Food” (substance) “Exposure to” (contextual qualifier) (qualifier value))
			(clinical_finding (snomed_concept “Drug or medicament” (substance) “Exposure to” (contextual qualifier) (qualifier value) (substance))
	)
)

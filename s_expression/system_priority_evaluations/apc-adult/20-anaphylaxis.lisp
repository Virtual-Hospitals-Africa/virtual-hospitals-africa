(system_priority_evaluation
  all_ages
  Urgent
  (diagnosis
    (snomed_concept "Anaphylaxis" "disorder")
    probable
			(clinical_finding (snomed_concept “History of anaphylaxis” (situation) “Food anaphylaxis” (disorder) “Symptom started hours ago” (finding))
			OR
			(clinical_finding (snomed_concept “History of anaphylaxis” (situation) “Anaphylaxis caused by insect bite and/or insect sting” (disorder) “Symptom started hours ago” (finding))
			OR
			(clinical_finding (snomed_concept “History of drug-induced anaphylaxis” (situation) “Symptom started hours ago” (finding))
)
			(clinical_finding (snomed_concept “Bite of insect” (event) “Exposure to” (contextual qualifier) (qualifier value) “Symptom started hours ago” (finding))
			OR
			(clinical_finding (snomed_concept “ Food” (substance) “Exposure to” (contextual qualifier) (qualifier value) ‘Symptom started hours ago” (finding))
			OR
			(clinical_finding (snomed_concept “Drug or medicament” (substance) “Exposure to” (contextual qualifier) (qualifier value) (substance) “Symptom started hours ago’ (finding))
)
			(snomed_concept "Sudden onset" "qualifier value")
			>= ANY 2
    	(clinical_finding (snomed_concept “Generalized pruritus” (finding))
			OR
			(clinical_finding (snomed_concept "Generalized rash” (disorder))
			OR
   	 (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure"))
			OR
    	(clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Tongue structure" "body structure"))
)
			(clinical_finding (snomed_concept "Difficulty breathing" "finding"))
)
			
    	(clinical_finding (snomed_concept "Dizziness" "finding"))
			OR
    	(clinical_finding (snomed_concept "Collapse" "finding"))
			OR
    	(<measurement(clinical_finding (snomed_concept " Systolic blood pressure” (observable entity) “Millimeter of mercury” (qualifier value)90)) 			AND
			(<measurement(clinical_finding (snomed_concept "Diastolic blood pressure” (observable entity) “Millimeter of mercury” (qualifier value) 60))
)
			(clinical_finding (snomed_concept "Abdominal pain” (finding))
			OR
			(clinical_finding (snomed_concept "Vomiting” (disorder))
  )
)

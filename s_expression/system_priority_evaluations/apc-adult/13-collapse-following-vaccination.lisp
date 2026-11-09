;;Page 13 - Collapse Following Vaccination 
"Urgent symptoms associated with Collapse Following vaccination"
	(urgent
	(clinical_finding (snomed_concept “Collapse” (finding) “Administration of vaccine to produce active immunity” (procedure)
	(adult
		(clinical_finding (snomed_concept “Collapse” (finding) “At time of procedure” (qualifier value) “Administration of vaccine to produce active immunity” (procedure) “After” (attribute) “minute” (qualifier value) 5 to 10 ))
		OR
		(clinical_finding (snomed_concept “Collapse” (finding) “At time of procedure” (qualifier value) “Administration of vaccine to produce active immunity” (procedure) “After” (attribute) “hour” (qualifier value) 1))
		)
		(clinical_finding (snomed_concept “Prolonged loss of consciousness” (finding))
		)
		(<measurement (clinical_finding (snomed_concept “Systolic blood pressure” (observable entity) “Millimeter of mercury” (qualifier value) 90))
		AND
		(<measurement (clinical_finding (snomed_concept “Diastolic blood pressure” (observable entity) “Millimeter of mercury” (qualifier value) 60))
		)
		(clinical_finding (snomed_concept “Low blood pressure” (disorder) “Prolonged” (qualifier value))
		)
		(>measurement (clinical_finding (snomed_concept “Heart rate” (observable entity) “Beats/minute” (qualifier value) 120))
		)
		(clinical_finding (snomed_concept “Wheezing” (finding))
		OR
		(clinical_finding (snomed_concept “Stridor” (finding))
		OR
		(clinical_finding (snomed_concept “Cough” (finding))
		)
		(clinical_finding (snomed_concept “Swelling” (finding))
		OR
		(clinical_finding (snomed_concept “Eruption of skin” (disorder))
		)
	)
)
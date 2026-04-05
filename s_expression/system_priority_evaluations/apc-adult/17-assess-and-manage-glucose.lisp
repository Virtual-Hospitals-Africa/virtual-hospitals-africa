Page 17 – Assess and manage glucose 
"Emergency symptoms for low glucose"
	(emergency
	(clinical_finding (snomed_concept “Hypoglycemia” (disorder))
		(adult
				(<measurement (clinical_finding (snomed_concept “Finding of blood glucose level” (finding) “Millimole/liter” (qualifier value) 3))
				)
				(clinical_finding (snomed_concept “Current drinker of alcohol” (finding) “Known” (qualifier value))
				)
				(clinical_finding (snomed_concept “Drowsy” (finding))
				)
				(clinical_finding (snomed_concept “Decreased level of consciousness” (finding))
				)
				(clinical_finding (snomed_concept “Seizure” (finding))
		)
	)
Page 17 – Assess and manage glucose 
"Emergency symptoms for high glucose"
	(emergency
	(clinical_finding (snomed_concept “Hyperglycemia” (disorder))
		(adult
				(>=measurement (clinical_finding (snomed_concept “Finding of blood glucose level” (finding) “Millimole/liter” (qualifier value) 11.1))
				)
				(clinical_finding (snomed_concept “Decreased level of consciousness” (finding))
				)
				(clinical_finding (snomed_concept “Chest pain” (finding))
				)
				(clinical_finding (snomed_concept “Seizure” (finding))
				)
				(clinical_finding (snomed_concept “Drowsy” (finding))
				)
				(clinical_finding (snomed_concept “Clouded consciousness” (finding))
				)
				(clinical_finding (snomed_concept “Nausea” (finding))
				OR
				(clinical_finding (snomed_concept “Vomiting” (disorder))
				)
				(clinical_finding (snomed_concept “Abdominal pain” (finding))
				)
				(clinical_finding (snomed_concept “Tachypnea” (finding))
				AND
				(clinical_finding (snomed_concept “Deep breathing (finding))
				)
				(>=measurement (clinical_finding (snomed_concept “Body temperature” (observable entity) “Degrees Celsius” (qualifier value) 38))
				)
				(clinical_finding (snomed_concept “Dehydration” (disorder))
				)
				(clinical_finding (snomed_concept “Ketonuria” (finding))
		)
	)
)

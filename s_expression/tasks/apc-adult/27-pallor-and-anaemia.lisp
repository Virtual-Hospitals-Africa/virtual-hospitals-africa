;;Page – Pallor and Anaemia 
(task
	"Check for urgent pallor and Anaemia conditions"
	(adult 
	(clinical_finding ( snomed_concept “Pale discoloration of entire skin of body” (finding))
	(clinical_finding ( snomed_concept “Anemia” (disorder))
	(check_for
		(clinical_finding ( snomed_concept “Dizziness” (finding))
		(clinical_finding ( snomed_concept “Syncope” (finding))
		(clinical_finding ( snomed_concept “Chest pain” (finding))
		(clinical_finding ( snomed_concept “Palpitations” (finding))
		(clinical_finding ( snomed_concept “Leg swelling symptom” (finding) “Both lower legs” (body structure))
		(clinical_finding ( snomed_concept “Jaundice” (finding))
		(clinical_finding ( snomed_concept “Melena” (disorder))
		(clinical_finding ( snomed_concept “Hematochezia” (finding))
		(clinical_finding ( snomed_concept “Multiple bruising” (finding) “Widespread” (qualifier value))
		(clinical_finding ( snomed_concept “Easy bruising” (finding))
		(clinical_finding ( snomed_concept “Purpuric rash” (disorder))
		)
	)
)

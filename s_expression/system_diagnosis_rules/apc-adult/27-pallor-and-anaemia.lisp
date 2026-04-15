;;Page 27 – Pallor and Anaemia 
(system_diagnosis_rule
	"Anaemia likely"
	(adult
	(clinical_finding ( snomed_concept “Anemia” (disorder))
	)
	probable
	(and
		(< ( snomed_concept “Measurement of total hemoglobin concentration” (procedure) “Woman” (person) g/dL) 12))
		(< ( snomed_concept “Measurement of total hemoglobin 			concentration” (procedure) “Man” (person) g/dL) 13))
		(< ( snomed_concept “Measurement of total hemoglobin concentration (procedure) “Pregnancy” (finding) g/dL) 11))
		(clinical_finding ( snomed_concept “Pallor of skin of face” (finding))
		(clinical_finding ( snomed_concept “Pale discoloration of entire skin of body” (finding))
		(clinical_finding ( snomed_concept “Asthenia” (finding))
		(clinical_finding ( snomed_concept “Muscle fatigue” (finding))
		)
	)
)
;;Page 27 – Pallor and Anaemia 
(system_diagnosis_rule
	"Iron deficiency likely"
	(adult
	(clinical_finding ( snomed_concept “Iron deficiency anemia” (disorder))
	)
	probable
	(and 
		(clinical_finding ( snomed_concept “Mean corpuscular volume below reference range” (finding))
	(clinical_finding ( snomed_concept “Abnormal vaginal bleeding” (finding))
		)
	)
;;Page 27 – Pallor and Anaemia 
(system_diagnosis_rule
	"Iron deficiency likely"
	(adult
	(referral 
	(clinical_finding ( snomed_concept “Iron deficiency anemia” (disorder))
	(clinical_finding ( snomed_concept “Patient referral” (procedure))
	)
	(and
		(clinical_finding ( snomed_concept “Hemoglobin below reference range” (finding))
		(clinical_finding ( snomed_concept “Occult hemorrhage” (morphologic abnormality))
		(clinical_finding ( snomed_concept “Patient condition unchanged” (finding) “After” (attribute) “week” (qualifier value) 4))
		)
	)
)
 ;;Page 27 – Pallor and Anaemia 
(system_diagnosis_rule
	"Malaria likely"
	(adult
	(clinical_finding ( snomed_concept “Malaria” (disorder))
	)
	probable
	(and 
		(clinical_finding ( snomed_concept “Fever” (finding) “day” (qualifier value) 0 to 3))
		(clinical_finding ( snomed_concept “History of travel with high risk of exposure to communicable disease” (situation) “Malaria” (disorder) “In the past” (qualifier value) “month” (qualifier value) 3))
		(clinical_finding ( snomed_concept “Malaria antigen test” (procedure) “Positive” (qualifier value))
		)
	)
)
;;Page 27 – Pallor and Anaemia 
(system_diagnosis_rule
	"Systemic disease or chronic condition likely"
	(adult
	(clinical_finding ( snomed_concept “Systemic disease” (disorder))
	(clinical_finding ( snomed_concept “Chronic disease” (disorder))
	)
	probable
	(and
		(clinical_finding ( snomed_concept “Mean corpuscular volume within reference range” (finding))
		(clinical_finding ( snomed_concept “Human immunodeficiency virus infection” (disorder))
		(clinical_finding ( snomed_concept “Tuberculosis” (disorder) and
“Pregnancy” (finding))
		(clinical_finding ( snomed_concept “Terminal illness” (finding) “Known” (qualifier value) 
		)
	)
)
;;Page 27 – Pallor and Anaemia 
(system_diagnosis_rule
	"Folate deficiency likely"
	(adult
	(clinical_finding ( snomed_concept “Folic acid deficiency” (disorder))
	)
	probable
	(and
		(clinical_finding ( snomed_concept “Mean corpuscular volume above reference range” (finding))
		(clinical_finding ( snomed_concept “Postpartum state” (finding))
		(clinical_finding ( snomed_concept “Current drinker of alcohol” (finding))
		)
	)
;;Page 27 – Pallor and Anaemia 
(system_diagnosis_rule
	"Folate deficiency likely"
	(adult
	(consultation 
	(clinical_finding ( snomed_concept “Folic acid deficiency” (disorder))
	(clinical_finding ( snomed_concept “Consultation” (procedure) “Medical practitioner” (occupation))
	(and
		(clinical_finding ( snomed_concept “Review of medication” (procedure))
		(clinical_finding ( snomed_concept “Zidovudine” (substance))
		(clinical_finding ( snomed_concept “Anticonvulsant” (substance))
		)
	)
)
 ;;Page 27 – Pallor and Anaemia 
(system_diagnosis_rule
	"Anaemia likely"
	(adult
	(referral
	(clinical_finding ( snomed_concept “Anemia” (disorder))
	(clinical_finding ( snomed_concept “Patient referral” (procedure))
	(and
		(clinical_finding ( snomed_concept “Hemoglobin below reference range” (finding))
		(clinical_finding ( snomed_concept “Patient condition unchanged” (finding) “After” (attribute) “week” (qualifier value) 4))
		(clinical_finding ( snomed_concept “Chronic diarrhea” (disorder))
		)
	)
)
;;Page 27 – Pallor and Anaemia 
(system_diagnosis_rule
	"Vitamin B12 deficiency likely"
	(adult
	(clinical_finding ( snomed_concept “Cobalamin deficiency” (disorder))
	)
	probable
	(and
		(clinical_finding ( snomed_concept “Mean corpuscular volume above reference range” (finding))
		(clinical_finding ( snomed_concept “Not pregnant” (finding))
		(clinical_finding ( snomed_concept “Pregnancy” (finding))
		(clinical_finding ( snomed_concept “Current non-drinker of alcohol” (finding))
		)
	)
;;Page 27 – Pallor and Anaemia 
(system_diagnosis_rule
	"Vitamin B12 deficiency likely"
	(adult
	(referral
	(clinical_finding ( snomed_concept “Cobalamin deficiency” (disorder))
	(clinical_finding ( snomed_concept “Patient referral” (procedure))
	(and
		(clinical_finding ( snomed_concept “Referral for diagnostic investigation” (procedure))
		)
	)
)


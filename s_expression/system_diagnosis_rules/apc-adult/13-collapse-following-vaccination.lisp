;;Page 13 – Collapse Following Vaccination 
(system_diagnosis_rule
	"Fainting episode likely"
	(probable
		(clinical_finding (snomed_concept “Syncope” (finding) “Episode” (attribute))
		(adult
				(clinical_finding (snomed_concept “Collapse” (finding) “Symptom started suddenly” (finding) “At time of procedure” (qualifier value) “Administration of vaccine to produce active immunity” (procedure)
				(clinical_finding (snomed_concept “Brief loss of consciousness” (finding) “Duration” (attribute) “Seconds” (qualifier value) 20 to “minute” (qualifier value) 1))
				(clinical_finding (snomed_concept “Transient hypotension” (disorder))
				(clinical_finding (snomed_concept “Pulse slow” (finding))
				(clinical_finding (snomed_concept “Normal respiratory function” (finding))
				(clinical_finding (snomed_concept “Hyperventilation” (finding))
		)
	)
;;Page 13 – Collapse Following Vaccination 
(system_diagnosis_rule
	"Fainting episode likely"
	(referral 
		(clinical_finding (snomed_concept “Syncope” (finding) “Episode” (attribute))
		AND 
		(clinical_finding (snomed_concept "Patient referral" (procedure))
		(adult
				(clinical_finding (snomed_concept “Injury of head” (disorder))
				(clinical_finding (snomed_concept “Heart disease” (disorder) “Known” (qualifier value))
				(clinical_finding (snomed_concept “Chronic disease” (disorder))
				(clinical_finding (snomed_concept “Terminal illness” (finding))
				(clinical_finding (snomed_concept “Atypical chest pain” (finding))
				(clinical_finding (snomed_concept “Dyspnea” (finding))
				(clinical_finding (snomed_concept “Clouded consciousness” (finding))
				(clinical_finding (snomed_concept “Blurring of visual image” (finding))
				(clinical_finding (snomed_concept “Difficulty talking” (finding))
		)
	)
)
;;Page 13 – Collapse Following Vaccination 
(system_diagnosis_rule
	"Anaphylaxis likely"
	(probable
	(clinical_finding (snomed_concept “Anaphylaxis” (disorder))
	(adult
			(clinical_finding (snomed_concept “Collapse” (finding) “At time of procedure” (qualifier value) “Administration of vaccine to produce active immunity” (procedure) “After” (attribute) “minute” (qualifier value) 5 to 10 ))
			OR
			(clinical_finding (snomed_concept “Collapse” (finding) “At time of procedure” (qualifier value) “Administration of vaccine to produce active immunity” (procedure) “After” (attribute) “hour” (qualifier value) 1))
			)
			(clinical_finding (snomed_concept “Prolonged loss of consciousness” (finding))
			(<measurement (clinical_finding (snomed_concept “Systolic blood pressure” (observable entity) “Millimeter of mercury” (qualifier value) 90))
			(<measurement (clinical_finding (snomed_concept “Diastolic blood pressure” (observable entity) “Millimeter of mercury” (qualifier value) 60))
			(clinical_finding (snomed_concept “Low blood pressure” (disorder) “Prolonged” (qualifier value))
			(>measurement (clinical_finding (snomed_concept “Heart rate” (observable entity) “Beats/minute” (qualifier value) 120))
			(clinical_finding (snomed_concept “Wheezing” (finding))
			(clinical_finding (snomed_concept “Stridor” (finding))
			(clinical_finding (snomed_concept “Cough” (finding))
			(clinical_finding (snomed_concept “Swelling” (finding))
			(clinical_finding (snomed_concept “Eruption of skin” (disorder))
		)
	)
)
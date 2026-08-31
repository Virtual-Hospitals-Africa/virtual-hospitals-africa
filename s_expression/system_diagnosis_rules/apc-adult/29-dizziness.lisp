;;Page 29 – Dizziness
(diagnosis 
	" Orthostatic hypotension likely" 
	(probable
	(clinical_finding ( snomed_concept “Orthostatic hypotension” (disorder))
	(adult
		(>= measurement (clinical_finding ( snomed_concept “Level of reduction in systolic blood pressure on standing” (observable entity) “Millimeter of mercury” (qualifier value) 20))
		(>= measurement (clinical_finding ( snomed_concept “Level of reduction in diastolic blood pressure on standing” (observable entity) “Millimeter of mercury” (qualifier value) 10))
		(clinical_finding ( snomed_concept “Elderly person” (person))
		(clinical_finding ( snomed_concept “Diarrhea” (finding))
		(clinical_finding ( snomed_concept “Vomiting” (disorder))
		(clinical_finding ( snomed_concept “Fever” (finding))
		(clinical_finding ( snomed_concept “Review of medication” (procedure))
			 ( snomed_concept “Fluoxetine” (substance))
			 ( snomed_concept “Amitriptyline” (substance))
			 ( snomed_concept “Amlodipine” (substance))
			 ( snomed_concept “Enalapril” (substance))
			 ( snomed_concept “Furosemide” (substance))
			 ( snomed_concept “Hydrochlorothiazide” (substance))
			 ( snomed_concept “Isosorbide dinitrate” (substance))
	)
)
;;Page 29 – Dizziness
(diagnosis 
" Orthostatic hypotension likely" 
	(referral
	(clinical_finding ( snomed_concept “Orthostatic hypotension” (disorder))
	(and
	(clinical_finding ( snomed_concept “Patient referral” (procedure))
	(adult
		(clinical_finding ( snomed_concept “Diabetes mellitus” (disorder))
		(clinical_finding ( snomed_concept “Peripheral nerve disease” (disorder))
				(clinical_finding ( snomed_concept “Chronic pain of bilateral feet” (finding))
				(clinical_finding ( snomed_concept “Numbness of foot” (finding) “Both feet” (body structure))
		(clinical_finding ( snomed_concept “Tremor” (finding))
		(clinical_finding ( snomed_concept “Bradykinesia” (finding))
		(clinical_finding ( snomed_concept “Stiffness” (finding))
		(clinical_finding ( snomed_concept “History of” (contextual qualifier) (qualifier value) “Constipation” (finding))
		(clinical_finding ( snomed_concept “History of” (contextual qualifier) (qualifier value) “Erectile dysfunction” (disorder))
		)
	)
)
Page 29 – Dizziness
(diagnosis 
" stroke or TIA likely" 
	(probable
	(clinical_finding ( snomed_concept “Cerebrovascular accident” (disorder))
	(clinical_finding ( snomed_concept “Transient ischemic attack” (disorder))
	(adult
		(clinical_finding ( snomed_concept “Weakness of face muscles” (finding) “New” (qualifier value) “Sudden” (qualifier value) “Asymmetry” (qualifier value))
		(clinical_finding ( snomed_concept “Numbness of face” (finding) “New” (qualifier value) “Sudden” (qualifier value) “Asymmetry” (qualifier value))
		(clinical_finding ( snomed_concept “Muscle weakness of upper limb” (finding) “New” (qualifier value) “Sudden” (qualifier value) “Asymmetry” (qualifier value))
		(clinical_finding ( snomed_concept “Numbness of upper limb” (finding) “New” (qualifier value) “Sudden” (qualifier value) “Asymmetry” (qualifier value))
		(clinical_finding ( snomed_concept “Weakness of muscle of lower limb” (finding) “New” (qualifier value) “Sudden” (qualifier value) “Asymmetry” (qualifier value))
		(clinical_finding ( snomed_concept “Numbness of lower limb” (finding) “New” (qualifier value) “Sudden” (qualifier value) “Asymmetry” (qualifier value))
		(clinical_finding ( snomed_concept “Difficulty talking” (finding))
		(clinical_finding ( snomed_concept “Visual disturbance” (disorder))
		(clinical_finding ( snomed_concept “Dizziness” (finding) and 					(clinical_finding ( snomed_concept “Collapse” (finding))
		(clinical_finding ( snomed_concept “Dizziness” (finding) and 		(clinical_finding ( snomed_concept “Falls” (finding))
		(clinical_finding ( snomed_concept “Asthenia” (finding))
		(clinical_finding ( snomed_concept “Tired” (finding))
		)
	)
)
Page 29 – Dizziness
(diagnosis 
" Vestibular neuronitis likely" 
	(probable
	(clinical_finding ( snomed_concept “Vestibular neuronitis of inner ear" (disorder))
	(adult
		(clinical_finding (snomed_concept “Dizziness" (finding) "Sudden" (qualifier value) "For" (qualifier value) "hours" (qualifier value) or "days" (qualifier value))
		(clinical_finding (snomed_concept “Nausea" (finding))
		(clinical_finding (snomed_concept “Vomiting" (disorder))
		(clinical_finding (snomed_concept “Influenza-like illness" (finding) "Before" (attribute))
		)
	)
Page 29 – Dizziness
(diagnosis 
" Vestibular neuronitis likely" 
	(referral 
	(clinical_finding ( snomed_concept “Vestibular neuronitis of inner ear" (disorder))
	(and
	(clinical_finding ( snomed_concept “Patient referral" (procedure))
	(adult
		(clinical_finding (snomed_concept “Hearing loss" (disorder))
		(clinical_finding (snomed_concept “Tinnitus" (finding))
		(clinical_finding (snomed_concept “Patient condition unchanged" (finding) "After" (attribute) "week" (qualifier value)2))
		)
	)
)
Page 29 – Dizziness
(diagnosis 
" Positional vertigo likely" 
	(probable
	(clinical_finding ( snomed_concept “Positional vertigo" (finding))
	(adult
		(clinical_finding (snomed_concept “Dizziness" (finding) "Sudden" (qualifier value) "For" (qualifier value) "Seconds" (qualifier value))
		(clinical_finding (snomed_concept “Provoked by" (attribute) "Does move head" (finding)
		)
	)
Page 29 – Dizziness
(diagnosis 
" Positional vertigo likely"  
	(referral
	(clinical_finding ( snomed_concept “Positional vertigo" (finding))
	(and
	(clinical_finding (snomed_concept “Patient referral" (procedure))
	(adult
		(clinical_finding (snomed_concept “Headache" (finding))
		(clinical_finding (snomed_concept “Visual disturbance" (disorder))
		(clinical_finding (snomed_concept “Hearing loss" (disorder))
		(clinical_finding (snomed_concept “Tinnitus" (finding))


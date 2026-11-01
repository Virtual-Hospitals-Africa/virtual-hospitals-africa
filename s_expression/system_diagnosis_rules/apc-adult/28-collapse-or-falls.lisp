Page 28 – Collapse/ Falls
(diagnosis
"Collapse or Falls needing referral"
	(clinical_finding ( snomed_concept “Collapse” (finding)
	or
	(clinical_finding ( snomed_concept “Falls” (finding))
	and
	(clinical_finding ( snomed_concept “Patient referral” (procedure))
	(referral
	(adult
		(clinical_finding ( snomed_concept “Collapse” (finding) “With” (attribute) “Coughing” (observable entity))
		(clinical_finding ( snomed_concept “Collapse” (finding) “With” (attribute) “Deglutition” (observable entity))
		(clinical_finding ( snomed_concept “Collapse” (finding) “With” (attribute) “Ability to turn head” (observable entity))
		)
	)
)
Page 28 – Collapse/ Falls
(diagnosis
"Diagnose Common Faint Likely"
	(clinical_finding ( snomed_concept “Syncope” (finding))
	(probable 
	(adult
		(clinical_finding ( snomed_concept “Dizziness” (finding) “Before” (attribute) “Collapse” (finding))
		(clinical_finding ( snomed_concept “Lightheadedness” (finding) “Before” (attribute) “Collapse” (finding))
		(clinical_finding ( snomed_concept “Nausea” (finding) “Before” (attribute) “Collapse” (finding))
		(clinical_finding ( snomed_concept “Sweating” (finding) “Before” (attribute) “Collapse” (finding))
		(clinical_finding ( snomed_concept “Asthenia” (finding) “Before” (attribute) “Collapse” (finding))
		(clinical_finding ( snomed_concept “Visual disturbance” (disorder) “Before” (attribute) “Collapse” (finding))
		(clinical_finding ( snomed_concept “Collapse” (finding) “With” (attribute) < “Spasmodic movement” (finding) “Seconds” (qualifier value) 15))
			(clinical_finding ( snomed_concept “After” (attribute) “Flushing” (disorder))
			(clinical_finding ( snomed_concept “After” (attribute) “Dizziness” (finding))
			(clinical_finding ( snomed_concept “After” (attribute) “Nausea” (finding))
			(clinical_finding ( snomed_concept “After” (attribute) “Sweating” (finding))
			)
		)
)
Page 28 – Collapse/ Falls
(diagnosis
"Diagnose Common Faint Likely"
	(clinical_finding ( snomed_concept “Syncope” (finding))
	and
	(clinical_finding ( snomed_concept "Patient referral" (procedure)
	(referral
	(adult
		(>clinical_finding ( snomed_concept “ Current chronological age” (observable entity) “year” (qualifier value) 65))
			(clinical_finding ( snomed_concept “With” (attribute)
“Heart disease suspected” (situation))
			(clinical_finding ( snomed_concept “With” (attribute) “Recurrent falls” (finding)) 
			(clinical_finding ( snomed_concept “With” (attribute) “Collapse” (finding) “Recurrent” (qualifier value))
			(clinical_finding ( snomed_concept “With” (attribute) “Collapse from cause unknown” (finding))
			(clinical_finding ( snomed_concept “With” (attribute) “Falls from cause unknown” (finding))
			)
		)
)
Page 28 – Collapse/ Falls
(diagnosis
"Diagnose Orthostatic hypotension likely"
	(clinical_finding ( snomed_concept “Orthostatic hypotension” (disorder))
	(probable 
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
)
Page 28 – Collapse/ Falls
(diagnosis
	(clinical_finding ( snomed_concept “Orthostatic hypotension” (disorder))
(and
(clinical_finding ( snomed_concept “Patient referral” (procedure))
	(referral 
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
Page 28 – Collapse/ Falls
	(diagnosis
"Diagnose Stroke or TIA Likely"
	(clinical_finding ( snomed_concept “Cerebrovascular accident” (disorder))
(clinical_finding ( snomed_concept “Transient ischemic attack” (disorder))
	(probable 
	(adult
		(clinical_finding ( snomed_concept “Weakness of face muscles” (finding) “New” (qualifier value) “Sudden” (qualifier value) “Asymmetry” (qualifier value))
		(clinical_finding ( snomed_concept “Numbness of face” (finding) “New” (qualifier value) “Sudden” (qualifier value) “Asymmetry” (qualifier value))
		(clinical_finding ( snomed_concept “Muscle weakness of upper limb” (finding) “New” (qualifier value) “Sudden” (qualifier value) “Asymmetry” (qualifier value))
		(clinical_finding ( snomed_concept “Numbness of upper limb” (finding) “New” (qualifier value) “Sudden” (qualifier value) “Asymmetry” (qualifier value))
		(clinical_finding ( snomed_concept “Weakness of muscle of lower limb” (finding) “New” (qualifier value) “Sudden” (qualifier value) “Asymmetry” (qualifier value))
		(clinical_finding ( snomed_concept “Numbness of lower limb” (finding) “New” (qualifier value) “Sudden” (qualifier value) “Asymmetry” (qualifier value))
		(clinical_finding ( snomed_concept “Difficulty talking” (finding))
		(clinical_finding ( snomed_concept “Visual disturbance” (disorder))
		(clinical_finding ( snomed_concept “Dizziness” (finding) and 					    (clinical_finding ( snomed_concept “Collapse” (finding))
		(clinical_finding ( snomed_concept “Dizziness” (finding) and 					(clinical_finding ( snomed_concept “Falls” (finding))
		(clinical_finding ( snomed_concept “Asthenia” (finding))
		(clinical_finding ( snomed_concept “Tired” (finding))
		)
	)
)

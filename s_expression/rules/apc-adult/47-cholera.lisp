Page 47 Cholera
(task
	"Urgent Cholera conditions"
	(adult
	(snomed_concept “Cholera” (disorder))
	(check_for
		(clinical_finding (snomed_concept “Drowsy” (finding))
		(clinical_finding (snomed_concept “Decreased level of consciousness” (finding))
		(clinical_finding (snomed_concept “Clouded consciousness” (finding))
		(clinical_finding (snomed_concept “Difficulty breathing” (finding))
		(clinical_finding (snomed_concept “Thready pulse” (finding))
		(clinical_finding (snomed_concept “Unable to drink” (finding))
		(clinical_finding (snomed_concept “Finding of insufficient fluid intake” (finding))
		(clinical_finding (snomed_concept “Decreased skin turgor” (finding))
		(clinical_finding (snomed_concept “Sunken eyes” (finding))
		(<measurement (snomed_concept “Systolic blood pressure” (observable entity) mmHg) 90))
		(<measurement (snomed_concept “Diastolic blood pressure” (observable entity) mmHg) 60))
		(>=measurement (snomed_concept “Heart rate” (observable entity) bpm) 100))
		(clinical_finding (snomed_concept “Retention of urine” (disorder))
		(clinical_finding (snomed_concept “Dependent for walking” (finding))
		(clinical_finding (snomed_concept “Diarrhea” (finding) “Ongoing episode” (qualifier value))
		(clinical_finding (snomed_concept “Vomiting” (disorder) “Ongoing episode” (qualifier value))
		)
	)
)
Page 47 Cholera
(system_priority_evaluation
	"Urgent Cholera conditions"
	(adult
	(snomed_concept “Cholera” (disorder))
	(and
		(or
			(clinical_finding (snomed_concept “Severe dehydration” (disorder))
			(clinical_finding (snomed_concept “Drowsy” (finding))
			(clinical_finding (snomed_concept “Decreased level of consciousness” (finding))
			(clinical_finding (snomed_concept “Clouded consciousness” (finding))
			(clinical_finding (snomed_concept “Difficulty breathing” (finding))
			(clinical_finding (snomed_concept “Thready pulse” (finding))
			)
			any 2
			(clinical_finding (snomed_concept “Unable to drink” (finding))
			(clinical_finding (snomed_concept “Finding of insufficient fluid intake” (finding))
			(clinical_finding (snomed_concept “Decreased skin turgor” (finding))
			(clinical_finding (snomed_concept “Sunken eyes” (finding))
			)
			(clinical_finding (snomed_concept “Signs of dehydration” (finding))
			(clinical_finding (snomed_concept “Unable to drink” (finding))
			(clinical_finding (snomed_concept “Finding of insufficient fluid intake” (finding))
			(clinical_finding (snomed_concept “Decreased skin turgor” (finding))
			(clinical_finding (snomed_concept “Sunken eyes” (finding))
			(>=measurement (snomed_concept “Heart rate” (observable entity) bpm) 100))
			(clinical_finding (snomed_concept “Thready pulse” (finding))
			(clinical_finding (snomed_concept “Retention of urine” (disorder))
			(clinical_finding (snomed_concept “Dependent for walking” (finding))
			(clinical_finding (snomed_concept “Diarrhea” (finding) “Ongoing episode” (qualifier value))
			)
			(clinical_finding (snomed_concept “Vomiting” (disorder) “Ongoing episode” (qualifier value))
		)
	)
)
Page 47 Cholera
(system_diagnosis_rule
	"Cholera likely"
	(adult
	(snomed_concept “Cholera” (disorder))
	)
	probable
	(and
		(or
			(clinical_finding (snomed_concept “Liquid stool” (finding))
			(clinical_finding (snomed_concept “Vomiting” (disorder))
			(clinical_finding (snomed_concept “No vomiting” (situation))
			(clinical_finding (snomed_concept “History of travel with high risk of exposure to communicable disease” (situation) “Cholera” (disorder) “In the past” (qualifier value) day) 5))
	)
)
Page 47 Cholera
(system_diagnosis_rule
	"Some dehydration likely"
	(adult
	(snomed_concept “Dehydration” (disorder) “Some” (qualifier value)
	)
	probable
	(and
		(or
			(clinical_finding (snomed_concept “Diarrhea” (finding))
			(clinical_finding (snomed_concept “Thirst due to water 		deprivation” (finding))
			(clinical_finding (snomed_concept “Xerostomia” (finding))
			(clinical_finding (snomed_concept “Restlessness” (finding))
			(clinical_finding (snomed_concept “Awake” (finding))
			(clinical_finding (snomed_concept “Able to drink” (finding))
			(<measurement (snomed_concept “Heart rate” (observable entity) bpm) 100))
	)
)
Page 47 Cholera
(system_diagnosis_rule
	"Severe dehydration likely"
	(adult
	(snomed_concept “Severe dehydration” (disorder))
	)
	probable
	(and
		(or
			(clinical_finding (snomed_concept “Drowsy” (finding))
			(clinical_finding (snomed_concept “Decreased level of consciousness” (finding))
			(clinical_finding (snomed_concept “Clouded consciousness” (finding))
			(clinical_finding (snomed_concept “Difficulty breathing” (finding))
			(clinical_finding (snomed_concept “Thready pulse” (finding))
			(clinical_finding (snomed_concept “Unable to drink” (finding))
			(clinical_finding (snomed_concept “Finding of insufficient fluid intake” (finding))
			(clinical_finding (snomed_concept “Decreased skin turgor” (finding))
			(clinical_finding (snomed_concept “Sunken eyes” (finding))
			(>=measurement (snomed_concept “Heart rate” (observable entity) bpm) 100))
			(clinical_finding (snomed_concept “Retention of urine” (disorder))
			(clinical_finding (snomed_concept “Dependent for walking” (finding))
			(clinical_finding (snomed_concept “Diarrhea” (finding) “Ongoing episode” (qualifier value))
			(clinical_finding (snomed_concept “Vomiting” (disorder) “Ongoing episode” (qualifier value))
		)
	)
)

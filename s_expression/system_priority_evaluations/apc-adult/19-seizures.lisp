;;Page 19 – Seizures
(system_priority_evaluation
	"Urgent seizure conditions"
	(urgent
	(clinical_finding ( snomed_concept “Seizure” (finding))
	(adult
		(clinical_finding ( snomed_concept “Unconscious” (finding))
		)
		(clinical_finding ( snomed_concept “Epilepsy” (disorder) “Known” (qualifier value))
		)
		(>=measurement (clinical_finding ( snomed_concept “Body temperature” (observable entity) “Degrees Celsius” (qualifier value) 38))
		)
		(clinical_finding ( snomed_concept “Headache” (finding))
		AND
		(clinical_finding ( snomed_concept “Seizure” (finding))
		AND 
		(clinical_finding ( snomed_concept “Stiff neck” (finding))
		AND
		(clinical_finding ( snomed_concept “Purpuric rash (disorder))
		)
		(>=measurement (clinical_finding ( snomed_concept “Body temperature” (observable entity) “Degrees Celsius” (qualifier value) 38))
		AND
		(clinical_finding ( snomed_concept “History of travel with high risk of exposure to communicable disease” (situation) “Malaria” (disorder))
		AND
		(clinical_finding ( snomed_concept “Malaria antigen test” (procedure) “Positive” (qualifier value))
		AND
		(clinical_finding ( snomed_concept “Seizure” (finding))
		)
		(clinical_finding ( snomed_concept “Headache” (finding) “New” (qualifier value))
		OR
		(clinical_finding ( snomed_concept “Frequent headache” (finding))
		OR
		(clinical_finding ( snomed_concept “Headache” (finding) “Worse” (qualifier value))
		)
		(clinical_finding ( snomed_concept “Human immunodeficiency virus infection” (disorder))
		AND
		(clinical_finding ( snomed_concept “Epilepsy” (disorder) “Known absent” (qualifier value))
		)
		(> (clinical_finding ( snomed_concept “Decreased level of consciousness” (finding))
		AND 
		(clinical_finding ( snomed_concept “After” (attribute) “Seizure” (finding) “hour” (qualifier value)1))
		)
		(< (clinical_finding ( snomed_concept “Finding of blood glucose level” (finding) “Millimole/liter” (qualifier value) 4))
		AND
		(clinical_finding ( snomed_concept “After” (attribute) “Treatment given” (situation) (finding) “hour” (qualifier value)1))
		)
		(< (clinical_finding ( snomed_concept “Finding of blood glucose level” (finding) “Millimole/liter” (qualifier value) 4))
		AND
		(clinical_finding ( snomed_concept “After” (attribute) “Administration of drug or medicament” (procedure) “Glimepiride” (substance) “hour” (qualifier value)1))
		)
		(< (clinical_finding ( snomed_concept “Finding of blood glucose level” (finding) “Millimole/liter” (qualifier value) 4))
		AND
		(clinical_finding ( snomed_concept “After” (attribute) “Administration of insulin” (procedure) “hour” (qualifier value)1))
		)
		(>= (clinical_finding ( snomed_concept “Finding of blood glucose level (finding) “Millimole/liter” (qualifier value) 11.1))
		)
		(clinical_finding ( snomed_concept “Muscle weakness” (finding) “New” (qualifier value) “Sudden” (qualifier value) “Asymmetry” (qualifier value))
		AND
		(clinical_finding ( snomed_concept “Numbness” (finding))
		AND
		(clinical_finding ( snomed_concept “Difficulty talking” (finding))
		AND 
		(clinical_finding ( snomed_concept “Visual disturbance” (disorder))
		)
		(>=measurement (clinical_finding ( snomed_concept “Systolic blood pressure” (observable entity) “Millimeter of mercury” (qualifier value) 180))
		AND
		(clinical_finding ( snomed_concept “ “After” (attribute) “Seizure” (finding) “Stops” (attribute) “hour” (qualifier value)1 ))
		AND
		(>=measurement (clinical_finding ( snomed_concept “Diastolic blood pressure” (observable entity) “Millimeter of mercury” (qualifier value) 130))
		AND
 “After” (attribute) “Seizure” (finding) “Stops” (attribute) “hour” (qualifier value)1 ))
		)
		(clinical_finding ( snomed_concept “Current drinker of alcohol” (finding))
		AND
		(clinical_finding ( snomed_concept “Alcohol intoxication” (disorder))
		AND
		(clinical_finding ( snomed_concept “Overdose” (disorder) “Alcohol use disorder” (disorder))
		AND
		(clinical_finding ( snomed_concept “Alcohol withdrawal syndrome” (disorder))
		OR
		(clinical_finding ( snomed_concept “Substance use disorder” (disorder))
		AND
		(clinical_finding ( snomed_concept “Intoxication” (disorder))
		AND
		(clinical_finding ( snomed_concept “Overdose’ (disorder))
		AND
		(clinical_finding ( snomed_concept “Substance withdrawal syndrome” (disorder))
		)
		(clinical_finding ( snomed_concept “Injury of head” (disorder) “Recent” (qualifier value))
		)
		(clinical_finding ( snomed_concept “Pregnancy” (finding))
		OR
		(clinical_finding ( snomed_concept “Postpartum period, 7 days” (finding) “In” (attribute))
		)
		(>= (clinical_finding ( snomed_concept “Gestation period, 20 weeks (finding) “Seizure” (finding) “Recent” (qualifier value))
		)
	)
)

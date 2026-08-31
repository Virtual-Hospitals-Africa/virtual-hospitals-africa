;;Page 16 – Decreased consciousness
(emergency 
"Emergency Decreased Consciousness conditions"
		(adult
		(clinical_finding ( snomed_concept “Decreased level of consciousness” (finding))
		(check for
				"Airway"
				(clinical_finding ( snomed_concept “Airway patency status” (observable entity))
						(clinical_finding ( snomed_concept “Respiratory obstruction” (disorder))
						)
						(clinical_finding ( snomed_concept “Gasping for breath” (finding))
						OR
						(clinical_finding ( snomed_concept “Apnea” (finding))
						)
						(clinical_finding ( snomed_concept “Snoring” (finding))
						OR
						(clinical_finding ( snomed_concept “Gurgling” (finding))
						OR
						(clinical_finding ( snomed_concept “Noisy respiration” (finding))
						)
						(clinical_finding ( snomed_concept “Unconscious” (finding) “Gagging” (finding) “With” (attribute))
						OR
						(clinical_finding ( snomed_concept “Unconscious” (finding) “Vomiting” (disorder) With (attribute))
						)
				"Breathing"
				(clinical_finding ( snomed_concept “Respiratory function” (observable entity))
						(clinical_finding ( snomed_concept “Difficulty breathing” (finding))
						OR
						(< measurement (clinical_finding ( snomed_concept “Hemoglobin saturation with oxygen” (observable entity) “At rest” (qualifier value) “Percent” (property) (qualifier value) 94))
						(< measurement (clinical_finding ( snomed_concept “Respiratory rate” (observable entity) “Breaths/minute” (qualifier value) 9))
						OR
						(clinical_finding ( snomed_concept “Blue lips” (finding))
						OR
						(clinical_finding ( snomed_concept “Blue tongue” (finding))
						)
						(clinical_finding ( snomed_concept “Dyspnea” (finding) “Sudden” (qualifier value))
						AND ALL
						(clinical_finding ( snomed_concept “Increased breath sounds” (finding))
						(clinical_finding ( snomed_concept “Decreased breath sounds” (finding))
						(clinical_finding ( snomed_concept “Chest pain” (finding) Unilateral (qualifier value))
						(clinical_finding ( snomed_concept “Trachea displaced” (disorder))
						)
				"Circulation" 
				(clinical_finding ( snomed_concept “Circulation status” (observable entity))
						(< measurement (clinical_finding ( snomed_concept “Heart rate (observable entity) “Beats/minute” (qualifier value) 50))
						AND 
						(clinical_finding ( snomed_concept “Unstable status” (qualifier value)
						(< measurement (clinical_finding ( snomed_concept “Systolic blood pressure” (observable entity) “Millimeter of mercury” (qualifier value) 90))
						AND
						(< measurement (clinical_finding ( snomed_concept “Diastolic blood pressure” (observable entity) “Millimeter of mercury” (qualifier value) 60))
						(clinical_finding ( snomed_concept “Decreased level of consciousness” (finding))
						(clinical_finding ( snomed_concept “Chest pain” (finding))
						(clinical_finding ( snomed_concept “Acute heart failure” (disorder))
						)
						(< measurement (clinical_finding ( snomed_concept “Systolic blood pressure” (observable entity) “Millimeter of mercury” (qualifier value) 90))
						AND
						(< measurement (clinical_finding ( snomed_concept “Diastolic blood pressure” (observable entity) “Millimeter of mercury” (qualifier value) 60))
						OR
						(>= measurement (clinical_finding ( snomed_concept “Heart rate” (observable entity) “Beats/minute” (qualifier value) 100))
						OR
						(clinical_finding ( snomed_concept “Bleeding” (finding) “Excessive” (qualifier value))
						)
						(clinical_finding ( snomed_concept “Heart disease” (disorder) “Known” (qualifier value))
						OR
						(clinical_finding ( snomed_concept “Infectious disease suspected” (situation))
						)
				"Level of consciousness" 
				(clinical_finding ( snomed_concept “Level of consciousness” (observable entity))
						(clinical_finding ( snomed_concept “Glasgow coma score” (observable entity))
						(clinical_finding ( snomed_concept “Glasgow Coma Scale motor response subscore” (observable entity))
								ONLY ONE 
								(clinical_finding ( snomed_concept “Localized motor response to command” (finding) “Item score” (qualifier value) 5))
								(clinical_finding ( snomed_concept “Withdrawing motor response to command” (finding) “Item score” (qualifier value) 4))
								(clinical_finding ( snomed_concept “Flexing motor response to command” (finding) “Item score” (qualifier value) 3))
								(clinical_finding ( snomed_concept “Extending motor response to command” (finding) “Item score” (qualifier value) 2))
								(clinical_finding ( snomed_concept “No motor response to command” (finding) “Item score” (qualifier value)1))
						(clinical_finding ( snomed_concept “Glasgow Coma Scale verbal response subscore” (observable entity))
								ONLY ONE 
								(clinical_finding ( snomed_concept “Clouded consciousness” (finding) “Item score” (qualifier value) 4))
								(clinical_finding ( snomed_concept “Inappropriate verbal response” (finding) “Item score” (qualifier value) 3))
								(clinical_finding ( snomed_concept “Incoherent speech” (finding) “Item score” (qualifier value) 2))
								(clinical_finding ( snomed_concept “Unable to speak” (finding) “Item score” (qualifier value)1))
						(clinical_finding ( snomed_concept “Glasgow Coma Score eye opening subscore” (observable entity))
								ONLY ONE 
								(clinical_finding ( snomed_concept “Responds to voice” (finding) “Item score” (qualifier value) 3))
								(clinical_finding ( snomed_concept “Responds to pain” (finding) “Item score” (qualifier value) 2))
								(clinical_finding ( snomed_concept “None” (qualifier value) “Item score” (qualifier value)1))
								)
						(clinical_finding ( snomed_concept “Traumatic or non-traumatic injury” (disorder))
						OR
						(clinical_finding ( snomed_concept “Multiple injuries” (disorder))
						)
						(clinical_finding ( snomed_concept “Seizure” (finding))
						)
						(clinical_finding ( snomed_concept “Burn” (disorder))
						)
						(clinical_finding ( snomed_concept “Decreased level of consciousness” (finding) “Sudden” (qualifier value))
								AND ANY
								(clinical_finding ( snomed_concept “Generalized pruritus” (finding))
								(clinical_finding ( snomed_concept “Generalized rash” (disorder))
								(clinical_finding ( snomed_concept “Facial swelling” (finding))
								(clinical_finding ( snomed_concept “Tongue swelling” (finding))
								(clinical_finding ( snomed_concept “Wheezing” (finding))
								(clinical_finding ( snomed_concept “Difficulty breathing” (finding))
								(clinical_finding ( snomed_concept “Abdominal pain” (finding))
								(clinical_finding ( snomed_concept “Vomiting” (disorder))
								(clinical_finding ( snomed_concept “Exposure to” (contextual qualifier) (qualifier value) “Substance” (substance) “Possible” (qualifier value) “Allergen” (attribute)) 
								)
						(<measurement (clinical_finding ( snomed_concept “Finding of blood glucose level” (finding) “Millimole/liter” (qualifier value) 3))
						OR
						(measurement (clinical_finding ( snomed_concept “Finding of blood glucose level” (finding) “Millimole/liter” (qualifier value) “Unrecordable” (qualifier value))
						AND
						(clinical_finding ( snomed_concept “Current drinker of alcohol” (finding) “Known” (qualifier value))
						)
						(>=measurement (clinical_finding ( snomed_concept “Finding of blood glucose level” (finding) “Millimole/liter” (qualifier value) 11.1))
						AND
						(clinical_finding ( snomed_concept “Diabetes mellitus” (disorder) “Known” (qualifier value))
						)
						(clinical_finding ( snomed_concept “Hypothermia” (finding)
						OR
						(<=measurement (clinical_finding ( snomed_concept “Body temperature” (observable entity) “Degrees Celsius” (qualifier value) 35))
						)
						(>=measurement (clinical_finding ( snomed_concept “Body temperature” (observable entity) “Degrees Celsius” (qualifier value) 38)
						AND
						(clinical_finding ( snomed_concept “Decreased level of consciousness” (finding))
						)
						(>=measurement (clinical_finding ( snomed_concept “Body temperature” (observable entity) “Degrees Celsius” (qualifier value) 38))
						AND
						(clinical_finding ( snomed_concept “History of travel with high risk of exposure to communicable disease” (situation) “Malaria” (disorder)
						AND
						(clinical_finding ( snomed_concept “Malaria antigen test” (procedure) “Positive” (qualifier value))
						)
						(clinical_finding ( snomed_concept “Pin point pupils” (finding))
						AND
						(clinical_finding ( snomed_concept “Misuses drugs” (finding))
						AND
						(<measurement (clinical_finding ( snomed_concept “Respiratory rate (observable entity) “Breaths/minute” (qualifier value) 12))
						)
						(clinical_finding ( snomed_concept “Pin point pupils” (finding))
						AND
						(clinical_finding ( snomed_concept “Body secretion” (substance) “Excessive” (qualifier value))
						OR
						(clinical_finding ( snomed_concept “Muscle twitch” (finding))
						AND
						(clinical_finding ( snomed_concept “Low blood pressure” (disorder) “Continual” (qualifier value))
						AND
						(clinical_finding ( snomed_concept “Bradycardia” (finding))
						)
						(clinical_finding ( snomed_concept “Decreased level of consciousness” (finding))
						AND
						(clinical_finding ( snomed_concept “Overdose” (disorder) “Drug or medicament” (substance)
						AND 
						(clinical_finding ( snomed_concept “Dilated pupil” (finding) “Equal” (qualifier value) “Right and left” (qualifier value))
						)
						(clinical_finding ( snomed_concept “Injury of head” (disorder))
						AND
						(clinical_finding ( snomed_concept “Unequal reaction of bilateral pupils” (finding))
						AND 
						(clinical_finding ( snomed_concept “Sluggish pupil movement” (finding))
		)
	)
)


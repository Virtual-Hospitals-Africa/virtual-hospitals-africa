Page 19 Seizures or fits
(system_diagnosis_rule
	"Stroke or TIA likely"
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
		)
	)
)
Page 19 Seizures or fits
(system_diagnosis_rule
	"Common faint likely"
	(probable
	(clinical_finding ( snomed_concept “Syncope” (finding))
	(adult
		(clinical_finding ( snomed_concept “Collapse” (finding) “With” (attribute) < “Spasmodic movement” (finding) “Seconds” (qualifier value) 15))
		(clinical_finding ( snomed_concept “After” (attribute) “Flushing” (disorder))
		(clinical_finding ( snomed_concept “After” (attribute) “Dizziness” (finding))
		(clinical_finding ( snomed_concept “After” (attribute) “Nausea” (finding))
		(clinical_finding ( snomed_concept “After” (attribute) “Sweating” (finding))
		)
	)
)
Page 19 Seizures or fits
(system_diagnosis_rule
	"Seizures likely "
	(probable
	(clinical_finding ( snomed_concept “Seizure” (finding))
	(adult
		(clinical_finding ( snomed_concept “Unconscious” (finding))
		(clinical_finding ( snomed_concept “Epilepsy” (disorder) “Known” (qualifier value))
		(clinical_finding ( snomed_concept “Seizure observable” (observable entity))
		(<measurement (clinical_finding ( snomed_concept “Spasmodic movement” (finding) “Body part structure” (body structure) “minute” (qualifier value) 3))
		(<measurement (clinical_finding ( snomed_concept “Spasmodic movement” (finding) “Entire body as a whole” (body structure) “minute” (qualifier value) 3))
		(clinical_finding ( snomed_concept “Biting own tongue” (finding))
		(clinical_finding ( snomed_concept “Incontinence” (finding))
		(clinical_finding ( snomed_concept “Post-ictal drowsiness” (finding))
		(clinical_finding ( snomed_concept “Clouded consciousness” (finding))
		)
	)
Page 19 Seizures or fits
(system_diagnosis_rule
	"Seizures likely"
	(referral 
	(clinical_finding ( snomed_concept “Seizure” (finding))
	(clinical_finding ( snomed_concept “Urgent referral” (procedure) “In” (attribute) “24 hours” (qualifier value))
	(adult
		(>=measurement (clinical_finding ( snomed_concept “Body temperature” (observable entity) “Degrees Celsius” (qualifier value) 38))
		(clinical_finding ( snomed_concept “Headache” (finding))
		(clinical_finding ( snomed_concept “Seizure” (finding))
		(clinical_finding ( snomed_concept “Stiff neck” (finding))
		(clinical_finding ( snomed_concept “Purpuric rash (disorder))
		(>=measurement (clinical_finding ( snomed_concept “Body temperature” (observable entity) “Degrees Celsius” (qualifier value) 38))
		(clinical_finding ( snomed_concept “History of travel with high risk of exposure to communicable disease” (situation) “Malaria” (disorder))
		(clinical_finding ( snomed_concept “Malaria antigen test” (procedure) “Positive” (qualifier value))
		(clinical_finding ( snomed_concept “Seizure” (finding))
		(clinical_finding ( snomed_concept “Headache” (finding) “New” (qualifier value))
		(clinical_finding ( snomed_concept “Frequent headache” (finding))
		(clinical_finding ( snomed_concept “Headache” (finding) “Worse” (qualifier value))
		(clinical_finding ( snomed_concept “Human immunodeficiency virus infection” (disorder))
		(clinical_finding ( snomed_concept “Epilepsy” (disorder) “Known absent” (qualifier value))
		(> (clinical_finding ( snomed_concept “Decreased level of consciousness” (finding) “After” (attribute) “Seizure” (finding) “hour” (qualifier value)1))
		(< (clinical_finding ( snomed_concept “Finding of blood glucose level” (finding) “Millimole/liter” (qualifier value) 4 “After” (attribute) “Treatment given” (situation) (finding) “hour” (qualifier value)1))
		(< (clinical_finding ( snomed_concept “Finding of blood glucose level” (finding) “Millimole/liter” (qualifier value) 4 “After” (attribute) “Administration of drug or medicament” (procedure) “Glimepiride” (substance) “hour” (qualifier value)1))
		(< (clinical_finding ( snomed_concept “Finding of blood glucose level” (finding) “Millimole/liter” (qualifier value) 4 “After” (attribute) “Administration of insulin” (procedure) “hour” (qualifier value)1))
		(>= (clinical_finding ( snomed_concept “Finding of blood glucose level (finding) “Millimole/liter” (qualifier value) 11.1))
		(clinical_finding ( snomed_concept “Muscle weakness” (finding) “New” (qualifier value) “Sudden” (qualifier value) “Asymmetry” (qualifier value))
		(clinical_finding ( snomed_concept “Numbness” (finding))
		(clinical_finding ( snomed_concept “Difficulty talking” (finding))
		(clinical_finding ( snomed_concept “Visual disturbance” (disorder))
		(>=measurement (clinical_finding ( snomed_concept “Systolic blood pressure” (observable entity) “Millimeter of mercury” (qualifier value) 180 “After” (attribute) “Seizure” (finding) “Stops” (attribute) “hour” (qualifier value)1 ))
		(>=measurement (clinical_finding ( snomed_concept “Diastolic blood pressure” (observable entity) “Millimeter of mercury” (qualifier value) 130  “After” (attribute) “Seizure” (finding) “Stops” (attribute) “hour” (qualifier value)1 ))
		(clinical_finding ( snomed_concept “Current drinker of alcohol” (finding))
		(clinical_finding ( snomed_concept “Alcohol intoxication” (disorder))
		(clinical_finding ( snomed_concept “Overdose” (disorder) “Alcohol use disorder” (disorder))
		(clinical_finding ( snomed_concept “Alcohol withdrawal syndrome” (disorder))
		(clinical_finding ( snomed_concept “Substance use disorder” (disorder))
		(clinical_finding ( snomed_concept “Intoxication” (disorder))
		(clinical_finding ( snomed_concept “Overdose’ (disorder))
		(clinical_finding ( snomed_concept “Substance withdrawal syndrome” (disorder))
		(clinical_finding ( snomed_concept “Injury of head” (disorder) “Recent” (qualifier value))
		(clinical_finding ( snomed_concept “Pregnancy” (finding) OR
		(clinical_finding ( snomed_concept “Postpartum period, 7 days” (finding) “In” (attribute))
		(>= (clinical_finding ( snomed_concept “Gestation period, 20 weeks 		(finding) “Seizure” (finding) “Recent” (qualifier value))
		)
	)
Page 19 Seizures or fits
(system_diagnosis_rule
	"Seizures likely"
	(consult
	(clinical_finding ( snomed_concept “Seizure” (finding))
	(clinical_finding ( snomed_concept “Consultation” (procedure) “Healthcare professional” (occupation))
	(adult
		(clinical_finding ( snomed_concept “Focal onset epileptic seizure” (finding))
		(clinical_finding ( snomed_concept “Seizure” (finding) “New” (qualifier value) “After” (attribute))
		(clinical_finding ( snomed_concept “Meningitis” (disorder))
		(clinical_finding ( snomed_concept “Cerebrovascular accident” (disorder))
		(clinical_finding ( snomed_concept “Injury of head” (disorder))
		)
	)
)
Page 19 Seizures or fits
(system_diagnosis_rule
	"Meningitis likely"
	(probable
	(clinical_finding ( snomed_concept “Meningitis” (disorder))
	(adult
		(>=measurement (clinical_finding ( snomed_concept “Body temperature” (observable entity) “Degrees Celsius” (qualifier value) 38))
		(clinical_finding ( snomed_concept “Headache” (finding))
		(clinical_finding ( snomed_concept “Seizure” (finding))
		(clinical_finding ( snomed_concept “Stiff neck” (finding))
		(clinical_finding ( snomed_concept “Purpuric rash” (disorder))
		)
	)
)
Page 19 Seizures or fits
(system_diagnosis_rule
	"Malaria likely"
	(probable
	(clinical_finding ( snomed_concept “Malaria” (disorder))
	(adult
		(>=measurement (clinical_finding ( snomed_concept “Body temperature” (observable entity) “Degrees Celsius” (qualifier value) 38))
		(clinical_finding ( snomed_concept “History of travel with high risk of exposure to communicable disease” (situation) “Malaria” (disorder))
		(clinical_finding ( snomed_concept “Malaria antigen test” (procedure) “Positive” (qualifier value))
		(clinical_finding ( snomed_concept “Seizure” (finding))
		)
	)
)
Page 19 Seizures or fits
(system_diagnosis_rule
	"Epilepsy likely"
	(probable
	(clinical_finding ( snomed_concept “Epilepsy” (disorder))
	(adult
		(clinical_finding ( snomed_concept “History of seizure” (situation)
		(>= (clinical_finding ( snomed_concept “Seizure” (finding) 2
“Unknown” (origin) (qualifier value))
		(clinical_finding ( snomed_concept “Seizure related finding” (finding))
		)
	)
Page 19 Seizures or fits
(system_diagnosis_rule
	"Epilepsy likely"
	(referral
	(clinical_finding ( snomed_concept “Epilepsy” (disorder))
	(clinical_finding ( snomed_concept “Patient referral” (procedure))
	(adult
		(clinical_finding ( snomed_concept “Referral to doctor” (procedure))
		(clinical_finding ( snomed_concept “Referral to medical service” (procedure))
		)
	)
)


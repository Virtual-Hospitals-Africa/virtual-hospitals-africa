;;Page 16 – Decreased Consciousness 
(system_diagnosis_rule
	"Hypoglycaemia likely"
		(probable
		(clinical_finding (snomed_concept “Hypoglycemia” (disorder))
		(adult
			(<measurement (clinical_finding (snomed_concept “Finding of blood glucose level” (finding) “Millimole/liter” (qualifier value) 3))
			(measurement (clinical_finding (snomed_concept “Finding of blood glucose level” (finding) “Millimole/liter” (qualifier value) “Unrecordable” (qualifier value))
			(clinical_finding (snomed_concept “Current drinker of alcohol” (finding) “Known” (qualifier value))
			(clinical_finding (snomed_concept “Decreased level of consciousness” (finding))
		)
	)
;;Page 16 – Decreased Consciousness 
(system_diagnosis_rule
	"Hypoglycaemia likely"
		(urgent_referral
		(clinical_finding (snomed_concept “Hypoglycemia” (disorder))
		(clinical_finding (snomed_concept “Urgent referral” (procedure))
		(adult
			(<measurement (clinical_finding (snomed_concept “Systolic blood pressure” (observable entity) “Millimeter of mercury” (qualifier value) 90))
			(<measurement (clinical_finding (snomed_concept “Diastolic blood pressure” (observable entity) “Millimeter of mercury” (qualifier value) 60))
			(>measurement (clinical_finding (snomed_concept “Heart rate” (observable entity) “Beats/minute” (qualifier value) 100))
			(<measurement (clinical_finding (snomed_concept “Heart rate” (observable entity) “Beats/minute” (qualifier value) 50))
			(>measurement (clinical_finding (snomed_concept “Respiratory rate” (observable entity) “Breaths/minute” (qualifier value) 20))
			(<measurement (clinical_finding (snomed_concept “Respiratory rate” (observable entity) “Breaths/minute” (qualifier value) 9))
			(<measurement (clinical_finding (snomed_concept “Hemoglobin saturation with oxygen” (observable entity) “Percent” (property) (qualifier value) 94))
			(clinical_finding (snomed_concept “Glasgow coma scale finding” (finding) “Decrease” (qualifier value))
		)
	)
)
;;Page 16 – Decreased Consciousness 
(system_diagnosis_rule
	"Hyperglycaemia likely"
		(probable
		(clinical_finding (snomed_concept “Hyperglycemia” (disorder))
		(adult
			(>=measurement (clinical_finding (snomed_concept “Finding of blood glucose level” (finding) “Millimole/liter” (qualifier value) 11.1))
			(clinical_finding (snomed_concept “Diabetes mellitus” (disorder) “Known” (qualifier value))
			(clinical_finding (snomed_concept “Decreased level of consciousness” (finding))
		)
	)
;;Page 16 – Decreased Consciousness 
(system_diagnosis_rule
	"Hyperglycaemia likely"
		(urgent_referral
		(clinical_finding (snomed_concept “Hyperglycemia” (disorder))
		(clinical_finding (snomed_concept “Urgent referral” (procedure))
		(adult
			(<measurement (clinical_finding (snomed_concept “Systolic blood pressure” (observable entity) “Millimeter of mercury” (qualifier value) 90))
			(<measurement (clinical_finding (snomed_concept “Diastolic blood pressure” (observable entity) “Millimeter of mercury” (qualifier value) 60))
			(>measurement (clinical_finding (snomed_concept “Heart rate” (observable entity) “Beats/minute” (qualifier value) 100))
			(<measurement (clinical_finding (snomed_concept “Heart rate” (observable entity) “Beats/minute” (qualifier value) 50))
			(>measurement (clinical_finding (snomed_concept “Respiratory rate” (observable entity) “Breaths/minute” (qualifier value) 20))
			(<measurement (clinical_finding (snomed_concept “Respiratory rate” (observable entity) “Breaths/minute” (qualifier value) 9))
			(<measurement (clinical_finding (snomed_concept “Hemoglobin saturation with oxygen” (observable entity) “Percent” (property) (qualifier value) 94))
			(clinical_finding (snomed_concept “Glasgow coma scale finding” (finding) “Decrease” (qualifier value))
		)
	)
)
;;Page 16 – Decreased Consciousness 
(system_diagnosis_rule
	"Hypothermia likely"
		(probable
		(clinical_finding (snomed_concept “Hypothermia” (finding))
		(adult  
			(clinical_finding (snomed_concept “Decreased level of consciousness” (finding))
			(<=measurement (clinical_finding (snomed_concept “Body temperature” (observable entity) “Degrees Celsius” (qualifier value) 35))
		)
	)
;;Page 16 – Decreased Consciousness 
(system_diagnosis_rule
	"Hypothermia likely "
		(urgent_referral
		(clinical_finding (snomed_concept “Hypothermia” (finding))
		(clinical_finding (snomed_concept “Urgent referral” (procedure))
		(adult 
			(<measurement (clinical_finding (snomed_concept “Systolic blood pressure” (observable entity) “Millimeter of mercury” (qualifier value) 90))
			(<measurement (clinical_finding (snomed_concept “Diastolic blood pressure” (observable entity) “Millimeter of mercury” (qualifier value) 60))
			(>measurement (clinical_finding (snomed_concept “Heart rate” (observable entity) “Beats/minute” (qualifier value) 100))
			(<measurement (clinical_finding (snomed_concept “Heart rate” (observable entity) “Beats/minute” (qualifier value) 50))
			(>measurement (clinical_finding (snomed_concept “Respiratory rate” (observable entity) “Breaths/minute” (qualifier value) 20))
			(<measurement (clinical_finding (snomed_concept “Respiratory rate” (observable entity) “Breaths/minute” (qualifier value) 9))
			(<measurement (clinical_finding (snomed_concept “Hemoglobin saturation with oxygen” (observable entity) “Percent” (property) (qualifier value) 94))
			(clinical_finding (snomed_concept “Glasgow coma scale finding” (finding) “Decrease” (qualifier value))
		)
	)
)
;;Page 16 – Decreased Consciousness 
(system_diagnosis_rule
	"Meningitis likely"
		(probable
		(clinical_finding (snomed_concept “Meningitis” (disorder))
		(adult 
			(clinical_finding (snomed_concept “Decreased level of consciousness” (finding))
			(>=measurement (clinical_finding (snomed_concept “Body temperature” (observable entity) “Degrees Celsius” (qualifier value) 38))
		)
	)
;;Page 16 – Decreased Consciousness 
(system_diagnosis_rule
	"Meningitis likely"
		(urgent_referral
		(clinical_finding (snomed_concept “Meningitis” (disorder))
		(clinical_finding (snomed_concept “Urgent referral” (procedure))
		(adult
			(<measurement (clinical_finding (snomed_concept “Systolic blood pressure” (observable entity) “Millimeter of mercury” (qualifier value) 90))
			(<measurement (clinical_finding (snomed_concept “Diastolic blood pressure” (observable entity) “Millimeter of mercury” (qualifier value) 60))
			(>measurement (clinical_finding (snomed_concept “Heart rate” (observable entity) “Beats/minute” (qualifier value) 100))
			(<measurement (clinical_finding (snomed_concept “Heart rate” (observable entity) “Beats/minute” (qualifier value) 50))
			(>measurement (clinical_finding (snomed_concept “Respiratory rate” (observable entity) “Breaths/minute” (qualifier value) 20))
			(<measurement (clinical_finding (snomed_concept “Respiratory rate” (observable entity) “Breaths/minute” (qualifier value) 9))
			(<measurement (clinical_finding (snomed_concept “Hemoglobin saturation with oxygen” (observable entity) “Percent” (property) (qualifier value) 94))
			(clinical_finding (snomed_concept “Glasgow coma scale finding” (finding) “Decrease” (qualifier value))
		)
	)
)
;;Page 16 – Decreased Consciousness 
(system_diagnosis_rule
	"Malaria likely "
		(probable
		(clinical_finding (snomed_concept “Malaria” (disorder))
		(adult
			(clinical_finding (snomed_concept “Decreased level of consciousness” (finding))
			(>=measurement (clinical_finding (snomed_concept “Body temperature” (observable entity) “Degrees Celsius” (qualifier value) 38))
			(clinical_finding (snomed_concept “History of travel with high risk of exposure to communicable disease” (situation) “Malaria” (disorder))
			(clinical_finding (snomed_concept “Malaria antigen test” (procedure) “Positive” (qualifier value))
		)
	)
;;Page 16 – Decreased Consciousness 
(system_diagnosis_rule
	"Malaria likely"
		(notify
		(clinical_finding (snomed_concept “Malaria” (disorder))
		(clinical_finding (snomed_concept “Notification of malaria” (procedure))
		(adult
			(clinical_finding (snomed_concept “Decreased level of consciousness” (finding))
			(>=measurement (clinical_finding (snomed_concept “Body temperature” (observable entity) “Degrees Celsius” (qualifier value) 38))
			(clinical_finding (snomed_concept “History of travel with high risk of exposure to communicable disease” (situation) “Malaria” (disorder))
			(clinical_finding (snomed_concept “Malaria antigen test” (procedure) “Positive” (qualifier value))
		)
	)
;;Page 16 – Decreased Consciousness 
(system_diagnosis_rule
	"Malaria likely"
		(urgent_referral
		(clinical_finding (snomed_concept “Malaria” (disorder))
		(clinical_finding (snomed_concept “Urgent referral” (procedure) “In” (attribute) “6 hours” (qualifier value))
		(adult
			(<measurement (clinical_finding (snomed_concept “Systolic blood pressure” (observable entity) “Millimeter of mercury” (qualifier value) 90))
			(<measurement (clinical_finding (snomed_concept “Diastolic blood pressure” (observable entity) “Millimeter of mercury” (qualifier value) 60))
			(>measurement (clinical_finding (snomed_concept “Heart rate” (observable entity) “Beats/minute” (qualifier value) 100))
			(<measurement (clinical_finding (snomed_concept “Heart rate” (observable entity) “Beats/minute” (qualifier value) 50))
			(>measurement (clinical_finding (snomed_concept “Respiratory rate” (observable entity) “Breaths/minute” (qualifier value) 20))
			(<measurement (clinical_finding (snomed_concept “Respiratory rate” (observable entity) “Breaths/minute” (qualifier value) 9))
			(<measurement (clinical_finding (snomed_concept “Hemoglobin saturation with oxygen” (observable entity) “Percent” (property) (qualifier value) 94))
			(clinical_finding (snomed_concept “Glasgow coma scale finding” (finding) “Decrease” (qualifier value))
		)
	)
)
;;Page 16 – Decreased Consciousness 
(system_diagnosis_rule
	"Opioid overdose likely"
		(probable
		(clinical_finding (snomed_concept “Overdose of opiate” (disorder))
		(adult
			(clinical_finding (snomed_concept “Decreased level of consciousness” (finding))
			(clinical_finding (snomed_concept “Pin point pupils” (finding)
“Misuses drugs” (finding))
			(<measurement (clinical_finding (snomed_concept “Respiratory rate” (observable entity) “Breaths/minute” (qualifier value) 12))
		)
	)
;;Page 16 – Decreased Consciousness 
(system_diagnosis_rule
	"Opioid overdose likely"
		(consultation 
		(clinical_finding (snomed_concept “Overdose of opiate” (disorder))
		(clinical_finding (snomed_concept “Consultation” (procedure) “Healthcare professional” (occupation))
		(clinical_finding (snomed_concept “Consultation” (procedure) “Consultancy/advice chemist” (occupation))
		(adult
			(clinical_finding (snomed_concept “Absent response to treatment” (situation))
			(clinical_finding (snomed_concept “Overdose” (disorder) “Substance type unknown” (finding))
			(clinical_finding (snomed_concept “Poisoning” (disorder) “Substance type unknown” (finding))
			(clinical_finding (snomed_concept “Overdose” (disorder) “Substance” (substance) “Unidentified” (qualifier value))
			(clinical_finding (snomed_concept “Poisoning” (disorder) “Substance” (substance) “Unidentified” (qualifier value))
		)
	)
;;Page 16 – Decreased Consciousness 
(system_diagnosis_rule
	"Opioid overdose likely"
		(urgent_referral
		(clinical_finding (snomed_concept “Overdose of opiate” (disorder))
		(clinical_finding (snomed_concept “Urgent referral” (procedure))
		(adult
			(<measurement (clinical_finding (snomed_concept “Systolic blood pressure” (observable entity) “Millimeter of mercury” (qualifier value) 90))
			(<measurement (clinical_finding (snomed_concept “Diastolic blood pressure” (observable entity) “Millimeter of mercury” (qualifier value) 60))
			(>measurement (clinical_finding (snomed_concept “Heart rate” (observable entity) “Beats/minute” (qualifier value) 100))
			(<measurement (clinical_finding (snomed_concept “Heart rate” (observable entity) “Beats/minute” (qualifier value) 50))
			(>measurement (clinical_finding (snomed_concept “Respiratory rate” (observable entity) “Breaths/minute” (qualifier value) 20))
			(<measurement (clinical_finding (snomed_concept “Respiratory rate” (observable entity) “Breaths/minute” (qualifier value) 9))
			(<measurement (clinical_finding (snomed_concept “Hemoglobin saturation with oxygen” (observable entity) “Percent” (property) (qualifier value) 94))
			(clinical_finding (snomed_concept “Glasgow coma scale finding” (finding) “Decrease” (qualifier value))
		)
	)
)
;;Page 16 – Decreased Consciousness 
(system_diagnosis_rule
	"Organophosphate poisoning likely"
		(probable
		(clinical_finding (snomed_concept “Organophosphate poisoning” (disorder))
		(adult
			(clinical_finding (snomed_concept “Decreased level of consciousness” (finding))
			(clinical_finding (snomed_concept “Pin point pupils” (finding))
			(clinical_finding (snomed_concept “Body secretion” (substance) “Excessive” (qualifier value))
			(clinical_finding (snomed_concept “Muscle twitch” (finding))
			(clinical_finding (snomed_concept “Low blood pressure” (disorder) “Continual” (qualifier value))
			(clinical_finding (snomed_concept “Bradycardia” (finding))
		)
	)
;;Page 16 – Decreased Consciousness 
(system_diagnosis_rule
	"Organophosphate poisoning likely"
		(consultation 
		(clinical_finding (snomed_concept “Organophosphate poisoning” (disorder))
		(clinical_finding (snomed_concept “Consultation” (procedure) “Healthcare professional” (occupation))
		(clinical_finding (snomed_concept “Consultation” (procedure) “Consultancy/advice chemist” (occupation))
		(adult
			(clinical_finding (snomed_concept “Absent response to treatment” (situation))
			(clinical_finding (snomed_concept “Overdose” (disorder) “Substance type unknown” (finding))
			(clinical_finding (snomed_concept “Poisoning” (disorder) “Substance type unknown” (finding))
			(clinical_finding (snomed_concept “Overdose” (disorder) “Substance” (substance) “Unidentified” (qualifier value))
			(clinical_finding (snomed_concept “Poisoning” (disorder) “Substance” (substance) “Unidentified” (qualifier value))
		)
	)
;;Page 16 – Decreased Consciousness 
(system_diagnosis_rule
	"Organophosphate poisoning likely"
		(urgent_referral
		(clinical_finding (snomed_concept “Organophosphate poisoning” (disorder))
		(clinical_finding (snomed_concept “Urgent referral” (procedure))
		(adult
			(<measurement (clinical_finding (snomed_concept “Systolic blood pressure” (observable entity) “Millimeter of mercury” (qualifier value) 90))
			(<measurement (clinical_finding (snomed_concept “Diastolic blood pressure” (observable entity) “Millimeter of mercury” (qualifier value) 60))
			(>measurement (clinical_finding (snomed_concept “Heart rate” (observable entity) “Beats/minute” (qualifier value) 100))
			(<measurement (clinical_finding (snomed_concept “Heart rate” (observable entity) “Beats/minute” (qualifier value) 50))
			(>measurement (clinical_finding (snomed_concept “Respiratory rate” (observable entity) “Breaths/minute” (qualifier value) 20))
			(<measurement (clinical_finding (snomed_concept “Respiratory rate” (observable entity) “Breaths/minute” (qualifier value) 9))
			(<measurement (clinical_finding (snomed_concept “Hemoglobin saturation with oxygen” (observable entity) “Percent” (property) (qualifier value) 94))
			(clinical_finding (snomed_concept “Glasgow coma scale finding” (finding) “Decrease” (qualifier value))
		)
	)
)
;;Page 16 – Decreased Consciousness 
(system_diagnosis_rule
	"Stimulant or other drug overdose likely"
		(probable
		(clinical_finding (snomed_concept “Psychostimulant overdose” (disorder))
		(clinical_finding (snomed_concept “Overdose” (disorder) “Drug or medicament” (substance) “Unidentified” (qualifier value))
		(adult
			(clinical_finding (snomed_concept “Decreased level of consciousness” (finding))
			(clinical_finding (snomed_concept “Dilated pupil” (finding) “Equal” (qualifier value) “Right and left” (qualifier value))
		)
	)
;;Page 16 – Decreased Consciousness 
(system_diagnosis_rule
	"Stimulant or other drug overdose likely"
		(consultation
		(clinical_finding (snomed_concept “Psychostimulant overdose” (disorder))
		(clinical_finding (snomed_concept “Overdose” (disorder) “Drug or medicament” (substance) “Unidentified” (qualifier value))
		(clinical_finding (snomed_concept “Consultation” (procedure) “Healthcare professional” (occupation))
		(clinical_finding (snomed_concept “Consultation” (procedure) “Consultancy/advice chemist” (occupation))
		(adult
			(clinical_finding (snomed_concept “Absent response to treatment” (situation))
			(clinical_finding (snomed_concept “Overdose” (disorder) “Substance type unknown” (finding))
			(clinical_finding (snomed_concept “Poisoning” (disorder) “Substance type unknown” (finding))
			(clinical_finding (snomed_concept “Overdose” (disorder) “Substance” (substance) “Unidentified” (qualifier value))
			(clinical_finding (snomed_concept “Poisoning” (disorder) “Substance” (substance) “Unidentified” (qualifier value))
		)
	)
;;Page 16 – Decreased Consciousness 
(system_diagnosis_rule
	"Stimulant or other drug overdose likely"
		(urgent_referral
		(clinical_finding (snomed_concept “Psychostimulant overdose” (disorder))
		(clinical_finding (snomed_concept “Overdose” (disorder) “Drug or medicament” (substance) “Unidentified” (qualifier value))
		(clinical_finding (snomed_concept “Urgent referral” (procedure))
		(adult
			(<measurement (clinical_finding (snomed_concept “Systolic blood pressure” (observable entity) “Millimeter of mercury” (qualifier value) 90))
			(<measurement (clinical_finding (snomed_concept “Diastolic blood pressure” (observable entity) “Millimeter of mercury” (qualifier value) 60))
			(>measurement (clinical_finding (snomed_concept “Heart rate” (observable entity) “Beats/minute” (qualifier value) 100))
			(<measurement (clinical_finding (snomed_concept “Heart rate” (observable entity) “Beats/minute” (qualifier value) 50))
			(>measurement (clinical_finding (snomed_concept “Respiratory rate” (observable entity) “Breaths/minute” (qualifier value) 20))
			(<measurement (clinical_finding (snomed_concept “Respiratory rate” (observable entity) “Breaths/minute” (qualifier value) 9))
			(<measurement (clinical_finding (snomed_concept “Hemoglobin saturation with oxygen” (observable entity) “Percent” (property) (qualifier value) 94))
			(clinical_finding (snomed_concept “Glasgow coma scale finding” (finding) “Decrease” (qualifier value))
		)
	)
)
;;Page 16 – Decreased Consciousness 
(system_diagnosis_rule
	"Head injury likely "
		(probable
		(clinical_finding (snomed_concept “Injury of head” (disorder))
		(adult
			(clinical_finding (snomed_concept “Decreased level of consciousness” (finding))
			(clinical_finding (snomed_concept “Unequal reaction of bilateral pupils” (finding))
			(clinical_finding (snomed_concept “Sluggish pupil movement” (finding))
		)
	)
;;Page 16 – Decreased Consciousness 
(system_diagnosis_rule
	"Head injury likely"
		(urgent_referral
		(clinical_finding (snomed_concept “Injury of head” (disorder))
		(clinical_finding (snomed_concept “Urgent referral” (procedure))
		(adult
			(<measurement (clinical_finding (snomed_concept “Systolic blood pressure” (observable entity) “Millimeter of mercury” (qualifier value) 90))
			(<measurement (clinical_finding (snomed_concept “Diastolic blood pressure” (observable entity) “Millimeter of mercury” (qualifier value) 60))
			(>measurement (clinical_finding (snomed_concept “Heart rate” (observable entity) “Beats/minute” (qualifier value) 100))
			(<measurement (clinical_finding (snomed_concept “Heart rate” (observable entity) “Beats/minute” (qualifier value) 50))
			(>measurement (clinical_finding (snomed_concept “Respiratory rate” (observable entity) “Breaths/minute” (qualifier value) 20))
			(<measurement (clinical_finding (snomed_concept “Respiratory rate” (observable entity) “Breaths/minute” (qualifier value) 9))
			(<measurement (clinical_finding (snomed_concept “Hemoglobin saturation with oxygen” (observable entity) “Percent” (property) (qualifier value) 94))
			(clinical_finding (snomed_concept “Glasgow coma scale finding” (finding) “Decrease” (qualifier value))
		)
	)
)
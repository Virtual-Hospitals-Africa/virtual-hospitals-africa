Page 43 Breast Symptoms
(system_diagnosis_rule
	"Breast lump  likely"
	(adult
	(referral
	(snomed_concept “Breast lump” (finding))
	(snomed_concept “Both breasts” (body structure))
	(snomed_concept “Patient referral” (procedure) “In” (attribute) day) 7))
	)
	(and
		(>(clinical_finding (snomed_concept “Current chronological age” (observable entity) year) 25))
		(clinical_finding (snomed_concept “Family history of malignant neoplasm of breast” (situation))
		(clinical_finding (snomed_concept “Lump of breast fixed to skin” (finding) “Irregular” (qualifier value))
		(clinical_finding (snomed_concept “Fixed deep lump of breast” (finding) “Irregular” (qualifier value)
		(clinical_finding (snomed_concept “Breast symptom of change in skin” (finding))
		(clinical_finding (snomed_concept “Breast symptom of change in nipple” (finding))
		(clinical_finding (snomed_concept “Discharge from nipple” (disorder))
		(clinical_finding (snomed_concept “Axillary lymphadenopathy” (disorder))
		)
Page 43 Breast Symptoms
(system_diagnosis_rule
	"Breast lump  likely"
	(adult
	(referral
	(snomed_concept “Breast lump” (finding))
	(snomed_concept “Left breast structure” (body structure))
	(snomed_concept “Right breast structure” (body structure))
	(snomed_concept “Patient referral” (procedure) “In” (attribute) day) 21))
	(snomed_concept “Breast clinic” (environment))
	)
	(and
		(clinical_finding (snomed_concept “Breast lump” (finding) “Continual” (qualifier value))
		)
	)
Page 43 Breast Symptoms
(system_diagnosis_rule
	"Fibrocystic change likely"
	(adult
	(snomed_concept “Fibrocystic breast changes” (finding))
	)
	probable
	(and
		(clinical_finding (snomed_concept “Breast lump” (finding))
		(clinical_finding (snomed_concept “Pain of breast” (finding) “Before” (attribute) “Menstruation, function” (observable entity))
		(clinical_finding (snomed_concept “Pain of breast” (finding) “Improving” (qualifier value) “With” (attribute) “Menstruation, function” (observable entity))
		(clinical_finding (snomed_concept “Uses hormone method of contraception” (finding))
		)
Page 43 Breast Symptoms
(system_diagnosis_rule
	"Fibrocystic change likely"
	(adult
	(return 
	(snomed_concept “Fibrocystic breast changes” (finding))
	(snomed_concept “Recommendation to return” (procedure))
	(snomed_concept “Referral to breast clinic” (procedure) “In” (attribute) day) 60))
	)
	(and
		(clinical_finding (snomed_concept “Breast signs and symptoms” (finding) “Change patterns” (qualifier value))
		(clinical_finding (snomed_concept “Breast signs and symptoms” (finding) “Worse” (qualifier value))
		)
	)
Page 43 Breast Symptoms
(system_diagnosis_rule
	"Nipple discharge likely"
	(adult
	(snomed_concept “Discharge from nipple” (disorder))
	)
	probable
	(and
		(clinical_finding (snomed_concept “Pregnancy” (finding))
		)
Page 43 Breast Symptoms
(system_diagnosis_rule
	"Nipple discharge likely"
	(adult
	(consult
	(snomed_concept “Discharge from nipple” (disorder))
	(snomed_concept “Consultation” (procedure))
	)
	(and
		(clinical_finding (snomed_concept “Review of medication” (procedure))
			(snomed_concept “Anti-psychotic agent” (substance))
			(snomed_concept “Antidepressant” (substance))
			(snomed_concept “Uses oral contraception” (finding))
			(snomed_concept “Metoclopramide” (substance))
		)
Page 43 Breast Symptoms
(system_diagnosis_rule
	"Nipple discharge likely"
	(adult
	(referral 
	(snomed_concept “Discharge from nipple” (disorder))
	(snomed_concept “Patient referral” (procedure))
	(snomed_concept “Referral to breast clinic” (procedure) “In” (attribute) day) 7))
	)
	(and
		(clinical_finding (snomed_concept “Bloody nipple discharge” (disorder))
		(clinical_finding (snomed_concept “Discharge from nipple” (disorder) “Unilateral” (qualifier value))
		(>=(clinical_finding (snomed_concept “Current chronological age” (observable entity) year) 50))
		(clinical_finding (snomed_concept “Male” (finding))
		(clinical_finding (snomed_concept “Breast symptom of change in skin” (finding))
		(clinical_finding (snomed_concept “Breast symptom of change in nipple” (finding))
		(clinical_finding (snomed_concept “Breast lump” (finding))
		(clinical_finding (snomed_concept “Mass of axilla” (finding))
		)
	)
Page 43 Breast Symptoms
(system_diagnosis_rule
	"Breast enlargement likely"
	(adult
	(snomed_concept “Large breast” (finding))
	)
	probable
	(and
		(clinical_finding (snomed_concept “Obesity” (disorder))
		(clinical_finding (snomed_concept “Body mass index 25-29 - overweight” (finding))
		(clinical_finding (snomed_concept “Body mass index 30+ - obesity” (finding))
		(clinical_finding (snomed_concept “Body mass index 40+ - severely obese” (finding))
		)
 Page 43 Breast Symptoms
(system_diagnosis_rule
	"Breast enlargement likely"
	(adult
	(consult
	(snomed_concept “Large breast” (finding))
	(snomed_concept “Consultation” (procedure))
	)
	(and
		(clinical_finding (snomed_concept “Review of medication” (procedure)
			(snomed_concept “Anti-psychotic agent” (substance))
			(snomed_concept “Antidepressant” (substance))
			(snomed_concept “Efavirenz” (substance))
			(snomed_concept “Nifedipine” (substance))
			(snomed_concept “Amlodipine” (substance))
		)
 Page 43 Breast Symptoms
(system_diagnosis_rule
	"Breast enlargement likely"
	(adult
	(referral 
	(snomed_concept “Large breast” (finding))
	(snomed_concept “Patient referral” (procedure))
	(snomed_concept “Referral to breast clinic” (procedure))
	)
	(and
		(clinical_finding (snomed_concept “Large breast” (finding) “Unilateral” (qualifier value))
		)
	)
 Page 43 Breast Symptoms
(system_diagnosis_rule
	"Mastitis likely "
	(adult
	(snomed_concept “Inflammatory disorder of breast” (disorder))
	)
	probable
	(and
		(clinical_finding (snomed_concept “Maternal breastfeeding” (finding))
		(clinical_finding (snomed_concept “Pain of breast” (finding))
		(clinical_finding (snomed_concept “No breast lump” (situation))
		(>=measurement (snomed_concept “Body temperature” (observable entity) °C) 38))
		(clinical_finding (snomed_concept “Generalized acute body pains” (finding))
		)
Page 43 Breast Symptoms
(system_diagnosis_rule
	"Mastitis likely "
	(adult
	(referral 
	(snomed_concept “Inflammatory disorder of breast” (disorder))
	(snomed_concept “Patient referral” (procedure))
	)
	(and
		(clinical_finding (snomed_concept “Patient condition unchanged” (finding) day) 2))
		(clinical_finding (snomed_concept “Breast lump” (finding))
		(clinical_finding (snomed_concept “Abscess of breast” (disorder))
		)
	)
Page 43 Breast Symptoms
(system_diagnosis_rule
	"Engorgement likely"
	(adult
	(snomed_concept “Engorgement of breasts” (finding))
	)
	probable
	(and
		(clinical_finding (snomed_concept “Maternal breastfeeding” (finding))
		(clinical_finding (snomed_concept “Pain of breast” (finding))
		(clinical_finding (snomed_concept “No breast lump” (situation))
		(clinical_finding (snomed_concept “Apyrexial” (situation))
		(clinical_finding (snomed_concept “No pain” (situation))
		)
Page 43 Breast Symptoms
(system_diagnosis_rule
	"Engorgement likely"
	(adult
	(return 
	(snomed_concept “Engorgement of breasts” (finding))
	(snomed_concept “Recommendation to return” (procedure))
	)
	(and
		(clinical_finding (snomed_concept “Fever” (finding))
		(clinical_finding (snomed_concept “Generalized acute body pains” (finding))
		(clinical_finding (snomed_concept “Breast lump” (finding) “Continual” (qualifier value))
		)
	)
Page 43 Breast Symptoms
(system_diagnosis_rule
	"Blocked duct likely"
	(adult
	(snomed_concept “Obstruction of lactiferous duct” (disorder))
	)
	probable
	(and
		(clinical_finding (snomed_concept “Pain of breast” (finding))
		(clinical_finding (snomed_concept “Breast lump” (finding)) 
		(clinical_finding (snomed_concept “Apyrexial” (situation))
		(clinical_finding (snomed_concept “No pain” (situation))
		)
Page 43 Breast Symptoms
(system_diagnosis_rule
	"Blocked duct likely"
	(adult
	(return 
	(snomed_concept “Obstruction of lactiferous duct” (disorder))
	(snomed_concept “Recommendation to return” (procedure))
	)
	(and
		(clinical_finding (snomed_concept “Fever” (finding))
		(clinical_finding (snomed_concept “Generalized acute body pains” (finding))
		(clinical_finding (snomed_concept “Breast lump” (finding) “Continual” (qualifier value))
		)
	)
Page 43 Breast Symptoms
(system_diagnosis_rule
	"Breast abscess likely"
	(adult
	(urgent_referral
	(snomed_concept “Abscess of breast” (disorder))
	(snomed_concept “Urgent referral” (procedure) “In” attribute) hour) 24))
	)
	(and
		(clinical_finding (snomed_concept “Pain of breast” (finding))
		(clinical_finding (snomed_concept “Breast lump” (finding)) 
		(>=measurement (snomed_concept “Body temperature” (observable entity) °C) 38))
		(clinical_finding (snomed_concept “Generalized acute body pains” (finding))
		)
	)
)

;; Page 46 - Diarrhoea
(task
  "Check for urgent diarrhoea conditions"
  adult
  (clinical_finding (snomed_concept "Diarrhea" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Thirst due to water deprivation" "finding"))
    (clinical_finding (snomed_concept “Xerostomia” (finding))
    (clinical_finding (snomed_concept "Decreased skin turgor" "finding"))
    (clinical_finding (snomed_concept "Sunken eyes" "finding"))
    (clinical_finding (snomed_concept "Drowsy" "finding"))
    (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
    (clinical_finding (snomed_concept "Diarrhea" "finding") (qualifier (snomed_concept "Watery" "qualifier value")))
    (clinical_finding (snomed_concept “Vomiting (disorder) “With” (attribute) or  “Without” (attribute))  
    (<= (timestamp (clinical_finding (snomed_concept "History of travel with high risk of exposure to communicable disease" "situation")“Cholera” (disorder)))
        (time_ago 5 days))
		)
	)
)
;; Page 46 - Diarrhoea: dehydration likely with diarrhoea and systemic signs
(system_diagnosis_rule
  "Diagnose probable dehydration"
  (diagnosis
    (snomed_concept "Dehydration" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Diarrhea" "finding"))
    (or
      (clinical_finding (snomed_concept “Thirst due to water deprivation” (finding))
			(clinical_finding (snomed_concept "Xerostomia" "finding"))
      (clinical_finding (snomed_concept "Decreased skin turgor" "finding"))
      (clinical_finding (snomed_concept "Sunken eyes" "finding"))
      (clinical_finding (snomed_concept "Drowsy" "finding"))
      (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
			(<measurement (snomed_concept “Diastolic blood pressure” (observable entity) mmHg) 60))
      (>= (measurement (snomed_concept "Heart rate" "observable entity") bpm) 100)
  )
)
;; Page 46 - Diarrhoea: cholera likely with watery diarrhoea and cholera exposure
(system_diagnosis_rule
  "Diagnose probable cholera"
  (diagnosis
    (snomed_concept "Cholera" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Diarrhea" "finding") (qualifier (snomed_concept "Watery" "qualifier value")))
		(clinical_finding (snomed_concept “Liquid stool” (finding))
		(clinical_finding (snomed_concept “Vomiting” (disorder))
		(clinical_finding (snomed_concept “No vomiting” (situation))
		(clinical_finding (snomed_concept “History of travel with high risk of exposure to communicable disease” (situation) “Cholera” (disorder) “In the past” (qualifier value) day) 5))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Vibrio cholerae" "organism"))
  )
)
;; Page 46 - Diarrhoea: Dysentery likely
(system_diagnosis_rule
  "Diagnose probable dysentery"
  (diagnosis
    (snomed_concept “Dysenteric diarrhea” (disorder))
    probable
  )
  adult
  (and
		(>(clinical_finding (snomed_concept “ Diarrhea” (finding) week) 2))
		(clinical_finding (snomed_concept “Hematochezia” (finding))
	)
)
;; Page 46 - Diarrhoea: Gastroenteritis likely
(system_diagnosis_rule
  "Diagnose probable gastroenteritis"
  (diagnosis
    (snomed_concept “Inflammation of stomach and intestine” (disorder))
    probable
  )
  adult
  (and
		(< (clinical_finding (snomed_concept “Diarrhea” (finding) week) 2))
		(clinical_finding (snomed_concept “Vomiting” (disorder))
		(clinical_finding (snomed_concept “Stomach cramps” (finding))
		(clinical_finding (snomed_concept “Fever” (finding))
		(clinical_finding (snomed_concept “Hematochezia” (finding) “Absent” (qualifier value))
	)
)
;; Page 46 - Diarrhoea: HIV associated diarrhea likely
(system_diagnosis_rule
  "Diagnose probable cholera"
  (diagnosis
    (snomed_concept “Human immunodeficiency virus enteropathy” (disorder))
    probable
  )
  adult
  (and
		(>(clinical_finding (snomed_concept “Diarrhea” (finding) week) 2))
		(clinical_finding (snomed_concept “Human immunodeficiency virus detected” (finding))
		(clinical_finding (snomed_concept “Taking medication” (observable entity) “Lopinavir” (substance))
	)
;; Page 46 - Diarrhoea: HIV associated diarrhea likely
(system_diagnosis_rule
  "Diagnose probable cholera"
  (diagnosis
	(referral 
    (snomed_concept “Human immunodeficiency virus enteropathy” (disorder))
		(snomed_concept “Patient referral” (procedure))
  adult
  (and
		(clinical_finding (snomed_concept “Hematochezia” (finding))
		(clinical_finding (snomed_concept “Mucus in stool” (finding))
		(clinical_finding (snomed_concept “Chronic diarrhea” (disorder))
		)
		(clinical_finding (snomed_concept “Patient referral to specialist” (procedure))
		(clinical_finding (snomed_concept “Diarrhea” (finding) “Continual’ (qualifier value) “After” (attribute) “Treatment given” (situation)
	)
)
;; Page 46 - Diarrhoea: Giardiasis likely
(system_diagnosis_rule
  "Diagnose probable cholera"
  (diagnosis
    (snomed_concept “Giardiasis” (disorder))
    probable
  )
  adult
  (and
		(> (clinical_finding (snomed_concept “Diarrhea” (finding) week) 2))
		(clinical_finding (snomed_concept “Human immunodeficiency virus not detected” (finding))
		(clinical_finding (snomed_concept “Human immunodeficiency virus status” (observable entity) “Unknown” (qualifier value))
	)
;; Page 46 - Diarrhoea: Giardiasis likely
(system_diagnosis_rule
  "Diagnose probable cholera"
  (diagnosis
	(referral 
    (snomed_concept “Giardiasis” (disorder))
		(snomed_concept “Patient referral” (procedure))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Hematochezia” (finding))
		(clinical_finding (snomed_concept “Mucus in stool” (finding))
		(clinical_finding (snomed_concept “Chronic diarrhea” (disorder))
		(clinical_finding (snomed_concept “Patient referral to specialist” (procedure))
		(clinical_finding (snomed_concept “Diarrhea” (finding) “Continual” (qualifier value) “After” (attribute) “Treatment given” (situation))
		)
	)
)
;; Page 46 - Diarrhoea
(system_priority_evaluation
  "Urgent diarrhoea conditions"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Diarrhea" "finding"))
    (or
      (clinical_finding (snomed_concept “Dehydration” (disorder))
			(clinical_finding (snomed_concept “Thirst due to water deprivation” (finding))
			(clinical_finding (snomed_concept “Xerostomia” (finding))
			(clinical_finding (snomed_concept “Decreased skin turgor” (finding))
			(clinical_finding (snomed_concept “Sunken eyes” (finding))
			(clinical_finding (snomed_concept "Drowsy" "finding"))
      (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
      (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
      (>= (measurement (snomed_concept "Heart rate" "observable entity") bpm) 100)
			)
			(clinical_finding (snomed_concept “Cholera” (disorder))
			(clinical_finding ( snomed_concept “Diarrhea” (finding) “Watery” (finding) 
			(clinical_finding (snomed_concept “Vomiting (disorder) “With” (attribute) or  “Without” (attribute)  
			(clinical_finding (snomed_concept “History of travel with high risk of exposure to communicable disease” (situation) “Cholera” (disorder) “In the past” (qualifier value) day (qualifier value) 5))
		)
	)
)
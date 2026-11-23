;; Page 40 - Covid 19 Diagnosis
(task
  "Check for presence of Covid-19"
  adult
  (clinical_finding (snomed_concept "Disease caused by severe acute respiratory coronavirus 2 suspected" "situation"))
  (check_for
    (clinical_finding (snomed_concept "Dyspnea at rest" "finding"))
		(clinical_finding (snomed_concept “Dyspnea” (finding) Speaking (observable entity) Associated with (attribute)
    (clinical_finding (snomed_concept "Dyspnea" "finding") (qualifier (snomed_concept "Sudden" "qualifier value")))
    (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
    (clinical_finding (snomed_concept "Feeling agitated" "finding"))
    (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
		(clinical_finding (snomed_concept “Increased vocal resonance” (finding)
		(clinical_finding (snomed_concept “Decreased breath sounds” (finding)
		(clinical_finding (snomed_concept “Chest pain” (finding) Unilateral (qualifier value)
    (clinical_finding (snomed_concept "Trachea displaced" "disorder"))
    (clinical_finding (snomed_concept "Hemoptysis" "finding") (qualifier (snomed_concept "Fresh" "qualifier value"))
		)
  )
)
;; Page 40- Covid 19 Diagnosis
(system_priority_evaluation
	"Urgent Covid 19 symptoms"
	(urgent
	(snomed_concept “Disease caused by severe acute respiratory coronavirus 2 suspected” (situation))
	(adult
		(>=measurement (snomed_concept “Respiratory rate” (observable entity) bpm) 30))
		(<measurement (snomed_concept “Hemoglobin saturation with oxygen” (observable entity) “At rest” (qualifier value) %) 92))
		(<measurement (snomed_concept “Hemoglobin saturation with oxygen” (observable entity) “After exercise” (qualifier value) %) 87))
		(<measurement (snomed_concept “Hemoglobin saturation with oxygen” (observable entity) “After” (attribute) “Walking” (observable entity) m) 15-20) %) 87))
		(>measurement (snomed_concept “Heart rate” (observable entity) bpm) 120))
		(<measurement (snomed_concept “Systolic blood pressure” (observable entity) mmHg) 90))
		(< measurement (snomed_concept “Diastolic blood pressure” (observable entity) mmHg) 60))
		(clinical_finding (snomed_concept “Dyspnea at rest” (finding))
		(clinical_finding (snomed_concept “Dyspnea” (finding) “Speaking” (observable entity) “Associated with” (attribute))
		(clinical_finding (snomed_concept “Clouded consciousness” (finding))
		(clinical_finding (snomed_concept “Feeling agitated” (finding))
		(clinical_finding (snomed_concept “Decreased level of consciousness” (finding))
		(clinical_finding (snomed_concept “Dyspnea” (finding) “Sudden” (qualifier value))
		(clinical_finding (snomed_concept “Increased vocal resonance” (finding))
		(clinical_finding (snomed_concept “Decreased breath sounds” (finding))
		(clinical_finding (snomed_concept “Chest pain” (finding) “Unilateral” (qualifier value))
		(clinical_finding (snomed_concept “Trachea displaced” (disorder))
		(clinical_finding (snomed_concept “Hemoptysis” (finding) “Fresh” (qualifier value))
		)
	)
)
;; Page 40- Covid 19 Diagnosis
(system_diagnosis_rule
	"Tension pneumothorax likely"
	(adult
	(snomed_concept “Tension pneumothorax” (disorder))
	)
	probable
	(and 
		(clinical_finding (snomed_concept “Dyspnea” (finding) “Sudden” (qualifier value))
		(clinical_finding (snomed_concept “Increased vocal resonance” (finding))
		(clinical_finding (snomed_concept “Decreased breath sounds” (finding))
		(clinical_finding (snomed_concept “Chest pain” (finding) “Unilateral” (qualifier value))
		(clinical_finding (snomed_concept “Trachea displaced” (disorder))
		(<measurement (snomed_concept “Systolic blood pressure” (observable entity) mmHg) 90))
		(< measurement (snomed_concept “Diastolic blood pressure” (observable entity) mmHg) 60))
		)
	)
;; Page 40- Covid 19 Diagnosis
(system_diagnosis_rule
	"Covid 19 likely"
	(adult
	(snomed_concept “Disease caused by severe acute respiratory coronavirus 2 suspected” (situation))
	)
	probable
	(and 
		(clinical_finding (snomed_concept “Symptom started days ago” (finding) “New” (qualifier value) “In" (attribute) day) 14))
			(clinical_finding (snomed_concept “Fever” (finding))
			(clinical_finding (snomed_concept “Cough” (finding))
			(clinical_finding (snomed_concept “Dyspnea” (finding) “New” (qualifier value))
			(clinical_finding (snomed_concept “Dyspnea” (finding) “Worse” (qualifier value))
			(clinical_finding (snomed_concept “Sore throat” (finding))
			(clinical_finding (snomed_concept “Loss of sense of smell” (finding))
			(clinical_finding (snomed_concept “Taste sense altered” (finding))
			(clinical_finding (snomed_concept “Nasal congestion” (finding))
			(clinical_finding (snomed_concept “Nasal discharge” (finding))
			(clinical_finding (snomed_concept “Fatigue” (finding))
			(clinical_finding (snomed_concept “Chest pain” (finding))
			(clinical_finding (snomed_concept “Generalized aches and pains” (finding))
			(clinical_finding (snomed_concept “Headache” (finding))
			(clinical_finding (snomed_concept “Diarrhea” (finding))
		)
	)
)
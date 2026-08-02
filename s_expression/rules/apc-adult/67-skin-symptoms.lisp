;; Page 67 - Skin Symptoms
(task
  "Check for urgent skin symptom conditions"
  adult
  (clinical_finding (snomed_concept Skin finding” (finding))
  (check_for
    (clinical_finding (snomed_concept "Generalized pruritus" "finding"))
    (clinical_finding (snomed_concept "Generalized rash" "disorder"))
    (clinical_finding (snomed_concept "Facial swelling” (finding))
    (clinical_finding (snomed_concept "Tongue swelling” (finding))
    (clinical_finding (snomed_concept "Wheezing" "finding"))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    (clinical_finding (snomed_concept "Dizziness" "finding"))
    (clinical_finding (snomed_concept "Collapse" "finding"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Substance" "substance") “Possible” (qualifier value) “Allergen” (attribute)))
    (clinical_finding (snomed_concept "Purpuric rash" "disorder"))
		(clinical_finding (snomed_concept “Erythematous rash” (disorder))
    (clinical_finding (snomed_concept "Stiff neck" "finding"))
    (clinical_finding (snomed_concept "Drowsy" "finding"))
    (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
    (clinical_finding (snomed_concept "Headache" "finding"))
    (<= (timestamp (clinical_finding (snomed_concept "Generalized rash” (disorder) "Medication commenced” (situation)“In” (attribute))
        (time_ago 3 months))
    (clinical_finding (snomed_concept "Jaundice" "finding"))
    (clinical_finding (snomed_concept "Blister" "morphologic abnormality"))
    (clinical_finding (snomed_concept "Abdominal pain" "finding"))
    (clinical_finding (snomed_concept "Vomiting” (disorder))
    (clinical_finding (snomed_concept "Diarrhea" "finding"))
    (clinical_finding (snomed_concept “Eruption of skin” (disorder)) 
				(snomed_concept “Mouth region structure” (body structure) “Involved” (qualifier value))
				(snomed_concept “Structure of both eyes” (body structure) “Involved” (qualifier value))
				(snomed_concept “Genital structure” (body structure)  “Involved” (qualifier value))
    (clinical_finding (snomed_concept "Peeling of skin" "finding"))
		(clinical_finding (snomed_concept “Denuded skin” (disorder))
    (clinical_finding (snomed_concept "Blister of skin" "disorder"))
  )
)
;; Page 67 - Skin Symptoms
"Adverse drug reaction likely" 
(system_diagnosis_rule
  "Diagnose probable adverse drug reaction"
  (diagnosis
    (snomed_concept "Adverse reaction caused by drug" "disorder" “Serious” (qualifier value))
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept “Generalized rash” (disorder) “In” (attribute) month) 3 “Medication commenced” (situation))
		(clinical_finding (snomed_concept “Facial swelling” (finding))
		(clinical_finding (snomed_concept “Tongue swelling” (finding))
		(clinical_finding (snomed_concept “Difficulty breathing” (finding))
		(<measurement (snomed_concept “Systolic blood pressure” (observable entity) mmHg) 90))
		(<measurement (snomed_concept “Diastolic blood pressure” (observable entity) mmHg) 60))
		(>=measurement (snomed_concept “Body temperature” (observable entity) °C) 38))
		(clinical_finding (snomed_concept “Vomiting” (disorder))
		(clinical_finding (snomed_concept “Diarrhea” (finding))
		(clinical_finding (snomed_concept “Eruption of skin” (disorder)) 			
				(clinical_finding (snomed_concept “Mouth region structure” (body structure) “Involved” (qualifier value))
				(clinical_finding (snomed_concept “Structure of both eyes” (body structure) “Involved” (qualifier value))
				(clinical_finding (snomed_concept “Genital structure” (body structure)  “Involved” (qualifier value))
		(clinical_finding (snomed_concept “Blister” (morphologic abnormality))
		(clinical_finding (snomed_concept “Peeling of skin” (finding))
		(clinical_finding (snomed_concept “Denuded skin” (disorder))
    (active_condition (snomed_concept "Fever" "finding"))
    (clinical_finding (snomed_concept "Abdominal pain" "finding"))
    (clinical_finding (snomed_concept "Jaundice" "finding"))
    )
  )
)
;; Page 67 - Skin Symptoms
"Meningococcal disease likely" 
(system_diagnosis_rule
  "Diagnose probable meningococcal disease "
  (diagnosis
    (snomed_concept "Meningococcal infectious disease” (disorder))
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Purpuric rash" "disorder"))
		(clinical_finding (snomed_concept “Erythematous rash” (disorder))
    (clinical_finding (snomed_concept "Stiff neck" "finding"))
    (clinical_finding (snomed_concept "Drowsy" "finding"))
    (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
    (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
    (clinical_finding (snomed_concept "Headache" "finding"))
    )
)
;; Page 67 - Skin Symptoms
"Anaphylaxis likely likely" 
(system_diagnosis_rule
  "Diagnose probable anaphylaxis"
  (diagnosis
    (snomed_concept "Anaphylaxis” (disorder))
    probable
  )
  adult
  (and
		(clinical_finding ( snomed_concept “Generalized pruritus” (finding))
		(clinical_finding ( snomed_concept “Generalized rash” (disorder))
		(clinical_finding ( snomed_concept “ Facial swelling” (finding))
		(clinical_finding ( snomed_concept “Tongue swelling” (finding))
		(clinical_finding ( snomed_concept “Wheezing” (finding))
		(clinical_finding (snomed_concept “Difficulty breathing” (finding))
		(<measurement (snomed_concept “Diastolic blood pressure” (observable entity) mmHg) 60))
		(>=measurement (snomed_concept “Body temperature” (observable entity) °C) 38))
		(clinical_finding (snomed_concept “Dizziness” (finding)) 			
		(clinical_finding ( snomed_concept “Collapse” (finding))
		(clinical_finding ( snomed_concept “Abdominal pain” (finding))
		(clinical_finding ( snomed_concept “Vomiting” (disorder))
		(clinical_finding ( snomed_concept “Exposure to” (contextual qualifier) “Substance” (substance) (qualifier value) “Possible” (qualifier value) “Allergen” (attribute))
		)
	)
;; Page 67 - Skin Symptoms
(system_priority_evaluation
  "Urgent skin symptoms"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept Skin finding” (finding))
    (or
      (clinical_finding ( snomed_concept “Anaphylaxis” (disorder))
			(clinical_finding ( snomed_concept “Generalized pruritus” (finding))
			(clinical_finding ( snomed_concept “Generalized rash” (disorder))
			(clinical_finding ( snomed_concept “ Facial swelling” (finding))
			(clinical_finding ( snomed_concept “Tongue swelling” (finding))
			(clinical_finding ( snomed_concept “Wheezing” (finding))
			(clinical_finding (snomed_concept “Difficulty breathing” (finding))
			(clinical_finding (snomed_concept “Dizziness” (finding)) 					
			(clinical_finding ( snomed_concept “Collapse” (finding))
			(clinical_finding ( snomed_concept “Exposure to” (contextual qualifier) “Substance” (substance) (qualifier value) “Possible” (qualifier value) “Allergen” (attribute))
			(< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
      (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
      (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
      (clinical_finding (snomed_concept "Abdominal pain" "finding"))
      (clinical_finding (snomed_concept "Vomiting” (disorder))
			)
			(clinical_finding (snomed_concept “Meningococcal infectious disease” (disorder))
			(clinical_finding (snomed_concept “Purpuric rash” (disorder))
			(clinical_finding (snomed_concept “Erythematous rash” (disorder))
			(clinical_finding (snomed_concept “Stiff neck” (finding))
			(clinical_finding (snomed_concept “Drowsy” (finding))
			(clinical_finding (snomed_concept “Clouded consciousness” (finding))
			(>=measurement (snomed_concept “Body temperature” (observable entity) °C) 38))
			(clinical_finding (snomed_concept “Headache” (finding))
			)
			(clinical_finding (snomed_concept “Adverse reaction caused by drug” (disorder) “Serious” (qualifier value))
			(clinical_finding (snomed_concept “Generalized rash” (disorder) “In” (attribute) month) 3 “Medication commenced” (situation))
			(clinical_finding (snomed_concept “Facial swelling” (finding))
			(clinical_finding (snomed_concept “Tongue swelling” (finding))
			(clinical_finding (snomed_concept “Difficulty breathing” (finding))
			(<measurement (snomed_concept “Systolic blood pressure” (observable entity) mmHg) 90))
			(<measurement (snomed_concept “Diastolic blood pressure” (observable entity) mmHg) 60))
			(>=measurement (snomed_concept “Body temperature” (observable entity) °C) 38))
			(clinical_finding (snomed_concept “Abdominal pain” (finding))
			(clinical_finding (snomed_concept “Vomiting” (disorder))
			(clinical_finding (snomed_concept “Eruption of skin” (disorder)) 
					(snomed_concept “Mouth region structure” (body structure) “Involved” (qualifier value))
					(snomed_concept “Structure of both eyes” (body structure) “Involved” (qualifier value))
					(snomed_concept “Genital structure” (body structure)  “Involved” (qualifier value))
			(clinical_finding (snomed_concept “Peeling of skin” (finding))
			(clinical_finding (snomed_concept “Denuded skin” (disorder))
      (clinical_finding (snomed_concept "Diarrhea" "finding"))
      (clinical_finding (snomed_concept "Jaundice" "finding"))
      (clinical_finding (snomed_concept "Blister” (morphologic abnormality))
    )
  )
)





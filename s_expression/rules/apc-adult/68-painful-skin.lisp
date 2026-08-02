;;Page 68 –Painful skin
(task
  "Check for urgent painful skin symptoms"
  adult
  (clinical_finding ( snomed_concept “Pain of skin” (finding))
 	 (check_for
		(clinical_finding ( snomed_concept “Generalized pruritus” (finding))
		(clinical_finding ( snomed_concept “Generalized rash” (disorder))
		(clinical_finding ( snomed_concept “ Facial swelling” (finding))
		(clinical_finding ( snomed_concept “Tongue swelling” (finding))
		(clinical_finding ( snomed_concept “Wheezing” (finding))
		(clinical_finding (snomed_concept “Difficulty breathing” (finding))
		(clinical_finding (snomed_concept “Dizziness” (finding)) 				
		(clinical_finding ( snomed_concept “Collapse” (finding))
		(clinical_finding ( snomed_concept “Abdominal pain” (finding))
		(clinical_finding ( snomed_concept “Vomiting” (disorder))
		(clinical_finding ( snomed_concept “Exposure to” (contextual qualifier) “Substance” (substance) (qualifier value) “Possible” (qualifier value) “Allergen” (attribute))
		(clinical_finding (snomed_concept “Purpuric rash” (disorder))
		(clinical_finding (snomed_concept “Erythematous rash” (disorder))
		(clinical_finding (snomed_concept “Stiff neck” (finding))
		(clinical_finding (snomed_concept “Drowsy” (finding))
		(clinical_finding (snomed_concept “Clouded consciousness” (finding))
		(clinical_finding (snomed_concept “Headache” (finding))
		(clinical_finding (snomed_concept “Generalized rash” (disorder) “In” (attribute) month) 3 “Medication commenced” (situation))
		(clinical_finding (snomed_concept “Diarrhea” (finding))
		(clinical_finding (snomed_concept “Eruption of skin” (disorder)) 
				(snomed_concept “Mouth region structure” (body structure) “Involved” (qualifier value))
				(snomed_concept “Structure of both eyes” (body structure) “Involved” (qualifier value))
				(snomed_concept “Genital structure” (body structure)  “Involved” (qualifier value))
		(clinical_finding (snomed_concept “Blister” (morphologic abnormality))
		(clinical_finding (snomed_concept “Peeling of skin” (finding))
		(clinical_finding (snomed_concept “Denuded skin” (disorder))
		(clinical_finding (snomed_concept “Jaundice” (finding))
	)
)
;;Page 68 –Painful skin
(system_priority_evaluation
  "Urgent painful skin symptoms”
  adult
  Urgent
  (and
    (clinical_finding ( snomed_concept “Pain of skin” (finding))
    (or
			(clinical_finding ( snomed_concept “Anaphylaxis” (disorder))
			(clinical_finding ( snomed_concept “Generalized pruritus” (finding))
			(clinical_finding ( snomed_concept “Generalized rash” (disorder))
			(clinical_finding ( snomed_concept “ Facial swelling” (finding))
			(clinical_finding ( snomed_concept “Tongue swelling” (finding))
			(clinical_finding ( snomed_concept “Wheezing” (finding))
			(clinical_finding (snomed_concept “Difficulty breathing” (finding))
			(<measurement (snomed_concept “Systolic blood pressure” (observable entity) mmHg) 90))
			(<measurement (snomed_concept “Diastolic blood pressure” (observable entity) mmHg) 60))
			(>=measurement (snomed_concept “Body temperature” (observable entity) °C) 38))
			(clinical_finding (snomed_concept “Dizziness” (finding)) 				
			(clinical_finding ( snomed_concept “Collapse” (finding))
			(clinical_finding ( snomed_concept “Abdominal pain” (finding))
			(clinical_finding ( snomed_concept “Vomiting” (disorder))
			(clinical_finding ( snomed_concept “Exposure to” (contextual qualifier) “Substance” (substance) (qualifier value) “Possible” (qualifier value) “Allergen” (attribute))
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
			(clinical_finding (snomed_concept “Diarrhea” (finding))
			(clinical_finding (snomed_concept “Eruption of skin” (disorder)) 
					(snomed_concept “Mouth region structure” (body structure) “Involved” (qualifier value))
					(snomed_concept “Structure of both eyes” (body structure) “Involved” (qualifier value))
					(snomed_concept “Genital structure” (body structure)  “Involved” (qualifier value))
			(clinical_finding (snomed_concept “Blister” (morphologic abnormality))
			(clinical_finding (snomed_concept “Peeling of skin” (finding))
			(clinical_finding (snomed_concept “Denuded skin” (disorder))
			(clinical_finding (snomed_concept “Jaundice” (finding))
		)
	)
)
;; Page 68 - Painful skin
“Anaphylaxis likely”
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
		(<measurement (snomed_concept “Systolic blood pressure” (observable entity) mmHg) 90))
		(<measurement (snomed_concept “Diastolic blood pressure” (observable entity) mmHg) 60))
		(>=measurement (snomed_concept “Body temperature” (observable entity) °C) 38))
		(clinical_finding (snomed_concept “Dizziness” (finding)) 
		(clinical_finding ( snomed_concept “Collapse” (finding))
		(clinical_finding ( snomed_concept “Abdominal pain” (finding))
		(clinical_finding ( snomed_concept “Vomiting” (disorder))
		(clinical_finding ( snomed_concept “Exposure to” (contextual qualifier) “Substance” (substance) (qualifier value) “Possible” (qualifier value) “Allergen” (attribute))
	)
)
;; Page 68 - Painful skin
“Meningococcal disease likely”
(system_diagnosis_rule
  "Diagnose probable meningococcal disease"
  (diagnosis
    (snomed_concept "Meningococcal infectious disease” (disorder))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Purpuric rash” (disorder))
		(clinical_finding (snomed_concept “Erythematous rash” (disorder))
		(clinical_finding (snomed_concept “Stiff neck” (finding))
		(clinical_finding (snomed_concept “Drowsy” (finding))
		(clinical_finding (snomed_concept “Clouded consciousness” (finding))
		(>=measurement (snomed_concept “Body temperature” (observable entity) °C) 38))
		(clinical_finding (snomed_concept “Headache” (finding))
	)
)
;; Page 68 - Painful skin
“Serious drug reaction likely”
(system_diagnosis_rule
  "Diagnose probable serious drug reaction"
  (diagnosis
    (snomed_concept "Adverse reaction caused by drug” (disorder) “Serious” (qualifier value))
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
		(clinical_finding (snomed_concept “Abdominal pain” (finding))
		(clinical_finding (snomed_concept “Vomiting” (disorder))
		(clinical_finding (snomed_concept “Diarrhea” (finding))
		(clinical_finding (snomed_concept “Eruption of skin” (disorder)) 
				(snomed_concept “Mouth region structure” (body structure) “Involved” (qualifier value))
				(snomed_concept “Structure of both eyes” (body structure) “Involved” (qualifier value))
				(snomed_concept “Genital structure” (body structure)  “Involved” (qualifier value))
		(clinical_finding (snomed_concept “Blister” (morphologic abnormality))
		(clinical_finding (snomed_concept “Peeling of skin” (finding))
		(clinical_finding (snomed_concept “Denuded skin” (disorder))
		(clinical_finding (snomed_concept “Jaundice” (finding))
	)
)
;; Page 68 - Painful skin
“Herpes zoster (shingles)  likely”
(system_diagnosis_rule
  "Diagnose probable herpes zoster (shingles)"
  (diagnosis
    (snomed_concept "Herpes zoster" (disorder))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Blister” (morphologic abnormality))
	  (clinical_finding (snomed_concept “Pain” (finding))
			(snomed_concept “In” (attribute) “Band” (qualifier value)) 
			(snomed_concept “Unilateral” (qualifier value))
	)
;; Page 68 - Painful skin
“Herpes zoster (shingles)  likely”
(system_diagnosis_rule
  "Diagnose probable herpes zoster (shingles)"
  (diagnosis
	(referral
    (snomed_concept "Herpes zoster" (disorder))
    (snomed_concept “Patient referral” (procedure) hour) 24))
  )
  adult
  (and
			(clinical_finding (snomed_concept “Eye involvement” (qualifier value))
			(clinical_finding (snomed_concept “Ear structure” (body structure) “Involvement” (attribute))
			(clinical_finding (snomed_concept “Nasal structure” (body structure) “Involvement” (attribute))
			(clinical_finding (snomed_concept “Infective meningitis suspected” (situation))
			(clinical_finding (snomed_concept “Headache” (finding))
			(>=measurement (snomed_concept “Body temperature” (observable entity) °C) 38))
			(clinical_finding (snomed_concept “Stiff neck” (finding))
			(clinical_finding (snomed_concept “Eruption of skin” (disorder) “Structure of multiple topographic sites” (body structure))
	)
)
;; Page 68 - Painful skin
“Boil/abscess likely”
(system_diagnosis_rule
  "Diagnose probable boil/abscess"
  (diagnosis
    (snomed_concept “Furuncle” (disorder))
		(snomed_concept “Abscess” (disorder))
    probable
  )
  adult
  (and
			(clinical_finding (snomed_concept “Mass of skin” (finding) or 
			(clinical_finding (snomed_concept “Mass of soft tissue” (finding))
			(clinical_finding (snomed_concept “Redness of skin over lesion” (finding))
			(clinical_finding (snomed_concept “Firm mass” (morphologic abnormality))
			(clinical_finding (snomed_concept “Temperature of skin over lesion warm” (finding))
			(clinical_finding (snomed_concept “Pain” (finding))
			(clinical_finding (snomed_concept “Fluctuant” (finding))
			(clinical_finding (snomed_concept “Skin discharge” (finding)) 			
			(clinical_finding (snomed_concept “Pus” (substance))
	)
;; Page 68 - Painful skin
“Boil/abscess likely”
(system_diagnosis_rule
  "Diagnose probable boil/abscess"
  (diagnosis
	(referral 
    (snomed_concept “Furuncle” (disorder))
		(snomed_concept “Abscess” (disorder))
    (snomed_concept “Patient referral” (procedure) hour) 24)
  )
  adult
  (and
			(<measurement (snomed_concept “Systolic blood pressure” (observable entity) mmHg) 90))
			(<measurement (snomed_concept “Diastolic blood pressure” (observable entity) mmHg) 60))
			(>measurement (snomed_concept “Heart rate” (observable entity) bpm) 100))
			(clinical_finding (snomed_concept “Deep abscess” (morphologic abnormality))
			(clinical_finding (snomed_concept “Drainage of abscess” (procedure) “Difficult” (qualifier value))
					(snomed_concept “Hand structure” (body structure))
					(snomed_concept “Breast structure” (body structure))
					(snomed_concept “Perineal structure” (body structure))
			(clinical_finding (snomed_concept “Patient condition unchanged” (finding) “Treatment given” (situation) “In” (attribute) day) 2))
	)
)
;; Page 68 - Painful skin
“Cellulitis likely”
(system_diagnosis_rule
  "Diagnose probable cellulitis"
  (diagnosis
    (snomed_concept "Cellulitis" (disorder))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Swelling of skin” (finding))
		(clinical_finding (snomed_concept “Red color” (qualifier value))
		(clinical_finding (snomed_concept “Warm skin” (finding))
		(clinical_finding (snomed_concept “Poorly defined” (qualifier value) “Marginal” (qualifier value))
		(clinical_finding (snomed_concept “Irregular” (qualifier value) “Marginal” (qualifier value))
	)
;; Page 68 - Painful skin
“Cellulitis likely”
(system_diagnosis_rule
  "Diagnose probable cellulitis"
  (diagnosis
	(referral 
    (snomed_concept "Cellulitis" (disorder))
    (snomed_concept “Patient referral” (procedure) hour) 24))
  )
  adult
  (and
			(<measurement (snomed_concept “Systolic blood pressure” (observable entity) mmHg) 90))
			(<measurement (snomed_concept “Diastolic blood pressure” (observable entity) mmHg) 60))
			(>measurement (snomed_concept “Heart rate” (observable entity) bpm) 100))
			(clinical_finding (snomed_concept “Clouded consciousness” (finding))
			(clinical_finding (snomed_concept “Hand structure” (body structure) “Involvement” (attribute))
			(clinical_finding (snomed_concept “Face structure” (body structure) “Involvement” (attribute))
			(clinical_finding (snomed_concept “Scalp structure” (body structure) “Involvement” (attribute))
			(clinical_finding (snomed_concept “Infectious disease” (disorder) “Extensive” (qualifier value))
			(clinical_finding (snomed_concept “Blister” (morphologic abnormality))
			(clinical_finding (snomed_concept “Gray skin” (finding))
			(clinical_finding (snomed_concept “Finding of color of skin” (finding) “Black color” (qualifier value))
			(clinical_finding (snomed_concept “Diabetic - poor control” (finding))
			(clinical_finding (snomed_concept “Recurrent infection of skin” (disorder) Secondary” (qualifier value))
			(clinical_finding (snomed_concept “Lymphedema” (disorder))
			(clinical_finding (snomed_concept “Disease” (disorder) “Other” (qualifier value))
			(clinical_finding (snomed_concept “Patient condition unchanged” (finding) “Treatment given” (situation) “In” (attribute) day) 2))
	)
)
;; Page 68 - Painful skin
“Erysipelas likely”
(system_diagnosis_rule
  "Diagnose probable erysipelas"
  (diagnosis
    (snomed_concept "Erysipelas" (disorder))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Swelling of skin” (finding))
		(clinical_finding (snomed_concept “Red color” (qualifier value))
		(clinical_finding (snomed_concept “Warm skin” (finding))
		(clinical_finding (snomed_concept “Well defined” (qualifier value) “Marginal” (qualifier value))
		(clinical_finding (snomed_concept “Raised” (qualifier value) “Marginal” (qualifier value))
	)
;; Page 68 - Painful skin
“Erysipelas likely”
(system_diagnosis_rule
  "Diagnose probable erysipelas"
  (diagnosis
	(referral 
    (snomed_concept "Erysipelas" (disorder))
    (snomed_concept “Patient referral” (procedure) hour) 24))
  )
  adult
  (and
		(<measurement (snomed_concept “Systolic blood pressure” (observable entity) mmHg) 90))
		(<measurement (snomed_concept “Diastolic blood pressure” (observable entity) mmHg) 60))
		(>measurement (snomed_concept “Heart rate” (observable entity) bpm) 100))
		(clinical_finding (snomed_concept “Clouded consciousness” (finding))
		(clinical_finding (snomed_concept “Hand structure” (body structure) “Involvement” (attribute))
		(clinical_finding (snomed_concept “Face structure” (body structure) “Involvement” (attribute))
		(clinical_finding (snomed_concept “Scalp structure” (body structure) “Involvement” (attribute))
		(clinical_finding (snomed_concept “Infectious disease” (disorder) “Extensive” (qualifier value))
		(clinical_finding (snomed_concept “Blister” (morphologic abnormality))
		(clinical_finding (snomed_concept “Gray skin” (finding))
		(clinical_finding (snomed_concept “Finding of color of skin” (finding) “Black color” (qualifier value))
		(clinical_finding (snomed_concept “Diabetic - poor control” (finding))
		(clinical_finding (snomed_concept “Recurrent infection of skin” (disorder) “Secondary” (qualifier value))
		(clinical_finding (snomed_concept “Lymphedema” (disorder))
		(clinical_finding (snomed_concept “Disease” (disorder) “Other” (qualifier value))
		(clinical_finding (snomed_concept “Patient condition unchanged” (finding) “Treatment given” (situation) “In” (attribute) day) 2))
		)
	)
)

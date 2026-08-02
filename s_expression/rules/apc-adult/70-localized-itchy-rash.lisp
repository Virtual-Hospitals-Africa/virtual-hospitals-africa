;;Page 70 – Localized itchy rash 
(task
  "Check for urgent localized itchy rash symptoms"
  adult
	  (clinical_finding ( snomed_concept “Eruption” (morphologic abnormality) “Localized” (qualifier value))
		(clinical_finding ( snomed_concept “Itching” (finding))
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
;;Page 70 – Localized itchy rash
(system_priority_evaluation
  "Urgent localized itch rash symptoms”
  adult
  Urgent
  (and
    (clinical_finding ( snomed_concept “Eruption” (morphologic abnormality) “Localized” (qualifier value))
		(clinical_finding ( snomed_concept “Itching” (finding))    
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
;; Page 70 – Localized itchy rash
“Anaphylaxis likely”
(system_diagnosis_rule
  "Diagnose probable anaphylaxis"
  (diagnosis
    (snomed_concept “Anaphylaxis” (disorder))
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
;; Page 70 – Localized itchy rash
“Meningococcal disease likely”
(system_diagnosis_rule
  "Diagnose probable meningococcal disease"
  (diagnosis
    (snomed_concept “Meningococcal infectious disease” (disorder))
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
;; Page 70 – Localized itchy rash
“Serious drug reaction likely”
(system_diagnosis_rule
  "Diagnose probable serious drug reaction"
  (diagnosis
    (snomed_concept “Adverse reaction caused by drug” (disorder) “Serious” (qualifier value))
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
;; Page 70 – Localized itchy rash
“Insect bite likely”
(system_diagnosis_rule
  "Diagnose probable insects bite"
  (diagnosis
    (snomed_concept “Insect bite - wound” (disorder))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Papule” (morphologic abnormality))
		(clinical_finding (snomed_concept “Red color” (qualifier value))
		(clinical_finding (snomed_concept “Itching” (finding))
		(clinical_finding (snomed_concept “Grouped” (qualifier value))
		(clinical_finding (snomed_concept “Blister” (morphologic abnormality))
		(clinical_finding (snomed_concept “Post-inflammatory hyperpigmentation” (disorder))
		(clinical_finding (snomed_concept “Scratch marks” (finding))
	)
)
;; Page 70 – Localized itchy rash
“Papular urticaria likely”
(system_diagnosis_rule
  "Diagnose probable papular urticaria"
  (diagnosis
    (snomed_concept “Papular urticaria” (disorder))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Prurigo simplex” (disorder))
		(clinical_finding (snomed_concept “Blister” (morphologic abnormality))
		(clinical_finding (snomed_concept “Post-inflammatory hyperpigmentation” (disorder))
	)
)
;; Page 70 – Localized itchy rash
“Impetigo likely”
(system_diagnosis_rule
  "Diagnose probable impetigo"
  (diagnosis
    (snomed_concept “Impetigo” (disorder))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Crust on skin” (finding) “Yellow color” (qualifier value))
	)
)
 ;; Page 70 – Localized itchy rash
“Scabies likely”
(system_diagnosis_rule
  "Diagnose probable scabies"
  (diagnosis
    (snomed_concept “Infestation caused by Sarcoptes scabiei var hominis” (disorder))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Papule” (morphologic abnormality))
		(clinical_finding (snomed_concept “Small” (qualifier value))
		(clinical_finding (snomed_concept “Red color” (qualifier value))
		(clinical_finding (snomed_concept “Itching” (finding) “Very” (qualifier value))
		(clinical_finding (snomed_concept “Burrows in skin” (disorder))
		(clinical_finding (snomed_concept “Skin structure of interdigital web of hand” (body structure) “Involved” (qualifier value))
		(clinical_finding (snomed_concept “Axillary region structure” (body 	structure) “Involved” (qualifier value))
		(clinical_finding (snomed_concept “Structure of waist” (surface region) (body structure) “Involved” (qualifier value))
		(clinical_finding (snomed_concept “Genital structure” (body structure) “Involved” (qualifier value))
	)
)
;; Page 70 – Localized itchy rash
“Eczema likely”
(system_diagnosis_rule
  "Diagnose probable eczema"
  (diagnosis
    (snomed_concept “Eczema” (disorder))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Xeroderma” (disorder) “Plaque” (morphologic abnormality))
		(clinical_finding (snomed_concept “Scaly skin” (finding) “Plaque” (morphologic abnormality))
		(clinical_finding (snomed_concept “Itching of skin” (finding) “Plaque” (morphologic abnormality))
		(clinical_finding (snomed_concept “Wrist region structure” (body structure) “Involved” (qualifier value))
		(clinical_finding (snomed_concept “Ankle region structure” (body structure) “Involved” (qualifier value))
		(clinical_finding (snomed_concept “Antecubital region structure” (body structure) “Involved” (qualifier value))
		(clinical_finding (snomed_concept “Popliteal region structure” (body structure) “Involved” (qualifier value))
	)
)
;; Page 70 – Localized itchy rash
“Psoriasis likely”
(system_diagnosis_rule
  "Diagnose probable psoriasis"
  (diagnosis
	(referral 
    (snomed_concept “Psoriasis” (disorder))
		(snomed_concept “Patient referral to specialist” (procedure))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Confirmation of” (contextual qualifier) (qualifier value) “Diagnosis” (observable entity))
		(clinical_finding (snomed_concept “Plaque” (morphologic abnormality))
		(clinical_finding (snomed_concept “Well defined” (qualifier value))
		(clinical_finding (snomed_concept “Raised” (qualifier value))
		(clinical_finding (snomed_concept “Covered” (qualifier value) “With” (attribute) “Scaly skin” (finding) “Silver color” (qualifier value)) 
		(clinical_finding (snomed_concept “Peeling of skin” (finding))
		(clinical_finding (snomed_concept “Knee region structure” (body structure) “Involved” (qualifier value))
		(clinical_finding (snomed_concept “Elbow region structure (body structure) “Involved” (qualifier value))
		(clinical_finding (snomed_concept “Structure of back of abdominopelvic segment of trunk” (body structure) “Involved” (qualifier value))
		(clinical_finding (snomed_concept “Scalp structure” (body structure) “Involved” (qualifier value))
		(clinical_finding (snomed_concept “Pitting of nails” (disorder))
	)
)
;; Page 70 – Localized itchy rash
“Pityriasis rosea likely”
(system_diagnosis_rule
  "Diagnose probable pityriasis rosea"
  (diagnosis
    (snomed_concept “Pityriasis rosea” (disorder))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Skin lesion” (disorder) “Annular shape” (qualifier value) “Thoracic structure” (body structure))
		(clinical_finding (snomed_concept “Plaque” (morphologic abnormality) “Structure of posterior region of trunk” (body structure)) 
		(clinical_finding (snomed_concept “Scaly skin” (finding)
“Central” (qualifier value) “Fine” (qualifier value))
		(clinical_finding (snomed_concept “Scaly skin” (finding))
“Lesser” (qualifier value) “Ovoid shape” (qualifier value)) 
		(clinical_finding (snomed_concept “Family Pinaceae” (organism) “Pattern” (attribute) “Structure of posterior region of trunk” (body structure))
	)
)
;; Page 70 – Localized itchy rash
“Tinea corporis (ringworm) likely”
(system_diagnosis_rule
  "Diagnose probable tinea corporis (ringworm)"
  (diagnosis
    (snomed_concept “Tinea corporis” (disorder))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Dermatophytosis” (disorder))
		(clinical_finding (snomed_concept “Skin lesion” (disorder) “Slow grower” (qualifier value))
		(clinical_finding (snomed_concept “Raised” (qualifier value) “Along edge” (qualifier value))
		(clinical_finding (snomed_concept “Scaly skin” (finding) “Annular shape” (qualifier value))
		(clinical_finding (snomed_concept “Clear” (qualifier value) “Central” (qualifier value))
	)
)
;; Page 70 – Localized itchy rash
“Tinea pedis (athlete's foot) likely”
(system_diagnosis_rule
  "Diagnose probable tinea pedis (athlete's foot)"
  (diagnosis
    (snomed_concept “Tinea pedis” (disorder))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Skin structure of interdigital web of foot” (body structure))
		(clinical_finding (snomed_concept “Fissure in skin” (disorder))
		(clinical_finding (snomed_concept “Peeling of skin” (finding))
		(clinical_finding (snomed_concept “Scaly skin” (finding) “Skin lesion” (disorder))
		(clinical_finding (snomed_concept “Thick” (qualifier value) “Scaly skin” (finding))
		(clinical_finding (snomed_concept “Structure of sole of foot” (body structure) “Involved” (qualifier value))
		(clinical_finding (snomed_concept “Heel structure” (body structure) “Involved” (qualifier value))
		(clinical_finding (snomed_concept “Structure of medial side of foot” (body structure) “Involved” (qualifier value))
		(clinical_finding (snomed_concept “Structure of lateral side of foot” (body structure) “Involved” (qualifier value))
		)
	)
)
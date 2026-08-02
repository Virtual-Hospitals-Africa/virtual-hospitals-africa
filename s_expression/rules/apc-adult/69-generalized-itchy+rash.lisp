;;Page 69 - Generalized itchy rash
(task
  "Check for urgent generalized itchy rash symptoms"
  adult
	  (clinical_finding ( snomed_concept “Generalized rash” (disorder))
		(clinical_finding (snomed_concept “Itching (finding))
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
		(clinical_finding ( snomed_concept “Exposure to” (contextual qualifier) 	“Substance” (substance) (qualifier value) “Possible” (qualifier value) “Allergen” (attribute))
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
;; Page 69 - Generalized itchy rash
(system_priority_evaluation
  "Urgent generalized itchy rash symptoms”
  adult
  Urgent
  (and
    (clinical_finding ( snomed_concept “Generalized rash” (disorder))
		(clinical_finding (snomed_concept “Itching (finding))
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
;; Page 69 - Generalized itchy rash
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
;; Page 69 - Generalized itchy rash
“Meningococcal disease likely”
(system_diagnosis_rule
  "Diagnose probable Meningococcal disease"
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
;; Page 69 - Generalized itchy rash
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
;; Page 69 - Generalized itchy rash
“Insects bites likely”
(system_diagnosis_rule
  "Diagnose probable insects bites"
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
		(clinical_finding (snomed_concept “Post-inflammatory 		hyperpigmentation” (disorder))
		(clinical_finding (snomed_concept “Scratch marks” (finding))
	)
)
;; Page 69 - Generalized itchy rash
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
		(clinical_finding (snomed_concept “Burrows in skin” (disorder))
		(clinical_finding (snomed_concept “Skin structure of interdigital web of hand” (body structure) “Involved” (qualifier value))
		(clinical_finding (snomed_concept “Axillary region structure” (body structure) “Involved” (qualifier value))
		(clinical_finding (snomed_concept “Structure of waist (surface region) (body structure) “Involved” (qualifier value))
		(clinical_finding (snomed_concept “Genital structure (body structure)  “Involved” (qualifier value))
		(clinical_finding (snomed_concept “Itching” (finding) “Very” (qualifier value) “Night time” (qualifier value))
	)
)
;; Page 69 - Generalized itchy rash
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
;; Page 69 - Generalized itchy rash
“Papular pruritic eruption (PPE) likely”
(system_diagnosis_rule
  "Diagnose probable papular pruritic eruption (PPE)"
  (diagnosis
    (snomed_concept “Papular eruption” (disorder))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Pruritic rash” (disorder))
		(clinical_finding (snomed_concept “Papule” (morphologic abnormality))
		(clinical_finding (snomed_concept “Hyperpigmentation of skin” (disorder))
		(clinical_finding (snomed_concept “Itching” (finding))
		(clinical_finding (snomed_concept “Limb structure” (body structure) “Involved” (qualifier value))
		(clinical_finding (snomed_concept “Trunk structure” (body structure) “Involved” (qualifier value))
		(clinical_finding (snomed_concept “Face structure” (body structure) “Involved” (qualifier value))
	)
)
;; Page 69 - Generalized itchy rash
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
		(clinical_finding (snomed_concept “Peeling of skin” (finding) “Plaque” (morphologic abnormality))
		(clinical_finding (snomed_concept “Itching of skin” (finding) “Plaque” (morphologic abnormality))
		(clinical_finding (snomed_concept “Wrist region structure” (body structure) “Involved” (qualifier value))
		(clinical_finding (snomed_concept “Ankle region structure” (body structure) “Involved” (qualifier value))
		(clinical_finding (snomed_concept “Antecubital region structure” (body structure) “Involved” (qualifier value))
		(clinical_finding (snomed_concept “Popliteal region structure” (body structure) “Involved” (qualifier value))
	)
;; Page 69 - Generalized itchy rash
“Eczema likely”
(system_diagnosis_rule
  "Diagnose probable eczema"
  (diagnosis
	(referral 
    (snomed_concept “Eczema” (disorder))
    (snomed_concept “Patient referral” (procedure)
  )
  adult
  (and
		(clinical_finding (snomed_concept “Patient condition unchanged” (finding) “After” (attribute) week) 2))
		(clinical_finding (snomed_concept “Extensive” (qualifier value) “Involvement” (attribute)) 
		(clinical_finding (snomed_concept “Pustule” (morphologic abnormality) “Pain” (finding))
	)
)
;; Page 69 - Generalized itchy rash
“Urticaria likely”
(system_diagnosis_rule
  "Diagnose probable urticaria"
  (diagnosis
    (snomed_concept “Urticaria” (disorder))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Wheal” (finding))
		(clinical_finding (snomed_concept “Itching” (finding) “Very” (qualifier value))
		(clinical_finding (snomed_concept “Red color” (qualifier value))
		(clinical_finding (snomed_concept “Raised” (qualifier value))
		(clinical_finding (snomed_concept “Appearances” (qualifier value) “Sudden” (qualifier value))
		(clinical_finding (snomed_concept “Transitory” (qualifier value) “In” (attribute) hour) 24)
	)
)
;; Page 69 - Generalized itchy rash
“Drug reaction likely”
(system_diagnosis_rule
  "Diagnose probable drug reaction"
  (diagnosis
    (snomed_concept “Adverse reaction caused by drug” (disorder))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Generalized rash” (disorder) “In” (attribute) month) 3 “Medication commenced” (situation))
		(clinical_finding (snomed_concept “Erythematous rash” (disorder))
		(clinical_finding (snomed_concept “Trunk structure” (body structure) “Involvement” (attribute))
		(clinical_finding (snomed_concept “Upper limb structure” (body structure) “Involvement” (attribute))
		(clinical_finding (snomed_concept “Lower limb structure” (body structure) “Involvement” (attribute))
		)
	)
)
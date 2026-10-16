;;Page 72 - Generalized non-itchy rash
(task
  "Check for generalized non-itchy rash symptoms"
  adult
	  (clinical_finding ( snomed_concept “Generalized rash” (disorder) “Not itching” (qualifier value))
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
;; Page 72 - Generalized non-itchy rash
(system_priority_evaluation
  "Urgent generalized non-itchy rash symptoms”
  adult
  Urgent
  (and
    (clinical_finding ( snomed_concept “Generalized rash” (disorder) “Not itching” (qualifier value))   
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
;; Page 72 - Generalized non-itchy rash
"Anaphylaxis likely"
(system_diagnosis_rule
  "Diagnose probable anaphylaxis"  
  (diagnosis 
	  (snomed_concept “Anaphylaxis” (disorder))
	probable
	adult
	)
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
;; Page 72 - Generalized non-itchy rash
"Meningococcal disease likely"
(system_diagnosis_rule
  "Diagnose probable meningococcal disease"  
  (diagnosis 
	  (snomed_concept “Meningococcal infectious disease” (disorder))
	probable
	adult
	)
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
;; Page 72 - Generalized non-itchy rash
"Serious drug reaction likely"
(system_diagnosis_rule
  "Diagnose probable serious drug reaction"  
  (diagnosis 
	  (snomed_concept “Adverse reaction caused by drug” (disorder) “Serious” (qualifier value))
	probable
	adult
	)
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
;; Page 72 - Generalized non-itchy rash
"Tick bite fever likely"
(system_diagnosis_rule
  "Diagnose probable tick bite fever"  
  (diagnosis 
	  (snomed_concept “South African tick-bite fever” (disorder))
		(snomed_concept “African tick bite fever” (disorder))
	probable
	adult
	)
	(and
		(clinical_finding (snomed_concept “Tick bite” (disorder))
		(clinical_finding (snomed_concept “Scab” (morphologic abnormality) “Small” (qualifier value) “Dark color” (qualifier value) “Brown color” (qualifier value))
		(clinical_finding (snomed_concept “Scab” (morphologic abnormality) “Small” (qualifier value) “Black color” (qualifier value))
		(clinical_finding (snomed_concept “Bite of tick” (event))
		(clinical_finding (snomed_concept “Suborder Ixodides” (organism) “Present” (qualifier value))
		(clinical_finding (snomed_concept “Headache” (finding))
		(clinical_finding (snomed_concept “Fever” (finding))
		(clinical_finding (snomed_concept “Generalized aches and pains” (finding))
	)
)
;; Page 72 - Generalized non-itchy rash
"Secondary syphilis likely"
(system_diagnosis_rule
  "Diagnose probable secondary syphilis"  
  (diagnosis 
	  (snomed_concept “Secondary syphilis” (disorder))
	probable
	adult
	)
	(and
		(clinical_finding (snomed_concept “Treponema pallidum antibody detected by hemagglutination test” (finding))
		(clinical_finding (snomed_concept “Syphilis titer detected” (finding))
		(clinical_finding (snomed_concept “Eruption of skin” (disorder) “Palm (region) structure” (body structure))
		(clinical_finding (snomed_concept “Eruption of skin” (disorder) “Structure of sole of foot” (body structure))
		(clinical_finding (snomed_concept “Genital warts” (disorder))
		(clinical_finding (snomed_concept “Papule” (morphologic abnormality) “Genital structure” (body structure))
		(clinical_finding (snomed_concept “Alopecia areata” (disorder))
	)
)
;; Page 72 - Generalized non-itchy rash
"Non-specific viral rash likely"
(system_diagnosis_rule
  "Diagnose probable non-specific viral rash"  
  (diagnosis 
	  (snomed_concept “Viral exanthem” (disorder))
	probable
	adult
	)
	(and
		(clinical_finding (snomed_concept “Fever” (finding))
		(clinical_finding (snomed_concept “Headache” (finding))
		(clinical_finding (snomed_concept “Lymphadenopathy” (disorder))
		(clinical_finding (snomed_concept “Muscle pain” (finding))
		(clinical_finding (snomed_concept “Generalized aches and pains” (finding))
		)
	)
)


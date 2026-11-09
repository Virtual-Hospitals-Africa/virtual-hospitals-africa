;; Page 73 - Drug Rash
(task
  "Check for urgent drug rash symptoms"
  adult
	  (clinical_finding (snomed_concept "Eruption caused by drug" "disorder"))
  (check_for
    (clinical_finding (snomed_concept "Facial swelling” (finding))
    (clinical_finding (snomed_concept "Tongue swelling” (finding))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    (clinical_finding (snomed_concept "Abdominal pain" "finding"))
    (clinical_finding (snomed_concept "Vomiting” (disorder))
    (clinical_finding (snomed_concept "Diarrhea" "finding"))
    (clinical_finding (snomed_concept "Blister" "morphologic abnormality"))
    (clinical_finding (snomed_concept "Peeling of skin" "finding"))
		(clinical_finding ( snomed_concept “Denuded skin” (disorder))
    (clinical_finding (snomed_concept "Jaundice" "finding"))
		(clinical_finding ( snomed_concept “Generally unwell” (finding))
		(clinical_finding ( snomed_concept “Malaise” (finding))
		(clinical_finding ( snomed_concept “Fatigue” (finding))
		(clinical_finding ( snomed_concept “Generalized aches and pains” (finding))
		(clinical_finding ( snomed_concept “Generalized pruritus” (finding))
		(clinical_finding ( snomed_concept “Generalized rash” (disorder))
		(clinical_finding ( snomed_concept “Wheezing” (finding))
		(clinical_finding (snomed_concept “Dizziness” (finding)) 
		(clinical_finding ( snomed_concept “Collapse” (finding))
		(clinical_finding ( snomed_concept “Exposure to” (contextual qualifier) “Substance” (substance) (qualifier value) “Possible” (qualifier value) “Allergen” (attribute))
		(clinical_finding (snomed_concept “Purpuric rash” (disorder))
		(clinical_finding (snomed_concept “Erythematous rash” (disorder))
		(clinical_finding (snomed_concept “Stiff neck” (finding))
		(clinical_finding (snomed_concept “Drowsy” (finding))
		(clinical_finding (snomed_concept “Clouded consciousness” (finding))
		(clinical_finding (snomed_concept “Headache” (finding))
		(clinical_finding (snomed_concept “Generalized rash” (disorder) “In” (attribute) month) 3 “Medication commenced” (situation))
		(clinical_finding (snomed_concept “Eruption of skin” (disorder)) 
				(snomed_concept “Mouth region structure” (body structure) “Involved” (qualifier value))
				(snomed_concept “Structure of both eyes” (body structure) “Involved” (qualifier value))
				(snomed_concept “Genital structure” (body structure)  “Involved” (qualifier value))
		)
	)
)
;; Page 73 - Drug rash
"Serious drug reaction likely"
(system_diagnosis_rule
  "Diagnose probable serious drug reaction"
  (diagnosis
    (snomed_concept "Adverse reaction caused by drug” (disorder) “Serious” (qualifier value))
    probable
  )
  adult
  (and
      (clinical_finding (snomed_concept “Generalized rash” (disorder) “In” (attribute) month) 3 “Medication commenced” (situation))		
			(clinical_finding (snomed_concept "Facial swelling” (finding))
      (clinical_finding (snomed_concept "Tongue swelling” (finding))
      (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
      (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
(<measurement (snomed_concept “Diastolic blood pressure” (observable entity) mmHg) 60))
      (clinical_finding (snomed_concept "Abdominal pain" "finding"))
      (clinical_finding (snomed_concept "Vomiting” (disorder))
			(clinical_finding (snomed_concept “Diarrhea” (finding))
			(clinical_finding (snomed_concept “Eruption of skin” (disorder)) 
					(snomed_concept “Mouth region structure” (body structure) “Involved” (qualifier value))
					(snomed_concept “Structure of both eyes” (body structure) “Involved” (qualifier value))
					(snomed_concept “Genital structure” (body structure)  “Involved” (qualifier value))
      (clinical_finding (snomed_concept "Blister” (morphologic abnormality))
			(clinical_finding (snomed_concept “Peeling of skin” (finding))
			(clinical_finding (snomed_concept “Denuded skin” (disorder))
      (clinical_finding (snomed_concept "Jaundice" "finding"))
    )
)
;; Page 73 - Drug rash
"Anaphylaxis likely"
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
		(< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
		(< (measurement (snomed_concept “Diastolic blood pressure” (observable entity) mmHg) 60))
		(>= (measurement (snomed_concept “Body temperature” (observable entity) °C) 38))
		(clinical_finding (snomed_concept “Dizziness” (finding)) 		
		(clinical_finding ( snomed_concept “Collapse” (finding))
		(clinical_finding ( snomed_concept “Abdominal pain” (finding))
		(clinical_finding ( snomed_concept “Vomiting” (disorder))
		(clinical_finding ( snomed_concept “Exposure to” (contextual qualifier) “Substance” (substance) (qualifier value) “Possible” (qualifier value) “Allergen” (attribute))
	)
)
;; Page 73 - Drug rash
"Meningococcal disease likely"
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
;; Page 73 - Drug rash
"Drug reaction likely"
(system_diagnosis_rule
  "Diagnose probable drug reaction"
  (diagnosis
    (snomed_concept "Adverse reaction caused by drug” (disorder))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Generalized rash” (disorder))
		(clinical_finding (snomed_concept “Erythematous rash” (disorder))
		(clinical_finding (snomed_concept “Trunk structure” (body structure) “Involved” (qualifier value))
		(clinical_finding (snomed_concept “Upper limb structure” (body structure) “Involved” (qualifier value))
		(clinical_finding (snomed_concept “Lower limb structure” (body structure) “Involved” (qualifier value))
		(clinical_finding (snomed_concept “Appearances” (qualifier value) “After” (attribute) “Medication commenced” (situation) “In” (attribute) month) 3))
	)
)
;; Page 73 - Drug rash
"Drug rash non urgent likely"
(system_diagnosis_rule
  "Diagnose probable drug rash non urgent"
  (diagnosis
	(consult
	(referral 
    (snomed_concept "Eruption caused by drug" "disorder") "Non-urgent” (qualifier value))
		(snomed_concept "Consultation" (procedure)) or
		(snomed_concept "Patient referral" (procedure))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Medication commenced” (situation) “In the past” (qualifier value) month) 3))
		(clinical_finding (snomed_concept “Anticonvulsant” (substance))
		(clinical_finding (snomed_concept “Highly active antiretroviral therapy” (procedure))
		(clinical_finding (snomed_concept “Antituberculosis agent” (substance))
		(clinical_finding (snomed_concept “Trimethoprim” (substance)/ “Sulfamethoxazole” (substance))
		(clinical_finding (snomed_concept “Administration of prophylactic antituberculosis agent” (procedure))
	)
)
;; Page 73 - Drug rash
"Fixed drug eruption likely"
(system_diagnosis_rule
  "Diagnose probable fixed drug eruption"
  (diagnosis
    (snomed_concept "Fixed drug eruption” (disorder))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Plaque” (morphologic abnormality) Initial (qualifier value) After” (attribute) “Medication given” (situation))
				(snomed_concept “Itching” (finding))
				(snomed_concept “Along edge” (qualifier value)) 
				(snomed_concept “Red color” (qualifier value))
(clinical_finding (snomed_concept “Macule” (morphologic abnormality))
				(snomed_concept “Dark” (qualifier value)) 
				(snomed_concept “Round shape” (qualifier value))
				(snomed_concept“Nonspecific site” (body structure))
		)
  )
)
;; Page 73 – Drug rash
(system_priority_evaluation
“Urgent drug rash symptoms”
	adult
	Urgent
	(and
		(clinical_finding ( snomed_concept “Eruption caused by drug” (disorder))
	(or
			(clinical_finding ( snomed_concept “Facial swelling” (finding)) or
			(clinical_finding ( snomed_concept “Tongue swelling” (finding))
			)
			(clinical_finding (snomed_concept “Difficulty breathing” (finding))
			)
			(< (measurement (snomed_concept “Systolic blood pressure” (observable entity) mmHg) 90))
			(< (measurement (snomed_concept “Diastolic blood pressure” (observable entity) mmHg) 60))
			)
			(>= (measurement (snomed_concept “Body temperature” (observable entity) °C) 38))
			)
			(clinical_finding ( snomed_concept “Abdominal pain” (finding))
			)
			(clinical_finding ( snomed_concept “Vomiting” (disorder)) or
			(clinical_finding ( snomed_concept “Diarrhea” (finding))
			)
			(clinical_finding (snomed_concept “Eruption of skin” (disorder)) 
					(snomed_concept “Mouth region structure” (body structure) “Involved” (qualifier value))
					(snomed_concept “Structure of both eyes” (body structure) “Involved” (qualifier value))
					(snomed_concept “Genital structure” (body structure)  “Involved” (qualifier value))
			)
			(clinical_finding ( snomed_concept “Blister” (morphologic abnormality)) or
			(clinical_finding ( snomed_concept “Peeling of skin” (finding))
			(clinical_finding ( snomed_concept “Denuded skin” (disorder))
			)
			(clinical_finding ( snomed_concept “Jaundice” (finding))
			)
			(clinical_finding ( snomed_concept “Generally unwell” (finding))
			(clinical_finding ( snomed_concept “Malaise” (finding))
			(clinical_finding ( snomed_concept “Fatigue” (finding))
			(clinical_finding ( snomed_concept “Generalized aches and pains” (finding))
			(>=measurement ( snomed_concept “Alanine transaminase in serum” (observable entity) U/L) 120))
			)
			(clinical_finding ( snomed_concept “Anaphylaxis” (disorder))
			(clinical_finding ( snomed_concept “Generalized pruritus” (finding))
			(clinical_finding ( snomed_concept “Generalized rash” (disorder))
			(clinical_finding ( snomed_concept “ Facial swelling” (finding))
			(clinical_finding ( snomed_concept “Tongue swelling” (finding))
			(clinical_finding ( snomed_concept “Wheezing” (finding))
			(clinical_finding (snomed_concept “Difficulty breathing” (finding))
			(< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
			(< (measurement (snomed_concept “Diastolic blood pressure” (observable entity) mmHg) 60))
			(>= (measurement (snomed_concept “Body temperature” (observable entity) °C) 38))
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
			(< (measurement (snomed_concept “Systolic blood pressure” (observable entity) mmHg) 90))
			(< (measurement (snomed_concept “Diastolic blood pressure” (observable entity) mmHg) 60))
			(>= (measurement (snomed_concept “Body temperature” (observable entity) °C) 38))
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

;; Page 78 - Crusts or Flaky Skin
(task
  "Check for urgent skin conditions with crusts or flaky skin"
  adult
	  (clinical_finding (snomed_concept "Crust" "morphologic abnormality"))
		(clinical_finding ( snomed_concept “Peeling of skin” (finding))
  (check_for
		(clinical_finding ( snomed_concept “Generalized pruritus” (finding))
		(clinical_finding ( snomed_concept “Generalized rash” (disorder))
		(clinical_finding ( snomed_concept “ Facial swelling” (finding))
		(clinical_finding ( snomed_concept “Tongue swelling” (finding))
		(clinical_finding ( snomed_concept “Wheezing” (finding))
		(clinical_finding (snomed_concept “Difficulty breathing” (finding))
		(clinical_finding (snomed_concept “Dizziness” (finding)) 
		(clinical_finding ( snomed_concept “Collapse” (finding))
		(clinical_finding ( snomed_concept “Vomiting” (disorder))
		(clinical_finding ( snomed_concept “Exposure to” (contextual qualifier) “Substance” (substance) (qualifier value) “Possible” (qualifier value) “Allergen” (attribute))
    (clinical_finding (snomed_concept "Purpuric rash" "disorder"))
		(clinical_finding (snomed_concept “Erythematous rash” (disorder))
    (clinical_finding (snomed_concept "Stiff neck" "finding"))
    (clinical_finding (snomed_concept "Drowsy" "finding"))
    (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
    (clinical_finding (snomed_concept "Headache" "finding"))
		(clinical_finding (snomed_concept “Generalized rash” (disorder) “In” (attribute) month) 3 “Medication commenced” (situation))
		(clinical_finding (snomed_concept “Diarrhea” (finding))
    (clinical_finding (snomed_concept "Jaundice" "finding"))
    (clinical_finding (snomed_concept "Blister" "morphologic abnormality"))
    (clinical_finding (snomed_concept "Abdominal pain" "finding"))
    (clinical_finding (snomed_concept “Eruption of skin” (disorder)) 
				(snomed_concept “Mouth region structure” (body structure) “Involved” (qualifier value))
				(snomed_concept “Structure of both eyes” (body structure) “Involved” (qualifier value))
				(snomed_concept “Genital structure” (body structure)  “Involved” (qualifier value))
    (clinical_finding (snomed_concept "Peeling of skin" "finding"))
		(clinical_finding (snomed_concept “Denuded skin” (disorder))
  )
)
;;Page 78– Crusts or flaky skin
(system_priority_evaluation
  "Urgent crusts or flaky skin conditions”
  adult
  Urgent
  (and
    (clinical_finding ( snomed_concept “Crust” (morphologic abnormality))
		(clinical_finding ( snomed_concept “Peeling of skin” (finding))
   (or
		(clinical_finding ( snomed_concept “Anaphylaxis” (disorder))
		(clinical_finding ( snomed_concept “Generalized pruritus” (finding))
		(clinical_finding ( snomed_concept “Generalized rash” (disorder))
		(clinical_finding ( snomed_concept “ Facial swelling” (finding))
		(clinical_finding ( snomed_concept “Tongue swelling” (finding))
		(clinical_finding ( snomed_concept “Wheezing” (finding))
		(clinical_finding (snomed_concept “Difficulty breathing” (finding))
		(< (measurement (snomed_concept “Systolic blood pressure” (observable entity) mmHg) 90))
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
		(>= (measurement (snomed_concept “Body temperature” (observable entity) °C) 38))
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
;; Page 78 - Crusts or Flaky Skin
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
		(< (measurement (snomed_concept “Systolic blood pressure” (observable entity) mmHg) 90))
		(< (measurement (snomed_concept “Diastolic blood pressure” (observable entity) mmHg) 60))
		(>= (measurement (snomed_concept “Body temperature” (observable entity) °C) 38))
		(clinical_finding (snomed_concept “Dizziness” (finding)) 
		(clinical_finding ( snomed_concept “Collapse” (finding))
		(clinical_finding ( snomed_concept “Abdominal pain” (finding))
		(clinical_finding ( snomed_concept “Vomiting” (disorder))
		(clinical_finding ( snomed_concept “Exposure to” (contextual qualifier) “Substance” (substance) (qualifier value) “Possible” (qualifier value) “Allergen” (attribute))
	)
)
;; Page 78 - Crusts or Flaky Skin
“Meningococcal disease”
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
		(>= (measurement (snomed_concept “Body temperature” (observable entity) °C) 38))
		(clinical_finding (snomed_concept “Headache” (finding))
	)
)
;; Page 78 - Crusts or Flaky Skin
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
;; Page 78 - Crusts or Flaky Skin
“Impetigo likely”
(system_diagnosis_rule
  "Diagnose probable impetigo"
  (diagnosis
    (snomed_concept “Impetigo” (disorder))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Blister” (morphologic abnormality))
		(clinical_finding (snomed_concept “Crusted” (qualifier value) “Yellow color” (qualifier value)) 
				(snomed_concept “Skin structure of perioral region of face” (body structure)) or 
				(snomed_concept “Perinasal skin structure” (body structure))
		(clinical_finding (snomed_concept “Early complication” (finding) “Insect bite - wound” (disorder))
		(clinical_finding (snomed_concept “Early complication” (finding) “Infestation caused by Sarcoptes scabiei var hominis” (disorder))
		(clinical_finding (snomed_concept “Early complication” (finding) “Injury to skin caused by trauma” (disorder))
	)
;; Page 78 - Crusts or Flaky Skin
“Impetigo likely”
(system_diagnosis_rule
  "Diagnose probable impetigo"
  (diagnosis
	(referral 
    (snomed_concept “Impetigo” (disorder))
    (snomed_concept “Patient referral” (procedure)
  )
  adult
  (and
		(clinical_finding (snomed_concept “Patient condition unchanged” (finding) “After” (attribute) “Antibiotic therapy” (procedure) “Drug course completed” (situation) “Second” (qualifier value))
		(clinical_finding (snomed_concept “Blood in urine” (finding))
		(clinical_finding (snomed_concept “Urine blood test = +” (finding))
		(clinical_finding (snomed_concept “Urine blood test = ++” (finding))
		(clinical_finding (snomed_concept “Urine blood test = +++” (finding))
		(clinical_finding (snomed_concept “Oliguria” (finding))
		(clinical_finding (snomed_concept “Anuria” (finding))
		(clinical_finding (snomed_concept “Facial swelling” (finding))
		(clinical_finding (snomed_concept “Swelling of limb” (finding))
	)
)
;; Page 78 - Crusts or Flaky Skin
“Seborrheic dermatitis likely”
(system_diagnosis_rule
  "Diagnose probable seborrheic dermatitis"
  (diagnosis
    (snomed_concept “Seborrheic dermatitis” (disorder))
   probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Plaque” (morphologic abnormality) “Red color” (qualifier value) or “Pink color” (qualifier value))
		(clinical_finding (snomed_concept “Scaly skin” (finding) “Fine” (qualifier value))
		(clinical_finding (snomed_concept “Greasy skin” (finding))
		(clinical_finding (snomed_concept “Scalp structure” (body structure) “Involved” (qualifier value))
		(clinical_finding (snomed_concept “Structure of glabella” (body structure) “Involved” (qualifier value))
		(clinical_finding (snomed_concept “Nasolabial sulcus structure” (body structure) “Involved” (qualifier value))
		(clinical_finding (snomed_concept “Postauricular region structure” (body structure) “Involved” (qualifier value))
		(clinical_finding (snomed_concept “Axillary region structure” (body structure) “Involved” (qualifier value))
		(clinical_finding (snomed_concept “Inguinal region structure” (body structure) “Involved” (qualifier value))
		(clinical_finding (snomed_concept “Structure of inframammary region” (body structure) “Involved” (qualifier value))
	)
)
;; Page 78 - Crusts or Flaky Skin
“Psoriasis likely”
(system_diagnosis_rule
  "Diagnose probable psoriasis"
  (diagnosis
	(referral 
    (snomed_concept “Psoriasis” (disorder))
		(snomed_concept “Patient referral” (procedure) or
		(snomed_concept “Patient referral to specialist” (procedure))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Confirmation of” (contextual qualifier) (qualifier value) “Diagnosis” (observable entity))
		(clinical_finding (snomed_concept “Plaque” (morphologic abnormality) “Well defined” (qualifier value))
		(clinical_finding (snomed_concept “Plaque” (morphologic abnormality) “Raised” (qualifier value))
		(clinical_finding (snomed_concept “Scaly skin” (finding) “Silver color” (qualifier value))
		(clinical_finding (snomed_concept “Knee region structure” (body structure) “Involved” (qualifier value))
		(clinical_finding (snomed_concept “Elbow region structure” (body structure) “Involved” (qualifier value))
		(clinical_finding (snomed_concept “Structure of back of abdominopelvic segment of trunk” (body structure) “Involved” (qualifier value))
		(clinical_finding (snomed_concept “Scalp structure” (body structure) “Involved” (qualifier value))
		(clinical_finding (snomed_concept “Pitting of nails” (disorder))
	)
)
;; Page 78 - Crusts or Flaky Skin
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
)
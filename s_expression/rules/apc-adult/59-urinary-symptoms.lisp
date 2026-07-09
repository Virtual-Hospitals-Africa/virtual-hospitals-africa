;; Page 59 - Urinary Symptoms
(task
  "Check for urgent urinary symptom conditions"
  adult
  (clinical_finding (snomed_concept "Urinary system finding" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Unable to void urine" "finding"))
    (clinical_finding (snomed_concept "Abdominal discomfort" "finding") (finding_site (snomed_concept "Lower abdomen structure" "body structure")))
    (clinical_finding (snomed_concept "Distension of abdomen" "finding") (finding_site (snomed_concept "Lower abdomen structure" "body structure")))
    (clinical_finding (snomed_concept "Left flank pain" "finding") (qualifier (snomed_concept "Sudden" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Right flank pain" "finding") (qualifier (snomed_concept "Sudden" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Blood in urine" "finding"))
    (clinical_finding (snomed_concept "Oliguria" "finding"))
    (clinical_finding (snomed_concept "“Facial swelling” (finding) (snomed_concept "New" "qualifier value")))
    (clinical_finding (snomed_concept "Swelling of bilateral feet" "finding") (qualifier (snomed_concept "New" "qualifier value")))
    (clinical_finding (snomed_concept "Proteinuria" "finding"))
    (clinical_finding (snomed_concept "Left inguinal pain" "finding") (qualifier (snomed_concept "Sudden" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Right inguinal pain" "finding") (qualifier (snomed_concept "Sudden" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Leukocytes in urine" "finding")“Urine dipstick test” (procedure))
    (clinical_finding (snomed_concept "Nitrite detected in urine" "finding")“Urine dipstick test” (procedure))
    (clinical_finding (snomed_concept "Vomiting” (disorder)
    (clinical_finding (snomed_concept "Diabetes mellitus" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
    (clinical_finding (snomed_concept "Pregnancy" "finding"))
    (clinical_finding (snomed_concept "Postmenopausal state" "finding"))
    (clinical_finding (snomed_concept "Flank pain" "finding") "Unilateral" "qualifier value"))
		)
  )
)
;; Page 59 - Urinary Symptoms
"Kidney disease likely"
(system_diagnosis_rule
  "Diagnose probable kidney disease"
  (diagnosis
    (snomed_concept "Kidney disease" "disorder")
    probable 
  )
  adult
  (and
		(clinical_finding (snomed_concept “Blood in urine” (finding))
		(clinical_finding (snomed_concept “Proteinuria” (finding))
		(clinical_finding (snomed_concept “Facial swelling” (finding) “New” (qualifier value))
		(clinical_finding (snomed_concept “Swelling of bilateral feet” (finding) New (qualifier value))
		(>=measurement (snomed_concept “Systolic blood pressure” (observable entity) mmHg) 140))
		(>=measurement (snomed_concept “Diastolic blood pressure” (observable entity) mmHg) 90))
		(clinical_finding (snomed_concept “Oliguria” (finding))
	)
)
;; Page 59 - Urinary Symptoms
"Kidney stone likely"
(system_diagnosis_rule
  "Diagnose probable kidney stone"
  (diagnosis
    (snomed_concept "Kidney stone" "disorder")
    probable 
  )
  adult
  (and
    (clinical_finding (snomed_concept "Blood in urine" "finding"))
    (clinical_finding (snomed_concept "Flank pain" "finding") (qualifier (snomed_concept "Sudden" "qualifier value")) (qualifier (snomed_concept"Unilateral" "qualifier value"))(snomed_concept “Severe” (severity modifier) (qualifier value))
    (clinical_finding (snomed_concept "Inguinal pain" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept"Unilateral" "qualifier value"))(snomed_concept “Severe” (severity modifier) (qualifier value))
	)
)
;; Page 59 - Urinary Symptoms
"Complicated pyelonephritis likely"
(system_diagnosis_rule
  "Diagnose possible complicated pyelonephritis"
  (diagnosis
    (snomed_concept “Pyelonephritis” (disorder) “Complicated” (qualifier value))
    probable 
  )
  adult
  (and
    (clinical_finding (snomed_concept “Micturition finding” (finding))				
		(clinical_finding (snomed_concept "Pain in flank" "finding"))
		(clinical_finding (snomed_concept “Leukocytes in urine” (finding))
		(clinical_finding (snomed_concept “Nitrite detected in urine” (finding))
    (clinical_finding (snomed_concept "Vomiting” (disorder))     
		(>= (measurement (snomed_concept "Heart rate" "observable entity") bpm) 100)
    (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
		(< (measurement (snomed_concept “Diastolic blood pressure” (observable entity) mmHg) 60))
		(clinical_finding (snomed_concept “Diabetes mellitus” (disorder))
		(clinical_finding (snomed_concept “Male” (finding))
		(clinical_finding (snomed_concept “Pregnancy” (finding))
		(clinical_finding (snomed_concept “Postmenopausal state” (finding))
	)
)
;; Page 59 - Urinary Symptoms
"Uncomplicated pyelonephritis likely"
(system_diagnosis_rule
  "Diagnose probable uncomplicated pyelonephritis"
  (diagnosis
    (snomed_concept “Pyelonephritis” (disorder) “Uncomplicated” (qualifier value))
    probable 
  )
  adult
  (and
		(clinical_finding (snomed_concept “Pain in flank” (finding))
		(clinical_finding (snomed_concept “Leukocytes in urine” (finding))
		(clinical_finding (snomed_concept “Nitrite detected in urine” (finding))
	)
)
;; Page 59 - Urinary Symptoms
"Simple UTI or Urinary tract infection likely"
(system_diagnosis_rule
  "Diagnose probable Simple UTI or Urinary tract infection"
  (diagnosis
    (snomed_concept “Urinary tract infectious disease” (disorder) “Simple” (qualifier value))
    probable 
  )
  adult
  (and
		(snomed_concept “Woman” (person))
		(clinical_finding (snomed_concept “Urine leukocytes not detected” (finding))
		(clinical_finding (snomed_concept “Nitrite not detected in urine” (finding))
		(clinical_finding (snomed_concept “Diabetes mellitus” (disorder))
		(clinical_finding (snomed_concept “Pregnancy” (finding))
		(clinical_finding (snomed_concept “Scalding pain on urination” (finding))
		(clinical_finding (snomed_concept “Increased frequency of urination” (finding))
		(clinical_finding (snomed_concept “Urgent desire to urinate” (finding))
	)
)
;; Page 59 - Urinary Symptoms
"Complicated UTI or Urinary tract infection likely"
(system_diagnosis_rule
  "Diagnose probable Complicated UTI or Urinary tract infection"
  (diagnosis
    (snomed_concept “Urinary tract infectious disease” (disorder) “Complicated” (qualifier value))
    probable 
  )
  adult
  (and
		(clinical_finding (snomed_concept “Leukocytes in urine” (finding))
		(clinical_finding (snomed_concept “Nitrite detected in urine” (finding))
		(clinical_finding (snomed_concept “Urinary catheter in situ” (finding))
		(clinical_finding (snomed_concept “Diabetes mellitus” (disorder))
		(clinical_finding (snomed_concept “Finding of urinary tract proper” (finding))
		(clinical_finding (snomed_concept “Scalding pain on urination” (finding))
		(clinical_finding (snomed_concept “Increased frequency of urination” (finding))
		(clinical_finding (snomed_concept “Urgent desire to urinate” (finding))
	)
)
;; Page 59 - Urinary Symptoms
"Male urethritis syndrome likely"
(system_diagnosis_rule
  "Diagnose probable male urethritis syndrome"
  (diagnosis
    (snomed_concept "Urethritis” (disorder))
    probable 
  )
  adult
  (and
		(snomed_concept “Man” (person))
		(clinical_finding (snomed_concept “Urethral discharge” (finding))
		(clinical_finding (snomed_concept “Leukocytes in urine” (finding))
		(clinical_finding (snomed_concept “Nitrite detected in urine” (finding))
		(clinical_finding (snomed_concept “Increased frequency of urination” (finding) “No” (qualifier value))
		(clinical_finding (snomed_concept “Urgent desire to urinate” (finding) “No” (qualifier value))
	)
)
;; Page 59 - Urinary Symptoms
"Acute prostatis likely"
(system_diagnosis_rule
  "Diagnose probable Acute prostatis"
  (diagnosis
    (snomed_concept “Acute prostatitis” (disorder))
    probable 
  )
  adult
  (and
		(snomed_concept “Man” (person))
		(clinical_finding (snomed_concept “Fever” (finding))
		(clinical_finding (snomed_concept “Perineal pain” (finding))
		(clinical_finding (snomed_concept “Generalized aches and pains” (finding))
		(clinical_finding (snomed_concept “Tenderness of prostate” (finding) “Rectal examination” (procedure))
		(clinical_finding (snomed_concept “Scalding pain on urination” (finding))
		(clinical_finding (snomed_concept “Increased frequency of urination” (finding))
		(clinical_finding (snomed_concept “Urgent desire to urinate” (finding))
		(clinical_finding (snomed_concept “Leukocytes in urine” (finding))
		(clinical_finding (snomed_concept “Nitrite detected in urine” (finding))
	)
;; Page 59 - Urinary Symptoms
"Acute prostatis likely"
(system_diagnosis_rule
  "Diagnose probable Acute prostatis"
  (diagnosis
	(referral 
    (snomed_concept “Acute prostatitis” (disorder))
		(snomed_concept “Patient referral (procedure)
  )
  adult
  (and
		(>=measurement (snomed_concept “Body temperature” (observable entity) °C) 38))
		(clinical_finding (snomed_concept “Difficulty passing urine” (finding))
		(clinical_finding (snomed_concept “Recurrent episode” (qualifier value))
		(clinical_finding (snomed_concept “Patient condition unchanged” (finding) “After” (attribute) day) 2))
		(clinical_finding (snomed_concept “Blood in urine” (finding) “Continual” (qualifier value))
	)
)
;; Page 59 - Urinary Symptoms
"Schistosomiasis likely"
(system_diagnosis_rule
  "Diagnose probable Schistosomiasis"
  (diagnosis
    (snomed_concept (snomed_concept “Infection caused by Schistosoma” (disorder))
    probable 
  )
  adult
  (and
		(clinical_finding (snomed_concept “Schistosoma” (organism) “Detected” (qualifier value))
		(clinical_finding (snomed_concept “Antibody to Schistosoma” (substance) “Positive” (qualifier value))
		(clinical_finding (snomed_concept “Scalding pain on urination” (finding) “No” (qualifier value))
		(clinical_finding (snomed_concept “Increased frequency of urination” (finding) “No” (qualifier value)
		(clinical_finding (snomed_concept “Urgent desire to urinate” (finding) “No” (qualifier value))
		(clinical_finding (snomed_concept “Leukocytes in urine” (finding) “No” (qualifier value))
		(clinical_finding (snomed_concept “Nitrite detected in urine” (finding) “No”’(qualifier value)
		(clinical_finding (snomed_concept “Risk of” (contextual qualifier) (qualifier value) “Infection caused by Schistosoma” (disorder))
			(clinical_finding (snomed_concept “Does wash laundry” (finding)) or
			(clinical_finding (snomed_concept “Does swim” (finding))
				(snomed_concept “Lake”(environment))
				(snomed_concept “River” (environment))
				(snomed_concept “Inland water” (environment))
				(snomed_concept “Stream” (environment))
			(snomed_concept “Geographical location" (property) (qualifier value) “Endemic disease” (finding) (Limpopo, North West, Mpumalanga, KwaZulu-Natal and parts of Eastern Cape))
	)
;; Page 59 - Urinary Symptoms
"Schistosomiasis likely"
(system_diagnosis_rule
  "Diagnose probable Schistosomiasis"
  (diagnosis
	(referral 
    (snomed_concept (snomed_concept “Infection caused by Schistosoma” (disorder))
		(snomed_concept “Patient referral” (procedure) “In” (attribute) hour) 24) or as scheduled
  )
  adult
  (and
		(snomed_concept “Patient referral” (procedure) “In” (attribute) hour) 24))
		(clinical_finding (snomed_concept “Fever” (finding))
		(clinical_finding (snomed_concept “Cough” (finding))
		(clinical_finding (snomed_concept “Headache” (finding))
		(clinical_finding (snomed_concept “Urticaria” (disorder))
		)
		(snomed_concept “Patient referral” (procedure))
		(clinical_finding (snomed_concept “Facial swelling” (finding))
		(clinical_finding (snomed_concept “Swelling of bilateral feet” (finding))
		(>=(clinical_finding (snomed_concept “Blood in urine” (finding) “Continual” (qualifier value) month) 2) “After” (attribute) “Treatment given” (situation))
	)
)
 ;; Page 59 - Urinary Symptoms
"Flow problem likely"
(system_diagnosis_rule
  "Diagnose probable flow problem"
  (diagnosis
    (snomed_concept "Finding of flow of urine” (finding))
    probable 
  )
  adult
  (and
		(clinical_finding (snomed_concept “Urinary incontinence” (finding))
		(clinical_finding (snomed_concept “Atrophy of vagina” (disorder))
		(clinical_finding (snomed_concept “Constipation” (finding))
	)
;; Page 59 - Urinary Symptoms
"Flow problem likely"
(system_diagnosis_rule
  "Diagnose probable flow problem"
  (diagnosis
	(consult
    (snomed_concept "Finding of flow of urine” (finding))
    (snomed_concept “Consultation” (procedure))
  )
  adult
  (and
(clinical_finding (snomed_concept “Review of medication” (procedure))
(clinical_finding (snomed_concept “Furosemide” (substance))
	)
;; Page 59 - Urinary Symptoms
"Flow problem likely"
(system_diagnosis_rule
  "Diagnose probable flow problem"
  (diagnosis
	(referral 
    (snomed_concept "Finding of flow of urine” (finding))
		(snomed_concept “Patient referral” (procedure))
		(snomed_concept “Referral to doctor” (procedure)) 
	)
  adult
  (and
		(clinical_finding (snomed_concept “Prolapse of female genital organs” (disorder))
		(clinical_finding (snomed_concept “Patient condition unchanged” (finding))
	)
)
;; Page 59 - Urinary Symptoms
"Poor stream likely"
(system_diagnosis_rule
  "Diagnose probable poor stream"
  (diagnosis
    (snomed_concept “Poor stream of urine” (finding))
    probable 
  )
  adult
  (and
(clinical_finding (snomed_concept “Difficulty passing urine” (finding))
	)
;; Page 59 - Urinary Symptoms
"Poor stream likely"
(system_diagnosis_rule
  "Diagnose probable poor stream"
  (diagnosis
	(consult 
	(referral
    (snomed_concept “Poor stream of urine” (finding))
		(snomed_concept “Consultation” (procedure))
		(snomed_concept “Patient referral” (procedure))
		(snomed_concept “Referral to doctor” (procedure))
  )
  adult
  (and
		(clinical_finding (snomed_concept “Review of medication” (procedure))
		(clinical_finding (snomed_concept “Amitriptyline” (substance))
		)
  )
)
;; Page 59 - Urinary Symptoms
(system_priority_evaluation
  "Urgent urinary symptoms"
  adult
	(clinical_finding (snomed_concept "Urinary system finding" "finding"))
  Urgent
  (and
    (clinical_finding (snomed_concept "Unable to void urine" "finding"))
		(clinical_finding ( snomed_concept “Abdominal discomfort” (finding) Lower abdomen structure (body structure))
		or
		(clinical_finding ( snomed_concept “Distension of abdomen” (finding) Lower abdomen structure (body structure))
		)
    (clinical_finding (snomed_concept “Kidney stone” (disorder))
		(clinical_finding ( snomed_concept “Blood in urine” (finding))
		(clinical_finding ( snomed_concept “Left flank pain” (finding) Sudden (qualifier value) Severe (severity modifier) (qualifier value))
		(clinical_finding ( snomed_concept “Right flank pain” (finding) Sudden (qualifier value) Severe (severity modifier) (qualifier value))
		(clinical_finding ( snomed_concept “Left inguinal pain” (finding) Sudden (qualifier value) Severe (severity modifier) (qualifier value))
		(clinical_finding ( snomed_concept “Right inguinal pain” (finding) Sudden (qualifier value) Severe (severity modifier) (qualifier value))
		)      
		(clinical_finding (snomed_concept “Pyelonephritis” (disorder) “Complicated” (qualifier value))
		(clinical_finding ( snomed_concept “Left flank pain” (finding)) 
		(clinical_finding ( snomed_concept “Right flank pain” (finding))
		(clinical_finding ( snomed_concept “Leukocytes in urine” (finding) “Urine dipstick test” (procedure))
		or
		(clinical_finding ( snomed_concept “Nitrite detected in urine” (finding) “Urine dipstick test” (procedure))
		(clinical_finding ( snomed_concept “Vomiting” (disorder)
		(<measurement (snomed_concept “Systolic blood pressure” (observable entity) mmHg) 90))
		(<measurement (snomed_concept “Diastolic blood pressure” (observable entity) mmHg) 60))
		(>=measurement (snomed_concept “Heart rate” (observable entity) bpm) 100))
		(clinical_finding (snomed_concept “Diabetes mellitus” (disorder))
		(clinical_finding (snomed_concept “Male” (finding))
		(clinical_finding ( snomed_concept “Pregnancy” (finding)
		(clinical_finding ( snomed_concept “Postmenopausal state” (finding)
		)
		(clinical_finding (snomed_concept “Kidney disease” (disorder))
		(clinical_finding ( snomed_concept “Blood in urine” (finding))
		or
		(clinical_finding ( snomed_concept “Proteinuria” (finding))
		(clinical_finding ( snomed_concept “Facial swelling” (finding) New (qualifier value))
		or
		(clinical_finding ( snomed_concept “Swelling of bilateral feet” (finding) New (qualifier value))     
	  (>= (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 140)     
	  (>= (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 90)
		(clinical_finding ( snomed_concept “Oliguria” (finding))
    )
  )
)

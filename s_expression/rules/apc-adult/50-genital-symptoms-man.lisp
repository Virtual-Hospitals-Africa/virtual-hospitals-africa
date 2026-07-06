;; Page 50 - Genital Symptoms in Man
(task
  "Check for urgent genital symptoms in a man"
  adult
  (or
    (clinical_finding (snomed_concept "Male genitalia finding" "finding"))
  )
  (check_for
    (clinical_finding (snomed_concept "Pain in scrotum" "finding"))
    (clinical_finding (snomed_concept "Swelling of scrotum" "finding"))
    (clinical_finding (snomed_concept "Severe pain" "finding") (qualifier (snomed_concept "Sudden" "qualifier value")))
    (clinical_finding (snomed_concept "Retractile testis" "disorder"))
    (clinical_finding (snomed_concept "Torsion of testis" "disorder"))
    (clinical_finding (snomed_concept "Traumatic injury" "disorder") "Before" (attribute))
(clinical_finding ( snomed_concept “Increased physical activity” (finding) "Before" (attribute))
    (clinical_finding (snomed_concept "Tightly retracted foreskin" "finding"))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Glans penis structure" "body structure")))
    (clinical_finding (snomed_concept "Excruciating pain" (finding) "Glans penis structure" (body structure))
    (> (timestamp (clinical_finding (snomed_concept “Prolonged erection of penis” (finding))
        (time_ago 4 hours))
		)
  )
)
;;Page 50 - Genital symptoms in man
(system_priority_evaluation
“Urgent genital symptoms in a man”
adult
(clinical_finding ( snomed_concept “Male genitalia’ finding (finding))
  Urgent
  (and
		(clinical_finding (snomed_concept “Torsion of testis” (disorder))
		(clinical_finding ( snomed_concept “Pain in scrotum” (finding))
		(clinical_finding ( snomed_concept “Swelling of scrotum” (finding))
		(clinical_finding ( snomed_concept “Severe pain” (finding) Sudden 		(qualifier value))
		(clinical_finding ( snomed_concept “Retractile testis” (disorder))
		(clinical_finding ( snomed_concept “Traumatic injury” (disorder) Before (attribute))
		(clinical_finding ( snomed_concept “Increased physical activity” (finding) Before (attribute))
		)
		(clinical_finding (snomed_concept “Paraphimosis” (disorder))
		(clinical_finding ( snomed_concept “Tightly retracted foreskin” (finding) With (attribute) Swelling (finding) Glans penis structure (body structure))
		(clinical_finding ( snomed_concept “Tightly retracted foreskin” (finding) With (attribute) Excruciating pain (finding) Glans penis structure (body structure))
		)
		(clinical_finding (snomed_concept “Priapism” (disorder))
		(clinical_finding ( snomed_concept “Prolonged erection of penis” (finding) hour (qualifier value) 4))
		)
	)
)
;; Page 50 - Genital symptoms (man)
"Testicular torsion likely"
(system_diagnosis_rule
  "Diagnose probable torsion of testis"
  (diagnosis
	(urgent_referral
    (snomed_concept "Torsion of testis" "disorder")
		(snomed_concept “Urgent referral” (procedure))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Pain in scrotum” (finding))
    (clinical_finding (snomed_concept "Swelling of scrotum" "finding"))		
		(clinical_finding (snomed_concept “Severe pain” (finding) “Sudden” (qualifier value))
		(clinical_finding (snomed_concept “Testicle out of place” (finding))
		(clinical_finding (snomed_concept “Testis structure” (body structure) “Rotated” (qualifier value))
		(clinical_finding (snomed_concept “Traumatic event” (event) “Before” (attribute))
		(clinical_finding (snomed_concept “Physical activity” (qualifier value) “Vigorously” (qualifier value) “Before” (attribute))
	)
)
;; Page 50 - Genital symptoms (man)
"Paraphimosis likely"
(system_diagnosis_rule
  "Diagnose probable paraphimosis"
  (diagnosis
    (snomed_concept "Paraphimosis" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Pain in penis" "finding")) “Glans penis structure” (body structure)) 
    (clinical_finding (snomed_concept "Penile swelling" "disorder")) “Glans penis structure” (body structure))
		(clinical_finding (snomed_concept “Fixed, retracted foreskin” (finding))
  )
;; Page 50 - Genital symptoms (man)
"Paraphimosis likely"
(system_diagnosis_rule
  "Diagnose probable paraphimosis"
  (diagnosis
	(urgent_referral
    (snomed_concept "Paraphimosis" "disorder")
		(snomed_concept “Urgent referral” (procedure))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Glans penis structure” (body structure) “Blue color” (qualifier value))
		(clinical_finding (snomed_concept “Glans penis structure” (body structure) “Black color” (qualifier value))
	)
)
;; Page 50 - Genital symptoms (man)
"Priapism likely"
(system_diagnosis_rule
  "Diagnose probable paraphimosis"
  (diagnosis
	(urgent_referral
    (snomed_concept "Priapism" "disorder")
		(snomed_concept “Urgent referral” (procedure))
    probable
  )
  adult
  (and  
		(>(clinical_finding (snomed_concept “Prolonged erection of penis” (finding) hour) 4))
	)
)
;; Page 50 - Genital symptoms (man)
"Male urethritis syndrome likely"
(system_diagnosis_rule
  "Diagnose probable paraphimosis"
  (diagnosis
    (snomed_concept "Urethritis" "disorder")
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Urethral discharge” (finding))
		(clinical_finding (snomed_concept “Dysuria” (finding) “With” (attribute) or “Without” (attribute))
		(clinical_finding (snomed_concept “Burning pain” (finding) “With” (attribute) or “Without” (attribute))
	)
)
;; Page 50 - Genital symptoms (man)
"Scrotal swelling likely"
(system_diagnosis_rule
  "Diagnose probable paraphimosis"
  (diagnosis
    (snomed_concept "Swelling of scrotum" "disorder")
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Pain in scrotum” (finding))
		(clinical_finding (snomed_concept “Swelling of scrotum” (finding) “With” (attribute) or “Without” (attribute))
		(clinical_finding (snomed_concept “Discharge - substance” (substance) “With” (attribute) or “Without” (attribute))
	)
)
;; Page 50 - Genital symptoms (man)
"Balanitis/ Balanoposthitis likely"
(system_diagnosis_rule
  "Diagnose probable paraphimosis"
  (diagnosis
    (snomed_concept “Balanitis” (disorder))
		(snomed_concept “Balanoposthitis” (disorder))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Infective balanitis” (disorder))
		(clinical_finding (snomed_concept “Inflammation of skin and/or subcutaneous tissue” (disorder) “Glans penis structure” (body structure)) 
		(clinical_finding (snomed_concept “Pain in penis” (finding)  “Glans penis structure” (body structure))
		(clinical_finding (snomed_concept “Itching” (finding) “Glans penis structure” (body structure))
		(clinical_finding (snomed_concept “Unpleasant odor of genitalia” (finding) “Glans penis structure” (body structure))
		(clinical_finding (snomed_concept “Tightly retracted foreskin” (finding))
	)
)
;; Page 50 - Genital symptoms (man)
"Testicular cancer likely"
(system_diagnosis_rule
  "Diagnose probable paraphimosis"
  (diagnosis
    (snomed_concept "Malignant neoplasm of testis" "disorder")
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Painless” (qualifier value) “Mass of testicle” (finding))
		(clinical_finding (snomed_concept “Swelling of scrotum” (finding))
		(clinical_finding (snomed_concept “Pain in scrotum” (finding))
		)
	)
)

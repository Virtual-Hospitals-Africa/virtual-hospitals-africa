;; Page 56 - Menstrual symptoms
“Amenorrhea likely” 
(system_diagnosis_rule
  "Diagnose probable amenorrhea"
  (diagnosis
    (snomed_concept “Amenorrhea” (finding))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Disorder of menstruation” (disorder))
		(clinical_finding (snomed_concept “No bleeding” (situation))
		(clinical_finding (snomed_concept “Uses intrauterine device contraception” (finding))
		(clinical_finding (snomed_concept “Uses depot contraception” (finding))
		(clinical_finding (snomed_concept “Uses drug-eluting contraceptive implant” (finding))
	)
;; Page 56 - Menstrual symptoms
“Amenorrhea likely” 
(system_diagnosis_rule
  "Diagnose probable amenorrhea"
  (diagnosis
	(referral 
    (snomed_concept “Amenorrhea” (finding))
		(snomed_concept “Patient referral” (procedure))
  )
  adult
  (and
		(clinical_finding (snomed_concept “Primary amenorrhea” (finding))
	)
)
 ;; Page 56 - Menstrual symptoms
“Thyroid problem likely” 
(system_diagnosis_rule
  "Diagnose probable thyroid problem"
  (diagnosis
    (snomed_concept “Disorder of thyroid gland” (disorder))
    probable
  )
  adult
  (and
		(>(clinical_finding (snomed_concept “Amenorrhea” (finding) month) 6))
		(clinical_finding (snomed_concept “Stress” (finding))
		(clinical_finding (snomed_concept “Physical activity” (qualifier value) “Excessive” (qualifier value))
		(clinical_finding (snomed_concept “Weight decreased” (finding) “Sudden” (qualifier value))
		(clinical_finding (snomed_concept “Underweight” (finding))
		)
		(clinical_finding (snomed_concept “Asthenia” (finding))
		(clinical_finding (snomed_concept “Fatigue” (finding))
		(clinical_finding (snomed_concept “Weight increased” (finding))
		(clinical_finding (snomed_concept “Depressed mood” (finding))
		(clinical_finding (snomed_concept “Xeroderma” (disorder))
		(clinical_finding (snomed_concept “Constipation” (finding))
		(clinical_finding (snomed_concept “Tolerant of cold” (finding))
	)
;; Page 56 - Menstrual symptoms
“Thyroid problem likely” 
(system_diagnosis_rule
  "Diagnose probable thyroid problem"
  (diagnosis
	(referral 
    (snomed_concept “Disorder of thyroid gland” (disorder))
		(snomed_concept “Patient referral” (procedure))
		(snomed_concept “Referral to doctor” (procedure))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Serum thyroid stimulating hormone level outside reference range” (finding))
	)
)
 ;; Page 56 - Menstrual symptoms
“Menopause likely” 
(system_diagnosis_rule
  "Diagnose probable menopause"
  (diagnosis
    (snomed_concept “Menopause finding” (finding))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Amenorrhea” (finding))
		(> (clinical_finding (snomed_concept “Current chronological age” (observable entity) year) 40))
		(clinical_finding (snomed_concept “Menopause finding” (finding))
		(clinical_finding (snomed_concept “Menopausal flushing” (disorder))
		(clinical_finding (snomed_concept “Night sweats” (finding))
		(clinical_finding (snomed_concept “Vaginal dryness” (disorder))
		(clinical_finding (snomed_concept “Mood swings” (finding))
		(clinical_finding (snomed_concept “Difficulty sleeping” (finding))
		(clinical_finding (snomed_concept “Finding relating to sexuality and sexual activity” (finding))
	)
)
;; Page 56 - Menstrual symptoms
“Dysmenorrhoea likely” 
(system_diagnosis_rule
  "Diagnose probable dysmenorrhoea"
  (diagnosis
    (snomed_concept “Dysmenorrhea” (disorder))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Lower abdominal pain” (finding)) “During” (attribute) Menstruation, function” (observable entity))
		(clinical_finding (snomed_concept “Backache” (finding) “During” (attribute) “Menstruation, function” (observable entity))
		(clinical_finding (snomed_concept “Headache” (finding))
		(clinical_finding (snomed_concept “Fatigue” (finding))
		(clinical_finding (snomed_concept “Nausea” (finding))
		(clinical_finding (snomed_concept “Vomiting” (disorder))
		(clinical_finding (snomed_concept “Diarrhea” (finding))
	)
;; Page 56 - Menstrual symptoms
“Dysmenorrhoea likely” 
(system_diagnosis_rule
  "Diagnose probable dysmenorrhoea"
  (diagnosis
	(consult
	(referral 
    (snomed_concept “Dysmenorrhea” (disorder))
		(snomed_concept “Consultation” (procedure)) or
		(snomed_concept “Patient referral” (procedure))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Patient condition unchanged (finding)
		(clinical_finding (snomed_concept “Interferes with (contextual qualifier) (qualifier value) Activity of daily living (observable entity)
		)
		(clinical_finding (snomed_concept “Referral to assessment service (procedure)
		(clinical_finding (snomed_concept “Uterine leiomyoma (disorder)
	)
)
;; Page 56 - Menstrual symptoms
“Premenstrual syndrome likely” 
(system_diagnosis_rule
  "Diagnose probable premenstrual syndrome"
  (diagnosis
    (snomed_concept “Premenstrual tension syndrome” (disorder))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Temporally related to” (attribute) “Menstruation, function” (observable entity))
		(clinical_finding (snomed_concept “Abdominal bloating” (finding))
		(clinical_finding (snomed_concept “Headache” (finding))
		(clinical_finding (snomed_concept “Premenstrual breast tenderness” (finding))
		(clinical_finding (snomed_concept “Fatigue” (finding))
		(clinical_finding (snomed_concept “Moody” (finding))
		(clinical_finding (snomed_concept “Depressed mood” (finding))
		(clinical_finding (snomed_concept “Stress” (finding))
		(clinical_finding (snomed_concept “Anxiety” (finding))
	)
;; Page 56 - Menstrual symptoms
“Premenstrual syndrome likely” 
(system_diagnosis_rule
  "Diagnose probable premenstrual syndrome"
  (diagnosis
	(consult
	(referral
    (snomed_concept “Premenstrual tension syndrome” (disorder))
    (snomed_concept “Consultation” (procedure)) or 
(snomed_concept “Patient referral” (procedure))
  )
  adult
  (and
		(clinical_finding (snomed_concept “Patient condition unchanged” (finding))
		(clinical_finding (snomed_concept “Interferes with” (contextual qualifier) (qualifier value) “Activity of daily living” (observable entity))
		)
		(clinical_finding (snomed_concept “Referral to assessment service” (procedure))
		(clinical_finding (snomed_concept “Uterine leiomyoma” (disorder))
		)
	)
)
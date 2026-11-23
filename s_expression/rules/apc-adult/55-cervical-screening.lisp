;; Page 55 - Cervical screening
“Cervical disease likely” 
(system_diagnosis_rule
  "Diagnose probable cervical disease"
  (diagnosis
    (snomed_concept "Disorder of uterine cervix" "disorder")
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Irregular periods” (finding))
		(clinical_finding (snomed_concept “Irregular intermenstrual bleeding” (finding))
		(clinical_finding (snomed_concept “Heavy episode of vaginal bleeding” (finding))
		(clinical_finding (snomed_concept “Postcoital bleeding” (finding))
		(clinical_finding (snomed_concept “Vaginal discharge problem” (finding))
		(clinical_finding (snomed_concept “Human immunodeficiency virus infection” (disorder))
		(clinical_finding (snomed_concept “Pregnancy” (finding))
		(clinical_finding (snomed_concept “Smoker” (finding))
	)
;; Page 55 - Cervical screening
“Cervical disease likely” 
(system_diagnosis_rule
  "Diagnose probable cervical disease"
  (diagnosis
	(referral 
    (snomed_concept "Disorder of uterine cervix" "disorder")
		(snomed_concept “Patient referral” (procedure))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Mass of pelvic structure” (finding))
	)
)
;; Page 55 - Cervical screening
“Lower abdominal pain (LAP) syndrome  likely” 
(system_diagnosis_rule
  "Diagnose probable lower abdominal pain (LAP) syndrome "
  (diagnosis
    (snomed_concept "Lower abdominal pain” (finding))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Pain on movement of cervix” (finding))
		)
	)
)



;; Page 52 - Genital Ulcer Syndrome
"Genital herpes likely"
(system_diagnosis_rule
  "Diagnose probable genital herpes"
  (diagnosis
    (snomed_concept "Genital herpes simplex" "disorder")
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Blister of skin” (disorder) “Genital structure” (body structure))
		(clinical_finding (snomed_concept “Soreness” (finding) “Genital structure” (body structure))
		(clinical_finding (snomed_concept “Ulcer of genital organ” (disorder))
		(clinical_finding (snomed_concept “Human immunodeficiency virus detected” (finding))
		(clinical_finding (snomed_concept “Human immunodeficiency virus infection” (disorder) “Screening status unknown” (situation))
		(clinical_finding (snomed_concept “Pregnancy” (finding))
		(clinical_finding (snomed_concept “Currently not sexually active” (finding) month) 3))
	)
;; Page 52 - Genital Ulcer Syndrome
"Genital herpes likely"
(system_diagnosis_rule
  "Diagnose probable genital herpes"
  (diagnosis
	(referral 
    (snomed_concept "Genital herpes simplex" "disorder")
		(snomed_concept “Patient referral” (procedure))
    probable
  )
  adult
  (and
		(>= (clinical_finding (snomed_concept “Gestation period, 28 weeks (finding))
		(clinical_finding (snomed_concept “Third trimester pregnancy” (finding))
		(clinical_finding (snomed_concept “Exposure to anogenital Herpes simplex virus” (event))
		)
		(clinical_finding (snomed_concept “Referral for laboratory tests” (procedure))
		(clinical_finding (snomed_concept “Recurrent anogenital herpes” (disorder))
	)
)
;; Page 52 - Genital Ulcer Syndrome
"Genital ulcer syndrome likely"
(system_diagnosis_rule
  "Diagnose probable genital ulcer syndrome"
  (diagnosis
    (snomed_concept "Ulcer of genital organ" "disorder")
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Sexually active” (finding) “In the past” (qualifier value) month) 3))
		(clinical_finding (snomed_concept “Vaginal discharge” (finding))
		(clinical_finding (snomed_concept “Urethral discharge” (finding))
	)
)
;; Page 52 - Genital Ulcer Syndrome
"Vaginal Discharge Syndrome likely"
(system_diagnosis_rule
  "Diagnose probable vaginal discharge syndrome"
  (diagnosis
    (snomed_concept "Vaginitis" "disorder")
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Vaginal discharge” (finding))
	)
)
;; Page 52 - Genital Ulcer Syndrome
"Male Urethritis Syndrome likely"
(system_diagnosis_rule
  "Diagnose probable male urethritis syndrome"
  (diagnosis
    (snomed_concept "Urethritis" "disorder")
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Urethral discharge” (finding))
	)
)
;; Page 52 - Genital Ulcer Syndrome
"Bubo likely"
(system_diagnosis_rule
  "Diagnose probable bubo"
  (diagnosis
    (snomed_concept "Bubonocele" "disorder")
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Enlarged” (qualifier value) ‘Inguinal lymph node structure” (body structure))
		(clinical_finding (snomed_concept “Hot sensation quality” (qualifier value) “Inguinal lymph node structure” (body structure))
		(clinical_finding (snomed_concept “Tender” (qualifier value) “Inguinal lymph node structure” (body structure))
		)
	)
)
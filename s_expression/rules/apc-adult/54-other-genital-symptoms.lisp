;; Page 54 - Other Genital Symptoms
“Genital warts likely” 
(system_diagnosis_rule
  "Diagnose probable genital warts"
  (diagnosis
    (snomed_concept “Genital warts” (disorder))
		(snomed_concept “Anogenital warts” (disorder))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Skin nodule” (disorder))
		(clinical_finding (snomed_concept “Mass of male genital structure” (finding))
		(clinical_finding (snomed_concept “Mass of female genital structure” (finding))
		(clinical_finding (snomed_concept “Painless nodule” (finding))
		(clinical_finding (snomed_concept “Melanocytic nevus” (disorder))
		(clinical_finding (snomed_concept “Viral wart of skin and/or mucous membrane caused by human papillomavirus” (disorder))
		(clinical_finding (snomed_concept “Neoplasm of anus” (disorder))
	)
)
;; Page 54 - Other Genital Symptoms
“Genital warts likely” 
(system_diagnosis_rule
  "Diagnose probable genital warts"
  (diagnosis
	(referral
    (snomed_concept “Genital warts” (disorder))
		(snomed_concept “Anogenital warts” (disorder))
		(snomed_concept “Patient referral” (procedure))
		(snomed_concept “Referral to gynecology service” (procedure))
		(snomed_concept “Referral to urology service” (procedure))
		(snomed_concept “Referral to sexually transmitted infections clinic” (procedure))
  )
  adult
  (and
		(> measurement (clinical_finding (snomed_concept “Wart size” (observable entity) mm) 10))
		(clinical_finding (snomed_concept “Multiple lesions” (disorder))
		(clinical_finding (snomed_concept “Genital warts” (disorder) “Internal” (qualifier value) “Vaginal structure” (body structure))
		(clinical_finding (snomed_concept “Genital warts” (disorder) “Internal” (qualifier value) “Cervix uteri structure” (body structure))
		(clinical_finding (snomed_concept “Genital warts” (disorder) “Internal” (qualifier value) “Urethral structure” (body structure))
		(clinical_finding (snomed_concept “Genital warts” (disorder) “Large” (qualifier value) and (clinical_finding (snomed_concept “Pregnancy” (finding))
		(clinical_finding (snomed_concept “Genital warts” (disorder) “Bleeding” (finding))
		(clinical_finding (snomed_concept “Genital warts” (disorder) “Infectious disease” (disorder))
	)
)
;; Page 54 - Other Genital Symptoms
“Molluscum contagiosum likely” 
(system_diagnosis_rule
  "Diagnose probable molluscum contagiosum"
  (diagnosis
    (snomed_concept “Infection caused by Molluscum contagiosum”(disorder))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Papule” (morphologic abnormality))
		(clinical_finding (snomed_concept “Indented structure” (morphologic abnormality) “Central” (qualifier value))
	)
)
;; Page 54 - Other Genital Symptoms
“Pubic lice (pediculosis) likely” 
(system_diagnosis_rule
  "Diagnose probable pubic lice (pediculosis)"
  (diagnosis
    (snomed_concept “Infestation caused by Phthirus pubis” (disorder))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Insect bite of pelvic region” (disorder))
		(clinical_finding (snomed_concept “Itching of lesion of skin” (disorder))
		(clinical_finding (snomed_concept “Pthirus pubis” (organism) “Observes” (attribute) “In” (attribute) “Skin structure of hypogastric region” (body structure) or “Perianal” (qualifier value))
		(clinical_finding (snomed_concept “Egg of order Phthiraptera” (organism) “Observes” (attribute) “In” (attribute) “Skin structure of hypogastric region” (body structure) or “Perianal” (qualifier value))
	)
)
;; Page 54 - Other Genital Symptoms
“Impetigo likely” 
(system_diagnosis_rule
  "Diagnose probable impetigo"
  (diagnosis
    (snomed_concept “Impetigo” (disorder))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Scratch marks” (finding) “Infectious disease” (disorder))
			(clinical_finding (snomed_concept “Pus” (substance))
			(clinical_finding (snomed_concept “Red color” (qualifier value))
			(clinical_finding (snomed_concept “Swelling” (finding))
		(clinical_finding (snomed_concept “Crust on skin” (finding))
	)
)
;; Page 54 - Other Genital Symptoms
“Genital scabies likely” 
(system_diagnosis_rule
  "Diagnose probable genital scabies"
  (diagnosis
    (snomed_concept “Infestation caused by Sarcoptes scabiei var hominis” (disorder))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Pruritic rash” (disorder))
		(clinical_finding (snomed_concept “Pruritus of genital organs” (disorder) “Worse” (qualifier value) “Night time” (qualifier value))
		(clinical_finding (snomed_concept “Papule” (morphologic abnormality) “Red color” (qualifier value))
		(clinical_finding (snomed_concept “Nodule” (morphologic abnormality) “Red color” (qualifier value))
		)
	)
)

;; Page 80 - Scalp Symptoms
“Lice likely”
(system_diagnosis_rule
  "Diagnose probable lice"
  (diagnosis
    (snomed_concept “Infestation caused by Pediculus” (disorder))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Itching” (finding) “Severe” (severity modifier) (qualifier value))
		(clinical_finding (snomed_concept “Order Phthiraptera” (organism))
		(clinical_finding (snomed_concept “Egg of order Phthiraptera” (organism))
		(clinical_finding (snomed_concept “Bite of insect” (event) “Red color” (qualifier value) “Small” (qualifier value))
		(clinical_finding (snomed_concept “Structure of posterior region of neck” (body structure) “Involved” (qualifier value))
	)
)
;; Page 80 - Scalp Symptoms
“Dandruff likely”
(system_diagnosis_rule
  "Diagnose probable dandruff"
  (diagnosis
    (snomed_concept “Pityriasis capitis” (disorder))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Scalp itchy” (finding))
		(clinical_finding (snomed_concept “Peeling of skin” (finding) “Fine” (qualifier value) “White color” (qualifier value))
		(clinical_finding (snomed_concept “Scaly skin” (finding) “Fine” (qualifier value) “White color” (qualifier value))
		(clinical_finding (snomed_concept “Top” (qualifier value) “Hair structure” (body structure))
		(clinical_finding (snomed_concept “Top” (qualifier value) “Garment” (physical object))
	)
)
;; Page 80 - Scalp Symptoms
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
		(clinical_finding (snomed_concept “Itching” (finding))
	)
)
;; Page 80 - Scalp Symptoms
“Psoriasis likely”
(system_diagnosis_rule
  "Diagnose probable psoriasis"
  (diagnosis
	(referral 
    (snomed_concept “Psoriasis” (disorder))
		(snomed_concept “Patient referral” (procedure))
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
;; Page 80 - Scalp Symptoms
“Contact dermatitis likely”
(system_diagnosis_rule
  "Diagnose probable contact dermatitis"
  (diagnosis
    (snomed_concept “Contact dermatitis” (disorder))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Care of hair” (procedure) “Recent” (qualifier value))
				(snomed_concept “Exposure to” (contextual qualifier) “Shampoo” (substance))
				(snomed_concept “Exposure to” (contextual qualifier) “Hair dye” (substance))
				(snomed_concept “Exposure to” (contextual qualifier) “Hair spray” (substance))
				(snomed_concept “Exposure to” (contextual qualifier) “Cosmetic material” (substance))
		(clinical_finding (snomed_concept “Erythema of skin” (disorder))
		(clinical_finding (snomed_concept “Swelling of skin” (finding))
		(clinical_finding (snomed_concept “Burn of scalp” (disorder))
		(clinical_finding (snomed_concept “Scalp itchy” (finding))
		(clinical_finding (snomed_concept “Blister” (morphologic abnormality))
	)
)
;; Page 80 - Scalp Symptoms
“Folliculitis likely”
(system_diagnosis_rule
  "Diagnose probable folliculitis"
  (diagnosis
    (snomed_concept “Folliculitis” (disorder))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Pimple” (morphologic abnormality) “Red color” (qualifier value))
		(clinical_finding (snomed_concept “Pustule” (disorder) “Red color” (qualifier value))
		(clinical_finding (snomed_concept “Vesicle” (morphologic abnormality) “Red color” (qualifier value))
		(clinical_finding (snomed_concept “Nodule” (morphologic abnormality) “Red color” (qualifier value))
		(clinical_finding (snomed_concept “Structure of perifollicular region of skin” (body structure) “Involved” (qualifier value))
		)
	)
)

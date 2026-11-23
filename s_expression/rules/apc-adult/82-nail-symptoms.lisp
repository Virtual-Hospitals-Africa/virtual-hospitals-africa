;; Page 82 - Nail Symptoms
“Chronic paronychia likely”
(system_diagnosis_rule
  "Diagnose probable chronic paronychia"
  (diagnosis
    (snomed_concept “Chronic paronychia” (disorder))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Associated with” (attribute)
“Exposure to” (contextual qualifier) (qualifier value) “Water” (substance))
		(clinical_finding (snomed_concept “Associated with” (attribute)
“Exposure to” (contextual qualifier) (qualifier value) “Irritant” (substance))
		(clinical_finding (snomed_concept “Associated with” (attribute)
“Exposure to” (contextual qualifier) (qualifier value) “Nail cosmetic” (substance))
		(clinical_finding (snomed_concept “Associated with” (attribute)
“Exposure to” (contextual qualifier) (qualifier value) “Soap” (substance))
		(clinical_finding (snomed_concept “Associated with” (attribute)
“Exposure to” (contextual qualifier) (qualifier value) “Chemical” (substance))
		(clinical_finding (snomed_concept “Abnormality of nail shape” (disorder))
		(clinical_finding (snomed_concept “Swelling” (finding) “Nail bed structure” (body structure)) 
		(clinical_finding (snomed_concept “Partial thickness skin loss” (finding) “Structure of cuticle of nail” (body structure))
	)
)
;; Page 82 - Nail Symptoms
“Acute paronychia likely”
(system_diagnosis_rule
  "Diagnose probable acute paronychia"
  (diagnosis
    (snomed_concept “Paronychia” (disorder))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “History of injury” (situation))
		(clinical_finding (snomed_concept “Nail biting” (finding))
		(clinical_finding (snomed_concept “Does push” (finding) “Structure of cuticle of nail” (body structure))
		(clinical_finding (snomed_concept “Cutting own nails, function” (observable entity) “Short” (qualifier value) “Extreme” (qualifier value))
		(clinical_finding (snomed_concept “Pain” (finding) “Periungual skin structure” (body structure))
		(clinical_finding (snomed_concept “Erythema of skin” (disorder) “Periungual skin structure” (body structure))
		(clinical_finding (snomed_concept “Swelling” (finding) “Periungual skin structure” (body structure))
		(clinical_finding (snomed_concept “Pus” (substance))
	)
)
;; Page 82 - Nail Symptoms
“Fungal infection likely”
(system_diagnosis_rule
  "Diagnose probable fungal infection"
  (diagnosis
    (snomed_concept “Mycosis” (disorder))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Abnormality of nail shape” (disorder)) 
		(clinical_finding (snomed_concept “White nails” (finding))
		(clinical_finding (snomed_concept “Yellow nails” (finding))
		(clinical_finding (snomed_concept “Nails crumble” (finding))
	)
;; Page 82 - Nail Symptoms
“Fungal infection likely”
(system_diagnosis_rule
  "Diagnose probable fungal infection"
  (diagnosis
	(referral 
    (snomed_concept “Mycosis” (disorder))
    (snomed_concept “Patient referral” (procedure))
  )
  adult
  (and
		(clinical_finding (snomed_concept “Feeling upset” (finding) “Very” (qualifier value))
		(clinical_finding (snomed_concept “Distress” (finding) “Very” (qualifier value))
	)
)
;; Page 82 - Nail Symptoms
“Hematoma likely”
(system_diagnosis_rule
  "Diagnose probable hematoma"
  (diagnosis
    (snomed_concept “Hematoma” (disorder))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Nail discoloration” (finding) “Blue color” (qualifier value))
		(clinical_finding (snomed_concept “Nail discoloration” (finding) “Brown color” (qualifier value))
		(clinical_finding (snomed_concept “Nail discoloration” (finding) “Black color” (qualifier value))
		(clinical_finding (snomed_concept “History of injury” (situation) “Nail unit structure” (body structure))
	)
)
;; Page 82 - Nail Symptoms
“Nail discoloration likely”
(system_diagnosis_rule
  "Diagnose probable nail discoloration"
  (diagnosis
    (snomed_concept “Nail discoloration” (finding))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Nail discoloration” (finding) “Blue color” (qualifier value))
		(clinical_finding (snomed_concept “Nail discoloration” (finding) “Brown color” (qualifier value))
		(clinical_finding (snomed_concept “Nail discoloration” (finding) “Black color” (qualifier value))
		(clinical_finding (snomed_concept “History of injury” (situation) “No” (qualifier value) “Nail unit structure” (body structure))
	)
;; Page 82 - Nail Symptoms
“Nail discoloration likely”
(system_diagnosis_rule
  "Diagnose probable nail discoloration"
  (diagnosis
	(consult 
    (snomed_concept “Nail discoloration” (finding))
    (snomed_concept “Consultation” (procedure))
  )
  adult
  (and
		(clinical_finding (snomed_concept “Review of medication” (procedure))
		(clinical_finding (snomed_concept “Fluconazole” (substance))
		(clinical_finding (snomed_concept “Ibuprofen” (substance))
		(clinical_finding (snomed_concept “Lamivudine” (substance))
		(clinical_finding (snomed_concept “Phenytoin” (substance))
		(clinical_finding (snomed_concept “Zidovudine” (substance))
	)
;; Page 82 - Nail Symptoms
“Nail discoloration likely”
(system_diagnosis_rule
  "Diagnose probable nail discoloration"
  (diagnosis
	(referral 
    (snomed_concept “Nail discoloration” (finding))
    (snomed_concept “Patient referral” (procedure) week) 1))
  )
  adult
  (and
		(clinical_finding (snomed_concept “Melanocytic neoplasm” (disorder) “Suspected” (qualifier value))
		)
		(clinical_finding (snomed_concept “Nail discoloration” (finding) “New” (qualifier value) “Patchy” (qualifier value) “Greater” (qualifier value)) and 
		(clinical_finding (snomed_concept “History of injury’ (situation) “Recent” (qualifier value) “No” (qualifier value))
		)
		(clinical_finding (snomed_concept “Nail discoloration” (finding) “Extending” (qualifier value) “Periungual skin structure” (body structure))
		(> (measurement (clinical_finding (snomed_concept “Band” (qualifier value) “Nail unit structure” (body structure) mm) 4)
		(clinical_finding (snomed_concept “Changing color of pigmented skin lesion” (disorder))
		(clinical_finding (snomed_concept “Hyperpigmentation of skin” (disorder))
		(clinical_finding (snomed_concept “Changing shape of pigmented skin lesion” (disorder))
		(clinical_finding (snomed_concept “Increased size” (finding))
		(clinical_finding (snomed_concept “Poorly defined” (qualifier value) “Along edge” (qualifier value))
		(clinical_finding (snomed_concept “Damaged nail” (finding))
		)
	)
)

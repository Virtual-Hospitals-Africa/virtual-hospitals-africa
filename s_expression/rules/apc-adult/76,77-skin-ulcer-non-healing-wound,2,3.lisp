;; Page 76– Skin ulcer or non-healing wound 2
“Peripheral vascular disease likely”
(system_diagnosis_rule
  "Diagnose probable peripheral vascular disease"
  (diagnosis
    (snomed_concept "Peripheral vascular disease" "disorder")
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Pain in muscle of lower leg” (finding))
		(clinical_finding (snomed_concept “Muscle pain” (finding) “Buttock structure” (body structure))
		(clinical_finding (snomed_concept “Pain provoked by exertion” (finding))
		(clinical_finding (snomed_concept “Abnormal foot pulse” (finding)) 		
		(clinical_finding (snomed_concept “Thready pulse” (finding)) 
		(clinical_finding (snomed_concept “Foot pulse absent” (finding))
	)
;; Page 76– Skin ulcer or non-healing wound 2
“Peripheral vascular disease likely”
(system_diagnosis_rule
  "Diagnose probable peripheral vascular disease"
  (diagnosis
	(referral 
    (snomed_concept "Peripheral vascular disease" "disorder")
    (snomed_concept “Patient referral” (procedure) week) 1))
  )
  adult
  (and
		(clinical_finding (snomed_concept “Peripheral vascular disease” (disorder) “New diagnosis” (observable entity))
	)
)
;; Page 76– Skin ulcer or non-healing wound 2
“Infection likely”
(system_diagnosis_rule
  "Diagnose probable infection"
  (diagnosis
    (snomed_concept “Infectious disease” (disorder))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Erythema of skin” (disorder) “Surrounding” (qualifier value) “Skin structure” (body structure))
		(clinical_finding (snomed_concept “Warm skin” (finding) “Surrounding” (qualifier value) “Skin structure” (body structure))
		(clinical_finding (snomed_concept “Swelling of skin” (finding) “Surrounding” (qualifier value) “Skin structure” (body structure))
		(clinical_finding (snomed_concept “Skin ulcer due to diabetes mellitus” (disorder))
		(clinical_finding (snomed_concept “Discharge - substance” (substance) “Increasing” (qualifier value))
		(clinical_finding (snomed_concept “Pus” (substance) “Increasing” (qualifier value))
		(clinical_finding (snomed_concept “Offensive body odor” (finding) “Increasing” (qualifier value))
	)
;; Page 76– Skin ulcer or non-healing wound 2
“Infection likely”
(system_diagnosis_rule
  "Diagnose probable infection"
  (diagnosis
	(referral 
    (snomed_concept “Infectious disease” (disorder))
    (snomed_concept “Urgent referral (procedure) or
		(snomed_concept “Patient referral” (procedure) hour) 24))
  )
  adult
  (and
		(snomed_concept “Urgent referral (procedure)
		(< (measurement (clinical_finding (snomed_concept “Systolic blood pressure” (observable entity) mmHg) 90))
		(< (measurement (clinical_finding (snomed_concept “Diastolic blood pressure” (observable entity) mmHg) 90))
		(> (measurement (clinical_finding (snomed_concept “Heart rate” (observable entity) bpm) 100))
		(>= (measurement (clinical_finding (snomed_concept “Body temperature” (observable entity) °C) 38))
		)
		(snomed_concept “Patient referral” (procedure) hour) 24))
		(clinical_finding (snomed_concept “Infectious disease” (disorder) “Extensive” (qualifier value) “After” (attribute) “Antibiotic therapy” (procedure))
		(clinical_finding (snomed_concept “Infectious disease” (disorder) “Worse” (qualifier value) “After” (attribute) “Antibiotic therapy” (procedure))
		(clinical_finding (snomed_concept “Wound tissue undermining” (finding))
		(clinical_finding (snomed_concept “Ulcer” (disorder) “Extended” (qualifier value) “Bone structure” (body structure))
		(clinical_finding (snomed_concept “Wound finding” (finding) “Extended” (qualifier value) “Bone structure” (body structure))
		(clinical_finding (snomed_concept “Diabetic - poor control” (finding))
		(clinical_finding (snomed_concept “History of surgery” (situation) “With” (attribute) “Implant, device” (physical object))
		(clinical_finding (snomed_concept “History of surgery” (situation) “With” (attribute) “Bone pin, device” (physical object))
		(clinical_finding (snomed_concept “History of surgery” (situation) “With” (attribute) “Bone plate, device” (physical object))
		(clinical_finding (snomed_concept “History of surgery” (situation) “With” (attribute) “Prosthetic arthroplasty of joint” (procedure))
	)
)
;; Page 76– Skin ulcer or non-healing wound 2
“Reduced blood supply likely”
(system_diagnosis_rule
  "Diagnose probable reduced blood supply"
  (diagnosis
    (snomed_concept “Ischemia” (disorder))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Abnormal foot pulse” (finding)) 
		(clinical_finding (snomed_concept “Thready pulse” (finding))
		(clinical_finding (snomed_concept “Foot pulse absent” (finding))
		(> (measurement (clinical_finding (snomed_concept “Capillary filling, function” (observable entity) second) 5))
		(clinical_finding (snomed_concept “Different temperature in opposite limbs” (finding) “Both feet” (body structure))
		(clinical_finding (snomed_concept “Discoloration of skin” (finding))
		(clinical_finding (snomed_concept “Loss of hair” (finding))
		(clinical_finding (snomed_concept “Shiny skin” (finding))
		(clinical_finding (snomed_concept “Numbness” (finding))
		(clinical_finding (snomed_concept “Monoparesis” (disorder))
	)
;; Page 76– Skin ulcer or non-healing wound 2
“Reduced blood supply likely”
(system_diagnosis_rule
  "Diagnose probable reduced blood supply"
  (diagnosis
	(consult
	(referral 
	(urgent_referral
    (snomed_concept “Ischemia” (disorder))
    (snomed_concept “Consultation” (procedure)) 
		(snomed_concept “Urgent referral” (procedure)) or
		(snomed_concept “Patient referral to specialist” (procedure))			
		(snomed_concept “Referral to hospital” (procedure) “Tertiary referral hospital” (environment))
  )
  adult
  (and
		(clinical_finding (snomed_concept “Changed status” (qualifier value) “New” (qualifier value))
	)
)
;; Page 76– Skin ulcer or non-healing wound 2
“Mobility problem likely”
(system_diagnosis_rule
  "Diagnose probable mobility problem"
  (diagnosis
	(referral 
    (snomed_concept “Impaired mobility” (finding))
		(snomed_concept “Patient referral” (procedure))
		(snomed_concept “Referral to physiotherapist” (procedure)) or
		(snomed_concept “Referral to occupational therapist” (procedure))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Difficulty moving” (finding))
		(clinical_finding (snomed_concept “Does not move” (finding))
		(clinical_finding (snomed_concept “Unable to move” (finding))
		(clinical_finding (snomed_concept “Rehabilitation therapy” (regime/therapy))
	)
)
 ;; Page 76– Skin ulcer or non-healing wound 2
“Anaemia likely”
(system_diagnosis_rule
  "Diagnose probable anaemia"
  (diagnosis
    (snomed_concept “Anemia” (disorder))
    probable
  )
  adult
  (and
(<(clinical_finding (snomed_concept “Measurement of total hemoglobin concentration” (procedure) “Woman” (person) g/dL) 12))
(<(clinical_finding (snomed_concept “Measurement of total hemoglobin concentration” (procedure) “Man” (person) g/dL) 13))
		)
	)
)
;;Page 77 - Skin ulcer or non-healing wound 3
“Skin ulcer likely”
(system_diagnosis_rule
  "Diagnose probable skin ulcer"
  (diagnosis
    (snomed_concept “Skin ulcer” (disorder))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Wound epithelialization” (finding) “Pink color” (qualifier value))
		(clinical_finding (snomed_concept “Wound” (disorder) “Granulation of tissue” (finding) “Red color” (qualifier value))
		(clinical_finding (snomed_concept “Wound slough” (finding) “Yellow color” (qualifier value))
		(clinical_finding (snomed_concept “Wound” (disorder) “Tissue necrosis” (disorder) “Dry” (qualifier value) “Black color” (qualifier value))
		(clinical_finding (snomed_concept “Local infection of wound” (disorder))
		(clinical_finding (snomed_concept “Wound tissue undermining” (finding))
		)
	)
)
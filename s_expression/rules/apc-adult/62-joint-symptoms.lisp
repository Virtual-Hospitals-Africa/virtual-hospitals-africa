;; Page 62 - Joint Symptoms
(task
  "Check for urgent joint conditions"
  adult
	(clinical_finding (snomed_concept “Joint finding” (finding))
  (check_for
    (clinical_finding (snomed_concept "Pain of joint" "finding") (qualifier (snomed_concept "Acute pain" "finding")"Singular" (qualifier value) "Short" (qualifier value) "History of" (contextual qualifier) (qualifier value)))
    (clinical_finding (snomed_concept "Joint warm" "finding"))
    (<= (timestamp (clinical_finding (snomed_concept "Injury of musculoskeletal system" "disorder")))
        (time_ago 48 hours))
    (clinical_finding (snomed_concept "Limitation of joint movement" "finding"))
    (clinical_finding (snomed_concept "Severe pain" "finding"))
    (clinical_finding (snomed_concept "Joint swelling" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Deformity" "finding"))
    (clinical_finding (snomed_concept "Unable to weight-bear" "finding"))
    (clinical_finding (snomed_concept "Pain of joint" "finding"))
    (clinical_finding (snomed_concept "Joint swelling" "finding"))
  )
)
;; Page 62 - Joint Symptoms
"septic arthritis likely"
(system_diagnosis_rule
  "Diagnose probable septic arthritis"
  (diagnosis
    (snomed_concept "Infective arthritis" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Pain of joint" "finding") "Short" (qualifier value) "History of" (contextual qualifier) (qualifier value)))
		(clinical_finding (snomed_concept “Pain of joint” (finding) “Extreme” (qualifier value) “Singular” (qualifier value))
    (clinical_finding (snomed_concept "Joint warm" "finding"))
    (clinical_finding (snomed_concept "Joint swelling" "finding") Singular” (qualifier value))
		(clinical_finding (snomed_concept “Limitation of joint movement” (finding))
  )
)
;; Page 62 - Joint Symptoms
"Joint problem likely"
(system_diagnosis_rule
  "Diagnose probable joint problem"
  (diagnosis
    (snomed_concept “Joint finding” (finding))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Joint warm” (finding))
		(clinical_finding (snomed_concept “Tenderness of joint” (finding))
		(clinical_finding (snomed_concept “Joint swelling” (finding))
		(clinical_finding (snomed_concept “Difficulty moving” (finding))
		(clinical_finding (snomed_concept “Injury of musculoskeletal system” (disorder) “Recent” (qualifier value))
	)
)
 ;; Page 62 - Joint Symptoms
"Fracture likely"
(system_diagnosis_rule
  "Diagnose probable fracture"
  (diagnosis
    (snomed_concept “Fracture of bone” (disorder))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Traumatic injury” (disorder) “In the past” (qualifier value) hour) 48))
		(clinical_finding (snomed_concept “Pain of joint” (finding) “Severe” (severity modifier) (qualifier value))
		(clinical_finding (snomed_concept “Joint swelling” (finding) “Severe” (severity modifier) (qualifier value))
		(clinical_finding (snomed_concept “Joint deformity” (finding) “Severe” (severity modifier) (qualifier value))
	)
)
;; Page 62 - Joint Symptoms
"Acute gout likely"
(system_diagnosis_rule
  "Diagnose probable acute gout"
  (diagnosis
    (snomed_concept “Acute gout” (disorder))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “No traumatic injury” (situation) “Recent” (qualifier value))
		(clinical_finding (snomed_concept “Discharge from female genitalia” (finding) “No” (qualifier value))
		(clinical_finding (snomed_concept “No urethral discharge” (situation))
		(clinical_finding (snomed_concept “Eruption of skin” (disorder)“No” (qualifier value))
		(<(clinical_finding (snomed_concept “Pain of joint” (finding) week) 6))
		(clinical_finding (snomed_concept “Joint warm” (finding) “Sudden onset” (qualifier value) 1-3))
		(clinical_finding (snomed_concept “Knee joint - warm” (finding))
		(clinical_finding (snomed_concept “Toe joint - warm” (finding))
		(clinical_finding (snomed_concept “Pain of joint” (finding) “Sudden onset” (qualifier value) 1-3))
		(clinical_finding (snomed_concept “Pain of joint of knee” (finding))
		(clinical_finding (snomed_concept “Pain in toe” (finding))
		(clinical_finding (snomed_concept “Pain of interphalangeal joint of toe” (finding))
		(clinical_finding (snomed_concept “Knee joint red” (finding))
		(clinical_finding (snomed_concept “Toe joint red” (finding))
		(clinical_finding (snomed_concept “Joint swelling” (finding) “Sudden onset” (qualifier value) 1-3))
		(clinical_finding (snomed_concept “Swelling of knee joint” (finding))
		(clinical_finding (snomed_concept “Toe swelling” (finding))
	)
;; Page 62 - Joint Symptoms
"Acute gout likely"
(system_diagnosis_rule
  "Diagnose probable acute gout"
  (diagnosis
	(consult
	(referral
    (snomed_concept “Acute gout” (disorder))
		(snomed_concept “Consultation” (procedure)) or
		(snomed_concept “Patient referral to specialist (procedure))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Gout” (disorder) “Known” (qualifier value))
		(clinical_finding (snomed_concept “Great toe structure” (body structure) “Affecting” (qualifier value))
		(clinical_finding (snomed_concept “Structure of midfoot region of foot (body structure) “Affecting” (qualifier value))
		(clinical_finding (snomed_concept “Fever” (finding) “No” (qualifier value))
		(clinical_finding (snomed_concept “Wound” (disorder) “No” (qualifier value))
		(clinical_finding (snomed_concept “Surgical procedure” (procedure) “No” (qualifier value))
		(clinical_finding (snomed_concept “Intra-articular injection” (procedure) “No” (qualifier value))
	)
)
;; Page 62 - Joint Symptoms
"Gonococcal arthritis likely"
(system_diagnosis_rule
  "Diagnose probable gonococcal arthritis"
  (diagnosis
	(referral 
    (snomed_concept “Gonococcal infection of joint” (disorder))
		(snomed_concept “Patient referral” (procedure) “In” (attribute) hour) 24))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Wrist region structure” (body structure) “Involved” (qualifier value))
		(clinical_finding (snomed_concept “Both ankles” (body structure) “Involved” (qualifier value))
		(clinical_finding (snomed_concept “Both hands” (body structure) “Involved” (qualifier value))
		(clinical_finding (snomed_concept “Both feet” (body structure) “Involved” (qualifier value))
		(clinical_finding (snomed_concept “No traumatic injury” (situation) “Recent” (qualifier value))
		(clinical_finding (snomed_concept “Discharge from female genitalia” (finding) “Recent” (qualifier value))
		(clinical_finding (snomed_concept “Urethral discharge” (finding))
		(clinical_finding (snomed_concept “Eruption of skin” (disorder) “Painless” (qualifier value))
		(clinical_finding (snomed_concept “Eruption of skin” (disorder) “Not itching” (qualifier value))
		(<(clinical_finding (snomed_concept “Pain of joint” (finding) week) 6))
	)
)
;; Page 62 - Joint Symptoms
"Sprain/strain likely"
(system_diagnosis_rule
  "Diagnose probable sprain or strain"
  (diagnosis
    (snomed_concept “Sprain of ligament” (disorder)) or
		(snomed_concept “Muscle strain” (disorder))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Pain of joint” (finding))
		(clinical_finding (snomed_concept “Traumatic injury” (disorder) “Recent” (qualifier value))
	)
)
;; Page 62 - Joint Symptoms
"Chronic arthritis likely"
(system_diagnosis_rule
  "Diagnose probable chronic arthritis"
  (diagnosis
    (snomed_concept "Chronic arthritis” (disorder))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “No traumatic injury” (situation) “Recent” (qualifier value))
		(>=(clinical_finding (snomed_concept “Pain of joint” (finding) week) 6))
	)
)
;; Page 62 - Joint Symptoms
(system_priority_evaluation
  "Urgent joint pain symptoms"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Pain of joint" "finding"))
    (or
      (and
        (clinical_finding (snomed_concept “Infective arthritis” (disorder))
				(clinical_finding ( snomed_concept “Pain of joint” (finding) “Acute pain” (finding) "Singular" (qualifier value) "Short" (qualifier value) "History of" (contextual qualifier) (qualifier value))
				(clinical_finding (snomed_concept "Joint warm" "finding"))
        (clinical_finding (snomed_concept "Joint swelling" "finding"))
				(clinical_finding ( snomed_concept “Limitation of joint movement” (finding))
  	    )
				(clinical_finding (snomed_concept “Fracture of bone” (disorder))
				(clinical_finding ( snomed_concept “Injury of musculoskeletal system” (disorder) In the past (qualifier value) hour (qualifier value) 48))
				(clinical_finding ( snomed_concept “Severe pain” (finding))
				(clinical_finding ( snomed_concept “Joint swelling” (finding) Severe (severity modifier) (qualifier value))
				(clinical_finding ( snomed_concept “Deformity” (finding) Severe (severity modifier) (qualifier value))
				)
      	(clinical_finding (snomed_concept "Unable to weight-bear" "finding"))
				)
     	 (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
    )
  )
)
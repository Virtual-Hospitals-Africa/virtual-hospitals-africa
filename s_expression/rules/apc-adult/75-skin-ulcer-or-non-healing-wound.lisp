;; Page 75 - Skin Ulcer or Non-Healing Wound
(task
  "Check for urgent skin ulcer and non-healing wound conditions"
  adult
  (or
    (clinical_finding (snomed_concept "Skin ulcer" "disorder"))
    (clinical_finding (snomed_concept "Wound, non-healed" "morphologic abnormality")))
  (check_for
    (clinical_finding (snomed_concept "Erythema" "finding") “Skin ulcer” (disorder) “Surrounding” (qualifier value))
		(clinical_finding ( snomed_concept “Erythema” (finding) “Wound, non-healed” (morphologic abnormality) “Surrounding” (qualifier value))
    (clinical_finding (snomed_concept "Warm skin" "finding") “Skin ulcer” (disorder) “Surrounding” (qualifier value))
		(clinical_finding ( snomed_concept “Warm skin” (finding) “Wound, non-healed” (morphologic abnormality) “Surrounding” (qualifier value))
    (clinical_finding (snomed_concept "Swelling of skin" "finding") “Skin ulcer” (disorder) “Surrounding” (qualifier value))
		(clinical_finding ( snomed_concept “Swelling of skin” (finding)) “Wound, non-healed” (morphologic abnormality) “Surrounding” (qualifier value))
    (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
    (clinical_finding (snomed_concept "Blister" "morphologic abnormality"))
    (clinical_finding (snomed_concept "Soft tissue crepitus" "finding"))
    (clinical_finding (snomed_concept "Severe pain" "finding"))
    (clinical_finding (snomed_concept "“Severe pain” (finding) “Skin ulcer” (disorder))
		(clinical_finding ( snomed_concept “Severe pain” (finding) “Wound, non-healed” (morphologic abnormality))
		(clinical_finding ( snomed_concept “Pain in lower limb” (finding) “Pain provoked by rest” (finding) “Sudden” (qualifier value) “Severe” (severity modifier) (qualifier value))
    (clinical_finding (snomed_concept "Numbness of lower limb" "finding"))
    (clinical_finding (snomed_concept "Muscle weakness of limb" "finding"))
    (clinical_finding (snomed_concept "Pale discoloration of entire skin” of body” (finding))
    (clinical_finding (snomed_concept "Peripheral pulse absent" "finding"))
  )
)
;; Page 75 – Skin ulcer or non-healing wound
(system_priority_evaluation
	“Urgent skin ulcer or non healing wound symptoms”
	adult
	Urgent
		(clinical_finding ( snomed_concept “Skin ulcer” (disorder))
		(clinical_finding ( snomed_concept “Wound, non-healed” (morphologic abnormality))
	(and
		(clinical_finding ( snomed_concept “Infectious disease” (disorder))
		(clinical_finding ( snomed_concept “Erythema” (finding) “Skin ulcer” (disorder) “Surrounding” (qualifier value))
		(clinical_finding ( snomed_concept “Erythema” (finding) “Wound, non-healed” (morphologic abnormality) “Surrounding” (qualifier value))
		(clinical_finding ( snomed_concept “Warm skin” (finding) “Skin ulcer” (disorder) “Surrounding” (qualifier value))
		(clinical_finding ( snomed_concept “Warm skin” (finding) “Wound, non-healed” (morphologic abnormality) “Surrounding” (qualifier value))
		(clinical_finding ( snomed_concept “Swelling of skin” (finding) “Skin ulcer” (disorder) “Surrounding” (qualifier value))
		(clinical_finding ( snomed_concept “Swelling of skin” (finding)) “Wound, non-healed” (morphologic abnormality) “Surrounding” (qualifier value))
		and any
		(< (measurement (snomed_concept “Systolic blood pressure” (observable entity) mmHg) 90))
		(< (measurement (snomed_concept “Diastolic blood pressure” (observable entity) mmHg) 60))
		(>= (measurement (snomed_concept “Body temperature” (observable entity) °C) 38))
		(clinical_finding ( snomed_concept “Clouded consciousness” (finding))
		(clinical_finding ( snomed_concept “Blister” (morphologic abnormality))
		(clinical_finding ( snomed_concept “Soft tissue crepitus” (finding))
		(clinical_finding ( snomed_concept “Severe pain” (finding) “Skin ulcer” (disorder))
		(clinical_finding ( snomed_concept “Severe pain” (finding) “Wound, non-healed” (morphologic abnormality))
		)
		(clinical_finding (snomed_concept “Acute lower limb ischemia” (disorder))
		(clinical_finding ( snomed_concept “Pain in lower limb” (finding) “Pain provoked by rest” (finding) “Sudden” (qualifier value) “Severe” (severity modifier) (qualifier value))
		and any
		(clinical_finding ( snomed_concept “Numbness of lower limb” (finding))
		(clinical_finding ( snomed_concept “Muscle weakness of limb” (finding))
		(clinical_finding ( snomed_concept “Pale discoloration of entire skin” of body” (finding))
		(clinical_finding ( snomed_concept “Peripheral pulse absent” (finding))
		)
	)
)
;; Page 75 – Skin ulcer or non-healing wound
“Infection likely”
(system_diagnosis_rule
  "Diagnose probable infection"
  (diagnosis
    (snomed_concept “Infectious disease” (disorder))
    probable
  )
  adult
  (and
		(clinical_finding ( snomed_concept “Erythema” (finding) “Skin ulcer” (disorder) “Surrounding” (qualifier value))
		(clinical_finding ( snomed_concept “Erythema” (finding) “Wound, non-healed” (morphologic abnormality) “Surrounding” (qualifier value))
		(clinical_finding ( snomed_concept “Warm skin” (finding) “Skin ulcer” (disorder) “Surrounding” (qualifier value))
		(clinical_finding ( snomed_concept “Warm skin” (finding) “Wound, non-healed” (morphologic abnormality) “Surrounding” (qualifier value))
		(clinical_finding ( snomed_concept “Swelling of skin” (finding) “Skin 	ulcer” (disorder) “Surrounding” (qualifier value))
		(clinical_finding ( snomed_concept “Swelling of skin” (finding)) “Wound, non-healed” (morphologic abnormality) “Surrounding” (qualifier value))
		(< (measurement (snomed_concept “Systolic blood pressure” (observable entity) mmHg) 90))
		(< (measurement (snomed_concept “Diastolic blood pressure” (observable entity) mmHg) 60))
		(>= (measurement (snomed_concept “Body temperature” (observable entity) °C) 38))
		(clinical_finding ( snomed_concept “Clouded consciousness” (finding))
		(clinical_finding ( snomed_concept “Blister” (morphologic abnormality))
		(clinical_finding ( snomed_concept “Soft tissue crepitus” (finding))
		(clinical_finding ( snomed_concept “Severe pain” (finding) “Skin ulcer” (disorder))
		(clinical_finding ( snomed_concept “Severe pain” (finding) “Wound, non-healed” (morphologic abnormality))
	)
)
;; Page 75 – Skin ulcer or non-healing wound
“Acute limb ischaemia likely”
(system_diagnosis_rule
  "Diagnose probable acute limb ischaemia"
  (diagnosis
    (snomed_concept “Acute lower limb ischemia” (disorder))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Pain in lower limb” (finding) “Sudden” (qualifier value) “Severe” (severity modifier) (qualifier value))
		(clinical_finding (snomed_concept “Pain onset at rest” (finding))
		(clinical_finding (snomed_concept “Numbness of lower limb” (finding))
		(clinical_finding (snomed_concept “Monoparesis of lower limb” (disorder))
		(clinical_finding (snomed_concept “Pale discoloration of entire skin of body” (finding))
		(clinical_finding (snomed_concept “Peripheral pulse absent” (finding))
	)
)
;; Page 75 – Skin ulcer or non-healing wound
“Pressure ulcer likely”
(system_diagnosis_rule
  "Diagnose probable pressure ulcer"
  (diagnosis
    (snomed_concept “Pressure injury” (disorder))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Bed-ridden” (finding))
		(clinical_finding (snomed_concept “Impaired wheelchair mobility” (finding))
		(clinical_finding (snomed_concept “Ulcer” (disorder) “Occipital region structure” (body structure))
		(clinical_finding (snomed_concept “Ulcer” (disorder) “Structure of posterior region of trunk” (body structure))
		(clinical_finding (snomed_concept “Ulcer” (disorder) “Structure of posterior cubital region” (body structure))
		(clinical_finding (snomed_concept “Ulcer” (disorder) “Buttock structure” (body structure) “Upper” (qualifier value))
		(clinical_finding (snomed_concept “Ulcer” (disorder) “Heel structure” (body structure))
		(clinical_finding (snomed_concept “Ulcer” (disorder) “Foot structure” (body structure))
	)
;; Page 75 – Skin ulcer or non-healing wound
“Pressure ulcer likely”
(system_diagnosis_rule
  "Diagnose probable pressure ulcer"
  (diagnosis
	(referral 
    (snomed_concept “Pressure injury” (disorder))
    (snomed_concept “Patient referral” (procedure)) or
		(snomed_concept “Referral to hospital” (procedure)) 
		(snomed_concept “Primary care hospital” (environment))
  )
  adult
  (and
		(clinical_finding (snomed_concept “Pressure injury assessment” (procedure))
	)
)
;; Page 75 – Skin ulcer or non-healing wound
“Arterial (ischaemic)  ulcer likely”
(system_diagnosis_rule
  "Diagnose probable arterial (ischaemic)  ulcer"
  (diagnosis
    (snomed_concept “Ischemic ulcer” (disorder))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Ulcer of skin of lower leg” (disorder))
		(clinical_finding (snomed_concept “Ulcer of foot” (disorder))
		(clinical_finding (snomed_concept “Pain in muscle of lower leg” (finding))
		(clinical_finding (snomed_concept “Muscle pain” (finding) “Buttock structure” (body structure))
		(clinical_finding (snomed_concept “Pain provoked by exertion” (finding))
		(clinical_finding (snomed_concept “Abnormal foot pulse” (finding) 	
		(clinical_finding (snomed_concept “Thready pulse” (finding)) 
		(clinical_finding (snomed_concept “Foot pulse absent” (finding))
	)
;; Page 75 – Skin ulcer or non-healing wound
“Arterial (ischaemic)  ulcer likely”
(system_diagnosis_rule
  "Diagnose probable arterial (ischaemic)  ulcer"
  (diagnosis
	(referral 
    (snomed_concept “Ischemic ulcer” (disorder))
    (snomed_concept “Patient referral (procedure)) or
		(snomed_concept “Referral to hospital (procedure)) 
		(snomed_concept “Primary care hospital” (environment))
  )
  adult
  (and
		(clinical_finding (snomed_concept “Wound assessment” (procedure))
	)
)
;; Page 75 – Skin ulcer or non-healing wound
“Venous ulcer likely”
(system_diagnosis_rule
  "Diagnose probable venous ulcer"
  (diagnosis
    (snomed_concept “Venous ulcer of lower limb” (disorder)) or
		(snomed_concept “Venous ulcer of lower leg” (disorder))
		(snomed_concept “Venous ulcer of foot” (disorder))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Post-inflammatory hyperpigmentation” (disorder) “Proximal” (qualifier value) “Ulcer” (disorder))
		(clinical_finding (snomed_concept “Venous varices” (disorder))
		(clinical_finding (snomed_concept “Swelling of lower limb” (finding) “Chronic” (qualifier value))
		(clinical_finding (snomed_concept “Pain in muscle of lower leg” (finding) “No” (qualifier value))
		(clinical_finding (snomed_concept “Muscle pain” (finding) “Buttock structure” (body structure) “No” (qualifier value))
		(clinical_finding (snomed_concept “Normal foot pulse” (finding))
	)
;; Page 75 – Skin ulcer or non-healing wound
“Venous ulcer likely”
(system_diagnosis_rule
  "Diagnose probable venous ulcer"
  (diagnosis
	(referral 
    (snomed_concept “Venous ulcer of lower limb” (disorder)) or
		(snomed_concept “Venous ulcer of lower leg” (disorder))
		(snomed_concept “Venous ulcer of foot” (disorder))
    (snomed_concept “Patient referral” (procedure)) or
		(snomed_concept “Referral to hospital” (procedure)) 
		(snomed_concept “Primary care hospital” (environment))
  )
  adult
  (and
		(clinical_finding (snomed_concept “Wound assessment” (procedure))
	)
)
;; Page 75 – Skin ulcer or non-healing wound
“Diabetic ulcer likely”
(system_diagnosis_rule
  "Diagnose probable diabetic ulcer"
  (diagnosis
    (snomed_concept “Ulcer of foot due to diabetes mellitus” (disorder))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Diabetes mellitus” (disorder) “Known” (qualifier value))
		(clinical_finding (snomed_concept “Ulcer of lower extremity” (disorder))
		(clinical_finding (snomed_concept “Ulcer of foot” (disorder))
		(clinical_finding (snomed_concept “Muscle pain” (finding) “No” (qualifier value))
		(clinical_finding (snomed_concept “Venous varices” (disorder) “No” (qualifier value))
		(clinical_finding (snomed_concept “Swelling of lower limb” (finding) “No” (qualifier value))
		(clinical_finding (snomed_concept “Normal foot pulse” (finding))
		)
	)
)
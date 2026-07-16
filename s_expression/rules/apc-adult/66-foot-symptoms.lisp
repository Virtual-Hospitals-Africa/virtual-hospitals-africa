;; Page 66 - Foot Symptoms
(task
  "Check for urgent foot symptom conditions"
  adult
  (clinical_finding (snomed_concept "Foot finding" (finding))
  (check_for
    (clinical_finding (snomed_concept "Ischemic foot with rest pain" "disorder") (qualifier (snomed_concept "Sudden" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of lower limb" "finding"))
    (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding"))
    (clinical_finding (snomed_concept "Pale discoloration of entire skin of body" "finding"))
    (clinical_finding (snomed_concept "Peripheral pulse absent" "finding"))
		(clinical_finding ( snomed_concept “Pain in muscle of lower limb” (finding))
				(clinical_finding ( snomed_concept “Pain onset during moderate exercise” (finding))
				(clinical_finding ( snomed_concept “Ischemic foot with rest pain” (disorder) “Associated with” (attribute))
				(clinical_finding ( snomed_concept “Gangrene of foot” (disorder) “Associated with” (attribute))
				(clinical_finding ( snomed_concept “Ulcer of foot” (disorder) “Associated with” (attribute))
		(clinical_finding ( snomed_concept “Muscle pain” (finding) “Buttock structure” (body structure))
				(clinical_finding ( snomed_concept “Pain onset during moderate exercise” (finding))
				(clinical_finding ( snomed_concept “Ischemic foot with rest pain” (disorder) “Associated with” (attribute))
				(clinical_finding ( snomed_concept “Gangrene of foot” (disorder) “Associated with” (attribute))
				(clinical_finding ( snomed_concept “Ulcer of foot” (disorder) “Associated with” (attribute))
    (clinical_finding (snomed_concept "Unable to weight-bear" "finding"))
    (clinical_finding (snomed_concept "Injury of foot" "disorder")“Following” (attribute))
		)
  )
)
;; Page 66 - Foot symptoms
"Acute limb ischaemia likely" 
(system_diagnosis_rule
  "Diagnose probable acute lower limb ischemia"
  (diagnosis
    (snomed_concept "Acute lower limb ischemia" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Foot pain" "finding") (qualifier (snomed_concept "Sudden" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept “Numbness of lower limb” (finding))
    (clinical_finding (snomed_concept “Monoparesis of lower limb” (disorder))
    (clinical_finding (snomed_concept “Peripheral pulse absent” (finding))
		(clinical_finding (snomed_concept “Pale discoloration of entire skin of body” (finding))
    )
)
;; Page 66 - Foot symptoms
"Critical limb ischaemia likely" 
(system_diagnosis_rule
  "Diagnose probable critical lower limb ischemia"
  (diagnosis
    (snomed_concept "Critical lower limb ischemia" "disorder")
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Pain in muscle of lower limb” (finding))
		(clinical_finding (snomed_concept “Muscle pain” (finding) “Buttock structure” (body structure))
		(clinical_finding (snomed_concept “Pain provoked by exertion” (finding))
		(clinical_finding (snomed_concept “Ischemic foot with rest pain” 
		(clinical_finding (snomed_concept “Pain provoked by rest” (finding))
    (clinical_finding (snomed_concept "Ulcer of foot" "disorder"))
    (clinical_finding (snomed_concept "Gangrene of foot" "disorder"))
    )
)
;; Page 66 - Foot symptoms
"Tinea pedis or athlete's foot  likely" 
(system_diagnosis_rule
  "Diagnose probable tinea pedis or athlete's foot "
  (diagnosis
    (snomed_concept “Tinea pedis” (disorder))
    probable
  )
  adult
  (and 
			(clinical_finding (snomed_concept “Fissure in skin” (disorder) “Skin lesion” (disorder) “Skin structure of interdigital web of foot” (body structure))
			(clinical_finding (snomed_concept “Peeling of skin” (finding) “Skin lesion” (disorder) “Skin structure of interdigital web of foot” (body structure))
			(clinical_finding (snomed_concept “Scaly skin” (finding) “Skin lesion” (disorder) “Skin structure of interdigital web of foot” (body structure))
			(clinical_finding (snomed_concept “Thick skin" (finding) “Structure of sole of foot” (body structure))
			(clinical_finding (snomed_concept “Thick skin” (finding) “Heel structure” (body structure))
			(clinical_finding (snomed_concept “Thick skin” (finding) “Structure of medial side of foot” (body structure))
			(clinical_finding (snomed_concept “Thick skin” (finding) “Structure of lateral side of foot” (body structure))
		)
)
;; Page 66 - Foot symptoms
"Peripheral neuropathy likely" 
(system_diagnosis_rule
  "Diagnose probable peripheral neuropathy "
  (diagnosis
    (snomed_concept “Peripheral nerve disease” (disorder))
    probable
  )
  adult
  (and  
		(clinical_finding (snomed_concept “Foot pain” (finding) “Generalized” (qualifier value))
		(clinical_finding (snomed_concept “Constant pain” (finding))
		(clinical_finding (snomed_concept “Burning pain” (finding))
		(clinical_finding (snomed_concept “Pins and needles” (finding))
		(clinical_finding (snomed_concept “Numbness of foot” (finding) “Worse’ (qualifier value) “Night time” (qualifier value))
		)
;; Page 66 - Foot symptoms
"Peripheral neuropathy likely" 
(system_diagnosis_rule
  "Diagnose probable peripheral neuropathy "
  (diagnosis
	(consult
	(referral
    (snomed_concept “Peripheral nerve disease” (disorder))
		(snomed_concept “Patient referral” (procedure)) or
		(snomed_concept “Consultation” (procedure))
    probable
  )
  adult
  (and 
		(snomed_concept “Patient referral” (procedure)) or
		(snomed_concept “Consultation” (procedure))
		(clinical_finding (snomed_concept “Pregnancy” (finding))
		(clinical_finding (snomed_concept “Patient condition unchanged” (finding) “After” (attribute) “Treatment given” (situation))
		)
		(snomed_concept “Patient referral” (procedure) “In” (attribute) day) 7))
		(clinical_finding (snomed_concept “Hemiparesis” (disorder))
		(clinical_finding (snomed_concept “Numbness” (finding) “Severe” (severity modifier) (qualifier value))
		(clinical_finding (snomed_concept “Structure of left half of body” (body structure))
		(clinical_finding (snomed_concept “Structure of right half of body” (body structure))
		)
		(snomed_concept “Patient referral” (procedure) “In” (attribute) hour) 24))
		(clinical_finding (snomed_concept “Malignant neoplastic disease” (disorder) “Known” (qualifier value))
		)
)
;; Page 66 - Foot symptoms
"Peripheral vascular disease  likely" 
(system_diagnosis_rule
  "Diagnose probable peripheral vascular disease "
  (diagnosis
    (snomed_concept “Peripheral vascular disease” (disorder))
    probable
  )
  adult
  (and 
		(clinical_finding (snomed_concept “Foot pain” (finding) “Generalized” (qualifier value))
		(clinical_finding (snomed_concept “Pain in muscle of lower limb” (finding))
		(clinical_finding (snomed_concept “Muscle pain” (finding) “Buttock structure” (body structure))
	)
)
;; Page 66 - Foot symptoms
"Plantar fasciitis  likely" 
(system_diagnosis_rule
  "Diagnose probable plantar fasciitis "
  (diagnosis
    (snomed_concept “Plantar fasciitis” (disorder))
    probable
  )
  adult
  (and 
		(clinical_finding (snomed_concept “Heel pain” (finding) “Localized” (qualifier value) “Aggravated by” (attribute) “Ability to initiate walking (observable entity))
		)
;; Page 66 - Foot symptoms
"Plantar fasciitis  likely" 
(system_diagnosis_rule
  "Diagnose probable plantar fasciitis "
  (diagnosis
	(referral 
    (snomed_concept “Plantar fasciitis” (disorder))
		(snomed_concept “Patient referral” (procedure))
  )
  adult
  (and 
		(clinical_finding (snomed_concept “Referral to physiotherapy service” (procedure))
	)
)
;; Page 66 - Foot symptoms
"Bunion  likely" 
(system_diagnosis_rule
  "Diagnose probable bunion "
  (diagnosis
    (snomed_concept “Hallux valgus with bunion” (disorder))
    probable
  )
  adult
  (and 
		(clinical_finding (snomed_concept “Deformity of foot” (finding))
		(clinical_finding (snomed_concept “Mass of body structure” (finding) “Bony” (qualifier value) “Structure of base of phalanx of great toe” (body structure))
		(clinical_finding (snomed_concept “Foot callus” (disorder))
		(clinical_finding (snomed_concept “Erythema of skin” (disorder))
		(clinical_finding (snomed_concept “Ulcer of lower extremity” (disorder))
		)
)
;; Page 66 - Foot symptoms
"Foot at risk ulcers and amputation  likely" 
(system_diagnosis_rule
  "Diagnose probable foot at risk ulcers and amputation "
  (diagnosis
    (snomed_concept “Foot structure” (body structure) “At increased risk for impaired skin integrity” (finding)) or 
		(snomed_concept “Foot structure” (body structure) “Finding of increased risk level” (finding) “Amputation” (procedure))
    probable
  )
  adult
  (and 
		(clinical_finding (snomed_concept “Diabetes mellitus” (disorder))
		(clinical_finding (snomed_concept “Peripheral vascular disease” (disorder))
		(clinical_finding (snomed_concept “Callosity” (disorder))
		(clinical_finding (snomed_concept “Corn - lesion” (disorder))
		(clinical_finding (snomed_concept “Fissure in skin” (disorder))
		(clinical_finding (snomed_concept “Moist skin” (finding) “Soft” (qualifier value) “Structure of interdigital web of foot” (body structure))
		(clinical_finding (snomed_concept “Ulcer” (disorder))
		(clinical_finding (snomed_concept “Deformity of foot” (finding))
		(clinical_finding (snomed_concept “Hallux valgus with bunion” (disorder))
		(clinical_finding (snomed_concept “Pin prick sensation of foot-abnormal” (finding))
		(clinical_finding (snomed_concept “Foot pulse absent” (finding))
		(clinical_finding (snomed_concept “Abnormal foot pulse” (finding) “Weak” (qualifier value))
		)
;; Page 66 - Foot symptoms
"Foot at risk ulcers and amputation  likely" 
(system_diagnosis_rule
  "Diagnose probable foot at risk ulcers and amputation "
  (diagnosis
	(referral 
    (snomed_concept “Foot structure” (body structure) “At increased risk for impaired skin integrity” (finding)) or 
		(snomed_concept “Foot structure” (body structure) “Finding of increased risk level” (finding) “Amputation” (procedure))
		(snomed_concept “Patient referral to specialist” (procedure))
  )
  adult
  (and 
		(clinical_finding (snomed_concept “Deformity of foot” (finding))
		)
  )
)
;; Page 66 - Foot Symptoms
Urgent foot symptoms conditions"
(system_priority_evaluation
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Foot finding" "finding"))
    (or
      (clinical_finding ( snomed_concept “Unable to weight-bear” (finding) “Injury of foot” (disorder) “Following” (attribute))
			)
			(clinical_finding (snomed_concept “Acute lower limb ischemia” (disorder))
			(clinical_finding ( snomed_concept “Ischemic foot with rest pain” (disorder) “Sudden” (qualifier value) “Severe” (severity modifier) (qualifier value))
			(clinical_finding ( snomed_concept “Pale discoloration of entire skin of body” (finding))
			(clinical_finding ( snomed_concept “Peripheral pulse absent” (finding))
			(clinical_finding (snomed_concept "Numbness of lower limb" "finding"))
      (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding"))
			)
			(clinical_finding (snomed_concept “Critical lower limb ischemia” (disorder))
			(clinical_finding ( snomed_concept “Pain in muscle of lower limb” (finding))
			(clinical_finding ( snomed_concept “Pain onset during moderate exercise” (finding))
			(clinical_finding ( snomed_concept “Ischemic foot with rest pain” (disorder) “Associated with” (attribute))
			(clinical_finding ( snomed_concept “Gangrene of foot” (disorder) “Associated with” (attribute))
			(clinical_finding ( snomed_concept “Ulcer of foot” (disorder) “Associated with” (attribute))
			(clinical_finding ( snomed_concept “Muscle pain” (finding) “Buttock structure” (body structure))
			(clinical_finding ( snomed_concept “Pain onset during moderate exercise” (finding))
			(clinical_finding ( snomed_concept “Ischemic foot with rest pain” (disorder) “Associated with” (attribute))
      (clinical_finding (snomed_concept "Gangrene of foot" "disorder")“Associated with” (attribute))
      (clinical_finding ( snomed_concept “Ulcer of foot” (disorder) “Associated with” (attribute))
    )
  )
)
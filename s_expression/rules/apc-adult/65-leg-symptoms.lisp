;; Page 65 - Leg Symptoms
(task
  "Check for urgent leg symptom conditions"
  adult
  (clinical_finding (snomed_concept "Finding of lower limb" (finding))
  (check_for
    (clinical_finding (snomed_concept "Pain in calf" "finding") (qualifier (snomed_concept "Unilateral" "qualifier value")))
    (clinical_finding (snomed_concept "Swollen calf" "finding") (qualifier (snomed_concept "Unilateral" "qualifier value")))
    (clinical_finding (snomed_concept "Peripheral pulse absent" "finding"))
    (clinical_finding (snomed_concept "Numbness of lower limb" "finding"))
    (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding"))
		(clinical_finding ( snomed_concept “Pain in muscle of lower limb” (finding) 	
				(clinical_finding ( snomed_concept "Pain onset during moderate exercise” (finding))
				(clinical_finding ( snomed_concept “Pain provoked by rest” (finding)) 
				(clinical_finding ( snomed_concept “Gangrene” (morphologic abnormality) “Associated with” (attribute))
				(clinical_finding ( snomed_concept “Ulcer” (morphologic abnormality) “Associated with” (attribute))
		(clinical_finding ( snomed_concept “Muscle pain” (finding) “Buttock structure” (body structure))
				(clinical_finding ( snomed_concept “Pain onset during moderate exercise” (finding))
				(clinical_finding ( snomed_concept “Pain provoked by rest” (finding)) 
	   	 (clinical_finding (snomed_concept "Gangrene" "morphologic abnormality"))
			 (clinical_finding ( snomed_concept “Ulcer” (morphologic abnormality) “Associated with” (attribute))
    (clinical_finding (snomed_concept "Pain in lower limb" "finding") (qualifier (snomed_concept "Sudden" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Unable to weight-bear" "finding") "Injury of lower limb" "disorder") “Following” (attribute))
    (clinical_finding (snomed_concept "Smoker" "finding"))
    (clinical_finding (snomed_concept "Impaired mobility" "finding"))
    (clinical_finding (snomed_concept "Pregnancy" "finding"))
    (clinical_finding (snomed_concept "Estrogen hormone therapy" "procedure"))
		(clinical_finding ( snomed_concept “Acute care inpatient service” (qualifier value) Recent (qualifier value))
    (clinical_finding (snomed_concept "Tuberculosis" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
    (clinical_finding (snomed_concept "Malignant neoplastic disease" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
    (clinical_finding (snomed_concept "Pain in lower limb" "finding"))
		(clinical_finding ( snomed_concept “Injury of lower limb” (disorder))
		(clinical_finding ( snomed_concept “Pale discoloration of entire skin of body” (finding))
		)
  )
)
;; Page 65 - Leg Symptoms
"Deep venous thrombosis likely"
(system_diagnosis_rule
  "Diagnose possible deep venous thrombosis"
  (diagnosis
    (snomed_concept "Deep venous thrombosis" "disorder")
    probable 
  )
  adult
  (or
    (clinical_finding (snomed_concept "Pain in calf" "finding") “Unilateral” (qualifier value))
    (clinical_finding (snomed_concept "Swollen calf" "finding") “Unilateral” (qualifier value))
		(>measurement (snomed_concept “Body mass index” (observable entity) m/kg^²) 30))
		(clinical_finding (snomed_concept “Smoker” (finding))
		(clinical_finding (snomed_concept “Impaired mobility” (finding))
		(clinical_finding (snomed_concept “Pregnancy” (finding))
		(clinical_finding (snomed_concept “Treatment given” (situation)) “Substance with estrogen receptor agonist mechanism of action” (substance))
		(clinical_finding (snomed_concept “Injury of lower limb” (disorder))
		(clinical_finding (snomed_concept “Hospital admission” (procedure) “Recent” (qualifier value))
		(clinical_finding (snomed_concept “Tuberculosis” (disorder))
		(clinical_finding (snomed_concept “Malignant neoplastic disease” (disorder))
	)
)
;; Page 65 - Leg Symptoms
"Critical limb ischaemia likely"
(system_diagnosis_rule
  "Diagnose possible critical limb ischaemia"
  (diagnosis
    (snomed_concept "Critical lower limb ischemia" "disorder")
    probable 
  )
  adult
  (or
		(clinical_finding (snomed_concept “Peripheral vascular disease” (disorder))
		(clinical_finding (snomed_concept “Pain in muscle of lower leg” (finding))
		(clinical_finding (snomed_concept “Pain in buttock” (finding) “Structure of muscle of buttock” (body structure))
		(clinical_finding (snomed_concept “Pain provoked by exertion” (finding))
		(clinical_finding (snomed_concept “Pain onset at rest” (finding))
		(clinical_finding (snomed_concept “Gangrenous disorder” (disorder))
		(clinical_finding (snomed_concept “Ulcer of lower extremity” (disorder))
	)
)
;; Page 65 - Leg Symptoms
"Irritation of sciatic nerve likely"
(system_diagnosis_rule
  "Diagnose possible irritation of sciatic nerve"
  (diagnosis
    (snomed_concept “Sciatic neuropathy” (disorder)) or
		(snomed_concept “Sciatica” (disorder))
    probable 
  )
  adult
  (or
		(clinical_finding (snomed_concept “Pain in buttock” (finding))
		(clinical_finding (snomed_concept “Pain radiating to left leg” (finding) “Posterior” (qualifier value))
		(clinical_finding (snomed_concept “Pain radiating to right leg” (finding) “Posterior” (qualifier value))
		(clinical_finding (snomed_concept “Swelling of lower limb” (finding) “No” (qualifier value))
	)
)
;; Page 65 - Leg Symptoms
"Irritation of sciatic nerve likely"
(system_diagnosis_rule
  "Diagnose possible irritation of sciatic nerve"
  (diagnosis
	(referral 
    (snomed_concept “Sciatic neuropathy” (disorder)) or
		(snomed_concept “Sciatica” (disorder))
		(snomed_concept “Patient referral”(procedure)) or
		(snomed_concept “Patient referral” (procedure) “In” (attribute) hour) 24)) 
  )
  adult
  (or
		(snomed_concept “Patient referral” (procedure) “In” (attribute) hour) 24)) 
		(clinical_finding (snomed_concept “Retention of urine” (disorder))
		(clinical_finding (snomed_concept “Impaction of large intestine” (disorder))
		(clinical_finding (snomed_concept “Urinary incontinence” (finding))
		(clinical_finding (snomed_concept “Incontinence of feces” (finding))
		(clinical_finding (snomed_concept “Numbness” (finding) “Buttock structure” (body structure))
		(clinical_finding (snomed_concept “Numbness” (finding) “Perineal structure” (body structure))
		(clinical_finding (snomed_concept “Numbness of lower limb” (finding))
		(clinical_finding (snomed_concept “Monoparesis of lower limb” (disorder))
		(clinical_finding (snomed_concept “Difficulty walking” (finding))
		)
		(snomed_concept “Patient referral”(procedure))
		(clinical_finding (snomed_concept “Confirmation of” (contextual qualifier) (qualifier value) “Diagnosis” (observable entity))
		(>= (clinical_finding (snomed_concept “Pain in buttock” (finding) week) 4))
	)
)
;; Page 65 - Leg Symptoms
"Joint problem likely"
(system_diagnosis_rule
  "Diagnose possible joint problem"
  (diagnosis
    (snomed_concept “Joint finding” (finding))
    probable 
  )
  adult
  (or
		(clinical_finding (snomed_concept “Joint warm” (finding))
		(clinical_finding (snomed_concept “Tenderness of joint” (finding))
		(clinical_finding (snomed_concept “Joint swelling” (finding))
		(clinical_finding (snomed_concept “Difficulty moving” (finding))
		(clinical_finding (snomed_concept “Unable to move” (finding))
	)
)
;; Page 65 - Leg Symptoms
"Fracture likely likely"
(system_diagnosis_rule
  "Diagnose possible fracture likely"
  (diagnosis
    (snomed_concept "Fracture of bone" "disorder")
    probable 
  )
  adult
  (or
		(clinical_finding (snomed_concept"Unable to weight-bear” (finding) “Following” (attribute) “Traumatic injury” (disorder))
	)
)
;; Page 65 - Leg Symptoms
"Peripheral vascular disease likely"
(system_diagnosis_rule
  "Diagnose possible peripheral vascular disease"
  (diagnosis
    (snomed_concept "Peripheral vascular disease" "disorder")
    probable 
  )
  adult
  (or
		(clinical_finding (snomed_concept “Pain in muscle of lower limb“ (finding))
		(clinical_finding (snomed_concept “Muscle pain” (finding) “Buttock structure” (body structure))
		(clinical_finding (snomed_concept “Pain provoked by exertion” (finding))
		(clinical_finding (snomed_concept “Pain relief by rest” (finding))
	)
)
;; Page 65 - Leg Symptoms
"Heart failure likely"
(system_diagnosis_rule
  "Diagnose possible heart failure"
  (diagnosis
    (snomed_concept "Heart failure" "disorder")
    probable 
  )
  adult
  (or 
		(clinical_finding (snomed_concept “Localized swelling of bilateral lower legs” (finding))
		(clinical_finding (snomed_concept “Difficulty breathing” (finding))
		(clinical_finding (snomed_concept “Orthopnea” (finding))
	)
)
;; Page 65 - Leg Symptoms
"Sprain or strain likely"
(system_diagnosis_rule
  "Diagnose possible sprain or strain"
  (diagnosis
    (snomed_concept “Sprain of ligament” (disorder))
		(snomed_concept “Muscle strain” (disorder))
    probable 
  )
  adult
  (or flat
		(clinical_finding (snomed_concept “Leg swelling symptom” (finding))
		(clinical_finding (snomed_concept “Traumatic injury” (disorder) “Recent” (qualifier value))
	)
)
;; Page 65 - Leg Symptoms
"Acute lower limb ischemia likely" 
(system_diagnosis_rule
  "Diagnose possible acute lower limb ischemia"
  (diagnosis
    (snomed_concept "Acute lower limb ischemia" "disorder")
    possible
  )
  adult
  (and
		(clinical_finding (snomed_concept “Peripheral vascular disease” (disorder))
    (clinical_finding (snomed_concept "Pain in lower limb" "finding") “Sudden” (qualifier value) “Severe” (severity modifier) (qualifier value))
    (clinical_finding (snomed_concept “Pain provoked by rest” (finding))
    (clinical_finding (snomed_concept "Numbness of lower limb" "finding"))
    (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding"))
		(clinical_finding (snomed_concept “Pale discoloration of entire skin of body” (finding))
		(clinical_finding (snomed_concept “Peripheral pulse absent” (finding))
		(clinical_finding (snomed_concept “Skin ulcer” (disorder))
		(clinical_finding (snomed_concept “Impaired wound healing” (finding))
		)
  )
)
;; Page 65 - Leg Symptoms
(system_priority_evaluation
  "Urgent leg conditions"
  adult
  Urgent
	(clinical_finding (snomed_concept "Finding of lower limb" (finding))
  (and
		(clinical_finding (snomed_concept “Fracture of bone” (disorder))
		(clinical_finding ( snomed_concept “Unable to weight-bear” (finding) “Injury of lower limb” (disorder) “After” (attribute))
		)
		(clinical_finding (snomed_concept “Deep venous thrombosis” (disorder))
    (clinical_finding (snomed_concept "Pain in calf" "finding") “Unilateral” (qualifier value))
    (clinical_finding (snomed_concept "Swollen calf" "finding") “Unilateral” (qualifier value))
		(>measurement (snomed_concept “Body mass index” (observable entity) m/kg^²) 30))
		(clinical_finding ( snomed_concept “Smoker” (finding))
		(clinical_finding ( snomed_concept “Impaired mobility” (finding))
		(clinical_finding ( snomed_concept “Pregnancy” (finding))
		(clinical_finding ( snomed_concept “Estrogen hormone therapy” (procedure))
		(clinical_finding ( snomed_concept “Injury of lower limb” (disorder))
		(clinical_finding ( snomed_concept “Acute care inpatient service” (qualifier value) Recent (qualifier value))
		(clinical_finding ( snomed_concept “Tuberculosis” (disorder))
		(clinical_finding ( snomed_concept “Malignant neoplastic disease” (disorder))
		)
		(clinical_finding (snomed_concept “Acute lower limb ischemia” (disorder))
    (clinical_finding (snomed_concept "Pain in lower limb" "finding") “Pain provoked by rest” (finding) “Sudden” (qualifier value) “Severe” (severity modifier) (qualifier value))
		and
		(clinical_finding ( snomed_concept “Pale discoloration of entire skin of body” (finding))
		(clinical_finding ( snomed_concept “Peripheral pulse absent” (finding))
    (clinical_finding (snomed_concept "Numbness of lower limb" "finding"))
    (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding"))
		(clinical_finding (snomed_concept “Critical lower limb ischemia” (disorder))
		(clinical_finding ( snomed_concept “Pain in muscle of lower limb” (finding))
	 			(clinical_finding ( snomed_concept "Pain onset during moderate exercise” (finding)
				(clinical_finding ( snomed_concept “Pain provoked by rest” (finding)) 
				(clinical_finding ( snomed_concept “Gangrene” (morphologic abnormality) “Associated with” (attribute))
				(clinical_finding ( snomed_concept “Ulcer” (morphologic abnormality) “Associated with” (attribute))
		(clinical_finding ( snomed_concept “Muscle pain” (finding) “Buttock structure” (body structure)
				(clinical_finding ( snomed_concept “Pain onset during moderate exercise” (finding))
				(clinical_finding ( snomed_concept “Pain provoked by rest” (finding)) 
				(clinical_finding ( snomed_concept “Gangrene” (morphologic abnormality) “Associated with” (attribute))
				(clinical_finding ( snomed_concept “Ulcer” (morphologic abnormality) “Associated with” (attribute))
		)
	)
)
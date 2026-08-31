;; Page 74 - Skin Lumps
(task
  "Check for urgent skin lump conditions"
  adult
	  (clinical_finding (snomed_concept "Mass of skin" "finding"))
  (check_for
		(clinical_finding ( snomed_concept “Mass of skin” (finding) “Abnormal shape” (qualifier value) “Poorly defined” (qualifier value))
    (clinical_finding (snomed_concept "Pigmented skin lesion" "disorder"))
    (clinical_finding (snomed_concept "Irregular outline of pigmented skin lesion" "disorder"))
    (clinical_finding (snomed_concept "Change in skin lesion" "finding"))
“Lesion size” (observable entity))
		(clinical_finding ( snomed_concept “Change in skin lesion” (finding) “Dimensions” (qualifier value))
		(clinical_finding ( snomed_concept “Change in skin lesion” (finding) “Color” (observable entity))
    (clinical_finding (snomed_concept "Pigmented nevus" "morphologic abnormality"))
		(> measurement  (clinical_finding ( snomed_concept “Lesion size” (observable entity) “Wide” (qualifier value) “Millimeter” (qualifier value) 6))
    (clinical_finding (snomed_concept "Bleeds easily" "finding"))
    (clinical_finding (snomed_concept "Itching” (finding) “Mass” (morphologic abnormality))
    (clinical_finding (snomed_concept "Pain" "finding") “Mass” (morphologic abnormality))
    (clinical_finding (snomed_concept "Firm mass" "morphologic abnormality"))
    (clinical_finding ( snomed_concept “Redness of skin over lesion” (finding))
		(clinical_finding ( snomed_concept “Temperature of skin over lesion” warm” (finding))
    (clinical_finding (snomed_concept "Fluctuant mass" "morphologic abnormality"))
		(clinical_finding ( snomed_concept “Purulent” (morphologic abnormality)) 
  )
)
;;Page 74 – Skin lumps
(system_priority_evaluation
“Urgent skin lump symptoms”
	adult
	Urgent
	(and
		(clinical_finding ( snomed_concept “Mass of skin” (finding))
	(or
		(clinical_finding ( snomed_concept “Mass of skin” (finding) “Abnormal shape” (qualifier value) “Poorly defined” (qualifier value)) or
		(clinical_finding ( snomed_concept “Pigmented skin lesion” (disorder))
		)
		(clinical_finding ( snomed_concept “Irregular outline of pigmented skin lesion” (disorder)) 
		(clinical_finding ( snomed_concept “Change in skin lesion” (finding) “Lesion size” (observable entity))
		(clinical_finding ( snomed_concept “Change in skin lesion” (finding) “Dimensions” (qualifier value))
		(clinical_finding ( snomed_concept “Change in skin lesion” (finding) “Color” (observable entity))
		)
		(clinical_finding ( snomed_concept “Pigmented nevus” (morphologic abnormality))
		)
		(> measurement  (clinical_finding ( snomed_concept “Lesion size” (observable entity) “Wide” (qualifier value) “Millimeter” (qualifier value) 6))
		)
		(clinical_finding ( snomed_concept “Bleeds easily” (finding) “Mass” (morphologic abnormality))
		)
		(clinical_finding ( snomed_concept “Itching” (finding) “Mass” (morphologic abnormality))
		) 
	)
)
;; Page 74 - Skin Lumps
“Boil/abscess likely”
(system_diagnosis_rule
  "Diagnose probable boil/abscess"
  (diagnosis
    (snomed_concept “Furuncle” (disorder)) or
		(snomed_concept “Abscess” (disorder))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Mass of skin” (finding)) or 
		(clinical_finding (snomed_concept “Mass of soft tissue” (finding))
		(clinical_finding (snomed_concept “Pain” (finding))
		(clinical_finding (snomed_concept “Firm mass” (morphologic abnormality))
		(clinical_finding (snomed_concept “Redness of skin over lesion” (finding))
		(clinical_finding (snomed_concept “Temperature of skin over lesion warm” (finding))
		(clinical_finding (snomed_concept “Fluctuant” (finding) “Central” (qualifier value))
		(clinical_finding (snomed_concept “Purulent discharge” (morphologic abnormality))
	)
)
;; Page 74 - Skin Lumps
“Warts likely”
(system_diagnosis_rule
  "Diagnose probable warts"
  (diagnosis
    (snomed_concept “Warts” (disorder)) 
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Mass of skin” (finding)) 
		(clinical_finding (snomed_concept “Verruca” (morphologic abnormality))
		(clinical_finding (snomed_concept “Papule” (morphologic abnormality)) 
				(snomed_concept “Round shape” (qualifier value))
				(snomed_concept “Raised” (qualifier value))
		(clinical_finding (snomed_concept “Rough skin” (finding) “Surface” (qualifier value))
	)
;; Page 74 - Skin Lumps
“Warts likely”
(system_diagnosis_rule
  "Diagnose probable warts"
  (diagnosis
	(referral 
    (snomed_concept “Warts” (disorder)) 
		(snomed_concept “Patient referral” (procedure))
  )
  adult
  (and
		(clinical_finding (snomed_concept “Verruca” (morphologic abnormality) “Extensive” (qualifier value))
		(clinical_finding (snomed_concept “Verruca plantaris” (disorder) “In” (attribute) “Diabetes mellitus” (disorder) “Known” (qualifier value))
	)
)
;; Page 74 - Skin Lumps
“Molluscum contagiosum likely”
(system_diagnosis_rule
  "Diagnose probable molluscum contagiosum"
  (diagnosis
    (snomed_concept “Infection caused by Molluscum contagiosum” (disorder))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Papule” (morphologic abnormality))
			(snomed_concept “Small” (qualifier value))
			(snomed_concept “Opalescent” (qualifier value))
			(snomed_concept “Normal color of skin over lesion” (finding))
		(clinical_finding (snomed_concept “Indented structure” (morphologic abnormality) “Central” (qualifier value))
	)
;; Page 74 - Skin Lumps
“Molluscum contagiosum likely”
(system_diagnosis_rule
  "Diagnose probable molluscum contagiosum"
  (diagnosis
	(referral 
    (snomed_concept “Infection caused by Molluscum contagiosum” (disorder))
    (snomed_concept “Patient referral” (procedure))
  )
  adult
  (and
		(clinical_finding (snomed_concept “Extensive” (qualifier value))
		(clinical_finding (snomed_concept “Lesion of eyelid” (disorder))
		(clinical_finding (snomed_concept “Poor response to treatment” (situation) 
		(clinical_finding (snomed_concept “Treatment not tolerated” (situation) “Increased intolerance” (finding))
	)
)
;; Page 74 - Skin Lumps
“Kaposi’s sarcoma likely”
(system_diagnosis_rule
  "Diagnose probable kaposi’s sarcoma"
  (diagnosis
	(referral 
    (snomed_concept “Kaposi's sarcoma” (disorder))
		(snomed_concept “Patient referral” (procedure))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Biopsy” (procedure))
		(clinical_finding (snomed_concept “Confirmation of” (contextual qualifier) (qualifier value) “Diagnosis” (observable entity))
		)
		(clinical_finding (snomed_concept “Mass” (morphologic abnormality) “Isolated” (qualifier value))
		(clinical_finding (snomed_concept “Ulcerated tumor configuration” (finding) “Large” (qualifier value))
		(clinical_finding (snomed_concept “Mouth region structure” (body structure) “Involved” (qualifier value))
		(clinical_finding (snomed_concept “Genital structure” (body structure) “Involved” (qualifier value))
		(clinical_finding (snomed_concept “Mass of skin” (finding))
		(clinical_finding (snomed_concept “Painless” (qualifier value))
		(clinical_finding (snomed_concept “Purple color” (qualifier value))
		(clinical_finding (snomed_concept “Brown color” (qualifier value))
	)
)
 ;; Page 74 - Skin Lumps
“Epidermoid cyst likely”
(system_diagnosis_rule
  "Diagnose probable epidermoid cyst"
  (diagnosis
    (snomed_concept “Epidermoid cyst” (disorder))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Mass of subcutaneous tissue” (finding))
		(clinical_finding (snomed_concept “Smooth” (qualifier value))
		(clinical_finding (snomed_concept “Well defined” (qualifier value))
		(clinical_finding (snomed_concept “Round shape” (qualifier value))
		(clinical_finding (snomed_concept “Firm mass” (morphologic abnormality))
		(clinical_finding (snomed_concept “Face structure” (body structure) “Involved” (qualifier value))
		(clinical_finding (snomed_concept “Trunk structure” (body structure) “Involved” (qualifier value))
		(clinical_finding (snomed_concept “Limb structure” (body structure) “Involved” (qualifier value))
		(clinical_finding (snomed_concept “Skin punctum” (disorder) “Central” (qualifier value))
		(clinical_finding (snomed_concept “Discharge - substance” (substance) “White color” (qualifier value))
	)
)
;; Page 74 - Skin Lumps
“Lipoma likely”
(system_diagnosis_rule
  "Diagnose probable lipoma"
  (diagnosis
    (snomed_concept “Lipoma” (disorder)) 
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Mass of subcutaneous tissue” (finding))
				(snomed_concept “Smooth” (qualifier value))
				(snomed_concept “Well defined” (qualifier value))
				(snomed_concept “Trunk structure” (body structure) “Involved” (qualifier value))
				(snomed_concept “Upper limb structure” (body structure) “Involved” (qualifier value))
		(clinical_finding (snomed_concept “Soft mass” (morphologic abnormality))
				(snomed_concept “Rubbery subcutaneous tissue” (finding))
				(snomed_concept “Painless” (qualifier value))
				(snomed_concept “Moveable” (qualifier value))
				(snomed_concept “Trunk structure” (body structure) “Involved” (qualifier value))
				(snomed_concept “Upper limb structure” (body structure) “Involved” (qualifier value))
	)
;; Page 74 - Skin Lumps
“Lipoma likely”
(system_diagnosis_rule
  "Diagnose probable lipoma"
  (diagnosis
	(referral 
    (snomed_concept “Lipoma” (disorder)) 
    (snomed_concept “Patient referral” (procedure))
  )
  adult
  (and
		(>(clinical_finding (snomed_concept “ Lump size” (observable entity) cm) 3))
		(clinical_finding (snomed_concept “Causing” (attribute) “Pain” (finding))
		(clinical_finding (snomed_concept “Causing” (attribute) “Discomfort” (finding))
		(clinical_finding (snomed_concept “Lump size” (observable entity)
 “Increased size” (finding) 
		(clinical_finding (snomed_concept “Firm mass” (morphologic abnormality))
		(clinical_finding (snomed_concept “Mass of soft tissue” (finding))
		(clinical_finding (snomed_concept “Mass of body structure” (finding) “New” (qualifier value) > “Persistence” (finding) month) 1))
		(clinical_finding (snomed_concept “Increased intolerance” (finding))
	)
)
;; Page 74 - Skin Lumps
“Acne likely”
(system_diagnosis_rule
  "Diagnose probable acne"
  (diagnosis
    (snomed_concept “Acne” (disorder)) 
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Papule” (morphologic abnormality) Red color (qualifier value))
		(clinical_finding (snomed_concept “Pustule” (morphologic abnormality))
		(clinical_finding (snomed_concept “Nodule” (morphologic abnormality))
		(clinical_finding (snomed_concept “Comedone” (disorder))
		(clinical_finding (snomed_concept “Face structure” (body structure) “Involved” (qualifier value))
		(clinical_finding (snomed_concept “Thoracic structure (body structure) “Involved’ (qualifier value))
		(clinical_finding (snomed_concept “Structure of posterior region of trunk” (body structure) “Involved” (qualifier value))
		(clinical_finding (snomed_concept “Structure of upper limb between shoulder and elbow” (body structure) “Involved” (qualifier value))
	)
;; Page 74 - Skin Lumps
“Acne likely”
(system_diagnosis_rule
  "Diagnose probable acne"
  (diagnosis
	(referral 
    (snomed_concept “Acne” (disorder)) 
    (snomed_concept “Patient referral” (procedure))
  )
  adult
  (and
		(clinical_finding (snomed_concept “Symptom severe” (finding))
		(clinical_finding (snomed_concept “Poor response to treatment” (situation) “After” (attribute) month) 6))
		)
	)
)

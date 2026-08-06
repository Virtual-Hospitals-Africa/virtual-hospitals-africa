;; Page 79 - Changes in Skin Colour
(task
  "Check for urgent skin colour change conditions"
  adult
  (clinical_finding (snomed_concept "Discoloration of skin" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Yellow skin" "finding"))
		(clinical_finding ( snomed_concept “Jaundice" (finding))
		(clinical_finding ( snomed_concept “Abdominal pain” (finding) “Severe” (severity modifier) (qualifier value))
		(clinical_finding ( snomed_concept “Drowsy” (finding))
		(clinical_finding ( snomed_concept “Clouded consciousness” (finding))
		(clinical_finding ( snomed_concept “Easy bruising” (finding))
		(clinical_finding ( snomed_concept “Bleeds easily” (finding))
		(clinical_finding ( snomed_concept “Pregnancy” (finding))
		(clinical_finding (snomed_concept “Drinking binge” (finding) “Recent” (qualifier value))
		(clinical_finding ( snomed_concept “Alcohol dependence” (disorder))
		(>= (measurement (clinical_finding ( snomed_concept “Drinking binge” (finding) “Drinking session” (finding) “bottles/day” (qualifier value)4))
		(>= (measurement (clinical_finding ( snomed_concept “Drinking binge (finding) “Drinking session” (finding) “glasses/day” (qualifier value) 4))
		(clinical_finding ( snomed_concept “Does take medication” (finding))
		(clinical_finding ( snomed_concept “Illicit drug use” (finding)) 
  )
)
;; Page 79 – Changes in skin colour
(system_priority_evaluation
	“Urgent skin conditions with color changes”
	adult
	Urgent
		(clinical_finding ( snomed_concept “Discoloration of skin” (finding))
	(and
		(clinical_finding ( snomed_concept “Jaundice (finding))
		and any
		(< (measurement (snomed_concept “Systolic blood pressure” (observable entity) mmHg) 90))
		(< (measurement (snomed_concept “Diastolic blood pressure” (observable entity) mmHg) 60))
		(>= (measurement (snomed_concept “Body temperature” (observable entity) °C) 38))
		(<(clinical_finding (snomed_concept “Measurement of total hemoglobin concentration” (procedure) “Woman” (person) g/dL) 12)) or
		(<(clinical_finding (snomed_concept “Measurement of total hemoglobin concentration” (procedure) “Man” (person) g/dL) 13))
    (clinical_finding (snomed_concept "Acute abdominal pain" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Acute abdominal pain" "finding"))
    (clinical_finding (snomed_concept "Alcohol dependence" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
    (clinical_finding (snomed_concept "Bleeds easily" "finding"))
    (clinical_finding (snomed_concept "Clouded consciousness" "finding")) 		or
    (clinical_finding (snomed_concept "Drowsy" "finding"))
    (clinical_finding (snomed_concept "Easy bruising" "finding"))
    (clinical_finding (snomed_concept “Bleeds easily” (finding))
		(clinical_finding (snomed_concept “Drinking binge” (finding) “Recent” (qualifier value))
		(clinical_finding ( snomed_concept “Alcohol dependence” (disorder))
		or
		>= (measurement (clinical_finding ( snomed_concept “Drinking binge” (finding) “Drinking session” (finding) “bottles/day” (qualifier value)4))
		(>= (measurement (clinical_finding ( snomed_concept “Drinking binge (finding) “Drinking session” (finding) “glasses/day” (qualifier value) 4))
		(clinical_finding ( snomed_concept “Does take medication” (finding))
		or
    (clinical_finding (snomed_concept "Illicit drug use" "finding"))
    (clinical_finding (snomed_concept "Pregnancy" "finding"))
		)   
  )
)
;; Page 79 - Changes in Skin Colour
"Jaundice likely"
(system_diagnosis_rule
  "Diagnose probable jaundice"
  (diagnosis
    (snomed_concept "Jaundice" "finding")
    probable
  )
  adult
	(and 
	  (clinical_finding (snomed_concept "Yellow skin" "finding"))
	)
;; Page 79 - Changes in Skin Colour
"Jaundice likely"
(system_diagnosis_rule
  "Diagnose probable jaundice"
  (diagnosis
	(urgent_referral 
    (snomed_concept "Jaundice" "finding")
		(snomed_concept “Urgent referral” (procedure))
  )
  adult
	(and 
		(>= (measurement (clinical_finding (snomed_concept “Body temperature” (observable entity) °C) 38))
		(<(clinical_finding (snomed_concept “Measurement of total hemoglobin concentration” (procedure) “Woman” (person) g/dL) 12))
		(<(clinical_finding (snomed_concept “Measurement of total hemoglobin concentration” (procedure) “Man” (person) g/dL) 13))
		(< (measurement (clinical_finding (snomed_concept “Systolic blood pressure” (observable entity) mmHg) 90))
		(< (measurement (clinical_finding (snomed_concept “Diastolic blood pressure” (observable entity) mmHg) 60))
		(clinical_finding (snomed_concept “Abdominal pain” (finding) “Severe” (severity modifier) (qualifier value))
		(clinical_finding (snomed_concept “Drowsy” (finding))
		(clinical_finding (snomed_concept “Clouded consciousness” (finding))
		(clinical_finding (snomed_concept “Easy bruising” (finding))
		(clinical_finding (snomed_concept “Bleeds easily” (finding))
		(clinical_finding (snomed_concept “Pregnancy” (finding))
		(clinical_finding (snomed_concept “Alcohol dependence” (disorder))
		or
		(>= (measurement (clinical_finding ( snomed_concept “Drinking binge” (finding) “Drinking session” (finding) “bottles/day” (qualifier value)4))
		(>= (measurement (clinical_finding ( snomed_concept “Drinking binge (finding) “Drinking session” (finding) “glasses/day” (qualifier value) 4))
		(clinical_finding ( snomed_concept “Does take medication” (finding))
		or
    (clinical_finding (snomed_concept "Illicit drug use" "finding"))
    (clinical_finding (snomed_concept "Pregnancy" "finding"))
		(clinical_finding (snomed_concept “Drinking binge” (finding) “Recent” (qualifier value))
	)
)

;; Page 79 - Changes in Skin Colour
"Acute Hepatitis A infection likely"
(system_diagnosis_rule
  "Diagnose probable acute hepatitis A infection"
  (diagnosis
	(referral 
    (snomed_concept “Viral hepatitis, type A” (disorder))
		(snomed_concept “Patient referral” (procedure))
    probable
  )
  adult
	(and 
		(clinical_finding (snomed_concept “Nausea” (finding))
		(clinical_finding (snomed_concept “Vomiting” (disorder))
		(clinical_finding (snomed_concept “Not tolerating oral fluid” (situation))
	)
)
;; Page 79 - Changes in Skin Colour
"Venous stasis likely"
(system_diagnosis_rule
  "Diagnose probable venous stasis"
  (diagnosis
    (snomed_concept "Venous stasis" "finding")
    probable
  )
  adult
	(and 
		(clinical_finding (snomed_concept “Plaque” (morphologic abnormality) “Dark color” (finding) “Structure of lower limb from knee to ankle” (body structure))
		(clinical_finding (snomed_concept “Discoloration of skin” (finding) “Brown red color” (qualifier value))
		(clinical_finding (snomed_concept “Broken skin” (disorder))
		(clinical_finding (snomed_concept “Skin ulcer” (disorder))
		(clinical_finding (snomed_concept “Spider veins of bilateral lower limbs” (disorder))
	)
)
;; Page 79 - Changes in Skin Colour
"Melasma likely"
(system_diagnosis_rule
  "Diagnose probable melasma"
  (diagnosis
    (snomed_concept “Chloasma” (disorder))
    probable
  )
  adult
	(and 
		(clinical_finding (snomed_concept “Plaque” (morphologic abnormality) “Dark color” (finding) “Face structure” (body structure))
		(clinical_finding (snomed_concept “Plaque” (morphologic abnormality) “Brown color” (qualifier value) “Cheek structure” (body structure))
		(clinical_finding (snomed_concept “Plaque” (morphologic abnormality) “Brown color” (qualifier value) “Forehead structure” (body structure))
		(clinical_finding (snomed_concept “Plaque” (morphologic abnormality) “Brown color” (qualifier value) “Upper lip structure” (body structure))
	)
)
;; Page 79 - Changes in Skin Colour
"Tinea versicolor likely"
(system_diagnosis_rule
  "Diagnose probable tinea versicolor"
  (diagnosis
    (snomed_concept “Pityriasis versicolor” (disorder))
    probable
  )
  adult
	(and 
		(clinical_finding (snomed_concept “Plaque” (morphologic abnormality) “Dark color” (finding)) 
		(clinical_finding (snomed_concept “Plaque” (morphologic abnormality) “Light color” (qualifier value))
		(clinical_finding (snomed_concept “Scaly skin” (finding) “Fine” (qualifier value))
		(clinical_finding (snomed_concept “Trunk structure” (body structure) “Involved” (qualifier value))
		(clinical_finding (snomed_concept “Neck structure” (body structure) “Involved” (qualifier value))
		(clinical_finding (snomed_concept “Structure of upper limb between shoulder and elbow” (body structure) “Involved” (qualifier value))
	)
)
;; Page 79 - Changes in Skin Colour
"Vitiligo likely"
(system_diagnosis_rule
  "Diagnose probable vitiligo"
  (diagnosis
	(referral 
    (snomed_concept “Vitiligo” (disorder))
		(snomed_concept “Patient referral” (procedure))
		(snomed_concept “Referral to dermatologist” (procedure))
    probable
  )
  adult
	(and
		(clinical_finding (snomed_concept “Depigmentation” (morphologic abnormality) “Patchy” (qualifier value))
	)
)
;; Page 79 - Changes in Skin Colour
"Albinism likely"
(system_diagnosis_rule
  "Diagnose probable albinism"
  (diagnosis
    (snomed_concept “Albinism” (disorder))
    probable
  )
  adult
	(and 
		(clinical_finding (snomed_concept “Depigmentation” (morphologic abnormality) “Generalized” (qualifier value))
		(clinical_finding (snomed_concept “Congenital” (qualifier value))
		(clinical_finding (snomed_concept “Skin structure” (body structure) “Involvement” (attribute))
		(clinical_finding (snomed_concept “Hair structure” (body structure) “Involvement” (attribute))
		(clinical_finding (snomed_concept “Eye region structure” (body structure) “Involvement” (attribute))
	)
;; Page 79 - Changes in Skin Colour
"Albinism likely"
(system_diagnosis_rule
  "Diagnose probable albinism"
  (diagnosis
	(referral 
    (snomed_concept “Albinism” (disorder))
    (snomed_concept “Patient referral” (procedure))
		(snomed_concept “Referral to dermatologist” (procedure))
		(snomed_concept “Referral to ophthalmologist” (procedure))
  )
  adult
	(and 
		(clinical_finding (snomed_concept “Skin lesion” (disorder) “In” (attribute) “Affected area of body” (body structure) “With” (attribute) “Exposure to” (contextual qualifier) (qualifier value) “Light emitted by the sun” (physical force)
		(clinical_finding (snomed_concept “Malignant neoplasm of skin suspected” (situation))
		)
	)
)
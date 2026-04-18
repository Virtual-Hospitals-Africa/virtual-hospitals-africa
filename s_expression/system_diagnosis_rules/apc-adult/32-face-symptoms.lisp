;; Page 32 - Face symptoms
(system_diagnosis_rule
  "Facial cellulitis likely"
  	(diagnosis
    (snomed_concept "Cellulitis of face" "disorder")
    probable
  adult
    		(clinical_finding (snomed_concept “Facial swelling” (finding) “Red color” (qualifier value) “Pain” (finding))
    		(>= (measurement (snomed_concept "Body temperature" "observable entity") “Degrees Celsius” (qualifier value) 38))
 		)
	)
)
;; Page 32 - Face symptoms 
(system_diagnosis_rule
  "Kidney disease likely"
  (diagnosis
  (snomed_concept "Kidney disease" "disorder")
  probable
  )
  adult
  (and
   	  (clinical_finding (snomed_concept “Facial swelling” (finding) “New” (qualifier value))
      (clinical_finding (snomed_concept "Blood in urine" "finding"))
      (clinical_finding (snomed_concept "Proteinuria" "finding"))
			(> measurement (clinical_finding ( snomed_concept “Heart rate” (observable entity) “Beats/minute” (qualifier value) 100))
			(> measurement (clinical_finding ( snomed_concept “Respiratory rate” (observable entity) “Breaths/minute” (qualifier value) 30))
			(> measurement (clinical_finding ( snomed_concept “Systolic blood pressure” (observable entity) “Millimeter of mercury” (qualifier value) 150))
			(> measurement (clinical_finding ( snomed_concept “Systolic blood pressure”(observable entity) “Millimeter of mercury” (qualifier value) 100))
		)
  )
)
;; Page 32 - Face symptoms
(system_diagnosis_rule
  "Post-herpetic neuralgia likely"
  (diagnosis
    (snomed_concept “Postherpetic neuralgia” (disorder))
    probable
  adult 
			(clinical_finding ( snomed_concept “Pain in face” (finding) “Unilateral”(qualifier value))
			(clinical_finding ( snomed_concept “History of herpes zoster” (situation) “Unilateral” (qualifier value) “Same” (qualifier value)
		)
	)
)
;; Page 32 - Face symptoms
(system_diagnosis_rule
  "Trigeminal neuralgia likely"
  (diagnosis
    (snomed_concept “Trigeminal neuralgia” (disorder))
    probable
  adult
			(clinical_finding ( snomed_concept “Pain in face” (finding) “Unilateral” (qualifier value))
		)
	)
;; Page 32 - Face symptoms
(system_diagnosis_rule
  "Trigeminal neuralgia likely"
  (referral
    (snomed_concept “Trigeminal neuralgia” (disorder))
		(and
		(clinical_finding ( snomed_concept “Patient referral” (procedure))
  adult
(clinical_finding ( snomed_concept “Pain in face” (finding) “Recurrent” (qualifier value))
(clinical_finding ( snomed_concept “Excruciating pain” (finding))
(clinical_finding ( snomed_concept “Superficial pain” (finding))
(clinical_finding ( snomed_concept “Stabbing pain” (finding))
		)
	)
)
;; Page 32 - Face symptoms
(system_diagnosis_rule
  "Bell’s palsy likely"
  (diagnosis
    (snomed_concept “Bell's palsy” (disorder))
    probable
  adult
				(clinical_finding ( snomed_concept “Weakness of face muscles” (finding) “Sudden onset” (attribute) “Progressive” (qualifier value))
				(clinical_finding ( snomed_concept “Rhytide of forehead” (finding) “Unable” (qualifier value))
				(clinical_finding ( snomed_concept “Unable to close eyes” (finding))
				(clinical_finding ( snomed_concept “Taste sense altered” (finding))
				(clinical_finding ( snomed_concept “Tear film insufficiency” (disorder))
		)
	)
;; Page 32 - Face symptoms
(system_diagnosis_rule
  "Bell’s palsy likely"
  (referral
    (snomed_concept “Bell's palsy” (disorder))
		(and
		(clinical_finding ( snomed_concept “Urgent referral” (procedure))
  adult
				(clinical_finding ( snomed_concept “Otitis media” (disorder))
				(clinical_finding ( snomed_concept “Hearing change” (finding))
				(clinical_finding ( snomed_concept “Injury of head” (disorder) “Recent” (qualifier value))
				(clinical_finding ( snomed_concept “Uncertain diagnosis” (observable entity))
		)
	)
)
;; Page 32 - Face symptoms
(system_diagnosis_rule
  "Sinusitis likely"
  (diagnosis
    (snomed_concept “Sinusitis” (disorder))
    probable
  adult
				(clinical_finding (snomed_concept “Common cold” (disorder) “Recent” (qualifier value))
				(clinical_finding (snomed_concept “Nasal discharge” (finding) “Thick” (qualifier value))
				(clinical_finding (snomed_concept “Posterior rhinorrhea” (disorder) “Thick” (qualifier value))
				(clinical_finding (snomed_concept “Pain in face” (finding))
				(clinical_finding (snomed_concept “Frontal sinus pain” (finding))
				(clinical_finding (snomed_concept “Maxillary sinus pain” (finding))
				(clinical_finding (snomed_concept “Headache” (finding) “Worse” (qualifier value) “Forward bending” (observable entity))
		)
	)
;; Page 32 - Face symptoms
(system_diagnosis_rule
  "Sinusitis likely"
  (referral
    (snomed_concept “Sinusitis” (disorder))
    (and
		(clinical_finding (snomed_concept “Urgent referral” (procedure))
  adult
				(clinical_finding (snomed_concept “Infection of tooth” (disorder))
				(clinical_finding (snomed_concept “Swelling over frontal sinus” (finding))
				(clinical_finding (snomed_concept “Swelling over maxillary sinus” (finding))
				(clinical_finding (snomed_concept “Swelling around eyes” (finding) “Unilateral” (qualifier value))
				(clinical_finding ( snomed_concept “Decreased therapeutic response” (finding))
		)
	)
)
;; Page 32 - Face symptoms
(system_diagnosis_rule
  "Stroke or TIA likely"
  (diagnosis
    (snomed_concept "Cerebrovascular accident" (disorder))
		(or
		(snomed_concept "Transient ischemic attack" (disorder))
    probable
  adult
				(clinical_finding ( snomed_concept “Weakness of face muscles” (finding) “New” (qualifier value) “Sudden” (qualifier value) “Asymmetry” (qualifier value) “Forehead structure” (body structure) “Uninvolved” (qualifier value))
				(clinical_finding ( snomed_concept “Weakness of face muscles” (finding) “New” (qualifier value) “Sudden” (qualifier value) “Asymmetry” (qualifier value) “Forehead structure” (body structure)  “Involved” (qualifier value) “Minimal” (qualifier value))
				(clinical_finding ( snomed_concept “Muscle weakness of upper limb” (finding) “New” (qualifier value) “Sudden” (qualifier value) “Asymmetry” (qualifier value))
				(clinical_finding ( snomed_concept “Weakness of muscle of lower limb” (finding) “New” (qualifier value) “Sudden” (qualifier value) “Asymmetry” (qualifier value))
				(clinical_finding ( snomed_concept “Numbness of face” (finding))
				(clinical_finding ( snomed_concept “Numbness of limbs” (finding))
				(clinical_finding ( snomed_concept “Difficulty talking” (finding))
				(clinical_finding ( snomed_concept “Visual disturbance” (disorder))
		)
	)
)
;; Page 32 - Face symptoms
(system_diagnosis_rule
  "Anaphylaxis likely"
  (diagnosis
    (snomed_concept  “Anaphylaxis” (disorder))
    probable
  adult
				(clinical_finding ( snomed_concept “Facial swelling” (finding) “Sudden” (qualifier value))
				(clinical_finding ( snomed_concept “Tongue swelling” (finding) “Sudden” (qualifier value))
				(clinical_finding (snomed_concept “Difficulty breathing” (finding))
				(<measurement (snomed_concept “Systolic blood pressure” (observable entity) “Millimeter of mercury” (qualifier value)90))
				(<measurement (snomed_concept “Diastolic blood pressure” (observable entity) “Millimeter of mercury” (qualifier value)60))
				(clinical_finding (snomed_concept “Dizziness” (finding) “Sudden” (qualifier value) “Severe” (severity modifier))
				(clinical_finding ( snomed_concept “Collapse” (finding))
				(clinical_finding ( snomed_concept “Abdominal pain” (finding))
				(clinical_finding (snomed_concept “Vomiting” (disorder))
				(clinical_finding ( snomed_concept “Exposure to” (contextual qualifier) “Substance” (substance) (qualifier value) “Possible” (qualifier value) “Allergen” (attribute))
		)
	)
)
;; Page 32 - Face symptoms
(system_diagnosis_rule
  "Angioedema likely"
  (diagnosis
    (snomed_concept “Angioedema” (disorder))
    probable
  adult
			(clinical_finding ( snomed_concept “Lip swelling” (finding) “Painless” (qualifier value))
			(clinical_finding ( snomed_concept “Swelling around eyes” (finding) “Painless” (qualifier value))
			(clinical_finding ( snomed_concept “Facial swelling” (finding)) 
		)
	)
)
;; Page 32 - Face symptoms
(system_diagnosis_rule
  "Mumps likely"
  (diagnosis
    (snomed_concept “Mumps” (disorder))
    probable
  adult
			(clinical_finding ( snomed_concept “Facial swelling” (finding) “Side” (qualifier value))
			(clinical_finding ( snomed_concept “Pain in face” (finding))
			(clinical_finding ( snomed_concept “Fever” (finding))
			(clinical_finding ( snomed_concept “Headache” (finding))
			(clinical_finding ( snomed_concept “Generalized aches and pains” (finding))
		)
	)
;; Page 32 - Face symptoms
(system_diagnosis_rule
  "Mumps likely"
  (referral
    (snomed_concept “Mumps” (disorder))
		(and
		(clinical_finding ( snomed_concept “Patient referral” (procedure))
  adult
			(clinical_finding ( snomed_concept “Stiff neck” (finding))
			(clinical_finding ( snomed_concept “Pain in scrotum” (finding))
			(clinical_finding ( snomed_concept “Hearing loss” (disorder))
			(clinical_finding ( snomed_concept “Abdominal pain” (finding))
		)
	)
)




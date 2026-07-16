;; Page 64 - Arm or Hand Symptoms
(task
  "Check for urgent arm or hand symptom conditions"
  adult
    (clinical_finding (snomed_concept "Finding of upper limb” (finding))
  (check_for
    (clinical_finding (snomed_concept "Pain in left arm" "finding"))
    (clinical_finding (snomed_concept "Chest pain" "finding"))
    (clinical_finding (snomed_concept "Pain in right arm" "finding"))
    (clinical_finding (snomed_concept "Hand pain" "finding"))
		(clinical_finding ( snomed_concept “Pain in left arm” (finding) Severe pain” (finding))
		(clinical_finding ( snomed_concept “Pain in right arm” (finding) Severe pain” (finding))
		(clinical_finding ( snomed_concept “Hand pain” (finding) Severe pain” (finding))
    (clinical_finding (snomed_concept "Injury of musculoskeletal system" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
    (clinical_finding (snomed_concept "Joint swelling" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Deformity" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "New" "qualifier value")))
    (clinical_finding (snomed_concept "Difficulty talking" "finding"))
    (clinical_finding (snomed_concept "Visual disturbance" "disorder"))
  )
)
;; Page 64 - Neck Pain
(task
  "Check for urgent neck pain conditions"
  adult
  (clinical_finding (snomed_concept "Neck pain" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Stiff neck" "finding"))
    (clinical_finding (snomed_concept "Headache" "finding"))
    (clinical_finding (snomed_concept "Drowsy" "finding"))
    (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
    (clinical_finding (snomed_concept "Purpuric rash" "disorder"))
		(clinical_finding (snomed_concept “Erythematous rash” (disorder))
		(clinical_finding ( snomed_concept “Neurological finding” (finding) “Limb structure” (body structure))
    (clinical_finding (snomed_concept "Numbness of limbs" "finding"))
    (clinical_finding (snomed_concept "Muscle weakness of limb" "finding"))
    (clinical_finding (snomed_concept "Clumsiness" "finding"))
    (clinical_finding (snomed_concept "Stiffness" "finding"))
    (clinical_finding (snomed_concept "Abnormal gait" "finding"))
    (clinical_finding (snomed_concept "Decreased coordination" "finding"))
    (clinical_finding (snomed_concept "Injury of neck" "disorder") (qualifier (snomed_concept "Recent" "qualifier value"))
		(clinical_finding ( snomed_concept “Plain X-ray of cervical spine abnormal” (finding))
		(clinical_finding ( snomed_concept “Plain X-ray of neck” (procedure) “Not available” (qualifier value))
		(clinical_finding ( snomed_concept “Neurological finding” (finding))
  )
)
;; Page 64 - Neck pain 
"Meningitis likely"
(system_diagnosis_rule
  "Diagnose probable meningitis"
  (diagnosis
    (snomed_concept "Meningitis" "disorder")
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Stiff neck” (finding))
		(>=measurement (snomed_concept “Body temperature” (observable entity) °C) 38))
		(clinical_finding (snomed_concept “Headache” (finding))
		(clinical_finding (snomed_concept “Drowsy” (finding))
		(clinical_finding (snomed_concept “Clouded consciousness” (finding))
		(clinical_finding (snomed_concept “Purpuric rash” (disorder))
		(clinical_finding (snomed_concept “Erythematous rash” (disorder))
	)
)
;; Page 64 - Neck pain 
"Neck pain non urgent likely"
(system_diagnosis_rule
  "Diagnose probable neck pain non urgent"
  (diagnosis
    (snomed_concept “Neck pain” (finding) “Non-urgent” (qualifier value))
		(snomed_concept “Consultation” (procedure)) or 
		(snomed_concept “Patient referral to specialist” (procedure))
		(snomed_concept “Referral to physiotherapist” (procedure))
    probable
  )
  adult
  (and
		(>(clinical_finding (snomed_concept “Current chronological age” (observable entity) year) 50))
		(clinical_finding (snomed_concept “Neck pain” (finding) “Progressive” (qualifier value))
		(>(clinical_finding (snomed_concept “Neck pain” (finding) week) 6))
		(clinical_finding (snomed_concept “Use of steroids” (finding) “Oral route” (qualifier value))
		(clinical_finding (snomed_concept “Human immunodeficiency virus infection” (disorder))
		(clinical_finding (snomed_concept “Intravenous drug user” (finding))
		(clinical_finding (snomed_concept “Unexplained weight loss” (finding))
		(clinical_finding (snomed_concept “Fever” (finding))
		(clinical_finding (snomed_concept “Tuberculosis” (disorder))
		(clinical_finding (snomed_concept “Surgical procedure” (procedure) “Neck structure” (body structure))
		(clinical_finding (snomed_concept “History of malignant neoplasm” (situation))
		)
		(snomed_concept “Referral to physiotherapist” (procedure))
		(clinical_finding (snomed_concept “Patient condition unchanged” (finding) “After” (attribute) day) 5))
		(clinical_finding (snomed_concept “Pain in upper limb” (finding) “No” (qualifier value))
		)
		(snomed_concept “Evaluation of test results” (procedure))
		(clinical_finding (snomed_concept “Finding of cervical spine” (finding))
		(clinical_finding (snomed_concept “Patient condition unchanged” (finding) “After” (attribute) week) 6))
		(clinical_finding (snomed_concept “Pain in upper limb” (finding))
		(clinical_finding (snomed_concept “Asthenia” (finding))
		(clinical_finding (snomed_concept “Muscle weakness” (finding))
		(clinical_finding (snomed_concept “Numbness” (finding))
	)
)
;; Page 64 - Arm or hand symptoms 
"Fracture likely"
(system_diagnosis_rule
  "Diagnose probable fracture of bone"
  (diagnosis
    (snomed_concept "Fracture of bone" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Injury of upper extremity" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
    (clinical_finding ( snomed_concept “Pain in left arm” (finding) Severe pain” (finding))
		(clinical_finding ( snomed_concept “Pain in right arm” (finding) Severe pain” (finding))
		(clinical_finding ( snomed_concept “Hand pain” (finding) Severe pain” (finding))
     (clinical_finding (snomed_concept "Swelling of upper limb" "finding"))
     (clinical_finding (snomed_concept "Deformity of upper limb" "finding"))
    )
)
;; Page 64 - Arm or hand symptoms 
"Stroke or TIA likely"
(system_diagnosis_rule
  "Diagnose probable stroke or TIA"
  (diagnosis
    (snomed_concept “Cerebrovascular accident (disorder))
		(snomed_concept “Transient ischemic attack (disorder))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Muscle weakness of upper limb” (finding) “Sudden onset” (qualifier value) “New” (qualifier value))
		(clinical_finding (snomed_concept “Difficulty talking” (finding))
		(clinical_finding (snomed_concept “Visual disturbance” (disorder))
	)
)
;; Page 64 - Arm or hand symptoms 
"Joint problem likely"
(system_diagnosis_rule
  "Diagnose probable joint problem"
  (diagnosis
    (snomed_concept "Joint finding” (finding))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Joint warm” (finding))
		(clinical_finding (snomed_concept “Tenderness of joint” (finding))
		(clinical_finding (snomed_concept “Joint swelling” (finding))
		(clinical_finding (snomed_concept “Difficulty moving” (finding))
		(clinical_finding (snomed_concept “Unable to move” (finding))
	)
)
;; Page 64 - Arm or hand symptoms 
"Referred pain likely"
(system_diagnosis_rule
  "Diagnose probable referred pain"
  (diagnosis
    (snomed_concept "Referred pain” (finding))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Pain of shoulder region” (finding))
		(clinical_finding (snomed_concept “Finding of upper limb” (finding))
		(clinical_finding (snomed_concept “Neck pain” (finding))
		(clinical_finding (snomed_concept “Cough” (finding))
		(clinical_finding (snomed_concept “Difficulty breathing” (finding))
		(clinical_finding (snomed_concept “Chest pain” (finding))
		(clinical_finding (snomed_concept “Abdominal pain” (finding))
		(clinical_finding (snomed_concept “Pregnancy” (finding))
	)
)
;; Page 64 - Arm or hand symptoms 
"Carpal tunnel syndrome likely"
(system_diagnosis_rule
  "Diagnose probable carpal tunnel syndrome"
  (diagnosis
    (snomed_concept "Carpal tunnel syndrome" "disorder")
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Pain of wrist region” (finding))
		(clinical_finding (snomed_concept “Hand pain” (finding))
		(clinical_finding (snomed_concept “Intermittent pain” (finding) “Worse” (qualifier value) “Night time” (qualifier value))
		(clinical_finding (snomed_concept “Intermittent pain” (finding) “Relieved by” (attribute) “Active wrist movements” (observable entity))
		(clinical_finding (snomed_concept “Numbness of finger” (finding))
			(clinical_finding (snomed_concept “Thumb structure” (body structure))
			(clinical_finding (snomed_concept “Index finger structure” (body structure))
			(clinical_finding (snomed_concept “Middle finger structure” (body structure))
		(clinical_finding (snomed_concept “Pins and needles” (finding)) 
			(clinical_finding (snomed_concept “Thumb structure” (body structure))
			(clinical_finding (snomed_concept “Index finger structure” (body structure))
			(clinical_finding (snomed_concept “Middle finger structure” (body structure))
		(clinical_finding (snomed_concept “Weakness of hand” (finding))
	)
)
;; Page 64 - Arm or hand symptoms 
"Tennis or golfer’s elbow likely"
(system_diagnosis_rule
  "Diagnose probable tennis or golfer’s elbow"
  (diagnosis
    (snomed_concept “Lateral epicondylitis’ (disorder))
		(snomed_concept “Medial epicondylitis of elbow joint” (disorder))
		(snomed_concept “Patient referral (procedure))
		(snomed_concept “Referral to physiotherapy service (procedure))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Pain of elbow region” (finding) “With” (attribute) or “After” (attribute) “Range of elbow flexion” (observable entity))
		(clinical_finding (snomed_concept “Pain of elbow region” (finding) “With” (attribute) or “After” (attribute) “Range of elbow extension” (observable entity))
		(clinical_finding (snomed_concept “Weakness of hand” (finding))
	)
)
;; Page 64 - Arm or hand symptoms 
"Tenosynovitis of hand or wrist likely"
(system_diagnosis_rule
  "Diagnose probable Tenosynovitis of hand or wrist"
  (diagnosis
    (snomed_concept “Tenosynovitis of hand” (disorder))
		(snomed_concept “Tenosynovitis of wrist” (disorder))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Pain in thumb” (finding) “Structure of base of phalanx of thumb” (body structure))
		(clinical_finding (snomed_concept “Normal range of thumb movement” (finding) “Aggravated by” (attribute))
		(clinical_finding (snomed_concept “Normal range of wrist movement” (finding) “Aggravated by” (attribute))
		(clinical_finding (snomed_concept “Triggering of digit” (disorder) “Aggravated by” (attribute))
		(clinical_finding (snomed_concept “Finger joint locking” (finding) “Aggravated by” (attribute))
  )
)
;; Page 64 - Neck Pain
(system_priority_evaluation
  "Urgent neck pain conditions"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Neck pain" "finding"))
    (or
      (clinical_finding (snomed_concept “Meningitis” (disorder))
			(clinical_finding ( snomed_concept “Headache” (finding))
			(clinical_finding ( snomed_concept “Drowsy” (finding))
			(clinical_finding ( snomed_concept “Clouded consciousness” (finding))
			(clinical_finding ( snomed_concept “Purpuric rash” (disorder)
			(>=measurement (snomed_concept “Body temperature” (observable entity) °C) 38))
			(clinical_finding (snomed_concept “Erythematous rash” (disorder))
			(clinical_finding (snomed_concept "Stiff neck" "finding"))
			)
			(clinical_finding ( snomed_concept “Neurological finding” (finding) “Limb structure” (body structure))
			(clinical_finding ( snomed_concept “Clumsiness” (finding))
			(clinical_finding ( snomed_concept “Stiffness” (finding))
			(clinical_finding ( snomed_concept “Abnormal gait” (finding))
			(clinical_finding ( snomed_concept “Decreased coordination” (finding))
      (clinical_finding (snomed_concept "Numbness of limbs" "finding"))
      (clinical_finding (snomed_concept "Muscle weakness of limb" "finding"))
			)
      (clinical_finding ( snomed_concept “Injury of neck” (disorder) Recent (qualifier value)
and
			(clinical_finding ( snomed_concept “Plain X-ray of cervical spine abnormal” (finding))
			(clinical_finding ( snomed_concept “Plain X-ray of neck” (procedure) “Not available” (qualifier value))
			(clinical_finding ( snomed_concept “Neurological finding” (finding))
    )
  )
)
;; Page 64 - Arm or hand symptoms
(system_priority_evaluation
  "Urgent arm or hand conditions"
  adult
  Urgent
	(and
	(clinical_finding (snomed_concept "Finding of upper limb” (finding))
  (or
		(clinical_finding ( snomed_concept “Pain in left arm” (finding))
		(clinical_finding ( snomed_concept “Pain in right arm” (finding) 
		(clinical_finding ( snomed_concept “Chest pain” (finding))
		)
		(clinical_finding (snomed_concept “Fracture of bone” (disorder))
		(clinical_finding ( snomed_concept “Injury of musculoskeletal system” (disorder) “Recent” (qualifier value))
		(clinical_finding ( snomed_concept “Pain in left arm” (finding) Severe pain” (finding))
		(clinical_finding ( snomed_concept “Pain in right arm” (finding) Severe pain” (finding))
		(clinical_finding ( snomed_concept “Hand pain” (finding) Severe pain” (finding))
		(clinical_finding ( snomed_concept “Joint swelling” (finding) “Severe” (severity modifier) (qualifier value))
		(clinical_finding ( snomed_concept “Deformity” (finding) “Severe” (severity modifier) (qualifier value))
		)
		(clinical_finding (snomed_concept “Cerebrovascular accident” (disorder))
		(clinical_finding (snomed_concept “Transient ischemic attack” (disorder))
		(clinical_finding ( snomed_concept “Muscle weakness of upper limb” (finding) “Sudden onset” (attribute) “New” (qualifier value))
		(clinical_finding ( snomed_concept “Difficulty talking” (finding) “With” (attribute) or “Without” (attribute))
		(clinical_finding ( snomed_concept “Visual disturbance” (disorder) “With” (attribute) or “Without” (attribute))
    )
  )
)



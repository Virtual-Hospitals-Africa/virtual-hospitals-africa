;; Page 57 - Abnormal Vaginal Bleeding
(task
  "Check for urgent vaginal bleeding conditions"
  adult
  (clinical_finding (snomed_concept "Abnormal vaginal bleeding" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Pregnancy" "finding"))
    (<= (timestamp (clinical_finding (snomed_concept "Delivery finding" "finding")))
        (time_ago 6 weeks))
    (<= (timestamp (clinical_finding (snomed_concept "Miscarriage" "disorder")))
        (time_ago 6 weeks))
    (<= (timestamp (clinical_finding (snomed_concept "Induced termination of pregnancy" "disorder")))
        (time_ago 6 weeks))
    (clinical_finding (snomed_concept "Pallor of skin of face" "finding"))
    (clinical_finding (snomed_concept "Dizziness" "finding"))
    (clinical_finding (snomed_concept "Feeling faint" "finding"))
    (clinical_finding (snomed_concept "Chest pain" "finding"))
    (clinical_finding (snomed_concept "Pale conjunctiva" "finding"))
		(clinical_finding ( snomed_concept “Pale discoloration of entire skin of body” (finding))
		)
  )
)
;; Page 57 - Abnormal Vaginal Bleeding: Urgent for haemodynamic signs
(system_priority_evaluation
  "Urgent: abnormal vaginal bleeding with haemodynamic compromise"
  adult
  Urgent
    (clinical_finding (snomed_concept "Abnormal vaginal bleeding" "finding"))
    (and
			(clinical_finding ( snomed_concept “Delivery finding” (finding) Recent (qualifier value))
			or
			(clinical_finding ( snomed_concept “Miscarriage” (disorder) Recent (qualifier value))
			or
			(clinical_finding ( snomed_concept “Induced termination of pregnancy” (disorder) Recent (qualifier value))
			)
      (clinical_finding (snomed_concept "Pallor of skin of face" "finding"))
      (clinical_finding ( snomed_concept “Pale discoloration of entire skin of body” (finding))
			(>=measurement ( snomed_concept “Heart rate” (observable entity) bpm) 100))
      (>= (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 30)
      (clinical_finding (snomed_concept "Dizziness" "finding"))
(clinical_finding ( snomed_concept “Feeling faint” (finding))
          (clinical_finding (snomed_concept "Chest pain" "finding"))
      )
			(<( snomed_concept “Measurement of total hemoglobin concentration” (procedure) g/dL) 6))
      )
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
      (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
    )
  )
)
;; Page 57 - Abnormal vaginal bleeding 
“Heavy or prolonged period likely” 
(system_diagnosis_rule
  "Diagnose probable heavy or prolonged period"
  (diagnosis
	(referral 
    (snomed_concept “Menorrhagia” (finding))
		(snomed_concept “Prolonged periods” (finding))
		(snomed_concept “Patient referral” (procedure) day) 2)) or “In” (attribute) week) 1))
  )
  adult
  (and
			(snomed_concept “Patient referral” (procedure) day) 2))
			(clinical_finding (snomed_concept “Easy bruising” (finding))
			(clinical_finding (snomed_concept “Purpuric rash” (disorder))
			(clinical_finding (snomed_concept “Bleeding gums” (finding))
			)
			(snomed_concept “Patient referral” (procedure) “In” (attribute) week) 1))
			(clinical_finding (snomed_concept “Abdominal mass” (finding))
			(clinical_finding (snomed_concept “Patient condition unchanged” (finding) “After” (attribute) “Treatment given” (situation) month) 3))
			(clinical_finding (snomed_concept “Bleeding” (finding) “Excessive” (qualifier value) “After” (attribute) “Insertion of intrauterine contraceptive device” (procedure))
			(clinical_finding (snomed_concept “Suspected victim of sexual abuse” (situation))
			(clinical_finding (snomed_concept “History of” (contextual qualifier) (qualifier value) “Foreign body in vagina” (disorder))
	)
)
 ;; Page 57 - Abnormal vaginal bleeding 
“Abnormal vaginal bleeding non-urgent likely” 
(system_diagnosis_rule
  "Diagnose probable Abnormal vaginal bleeding non-urgent"
  (diagnosis
    (snomed_concept “Abnormal vaginal bleeding” (finding))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Mass of pelvic structure” (finding))
		(>(clinical_finding (snomed_concept “Current chronological age” (observable entity) year) 40))
		(clinical_finding (snomed_concept “Menopause finding” (finding))
		(clinical_finding (snomed_concept “Menopausal flushing” (disorder))
		(clinical_finding (snomed_concept “Night sweats” (finding))
		(clinical_finding (snomed_concept “Vaginal dryness” (disorder))
		(clinical_finding (snomed_concept “Mood swings” (finding))
		(clinical_finding (snomed_concept “Difficulty sleeping” (finding))
		(clinical_finding (snomed_concept “Finding relating to sexuality and sexual activity” (finding))
	)
;; Page 57 - Abnormal vaginal bleeding 
“Abnormal vaginal bleeding non-urgent likely” 
(system_diagnosis_rule
  "Diagnose probable Abnormal vaginal bleeding non-urgent"
  (diagnosis
	(referral
    (snomed_concept “Abnormal vaginal bleeding” (finding))
		(snomed_concept “Patient referral” (procedure) “In” (attribute) week) 2))
  )
  adult
  (and
			(> (clinical_finding (snomed_concept “Bleeding” (finding) “New” (qualifier value) year) 1) “After” (attribute) “Menopause, function” (observable entity))
		)
	)
 ;; Page 57 - Abnormal vaginal bleeding 
“Anaemia likely” 
(system_diagnosis_rule
  "Diagnose probable anaemia"
  (diagnosis
	(snomed_concept “Anemia” (disorder))
    probable
  )
  adult
  (and
			(<(snomed_concept “Measurement of total hemoglobin concentration” (procedure) g/dL) 12))
	)
)
;; Page 57 - Abnormal vaginal bleeding 
“Irregular periods likely” 
(system_diagnosis_rule
  "Diagnose probable irregular periods"
  (diagnosis
	(snomed_concept “Irregular periods” (finding))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Short menstrual cycle” (finding))
		(clinical_finding (snomed_concept “Long menstrual cycle” (finding))
		(<(clinical_finding (snomed_concept “Duration of menstrual cycle” (observable entity) day) 21))
		(>(clinical_finding (snomed_concept “Duration of menstrual cycle” (observable entity) day) 35))
	)
 ;; Page 57 - Abnormal vaginal bleeding 
“Irregular periods likely” 
(system_diagnosis_rule
  "Diagnose probable irregular periods"
  (diagnosis
	(consult
	(referral 
	(snomed_concept “Irregular periods” (finding))
	(snomed_concept “Consultation” (procedure)) or 
	(snomed_concept “Patient referral” (procedure))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Trying to conceive” (finding))
		(clinical_finding (snomed_concept “Oral contraceptive pill contraindicated” (situation) “Combined” (qualifier value))
	)
)
;; Page 57 - Abnormal vaginal bleeding 
“Thyroid problem likely” 
(system_diagnosis_rule
  "Diagnose probable thyroid problem"
  (diagnosis
	(snomed_concept “Finding of thyroid gland” (finding))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Irregular periods” (finding))
		(clinical_finding (snomed_concept “Weight change finding” (finding))
		(>=measurement (snomed_concept “Heart rate” (observable entity) bpm) 100))
		(clinical_finding (snomed_concept “Tremor” (finding))
		(clinical_finding (snomed_concept “Asthenia” (finding))
		(clinical_finding (snomed_concept “Fatigue” (finding))
		(clinical_finding (snomed_concept “Xeroderma” (disorder))
		(clinical_finding (snomed_concept “Constipation” (finding))
		(clinical_finding (snomed_concept “Intolerant of heat” (finding))
		(clinical_finding (snomed_concept “Intolerant of cold” (finding))
	)
)
;; Page 57 - Abnormal vaginal bleeding 
“Spotting between periods likely” 
(system_diagnosis_rule
  "Diagnose probable spotting between periods"
  (diagnosis
	(snomed_concept “Menstrual spotting” (finding))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Uses contraception” (finding))
	)
;; Page 57 - Abnormal vaginal bleeding 
“Spotting between periods likely” 
(system_diagnosis_rule
  "Diagnose probable spotting between periods"
  (diagnosis
	(referral 
	(snomed_concept “Menstrual spotting” (finding))
	(snomed_concept “Patient referral” (procedure) “In” (attribute) week 2))
  )
  adult
  (and
		(clinical_finding (snomed_concept “Uncertain diagnosis” (observable entity))
		(clinical_finding (snomed_concept “Pain in pelvis” (finding))
		(clinical_finding (snomed_concept “Bleeding” (finding) “Continual” (qualifier value) “After” (attribute) > week)1) “Treatment given” (situation) “Sexually transmitted infectious disease” (disorder))
		(clinical_finding (snomed_concept “Bleeding” (finding) “Continual” (qualifier value) “After” (attribute) “Diarrhea” (finding))
		(clinical_finding (snomed_concept “Bleeding” (finding) “Continual” (qualifier value) “After” (attribute) “Vomiting” (disorder))
		(clinical_finding (snomed_concept “Bleeding” (finding) “Continual” (qualifier value) “After” (attribute) “Treatment given” (situation))
	)
)
;; Page 57 - Abnormal vaginal bleeding 
“Bleeding after sex likely” 
(system_diagnosis_rule
  "Diagnose probable bleeding after sex"
  (diagnosis
	(referral 
    (snomed_concept “Postcoital bleeding” (finding))
		(snomed_concept “Patient referral” (procedure) “In” (attribute) week) 2))
  )
  adult
  (and
		(clinical_finding (snomed_concept “Uncertain diagnosis” (observable entity))
		(clinical_finding (snomed_concept “Pain in pelvis” (finding))
		(clinical_finding (snomed_concept “Bleeding” (finding) “Continual” (qualifier value) “After” (attribute) > week)1) “Treatment given” (situation) “Sexually transmitted infectious disease” (disorder))
		(clinical_finding (snomed_concept “Bleeding” (finding) “Continual” (qualifier value) “After” (attribute) “Diarrhea” (finding))
		(clinical_finding (snomed_concept “Bleeding” (finding) “Continual” (qualifier value) “After” (attribute) “Vomiting” (disorder))
		(clinical_finding (snomed_concept “Bleeding” (finding) “Continual” (qualifier value) “After” (attribute) “Treatment given” (situation))
		)
	)
)

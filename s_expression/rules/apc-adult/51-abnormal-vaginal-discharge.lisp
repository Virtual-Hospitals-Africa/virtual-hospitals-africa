;; Page 51 - Abnormal Vaginal Discharge
(task
  "Check for urgent female genitalia conditions"
  adult
  (clinical_finding (snomed_concept "Female genitalia finding" "finding"))
  (check_for
    (<= (timestamp (clinical_finding (snomed_concept "Delivery finding" "finding")))
        (time_ago 6 weeks))
    (<= (timestamp (clinical_finding (snomed_concept "Miscarriage" "disorder")))
        (time_ago 6 weeks))
    (<= (timestamp (clinical_finding (snomed_concept "Induced termination of pregnancy" "disorder")))
        (time_ago 6 weeks))
    (clinical_finding (snomed_concept "Pregnancy" "finding"))
    (clinical_finding (snomed_concept "Missed period" "finding"))
    (clinical_finding (snomed_concept "Abnormal vaginal bleeding" "finding"))
    (clinical_finding (snomed_concept "Abdominal mass" "finding"))
    (clinical_finding (snomed_concept "Abdominal guarding" "finding"))
    (clinical_finding (snomed_concept "Abdominal rigidity" "finding"))
    (clinical_finding (snomed_concept "Rebound tenderness" "finding"))
		)
  )
)
;; Page 51 - Abnormal Vaginal Discharge 
(system_priority_evaluation
  "Urgent vaginal discharge symptoms"
  adult
	(snomed_concept “Female genitalia finding” (finding))
  Urgent
  (and
		(clinical_finding ( snomed_concept “Delivery finding” (finding) Recent (qualifier value))
		or
		(clinical_finding ( snomed_concept “Miscarriage” (disorder) Recent (qualifier value))
		or
		(clinical_finding ( snomed_concept “Induced termination of pregnancy” (disorder) Recent (qualifier value))
		)
		(clinical_finding ( snomed_concept “Pregnancy” (finding))
		or
		(clinical_finding ( snomed_concept “Missed period” (finding))
		)
		(clinical_finding ( snomed_concept “Abnormal vaginal bleeding” (finding))
		)
		(>measurement ( snomed_concept “Body temperature” (observable entity) °C) 38))
		)
		(>measurement ( snomed_concept “Heart rate” (observable entity) bpm) 100))
		)
		(<measurement ( snomed_concept “Systolic blood pressure” (observable entity) mmHg) 90))
		and
		(<measurement ( snomed_concept “Diastolic blood pressure” (observable entity) mmHg) 60))
		)
		(clinical_finding ( snomed_concept “Abdominal mass” (finding))
		)
		(clinical_finding ( snomed_concept “Peritonitis” (disorder))
		(clinical_finding ( snomed_concept “Abdominal guarding” (finding))
		(clinical_finding ( snomed_concept “Abdominal rigidity” (finding))
		(clinical_finding ( snomed_concept “Rebound tenderness” (finding))
		)
	)
)
;; Page 51 - Abnormal Vaginal Discharge 
"Cervicitis likely"
(system_diagnosis_rule
  "Diagnose probable cervicitis"
  (diagnosis
    (snomed_concept “Inflammation of cervix” (disorder))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Sexually active” (finding) “In the past” (qualifier value) month) 3))
		(clinical_finding (snomed_concept “Vaginal discharge problem” (finding))
		(clinical_finding (snomed_concept “Lower abdominal pain (finding) “No” (qualifier value))
		(clinical_finding (snomed_concept “Pain on movement of cervix (finding) “No” (qualifier value))
		)
		(clinical_finding (snomed_concept “Currently not sexually active” (finding))
		(clinical_finding (snomed_concept “Cervix uteri structure” (body structure) “Red color” (qualifier value))
		(clinical_finding (snomed_concept “Cervix uteri structure” (body structure) “Swelling” (finding))
		(clinical_finding (snomed_concept “Cervical discharge” (finding))
	)
)
;; Page 51 - Abnormal Vaginal Discharge 
"Lower abdominal pain syndrome likely"
(system_diagnosis_rule
  "Diagnose probable lower abdominal pain syndrome "
  (diagnosis
    (snomed_concept “Lower abdominal pain” (finding))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Sexually active” (finding) “In the past” (qualifier value) month) 3))
		(clinical_finding (snomed_concept “Vaginal discharge problem” (finding))
		(clinical_finding (snomed_concept “Lower abdominal pain” (finding))
		(clinical_finding (snomed_concept “Pain on movement of cervix” (finding))
		or
		(clinical_finding (snomed_concept “Pain on movement of cervix” (finding) “No” (qualifier value))
		(clinical_finding (snomed_concept “Urine leukocytes not detected” (finding))
		(clinical_finding (snomed_concept “Nitrite not detected in urine” (finding))
	)
)
;; Page 51 - Abnormal Vaginal Discharge 
"Vaginal candidiasis likely"
(system_diagnosis_rule
  "Diagnose probable vaginal candidiasis"
  (diagnosis
    (snomed_concept “Candidiasis of vagina” (disorder))
    probable
  )
  adult
  (and 
		(clinical_finding (snomed_concept “Currently not sexually active” (finding) month) 3))
		(clinical_finding (snomed_concept “Lower abdominal pain” (finding) “No” (qualifier value))
		(clinical_finding (snomed_concept “Pain on movement of cervix” (finding) “No” (qualifier value))
		(clinical_finding (snomed_concept “Discharge - substance” (substance) “Itching” (finding))
		(clinical_finding (snomed_concept “Discharge - substance” (substance) “Curds” (substance) “Appearance” (property) (qualifier value))
		(clinical_finding (snomed_concept “Inflammation of vulva” (disorder))
		(clinical_finding (snomed_concept “Vulval structure” (body structure) “Red color” (qualifier value))
		(clinical_finding (snomed_concept “Swelling of vulva” (finding))
		(clinical_finding (snomed_concept “Vulval pain” (finding))
	)
)
;; Page 51 - Abnormal Vaginal Discharge 
"Bacterial vaginosis likely"
(system_diagnosis_rule
  "Diagnose probable bacterial vaginosis"
  (diagnosis
    (snomed_concept “Bacterial vaginosis” (disorder))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Currently not sexually active” (finding) month) 3))
		(clinical_finding (snomed_concept “No itch” (situation))
		(clinical_finding (snomed_concept “Discharge - substance” (substance) “No” (qualifier value))
		(clinical_finding (snomed_concept “Inflammation of vulva” (disorder) “No” (qualifier value))
		(clinical_finding (snomed_concept “Vulval structure” (body structure) “Red color” (qualifier value) “No” (qualifier value))
		(clinical_finding (snomed_concept “Swelling of vulva” (finding) “No” (qualifier value))
		(clinical_finding (snomed_concept “Vulval pain” (finding) “No” (qualifier value))
		)
	)
)

;; Page 44 - Abdominal Pain
(task
  "Check for urgent abdominal pain conditions"
  adult
  (clinical_finding (snomed_concept "Abdominal pain" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Chest pain" "finding"))
    (clinical_finding (snomed_concept "Pregnancy" "finding"))
    (clinical_finding (snomed_concept "Delivery finding" "finding") (qualifier (snomed_concept "Recent" "qualifier value")))
    (clinical_finding (snomed_concept "Miscarriage" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
    (clinical_finding (snomed_concept "Induced termination of pregnancy" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
    (clinical_finding (snomed_concept "Unable to void urine" "finding"))
    (clinical_finding (snomed_concept "Jaundice" "finding"))
    (clinical_finding (snomed_concept "Abdominal mass" "finding"))
    (clinical_finding (snomed_concept "Rebound tenderness" "finding"))
    (clinical_finding (snomed_concept "Abdominal guarding" "finding"))
    (clinical_finding (snomed_concept "Abdominal rigidity" "finding"))
    (<= (timestamp (clinical_finding (snomed_concept "Unable to break wind" "finding")))
        (time_ago 24 hours))
    (<= (timestamp (clinical_finding (snomed_concept "Acute constipation" "finding")))
        (time_ago 24 hours))
    (clinical_finding (snomed_concept "Tenderness of right upper quadrant of abdomen" "finding"))
    (clinical_finding (snomed_concept "Loss of appetite" "finding"))
    (clinical_finding (snomed_concept "Pain radiating to lumbar region of back" "finding"))
    (clinical_finding (snomed_concept “Vomiting” (disorder))
    (clinical_finding (snomed_concept "Right lower quadrant pain" "finding"))
    (clinical_finding (snomed_concept "Nausea" "finding"))
    (clinical_finding (snomed_concept "Right upper quadrant pain" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Upper abdominal pain" "finding") (qualifier (snomed_concept "Sudden" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Generalized pruritus" "finding"))
    (clinical_finding (snomed_concept "Generalized rash" "disorder"))
		(clinical_finding ( snomed_concept “Abdominal pain” (finding)) “Sudden” (qualifier value))
    (clinical_finding (snomed_concept "Facial swelling” (finding))
    (clinical_finding (snomed_concept “Tongue swelling” (finding))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    (clinical_finding (snomed_concept "Dizziness" "finding"))
    (clinical_finding (snomed_concept "Collapse" "finding"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Substance" "substance") “Possible” (qualifier value) “Allergen” (attribute))
    (clinical_finding (snomed_concept "Pulsatile mass of abdomen" "finding"))
    (clinical_finding (snomed_concept "Mass of pelvic structure" "finding"))
  )
)
;; Page 44 - Abdominal Pain: Peritonitis likely with guarding, rigidity or rebound tenderness
(system_diagnosis_rule
  "Diagnose probable peritonitis based on abdominal pain"
  (diagnosis
    (snomed_concept "Peritonitis" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Abdominal pain" "finding"))
    (or
      (clinical_finding (snomed_concept "Rebound tenderness" "finding"))
      (clinical_finding (snomed_concept "Abdominal guarding" "finding"))
      (clinical_finding (snomed_concept "Abdominal rigidity" "finding"))
    )
  )
)
;; Page 44 - Abdominal Pain: Cholecystitis likely with RUQ tenderness and nausea/fever/anorexia
(system_diagnosis_rule
  "Diagnose probable Cholecystitis"
  (diagnosis
    (snomed_concept "Cholecystitis" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Abdominal pain" "finding"))   
		(clinical_finding (snomed_concept “Right upper quadrant pain” (finding) “Severe” (severity modifier) (qualifier value))
    (or
      (clinical_finding (snomed_concept "Nausea" "finding"))
      (active_condition (snomed_concept "Fever" "finding"))
      (clinical_finding (snomed_concept "Loss of appetite" "finding"))
			(clinical_finding (snomed_concept "Tenderness of right upper quadrant of abdomen" "finding"))
		)
  )
)
;; Page 44 - Abdominal Pain: Pancreatitis likely with upper abdominal pain spreading to back
(system_diagnosis_rule
  "Diagnose probable Pancreatitis"
  (diagnosis
    (snomed_concept "Pancreatitis" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Upper abdominal pain" "finding")“Sudden” (qualifier value) “Severe” (severity modifier) (qualifier value))
		)
		or
			(clinical_finding (snomed_concept “Pain radiating to lumbar region of back” (finding))
			(clinical_finding (snomed_concept “Nausea” (finding))
			(clinical_finding (snomed_concept “Vomiting” (disorder))
			(<measurement (snomed_concept “Systolic blood pressure” (observable entity) mmHg) 90))
			(<measurement (snomed_concept “Diastolic blood pressure” (observable entity) mmHg) 60)) 
    )
  )
)
;; Page 44 - Abdominal Pain: Abdominal aortic aneurysm likely with pulsatile abdominal mass
(system_diagnosis_rule
  "Diagnose possible abdominal aortic aneurysm"
  (diagnosis
    (snomed_concept "Abdominal aortic aneurysm" "disorder")
    possible
  )
  adult
  (clinical_finding (snomed_concept "Pulsatile mass of abdomen" "finding"))
	(clinical_finding (snomed_concept “Backache” (finding))
	)
)	
;; Page 44 - Abdominal Pain: Appendicitis likely
(system_diagnosis_rule
  "Diagnose probable appendicitis"
  (diagnosis
    (snomed_concept “Appendicitis”  "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Abdominal pain" "finding"))
		(clinical_finding (snomed_concept “Right lower quadrant pain” (finding))
	  )
		or
			(clinical_finding (snomed_concept “Nausea” (finding))
			(clinical_finding (snomed_concept “Vomiting” (disorder))
			(clinical_finding (snomed_concept “Fever” (finding))
		)
	)
)
;; Page 44 - Abdominal Pain: Gastroenteritis likely 
(system_diagnosis_rule
  "Diagnose probable gastroenteritis"
  (diagnosis
    (snomed_concept “Inflammation of stomach and intestine” (disorder))
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Abdominal pain" "finding"))
    (or
			(clinical_finding (snomed_concept “Cramping pain” (finding))
			(clinical_finding (snomed_concept “Vomiting” (disorder) “Recent” (qualifier value) “Onset of” (contextual qualifier) (qualifier value))
			(clinical_finding (snomed_concept “Diarrhea” (finding))
			(clinical_finding (snomed_concept “Loss of appetite” (finding))
			(clinical_finding (snomed_concept “Generalized acute body pains” (finding))
			(clinical_finding (snomed_concept “Fever” (finding))
		)
	)
)
;; Page 44 - Abdominal Pain: Dysmenorrhoea likely
(system_diagnosis_rule
  "Diagnose probable dysmenorrhea"
  (diagnosis
    (snomed_concept “Dysmenorrhea”  "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Abdominal pain" "finding"))
   (clinical_finding (snomed_concept “Lower abdominal pain” (finding))
    (or
			(clinical_finding (snomed_concept “Cramping pain” (finding))
			(clinical_finding (snomed_concept “Woman” (person))
			(clinical_finding (snomed_concept “Menstruation, function” (observable entity) “During” (attribute))
		)
	)
)
;; Page 44 - Abdominal Pain: Lower abdominal pain (LAP) syndrome
(system_diagnosis_rule
  "Diagnose probable lower abdominal pain (LAP) syndrome:"
  (diagnosis
    (snomed_concept “Lower abdominal pain” (finding)
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Abdominal pain" "finding"))
    (clinical_finding (snomed_concept “Lower abdominal pain” (finding))
    (or
			(clinical_finding (snomed_concept “Vaginal discharge” (finding))
			(clinical_finding (snomed_concept “Vaginal discharge problem” (finding))
			(clinical_finding (snomed_concept “Pain on movement of cervix” (finding))
		)
)
;; Page 44 - Abdominal Pain: Lower abdominal pain (LAP) syndrome
(system_diagnosis_rule
  "Diagnose probable lower abdominal pain (LAP) syndrome:"
  (diagnosis
	(referral
    (snomed_concept “Lower abdominal pain” (finding)
		(snomed_concept “Urgent referral” (procedure) “In” (attribute) hour) 24))
 		 adult
 		 (and
			(>=measurement (snomed_concept “Body temperature” (observable entity) ° C) 38))
			(>measurement (snomed_concept “Heart rate” (observable entity) bpm) 100))
			(< measurement (snomed_concept “Systolic blood pressure” (observable entity) mmHg) 90))
			(<measurement (snomed_concept “Diastolic blood pressure” (observable entity) mmHg) 60))
		)
	)
)
;; Page 44 - Abdominal Pain:  Irritable bowel syndrome (IBS) likely
(system_diagnosis_rule
  "Diagnose probable irritable bowel syndrome"
  (diagnosis
    (snomed_concept “Irritable bowel syndrome” (disorder))
    probable
  	)
  	adult
  	(and
    (clinical_finding (snomed_concept "Abdominal pain" "finding"))
	  (clinical_finding (snomed_concept “Recurrent abdominal pain” (finding))
    (or
			(clinical_finding (snomed_concept “Abdominal discomfort” (finding))
			any2
			(clinical_finding (snomed_concept “Pain characterized by relieving factor” (finding) “Defecation” (observable entity))
			(clinical_finding (snomed_concept “Distension of abdomen” (finding))
			(clinical_finding (snomed_concept “Frequency of defecation” (observable entity) “Changed status” (qualifier value))
			(clinical_finding (snomed_concept “Appearance of stool” (observable entity) “Changed status” (qualifier value))
			(clinical_finding (snomed_concept “Finding of appearance of stool” (finding))
			(clinical_finding (snomed_concept “Mucus in stool” (finding))
			(clinical_finding (snomed_concept “Abdominal bloating” (finding))
			(clinical_finding (snomed_concept “Constipation” (finding))
			(clinical_finding (snomed_concept “Diarrhea” (finding))
			)
;; Page 44 - Abdominal Pain:  Irritable bowel syndrome (IBS) likely
(system_diagnosis_rule
  "Diagnose probable irritable bowel syndrome"
  (diagnosis
	(referral
    (snomed_concept “Irritable bowel syndrome” (disorder))
		(snomed_concept “Patient referral” (procedure))
    probable
  	)
 	 adult
 	 (and
    (clinical_finding (snomed_concept "Abdominal pain" "finding"))
	  (clinical_finding (snomed_concept “Recurrent abdominal pain” (finding))
    (or
			(clinical_finding (snomed_concept “Referral to doctor” (procedure))
			(clinical_finding (snomed_concept “Diagnostic assessment” (procedure))
			)
			(clinical_finding (snomed_concept “Referral to dietitian” (procedure))
			(clinical_finding (snomed_concept “Nutritional assessment” (procedure))
			)
	)
)
;; Page 44 - Abdominal Pain: Dyspepsia or heartburn likely
(system_diagnosis_rule
  "Diagnose probable dyspepsia or heartburn"
  (diagnosis
    (snomed_concept “Indigestion” (finding))
		(snomed_concept “Heartburn” (finding))
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Abdominal pain" "finding"))
    (or
			(clinical_finding (snomed_concept “Epigastric pain” (finding))
			(clinical_finding (snomed_concept “Worse” (qualifier value) “With” (attribute) “Eating” (observable entity))
			(clinical_finding (snomed_concept “Worse” (qualifier value) “With” (attribute) “Hungry” (finding))
			(clinical_finding (snomed_concept “Worse” (qualifier value) “With” (attribute) “Recumbent body position” (finding)
			(clinical_finding (snomed_concept “Worse” (qualifier value) “With” (attribute) “Forward bending” (observable entity))
		)
;; Page 44 - Abdominal Pain: Dyspepsia or heartburn likely
(system_diagnosis_rule
  "Diagnose probable dyspepsia or heartburn"
  (diagnosis
	(referral
    (snomed_concept “Indigestion” (finding))
		(snomed_concept “Heartburn” (finding))
		(snomed_concept “Patient referral” (procedure) “In” (attribute) day) 7))
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Abdominal pain" "finding"))
    (or
			(<(snomed_concept “Measurement of total hemoglobin concentration” (procedure) “Woman” (person) g/dL) 12))
			(<(snomed_concept “Measurement of total hemoglobin concentration” (procedure) “Man” (person) g/dL) 13))
			(clinical_finding (snomed_concept “Epigastric pain” (finding) “New” (qualifier value))
			(>(clinical_finding (snomed_concept “Current chronological age” (observable entity) year) 50))
			(clinical_finding (snomed_concept “Family history: Stomach cancer” (situation))
			(clinical_finding (snomed_concept “Family history of cancer of the esophagus” (situation))
		)
;; Page 44 - Abdominal Pain: Dyspepsia or heartburn likely
(system_diagnosis_rule
  "Diagnose probable dyspepsia or heartburn"
  (diagnosis
	(return
	(referral
    (snomed_concept “Indigestion” (finding))
		(snomed_concept “Heartburn” (finding))
		(snomed_concept “Recommendation to return” (procedure))
		(snomed_concept “Patient referral” (procedure))
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Abdominal pain" "finding"))
    (or
			(clinical_finding (snomed_concept “Patient condition unchanged” (finding) day) 7))
			(clinical_finding (snomed_concept “Recurrent episode” (qualifier value))
			(clinical_finding (snomed_concept “Difficulty swallowing” (finding))
			(clinical_finding (snomed_concept “Persistent vomiting” (disorder))
			(clinical_finding (snomed_concept “Vomit contains blood” (finding))
			(clinical_finding (snomed_concept “Hematochezia” (finding))
		)
	)
)
;; Page 44 - Abdominal Pain: Urgent for danger signs
(system_priority_evaluation
  "Urgent: abdominal pain with peritoneal, obstructive or metabolic signs"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Abdominal pain" "finding"))
    (or
			(clinical_finding ( snomed_concept “Chest pain” (finding))
			)
			(clinical_finding ( snomed_concept “Pregnancy” (finding))
			)
			(clinical_finding ( snomed_concept “Delivery finding” (finding) “Recent” (qualifier value))
			or
			(clinical_finding ( snomed_concept “Miscarriage” (disorder) “Recent” (qualifier value))
			(clinical_finding ( snomed_concept “Induced termination of pregnancy” (disorder) “Recent” (qualifier value))
			)
      (clinical_finding (snomed_concept "Unable to void urine" "finding"))
			)
      (clinical_finding (snomed_concept "Jaundice" "finding"))
			)
      (clinical_finding (snomed_concept "Abdominal mass" "finding"))
			or
      (clinical_finding (snomed_concept "Mass of pelvic structure" "finding"))
			)
			(clinical_finding (snomed_concept “Abdominal aortic aneurysm” (disorder))
			or
      (clinical_finding (snomed_concept "Pulsatile mass of abdomen" "finding"))
			)
			(clinical_finding (snomed_concept “Peritonitis” (disorder))
			or
      (clinical_finding (snomed_concept "Rebound tenderness" "finding"))
      (clinical_finding (snomed_concept "Abdominal guarding" "finding"))
      (clinical_finding (snomed_concept "Abdominal rigidity" "finding"))
			)
			(clinical_finding (snomed_concept “Appendicitis” (disorder))
			or
			(clinical_finding ( snomed_concept “Right lower quadrant pain” (finding) 
			(clinical_finding ( snomed_concept “Nausea” (finding)) 
			(clinical_finding ( snomed_concept “Vomiting” (disorder)) 
			(clinical_finding ( snomed_concept “ Fever” (finding))
			)
			(clinical_finding (snomed_concept “Cholecystitis” (disorder))
			or
			(clinical_finding ( snomed_concept “Right upper quadrant pain” (finding) “Severe” (severity modifier) (qualifier value)) 
			(clinical_finding ( snomed_concept “Nausea” (finding)) 
			(clinical_finding ( snomed_concept “ Fever” (finding))
			(clinical_finding ( snomed_concept “Loss of appetite” (finding))
			)
			(clinical_finding (snomed_concept “Pancreatitis” (disorder))
			(clinical_finding ( snomed_concept “Upper abdominal pain” (finding) “Sudden” (qualifier value) “Severe” (severity modifier) 	(qualifier value)) 
			(clinical_finding ( snomed_concept “Pain radiating to lumbar region of back” (finding)) 
			(clinical_finding ( snomed_concept “Nausea” (finding)) 
			(clinical_finding ( snomed_concept “ Vomiting” (disorder))
			)
			(clinical_finding ( snomed_concept “Constipation” (finding) “In the past” (qualifier value) “hour” (qualifier value) 24))
			(clinical_finding ( snomed_concept “Unable to break wind” (finding) “In the past” (qualifier value) “hour” (qualifier value) 24))
			)
			(clinical_finding ( snomed_concept “Abdominal pain” (finding)) “Sudden” (qualifier value))
			or
			(clinical_finding ( snomed_concept “Generalized pruritus” (finding))
			(clinical_finding ( snomed_concept “Generalized rash” (disorder))
			(clinical_finding ( snomed_concept “ Facial swelling” (finding))
			(clinical_finding ( snomed_concept “Tongue swelling” (finding))
			(clinical_finding (snomed_concept “Difficulty breathing” (finding))
			(clinical_finding (snomed_concept “Dizziness” (finding) “Sudden” (qualifier value) “Severe” (severity modifier))
			(clinical_finding ( snomed_concept “Collapse” (finding))
			(clinical_finding ( snomed_concept “Exposure to” (contextual qualifier) “Substance” (substance) (qualifier value) “Possible” (qualifier value) “Allergen” (attribute))
    )
  )
)


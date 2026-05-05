;; Page 45 - Nausea or Vomiting
(task
  "Check for urgent nausea or vomiting conditions"
  adult
  (or
    (clinical_finding (snomed_concept "Nausea" "finding"))
    (clinical_finding (snomed_concept "Finding of vomiting" "finding")))
  (check_for
    (clinical_finding (snomed_concept "Headache" "finding"))
    (clinical_finding (snomed_concept "Chest pain" "finding"))
    (clinical_finding (snomed_concept "Diarrhea" "finding") (qualifier (snomed_concept "Watery" "qualifier value")))
		(clinical_finding ( snomed_concept “Vomiting” (disorder)  “With” (attribute) or “Without” (attribute)) 
    (<= (timestamp (clinical_finding (snomed_concept "History of travel with high risk of exposure to communicable disease" "situation")“Cholera” (disorder) ))
        (time_ago 5 days))
    (clinical_finding (snomed_concept "Rebound tenderness" "finding"))
    (clinical_finding (snomed_concept "Abdominal guarding" "finding"))
    (clinical_finding (snomed_concept "Abdominal rigidity" "finding"))
    (clinical_finding (snomed_concept "Tenderness of right lower quadrant of abdomen" "finding"))
    (clinical_finding (snomed_concept "Hematemesis" "disorder"))
    (clinical_finding (snomed_concept "Jaundice" "finding"))
    (clinical_finding (snomed_concept "Drowsy" "finding"))
    (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
    (clinical_finding (snomed_concept "Stiff neck" "finding"))
    (clinical_finding (snomed_concept "Purpuric rash" "disorder"))
    (clinical_finding (snomed_concept "Deep breathing" "finding") (qualifier (snomed_concept "Rapid" "qualifier value")))
    (clinical_finding (snomed_concept "Right lower quadrant pain" "finding"))
    (clinical_finding (snomed_concept "Upper abdominal pain" "finding") (qualifier (snomed_concept "Sudden" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Pain radiating to lumbar region of back" "finding"))
    (clinical_finding (snomed_concept "Distension of abdomen" "finding"))
    (clinical_finding (snomed_concept "Constipation" "finding"))
    (clinical_finding (snomed_concept "Finding of vomiting" "finding") (qualifier (snomed_concept "Sudden" "qualifier value")))
    (clinical_finding (snomed_concept "Nausea" "finding") (qualifier (snomed_concept "Sudden" "qualifier value")))
    (clinical_finding (snomed_concept "Unable to break wind" "finding")))
    (clinical_finding (snomed_concept "Generalized pruritus" "finding"))
    (clinical_finding (snomed_concept "Generalized rash" "disorder"))
    (clinical_finding (snomed_concept  “ Facial swelling” (finding))
    (clinical_finding (snomed_concept  “Tongue swelling” (finding))
    (clinical_finding (snomed_concept "Wheezing" "finding"))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
		(clinical_finding (snomed_concept “Dizziness” (finding)) 
    (clinical_finding (snomed_concept "Collapse" "finding"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Substance" "substance") “Possible” (qualifier value) “Allergen” (attribute))
    (clinical_finding (snomed_concept "Abdominal pain" "finding"))
  )
)
;; Page 45 - Nausea/Vomiting: Peritonitis likely with guarding, rigidity or rebound tenderness
(system_diagnosis_rule
  "Diagnose probable peritonitis"
  (diagnosis
    (snomed_concept "Peritonitis" "disorder")
    probable
  )
  adult
  (and
    (or
      (clinical_finding (snomed_concept "Nausea" "finding"))
      (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
    )
    (or
      (clinical_finding (snomed_concept "Rebound tenderness" "finding"))
      (clinical_finding (snomed_concept "Abdominal guarding" "finding"))
      (clinical_finding (snomed_concept "Abdominal rigidity" "finding"))
    )
  )
)
;; Page 45 - Nausea/Vomiting: Appendicitis likely with right lower abdominal pain and tenderness
(system_diagnosis_rule
  "Diagnose probable appendicitis"
  (diagnosis
    (snomed_concept "Appendicitis" "disorder")
    probable
  )
  adult
  (and
    (or
      (clinical_finding (snomed_concept "Nausea" "finding"))
      (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
    	)
			(clinical_finding (snomed_concept “Right lower quadrant pain” (finding))
    	(clinical_finding (snomed_concept "Tenderness of right lower quadrant of abdomen" "finding"))
		)
  )
;; Page 45 - Nausea/Vomiting: Cholera likely 
(system_diagnosis_rule
  "Diagnose probable cholera”
  (diagnosis
    (snomed_concept “Cholera” "disorder")
    probable
  )
  adult
  (and
    (or
			(clinical_finding ( snomed_concept “Diarrhea” (finding) “Watery” (finding)) 
			(clinical_finding (snomed_concept “Liquid stool” (finding))
			(clinical_finding (snomed_concept “Vomiting” (disorder))
			(clinical_finding (snomed_concept “No vomiting” (situation))
			(clinical_finding (snomed_concept “History of travel with high risk of exposure to communicable disease” (situation) “Cholera” (disorder) “In the past” (qualifier value) day) 5))
		)
)
;; Page 45 - Nausea/Vomiting: Meningitis likely
(system_diagnosis_rule
  "Diagnose probable meningitis”
  (diagnosis
    (snomed_concept “Meningitis” "disorder")
    probable
  )
  adult
  (and
    (or
			(clinical_finding (snomed_concept “Stiff neck” (finding))
			(clinical_finding (snomed_concept “Drowsy” (finding))
			(clinical_finding (snomed_concept “Clouded consciousness” (finding))
			(clinical_finding (snomed_concept “Purpuric rash” (disorder))
			)
)
;; Page 45 - Nausea/Vomiting: Pancreatitis likely
(system_diagnosis_rule
  "Diagnose probable pancreatitis”
  (diagnosis
    (snomed_concept “Pancreatitis” "disorder")
    probable
  )
  adult
  (and
    (or
			(clinical_finding (snomed_concept “Upper abdominal pain” (finding) “Severe” (severity modifier) (qualifier value))
			(clinical_finding (snomed_concept “Pain radiating to lumbar region of back” (finding))
			(< measurement (snomed_concept “Systolic blood pressure” (observable entity) mmHg) 90))
			(< measurement (snomed_concept “Diastolic blood pressure” (observable entity) mmHg) 60))
		)
)
;; Page 45 - Nausea/Vomiting: Dehydration likely
(system_diagnosis_rule
  "Diagnose probable dehydration"
  (diagnosis
    (snomed_concept "Dehydration" "disorder")
    probable
  )
  adult
  (and
    (or
			(clinical_finding (snomed_concept “Thirst due to water deprivation” (finding))
			(clinical_finding (snomed_concept “Xerostomia” (finding))
			(clinical_finding (snomed_concept “Decreased skin turgor” (finding)
			(>=measurement (snomed_concept “Heart rate” (observable entity) bpm) 100))
		)
)
;; Page 45 - Nausea/Vomiting: Gastroenteritis likely
(system_diagnosis_rule
  "Diagnose probable gastroenteritis"
  (diagnosis
    (snomed_concept “Inflammation of stomach and intestine” (disorder))
    probable
  )
  adult
  (and
    (or
			(clinical_finding (snomed_concept “Vomiting” (disorder) “Recent” (qualifier value) “Onset of” (contextual qualifier) (qualifier value))
			(clinical_finding (snomed_concept “Abdominal pain” (finding))
			(clinical_finding (snomed_concept “Cramping pain” (finding))
			(clinical_finding (snomed_concept “Diarrhea” (finding))
			(clinical_finding (snomed_concept “Loss of appetite” (finding))
			(clinical_finding (snomed_concept “Generalized acute body pains’ (finding))
			(clinical_finding (snomed_concept “Fever” (finding))
		)
)
;; Page 45 - Nausea/Vomiting: Vomiting non-urgent likely
(system_diagnosis_rule
  "Diagnose probable vomiting non-urgent conditions"
  (diagnosis
    (snomed_concept "Vomiting" "disorder")
    probable
  )
  adult
  (and
    (or
			(clinical_finding (snomed_concept “Stress” (finding))
			(clinical_finding (snomed_concept “Anxiety” (finding))
			(clinical_finding (snomed_concept “Pregnancy” (finding))
			(clinical_finding (snomed_concept “Dizziness” (finding))
			(clinical_finding (snomed_concept “Current drinker of alcohol” (finding))
			(clinical_finding (snomed_concept “Current drug user” (finding))
			(clinical_finding (snomed_concept “Terminal illness” (finding))
	)
;; Page 45 - Nausea/Vomiting: Vomiting non-urgent likely
(system_diagnosis_rule
  "Diagnose probable vomiting non-urgent conditions"
  (diagnosis
	(consult
    (snomed_concept "Vomiting" "disorder")
		(snomed_concept “Consultation” (procedure))
  )
  adult
  (and
			(clinical_finding (snomed_concept “Review of medication” (procedure))
				(snomed_concept “Non-steroidal anti-inflammatory agent” (substance))
				(snomed_concept “Ibuprofen” (substance))
				(snomed_concept “Metformin” (substance))
				(clinical_finding (snomed_concept “Uses contraception” (finding))
				(snomed_concept “Synthetic progestogen” (substance)
				(snomed_concept “Substance with estrogen receptor agonist mechanism of action” (substance))
				(clinical_finding (snomed_concept “Hormone therapy” (procedure))
				(snomed_concept “Hormone” (substance))
				(clinical_finding (snomed_concept “Chemotherapy” (procedure))
				(snomed_concept “Antineoplastic agent” (substance))
				(snomed_concept “Morphine” (substance))
				(>(clinical_finding (snomed_concept “Nausea” (finding) “Continual” (qualifier value) week) 2))
				(>(clinical_finding (snomed_concept “Persistent vomiting” (disorder) week) 2))
				(clinical_finding (snomed_concept “Uncertain diagnosis” (observable entity))
		)
)
;; Page 45 - Nausea/Vomiting: Dyspepsia/ heartburn likely 
(system_diagnosis_rule
  "Diagnose probable peritonitis"
  (diagnosis
    (snomed_concept “Indigestion” (finding))
		(snomed_concept “Heartburn” (finding))
    probable
  )
  adult
  (and
    (or
			(clinical_finding (snomed_concept “Epigastric pain” (finding))
			(clinical_finding (snomed_concept “Worse” (qualifier value) “With” (attribute) “Eating” (observable entity))
			(clinical_finding (snomed_concept “Worse” (qualifier value) “With” (attribute) “Hungry” (finding)
			(clinical_finding (snomed_concept “Worse” (qualifier value) “With” (attribute) “Recumbent body position” (finding))
			(clinical_finding (snomed_concept “Worse” (qualifier value) “With” (attribute) “Forward bending” (observable entity))
		)
;; Page 45 - Nausea/Vomiting: Dyspepsia/ heartburn likely 
(system_diagnosis_rule
  "Diagnose probable peritonitis"
  (diagnosis
	(referral
    (snomed_concept “Indigestion” (finding))
		(snomed_concept “Heartburn” (finding))
		(snomed_concept “Patient referral” (procedure) “In” (attribute) day) 7))
  adult
  (and
    (or 
			(clinical_finding (snomed_concept “Patient condition unchanged” (finding) “After” (attribute) day) 7))
			(clinical_finding (snomed_concept “Recurrent episode” (qualifier value))
			(clinical_finding (snomed_concept “Swallowing painful” (finding))
			(clinical_finding (snomed_concept “Difficulty swallowing” (finding))
			(clinical_finding (snomed_concept “Persistent vomiting” (disorder))
			(clinical_finding (snomed_concept “Vomit contains blood” (finding))
			(clinical_finding (snomed_concept “Hematochezia” (finding))
			(clinical_finding (snomed_concept “Occult blood detected in feces” (finding))
			(clinical_finding (snomed_concept “Abdominal mass” (finding))
			(clinical_finding (snomed_concept “Weight decreased” (finding))
			(< (snomed_concept “Measurement of total hemoglobin concentration” (procedure) “Woman” (person) g/dL) 12))
			(< (snomed_concept “Measurement of total hemoglobin concentration” (procedure) “Man” (person) g/dL) 13))
			(clinical_finding (snomed_concept “Epigastric pain” (finding) “New” (qualifier value))
			(> (snomed_concept “Current chronological age” (observable entity) year) 50))
			(clinical_finding (snomed_concept “Family history: Stomach cancer” (situation))
			(clinical_finding (snomed_concept “Family history of cancer of the esophagus” (situation))
		)
	)
)
;; Page 45 - Nausea/Vomiting: Anaphylaxis likely
(system_diagnosis_rule
  "Diagnose probable anaphylaxis"
  (diagnosis
    (snomed_concept “Anaphylaxis” (disorder))
    probable
  )
  adult
  (and
    (or
			(clinical_finding (snomed_concept “Nausea” (finding))
			(clinical_finding (snomed_concept “Vomiting” (disorder))
			any
			(clinical_finding (snomed_concept “Generalized pruritus” (finding))
			(clinical_finding (snomed_concept “Generalized rash” (disorder))
			(clinical_finding (snomed_concept “Facial swelling” (finding))
			(clinical_finding (snomed_concept “Tongue swelling” (finding))
			(clinical_finding (snomed_concept “Wheezing” (finding))
			(clinical_finding (snomed_concept “Difficulty breathing” (finding))
			(<measurement (snomed_concept “Systolic blood pressure” (observable entity) mmHg) 90))
			(<measurement (snomed_concept “Diastolic blood pressure” (observable entity) mmHg) 60))
			(clinical_finding (snomed_concept “Dizziness” (finding))
			(clinical_finding (snomed_concept “Collapse” (finding))
			(clinical_finding (snomed_concept “Exposure to” (contextual qualifier) (qualifier value) “Food” (substance) “Possible” (qualifier value) “Allergen” (attribute))
			(clinical_finding (snomed_concept “Exposure to” (contextual qualifier) (qualifier value) “Substance” (substance) “Possible” (qualifier value) “Allergen” (attribute))
			(clinical_finding (snomed_concept “Exposure to” (contextual qualifier) (qualifier value) “Drug or medicament” (substance) “Possible” (qualifier value) “Allergen” (attribute))
		)
	)
)
);; Page 45 - Nausea/Vomiting: Urgent for danger signs
(system_priority_evaluation
  "Urgent: nausea or vomiting with haemorrhagic, peritoneal or systemic signs"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Nausea" "finding"))
    (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
    )
    (or
			(clinical_finding ( snomed_concept “Headache” (finding))
			)
			(clinical_finding ( snomed_concept “Chest pain” (finding))
			)
			(clinical_finding (snomed_concept “Cholera” (disorder))
			(clinical_finding ( snomed_concept “Diarrhea” (finding) “Watery” (finding)) 
			(clinical_finding ( snomed_concept “Vomiting (disorder) “With” (attribute) or “Without” (attribute)) 
			(clinical_finding ( snomed_concept “History of travel with high risk of exposure to communicable disease” (situation) “Cholera” (disorder) “In the past” (qualifier value) day (qualifier value) 5))
			)
			(clinical_finding (snomed_concept “Meningitis” (disorder))
			(clinical_finding ( snomed_concept “Stiff neck” (finding))
			(clinical_finding ( snomed_concept “Drowsy” (finding))
			(clinical_finding ( snomed_concept “Clouded consciousness” (finding))
			(clinical_finding ( snomed_concept “Purpuric rash” (disorder))
			)
			(clinical_finding ( snomed_concept “Abdominal guarding” (finding))
			(clinical_finding ( snomed_concept “Abdominal rigidity” (finding))
			(clinical_finding ( snomed_concept “Rebound tenderness” (finding))
			)
      (clinical_finding (snomed_concept "Hematemesis" "disorder"))
			)
      (clinical_finding (snomed_concept "Jaundice" "finding"))
			)
			(clinical_finding (snomed_concept “Peritonitis” (disorder))
      (clinical_finding (snomed_concept "Rebound tenderness" "finding"))
      (clinical_finding (snomed_concept "Abdominal guarding" "finding"))
      (clinical_finding (snomed_concept "Abdominal rigidity" "finding"))
			)
			(clinical_finding (snomed_concept “Appendicitis” (disorder))
			(clinical_finding ( snomed_concept “Right lower quadrant pain” (finding))
			)
			(clinical_finding (snomed_concept “Pancreatitis” (disorder))
			(clinical_finding ( snomed_concept “Upper abdominal pain” (finding) “Sudden” (qualifier value) “Severe” (severity modifier) (qualifier value)) 
			(clinical_finding ( snomed_concept “Pain radiating to lumbar region of back” (finding))
			)
      (clinical_finding (snomed_concept "Drowsy" "finding"))
      (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
      (clinical_finding (snomed_concept "Deep breathing" "finding") “Rapid” (qualifier value))
		  )
      (clinical_finding (snomed_concept "Abdominal pain" "finding"))
      (clinical_finding (snomed_concept "Distension of abdomen" "finding"))
			(clinical_finding ( snomed_concept “Constipation” (finding))        
			(clinical_finding (snomed_concept "Unable to break wind" "finding"))
      )
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
      (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
			)
			(clinical_finding (snomed_concept “Anaphylaxis” (disorder))
			(clinical_finding ( snomed_concept “Vomiting” (disorder) “Sudden” (qualifier value))
			(clinical_finding ( snomed_concept “Nausea” (finding) “Sudden” (qualifier value))
			(clinical_finding ( snomed_concept “Generalized pruritus” (finding))
			(clinical_finding ( snomed_concept “Generalized rash” (disorder))
			(clinical_finding ( snomed_concept “ Facial swelling” (finding))
			(clinical_finding ( snomed_concept “Tongue swelling” (finding))
			(clinical_finding ( snomed_concept “Wheezing” (finding))
			(clinical_finding (snomed_concept “Difficulty breathing” (finding))
			(clinical_finding (snomed_concept “Dizziness” (finding)) 
			(clinical_finding ( snomed_concept “Collapse” (finding))
			(clinical_finding ( snomed_concept “Exposure to” (contextual qualifier) “Substance” (substance) (qualifier value) “Possible” (qualifier value) “Allergen” (attribute))
    )
  )
)



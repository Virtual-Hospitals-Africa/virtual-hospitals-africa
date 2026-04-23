;; Page 37 - Chest Pain
(task
  "Check for urgent chest pain conditions"
  adult
  (clinical_finding (snomed_concept "Chest pain" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Pulse irregular" "finding"))
    (clinical_finding (snomed_concept "Severe pain" "finding"))
    (clinical_finding (snomed_concept "Chest pain" "finding") "New" "qualifier value")))
    (clinical_finding (snomed_concept "Chest discomfort" "finding") "New" "qualifier value")))
		(clinical_finding ( snomed_concept “Central chest pain” (finding))
		(clinical_finding ( snomed_concept “Left sided chest pain” (finding))
		(clinical_finding ( snomed_concept “Chest discomfort” (finding) “Central” (qualifier value))
		(clinical_finding ( snomed_concept “Chest discomfort” (finding) “Left sided” (qualifier value))
    (clinical_finding (snomed_concept "Nausea" "finding"))
    (clinical_finding (snomed_concept “Vomiting” (disorder))
    (clinical_finding (snomed_concept "Pallor of skin of face" "finding"))
		(clinical_finding ( snomed_concept “Pale discoloration of entire skin of body” (finding))
    (clinical_finding (snomed_concept "Sweating" "finding"))
    (clinical_finding (snomed_concept "Radiating chest pain" "finding"))
    (clinical_finding (snomed_concept "Pain radiating to jaw" "finding"))
    (clinical_finding (snomed_concept "Pain radiating to neck" "finding"))
    (clinical_finding (snomed_concept "Pain radiating to left arm" "finding"))
    (clinical_finding (snomed_concept "Pain radiating to right arm" "finding"))
    (clinical_finding (snomed_concept "Pain radiating to left shoulder" "finding"))
    (clinical_finding (snomed_concept "Pain radiating to right shoulder" "finding"))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    (clinical_finding (snomed_concept “Ischemic heart disease” (disorder) “Known” (qualifier value))
    (clinical_finding (snomed_concept "Diabetes mellitus" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
    (clinical_finding (snomed_concept "Smoker" "finding"))
    (clinical_finding (snomed_concept "Hypertensive disorder, systemic arterial" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
    (clinical_finding (snomed_concept "Hypercholesterolemia" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
    (clinical_finding (snomed_concept "Family history of ischemic heart disease" "situation"))
		(clinical_finding (snomed_concept “Electrocardiogram normal’ (finding))
		(clinical_finding (snomed_concept “Electrocardiogram abnormal’ (finding))
    (clinical_finding (snomed_concept "ST segment elevation" "finding"))
    (clinical_finding (snomed_concept "ST segment depression" "finding"))
    (clinical_finding (snomed_concept "Electrocardiographic left bundle branch block" "finding"))
		(clinical_finding (snomed_concept “Inadequate electrocardiogram tracing” (finding))
		(clinical_finding (snomed_concept “Electrocardiogram not done” (situation))
		(clinical_finding (snomed_concept “Chest pain” (finding) “Worse” (qualifier value) “Recumbent body position” (finding))
		(clinical_finding (snomed_concept “Chest pain” (finding) “Worse” (qualifier value) “Palpation” (procedure))
    (clinical_finding (snomed_concept "Chest pain on breathing" "finding") “Deep breathing” (finding))
		)
  )
)
;; Page 37 - Chest Pain
(system_diagnosis_rule
  "Ischaemic heart disease likely"
  (adult
  (snomed_concept "Ischemic heart disease" "disorder")
	)
  probable
  (and
		(clinical_finding (snomed_concept “Central chest pain” (finding))		
		(clinical_finding (snomed_concept “Multiple episode” (qualifier value))
		(clinical_finding (snomed_concept “Chest pain on exertion” (finding))
		(clinical_finding (snomed_concept “Pain relief by rest” (finding))
		(clinical_finding (snomed_concept “Electrocardiogram abnormal” (finding))
		(clinical_finding (snomed_concept “ST segment elevation” (finding))
		(clinical_finding (snomed_concept “ST segment depression” (finding))
		(clinical_finding (snomed_concept “Left bundle branch block” (disorder))
		)
	)
;; Page 37 - Chest Pain
(system_diagnosis_rule
  "Increased risk of heart attack"
  (adult
  (snomed_concept “Finding of increased risk level” (finding) “Myocardial infarction” (disorder))
	)
  probable
  (and
		(clinical_finding (snomed_concept “Diabetes mellitus” (disorder))
		(clinical_finding (snomed_concept “Smoker” (finding))
		(clinical_finding (snomed_concept “Hypertensive disorder, systemic arterial” (disorder))
		(clinical_finding (snomed_concept “ Hypercholesterolemia” (disorder))
		(clinical_finding (snomed_concept “Family history of ischemic heart disease” (situation))
		)
	)
;; Page 37 - Chest Pain
(system_diagnosis_rule
  "Tension pneumothorax likely"
  (adult
  (snomed_concept “Tension pneumothorax” (disorder))
	)
  probable
  (and
		(clinical_finding (snomed_concept “Dyspnea” (finding) “Sudden” (qualifier value))
		(clinical_finding (snomed_concept “Increased vocal resonance” (finding))
		(clinical_finding (snomed_concept “Decreased breath sounds” (finding))
		(clinical_finding (snomed_concept “Chest pain” (finding) “Unilateral” (qualifier value))
		(clinical_finding (snomed_concept “Trachea displaced” (disorder))
		)
	)
;; Page 37 - Chest Pain
(system_diagnosis_rule
  "Dyspepsia/ heartburn likely"
  (adult
  (snomed_concept “Indigestion” (finding))
	(snomed_concept “Heartburn” (finding))
	)
  probable
  (and
		(clinical_finding (snomed_concept “Retrosternal pain” (finding))
		(clinical_finding (snomed_concept “Epigastric pain” (finding))
		(clinical_finding (snomed_concept “Pain provoked by eating” (finding))
		(clinical_finding (snomed_concept “Hunger pain” (finding))
		(clinical_finding (snomed_concept “Pain aggravated by position” (finding) “Recumbent body position” (finding))
		(clinical_finding (snomed_concept “Pain aggravated by position” (finding) “Forward bending” (observable entity))
		)
;; Page 37 - Chest Pain
(system_diagnosis_rule
  "Dyspepsia/ heartburn likely"
  (adult
	(referral 
  (snomed_concept “Indigestion” (finding))
	(snomed_concept “Heartburn” (finding))
	(snomed_concept “Patient referral” (procedure) “In” (attribute) week) 1))
	)
  (and
		(clinical_finding (snomed_concept “Patient condition unchanged” (finding) “After” (attribute) “Treatment given” (situation) day) 7))
		(clinical_finding (snomed_concept “Recurrence of problem” (finding))
		(clinical_finding (snomed_concept “Swallowing painful” (finding))
		(clinical_finding (snomed_concept “Difficulty swallowing” (finding))
		(clinical_finding (snomed_concept “Persistent vomiting” (disorder))
		(clinical_finding (snomed_concept “Abdominal mass” (finding))
		(clinical_finding (snomed_concept “Vomit contains blood” (finding))
		(clinical_finding (snomed_concept “Occult blood detected in vomitus” (finding))
		(clinical_finding (snomed_concept “Hematochezia” (finding))
		(clinical_finding (snomed_concept “Occult blood detected in feces” (finding))
		(clinical_finding (snomed_concept “Weight decreased” (finding))
		(< (snomed_concept “Measurement of total hemoglobin concentration (procedure) Woman (person) g/dL) 12))
		(< (snomed_concept “Measurement of total hemoglobin concentration (procedure) Man (person) g/dL) 13))
		(clinical_finding (snomed_concept “Retrosternal pain” (finding) “New” (qualifier value))
		(clinical_finding (snomed_concept “Epigastric pain” (finding) “New” (qualifier value))
		(> (snomed_concept “Current chronological age" (observable entity) year) 50))
		(clinical_finding (snomed_concept “Family history: Stomach cancer” (situation))
		(clinical_finding (snomed_concept “Family history of cancer of the esophagus” (situation))
		)
	)
;; Page 37 - Chest Pain
(system_diagnosis_rule
  "Musculoskeletal problem likely"
  (adult
  (snomed_concept “Disorder of musculoskeletal system” (disorder))
	)
  probable
  (and
		(clinical_finding (snomed_concept “Pain” (finding) “Entire costochondral junction” (body structure))
		(clinical_finding (snomed_concept “Tenderness” (finding) “Entire costochondral junction” (body structure))
		(clinical_finding (snomed_concept “Apyrexial” (situation))
		(clinical_finding (snomed_concept “No cough” (situation))
		)
	)
;; Page 37 - Chest Pain
(system_diagnosis_rule
  "Risk for cardiovascular disease"
  (adult
	(assess
  (snomed_concept “Assessment for risk of cardiovascular disease” (procedure)
	)
  (and
		(measurement (snomed_concept “Body mass index (observable entity) 
		(snomed_concept “Body weight” (observable entity) kg/ “Body height” (observable entity) m²
		(measurement (snomed_concept “Blood pressure” (observable entity)
;; Page 37 - Chest Pain
(system_diagnosis_rule
  "Risk of cardiovascular event"
  (adult
	(calculation
  (snomed_concept “Risk of “ (contextual qualifier) “Cardiovascular event” (event) (qualifier value) year) 10))
	)
  (and
		(snomed_concept “Man” (person)
		(snomed_concept “Woman” (person)
		(snomed_concept “Current chronological age" (observable entity) year) 40-44, 45-49, 50-54,55-59,60-64, 65-69, 70-74))
		(clinical_finding (snomed_concept “Finding of body mass index” (finding) kg/m²) <20, 20-24, 25-29, 30-34, >35))
			(clinical_finding (snomed_concept “Body mass index less than 20” (finding))
			(clinical_finding (snomed_concept “Body mass index 20-24” - normal (finding))
			(clinical_finding (snomed_concept “Body mass index 25-29” - overweight (finding))
			(clinical_finding (snomed_concept “Body mass index 30+ “- obesity (finding))
			(clinical_finding (snomed_concept “Body mass index 40+” - severely obese (finding))
		(snomed_concept “Systolic blood pressure”(observable entity) mmHg) <120, 120-139, 140-159, 160-179, >180))
			(snomed_concept “Systolic arterial pressure within reference range” (finding))
			(clinical_finding (snomed_concept “Systolic arterial pressure outside reference range” (finding)
			(clinical_finding (snomed_concept “Systolic arterial pressure above reference range” (finding)
			(clinical_finding (snomed_concept “Systolic arterial pressure below reference range” (finding) 
		(clinical_finding (snomed_concept “Finding of tobacco smoking behavior” (finding)
			(clinical_finding (snomed_concept “Non-smoker (finding)”
			(clinical_finding (snomed_concept “Smoker (finding)”
		)
	)
;; Page 37 - Chest Pain
(system_diagnosis_rule
  "Risk of cardiovascular disease"
  (adult
	(assessment
  (snomed_concept “Framingham cardiovascular disease 10 year risk score” (assessment scale)
	)
  (and
use only
		(clinical_finding (snomed_concept “Absent” (qualifier value) “Disorder of cardiovascular system” (disorder)
		(clinical_finding (snomed_concept “Absent” (qualifier value) “Familial hypercholesterolemia” (disorder)
;; Page 37 - Chest Pain
(system_diagnosis_rule
  "Risk of cardiovascular disease"
  (adult
	(calculation
  (snomed_concept “Framingham cardiovascular disease 10 year risk score” (assessment scale)
	)
  (and
		(snomed_concept “Man” (person)
		(snomed_concept “Woman” (person)
		(snomed_concept “Current chronological age" (observable entity) year) 30–34, 35–39, 40–44, 45–49, 50–54, 55–59, 60–64, 65–69, 70–74, 75–79))
		(snomed_concept “Total cholesterol measurement “(procedure) mmol/L) <4.1, 4.1–5.19, 5.2 – 6.19, 6.2–7.2, >7.2))
		(snomed_concept “High density lipoprotein cholesterol measurement” (procedure) mmol/L) >1.5, 1.3–1.49, 1.2–1.29, 0.9–1.119, <0.9))
		(clinical_finding (snomed_concept “Smoker (finding)”
		(clinical_finding (snomed_concept “Diabetes mellitus” (disorder)
		(clinical_finding (snomed_concept “Systolic blood pressure”(observable entity) mmHg) <120, 120–129, 130–139, 140–149, 150–159, ≥160))
		(snomed_concept “Monitoring hypertension treatment “ (regime/therapy) Pre-starting action status (qualifier value)
		(snomed_concept “Monitoring hypertension treatment “ (regime/therapy) Post-starting action status (qualifier value)
    )
  )
)
;; Page 37 - Chest Pain
(system_priority_evaluation
  "Urgent chest pain conditions"
  adult
	(snomed_concept "Chest pain" "finding"))
  Urgent
  (and
    (clinical_finding ( snomed_concept “Severe pain” (finding))
		)
		(clinical_finding ( snomed_concept “Chest pain” (finding) “New” (qualifier value))
		or
		(clinical_finding ( snomed_concept “Central chest pain” (finding))
		(clinical_finding ( snomed_concept “Left sided chest pain” (finding))
		(clinical_finding ( snomed_concept “Chest discomfort” (finding) “New” (qualifier value))
		(clinical_finding ( snomed_concept “Chest discomfort” (finding) “Central” (qualifier value))
		(clinical_finding ( snomed_concept “Chest discomfort” (finding) “Left sided” (qualifier value))
		)
		(clinical_finding (snomed_concept "Radiating chest pain" "finding"))
  	  (clinical_finding (snomed_concept "Pain radiating to jaw" "finding"))
    	(clinical_finding (snomed_concept "Pain radiating to neck" "finding"))
   	 	(clinical_finding (snomed_concept "Pain radiating to left arm" "finding"))
      (clinical_finding (snomed_concept "Pain radiating to right arm" "finding"))
		(clinical_finding ( snomed_concept “Pale discoloration of entire skin of body” (finding))
		or
    (clinical_finding (snomed_concept "Pallor of skin of face" "finding"))
    (clinical_finding (snomed_concept "Sweating" "finding"))
		)
    (clinical_finding (snomed_concept "Nausea" "finding"))
    (clinical_finding (snomed_concept “Vomiting” (disorder))
    (active_condition (snomed_concept "Ischemic heart disease" "disorder") “Known” (qualifier value))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    (clinical_finding (snomed_concept "Pulse irregular" "finding"))
		)
		(clinical_finding (snomed_concept “Finding of increased risk level” (finding) “Myocardial infarction” (disorder))
		any
		(clinical_finding (snomed_concept “Diabetes mellitus” (disorder))
		(clinical_finding (snomed_concept “Smoker” (finding))
		(clinical_finding (snomed_concept “Hypertensive disorder, systemic arterial” (disorder))
		(clinical_finding (snomed_concept “ Hypercholesterolemia” (disorder)) 
		(clinical_finding (snomed_concept “Family history of ischemic heart disease” (situation))
		(>measurement (snomed_concept “Risk of cardiovascular disease” (observable entity) %) 20))
    (>= (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 30)
    (>= (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 180)
    (>= (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 110)
    (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
    (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
    (> (measurement (snomed_concept “Heart rate” "observable entity") bpm) 100)
    (< (measurement (snomed_concept “Heart rate” "observable entity") bpm) 50)
		)
		(clinical_finding (snomed_concept “Tension pneumothorax” (disorder))
		or
		(clinical_finding (snomed_concept “Dyspnea” (finding) “Sudden” (qualifier value))
		(clinical_finding (snomed_concept “Increased vocal resonance” (finding))
		(clinical_finding (snomed_concept “Decreased breath sounds” (finding))
		(clinical_finding (snomed_concept “Chest pain” (finding) “Unilateral” (qualifier value))
		(clinical_finding (snomed_concept “Trachea displaced” (disorder))
		)
		(clinical_finding (snomed_concept “Ischemic heart disease” (disorder))
		or
		(clinical_finding (snomed_concept “Electrocardiogram abnormal” (finding))
		(clinical_finding (snomed_concept “ST segment elevation” (finding))
		(clinical_finding (snomed_concept “ST segment depression” (finding))
		(clinical_finding (snomed_concept “Left bundle branch block” (disorder))
    )
  )
)






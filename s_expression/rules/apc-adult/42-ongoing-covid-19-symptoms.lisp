;; Page 42 - Ongoing Covid 19 Symptoms
(task
  "Check for urgent ongoing Covid-19 symptoms"
  adult
  (clinical_finding (snomed_concept "Disease caused by severe acute respiratory syndrome coronavirus 2" "disorder"))
  (check_for
    (clinical_finding (snomed_concept "Headache" "finding"))
    (clinical_finding (snomed_concept "Vomiting" (disorder))
    (clinical_finding (snomed_concept "Chest pain" "finding") (snomed_concept "Severe" (severity modifier)" (qualifier value)) 
		(clinical_finding (snomed_concept “Chest pain” (finding) "New" (qualifier value))
    (clinical_finding (snomed_concept "Weakness of face muscles" "finding") "New" (qualifier value) "Sudden" (qualifier value) "Asymmetry" (qualifier value))
    (clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding") "New" (qualifier value) "Sudden" (qualifier value) "Asymmetry" (qualifier value))
    (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding") "New" (qualifier value) "Sudden" (qualifier value) "Asymmetry" (qualifier value))
    (clinical_finding (snomed_concept "Numbness of face" "finding"))
    (clinical_finding (snomed_concept "Numbness of limbs" "finding"))
		(clinical_finding (snomed_concept “Difficulty talking” (finding))
		(clinical_finding (snomed_concept “Visual disturbance” (disorder))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    (clinical_finding (snomed_concept "Orthopnea" "finding"))
    (clinical_finding (snomed_concept "Leg swelling symptom" "finding"))
    (clinical_finding (snomed_concept "Clouded consciousness" "finding") "Onset of" (contextual qualifier) (qualifier value) "New" (qualifier value))
    (clinical_finding (snomed_concept "Feeling agitated" "finding") "Onset of" (contextual qualifier) (qualifier value) "New" (qualifier value))
    (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
    (clinical_finding (snomed_concept "Hemoptysis" "finding") (qualifier (snomed_concept "Fresh" "qualifier value")))
    (clinical_finding (snomed_concept "Swollen calf" "finding"))
    (clinical_finding (snomed_concept "Pain in calf" "finding"))
		)
  )
)
;;Page 42 – Ongoing Covid 19 Symptoms 
(system_priority_evaluation
	Urgent
	(snomed_concept “Disease caused by severe acute respiratory syndrome coronavirus 2” (disorder) “Symptomatic” (qualifier value)) "Active disease following therapy" (finding))
	(adult 
		(clinical_finding (snomed_concept “Headache” (finding))								(clinical_finding (snomed_concept "Vomiting" (disorder))
		)
		(clinical_finding (snomed_concept “Chest pain” (finding) Severe (severity modifier) (qualifier value))
		or
		(clinical_finding (snomed_concept “Chest pain” (finding) New (qualifier value))
		)
		(clinical_finding (snomed_concept “Cerebrovascular accident” (disorder))
		(clinical_finding (snomed_concept “Transient ischemic attack” (disorder))
		(clinical_finding ( snomed_concept “Weakness of face muscles” (finding) "New"		(qualifier value) "Sudden" (qualifier value) "Asymmetry" (qualifier value))
		or
		(clinical_finding ( snomed_concept “Muscle weakness of upper limb” (finding) "New" (qualifier value) "Sudden" (qualifier value) "Asymmetry" (qualifier value))
		(clinical_finding ( snomed_concept “Weakness of muscle of lower limb” (finding) "New" (qualifier value) "Sudden" (qualifier value) "Asymmetry" (qualifier value))
		(clinical_finding ( snomed_concept “Numbness of face” (finding))
		(clinical_finding ( snomed_concept “Numbness of limbs” (finding))
		(clinical_finding (snomed_concept “Difficulty talking” (finding))
		(clinical_finding (snomed_concept “Visual disturbance” (disorder))
		)
		(clinical_finding (snomed_concept “Heart failure” (disorder))
		(clinical_finding (snomed_concept “Difficulty breathing” (finding)) 
		(clinical_finding (snomed_concept “Orthopnea” (finding))
		(clinical_finding (snomed_concept “Swelling of lower limb” (finding))
		)
		(clinical_finding (snomed_concept “Decreased level of consciousness” (finding))
		or
		(clinical_finding (snomed_concept “Clouded consciousness” (finding) "Onset of" (contextual qualifier) (qualifier value) "New" (qualifier value))
		(clinical_finding (snomed_concept “Feeling agitated” (finding) "Onset of" (contextual qualifier) (qualifier value) "New" (qualifier value))
		)
		(clinical_finding (snomed_concept “Hemoptysis” (finding) "Fresh" (qualifier value))
		)
		(clinical_finding (snomed_concept “Swollen calf” (finding))							
		(clinical_finding (snomed_concept “Pain in calf” (finding))
		)
		(>=measurement (snomed_concept “Respiratory rate” (observable entity) bpm) 25))
		(<measurement (snomed_concept “Hemoglobin saturation with oxygen” (observable entity) %) 95))
		(>=measurement (snomed_concept “Body temperature” (observable entity) °C) 38))
		(>measurement (snomed_concept “Heart rate” (observable entity) bpm) 120))
		(<measurement (snomed_concept “Systolic blood pressure” (observable entity) mmHg) 90))
		(< measurement (snomed_concept “Diastolic blood pressure” (observable entity) mmHg) 60))
		)
	)
)
;;Page 42 – Ongoing Covid 19 Symptoms 
(system_diagnosis_rule
	"Ongoing Covid 19 likely"
	(adult
	(snomed_concept “Disease caused by severe acute respiratory syndrome coronavirus 2” (disorder) “Symptomatic” (qualifier value)) "Active disease following therapy" (finding))
	)
	probable 
	(and
		(clinical_finding (snomed_concept “Fatigue” (finding))
		(clinical_finding (snomed_concept “Dyspnea” (finding))
		(clinical_finding (snomed_concept “Cough” (finding))
		(clinical_finding (snomed_concept “Sense of smell altered” (finding))
		(clinical_finding (snomed_concept “Taste sense altered” (finding))
		(clinical_finding (snomed_concept “Headache” (finding))
		(clinical_finding (snomed_concept “Dizziness” (finding))
		(clinical_finding (snomed_concept “Difficulty processing information at normal speed” (finding))
		(clinical_finding (snomed_concept “Mentally vague” (finding))
		(clinical_finding (snomed_concept “Pain of joint” (finding))
		(clinical_finding (snomed_concept “Muscle pain” (finding))
		(clinical_finding (snomed_concept “Chest pain” (finding))
		(clinical_finding (snomed_concept “History of disease caused by severe acute respiratory syndrome coronavirus 2” (situation))
		(clinical_finding (snomed_concept “History of” (contextual qualifier) (qualifier value) “Severe acute respiratory syndrome coronavirus 2 antibody detected” (finding))
		)
;;Page 42 – Ongoing Covid 19 Symptoms 
(system_diagnosis_rule
	"Ongoing Covid 19 likely"
	(adult
	(consult
	(snomed_concept “Disease caused by severe acute respiratory syndrome coronavirus 2” (disorder) “Symptomatic” (qualifier value)) Active disease following therapy (finding)
	(snomed_concept “Consultation” (procedure) “Specialized physician” (occupation))
	)
	probable 
	(and
		(clinical_finding (snomed_concept “Severe acute respiratory syndrome coronavirus 2 antibody not detected” (finding))
		(clinical_finding (snomed_concept “History of disease caused by severe acute respiratory syndrome coronavirus 2” (situation) “Uncertain” (qualifier value))
		)
	)
;;Page 42 – Ongoing Covid 19 Symptoms 
(system_diagnosis_rule
	"Long Covid likely"
	(adult
	(snomed_concept “Chronic post-COVID-19 syndrome” (disorder))
	)
	probable 
	(and
		(clinical_finding (snomed_concept “Chest pain” (finding) “Chronic persistent” (qualifier value))
		(clinical_finding (snomed_concept “Pain of joint” (finding) “Chronic persistent” (qualifier value))
		(clinical_finding (snomed_concept “Headache” (finding) “Chronic persistent” (qualifier value))
		(clinical_finding (snomed_concept “Dizziness” (finding) “Chronic persistent” (qualifier value))
		)
;;Page 42 – Ongoing Covid 19 Symptoms 
(system_diagnosis_rule
	"Long Covid likely"
	(adult
	(urgent_return
	(snomed_concept “Chronic post-COVID-19 syndrome” (disorder))
	(snomed_concept “Recommendation to return” (procedure) “Urgent” (qualifier value))
	)
	probable 
	(and
		(clinical_finding (snomed_concept “Dyspnea” (finding) “Worse” (qualifier value))
		(clinical_finding (snomed_concept “Clouded consciousness” (finding) “New” (qualifier value))
		(clinical_finding (snomed_concept “Clouded consciousness” (finding) “Worsening” (qualifier value))
		(clinical_finding (snomed_concept “Unresponsive” (finding))
		(clinical_finding (snomed_concept “Not easily wakened from sleep” (finding))
		(clinical_finding (snomed_concept “Chest pain” (finding) “Recurrence” (qualifier value))
		(clinical_finding (snomed_concept “Tight chest” (finding) “Recurrence” (qualifier value))
		(clinical_finding (snomed_concept “Weakness of face muscles” (finding) “New” (qualifier value) “Sudden” (qualifier value))
		(clinical_finding (snomed_concept “Muscle weakness of upper limb” (finding) “New” (qualifier value) “Sudden” (qualifier value))
		(clinical_finding (snomed_concept “Weakness of muscle of lower limb” (finding) “New” (qualifier value) “Sudden” (qualifier value))
		(clinical_finding (snomed_concept “Numbness of face” (finding))
		(clinical_finding (snomed_concept “Numbness of limbs” (finding))
		)
	)
;;Page 42 – Ongoing Covid 19 Symptoms 
(system_diagnosis_rule
	"Tuberculosis likely"
	(adult
	(snomed_concept “Tuberculosis” (disorder)) 
	)
	probable 
	(and
		(clinical_finding (snomed_concept “Cough” (finding))
		(> (snomed_concept “Weight decreased” (finding) kg) 1.5))
		(clinical_finding (snomed_concept “Night sweats” (finding))
		(clinical_finding (snomed_concept “Hyperhidrosis” (disorder))
		(clinical_finding (snomed_concept “Fever” (finding))
		(clinical_finding (snomed_concept “Fatigue” (finding))
		)
	)
;;Page 42 – Ongoing Covid 19 Symptoms 
(system_diagnosis_rule
	"Stroke or TIA likely"
	(adult
	(snomed_concept “Cerebrovascular accident” (disorder))
	(snomed_concept “Transient ischemic attack” (disorder))
	)
	probable 
	(and
		(clinical_finding (snomed_concept “Weakness of face muscles” (finding) “New” (qualifier value) “Sudden” (qualifier value) “Asymmetry” (qualifier value))
		(clinical_finding (snomed_concept “Muscle weakness of upper limb” (finding) “New” (qualifier value) “Sudden” (qualifier value) “Asymmetry” (qualifier value))
		(clinical_finding (snomed_concept “Weakness of muscle of lower limb” (finding) “New” (qualifier value) “Sudden” (qualifier value) “Asymmetry” (qualifier value))
		(clinical_finding (snomed_concept “Numbness of face” (finding))
		(clinical_finding (snomed_concept “Numbness of limbs” (finding))
		(clinical_finding (snomed_concept “Difficulty talking” (finding))
		(clinical_finding (snomed_concept “Visual disturbance” (disorder))
		)
	)
;;Page 42 – Ongoing Covid 19 Symptoms 
(system_diagnosis_rule
	"Heart failure likely"
	(adult
	(snomed_concept “Heart failure” (disorder))
	)
	probable 
	(and 
		(clinical_finding (snomed_concept “Difficulty breathing” (finding))
		(clinical_finding (snomed_concept “Orthopnea” (finding))
		(clinical_finding (snomed_concept “Leg swelling symptom” (finding))
		)
	)
)

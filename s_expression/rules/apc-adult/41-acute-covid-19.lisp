;; Page 41 - Acute Covid 19
(task
  "Check for urgent acute Covid-19 conditions"
  adult
  (snomed_concept "Acute disease caused by severe acute respiratory syndrome coronavirus 2" "disorder"))
  (check_for
    (clinical_finding (snomed_concept "Dyspnea" "finding"))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    (clinical_finding (snomed_concept "Chest pain" "finding") “Continual” (qualifier value))
    (clinical_finding (snomed_concept "Tight chest" "finding") “Continual” (qualifier value))
    (clinical_finding (snomed_concept "Clouded consciousness" "finding") “New” (qualifier value))
    (clinical_finding (snomed_concept "Drowsy" "finding") (qualifier (snomed_concept "Worsening" "qualifier value")))
  )
)
;; Page 41 - Acute Covid 19
(system_priority_evaluation
  "Check for urgent acute Covid-19 conditions"
  (urgent
  (snomed_concept "Acute disease caused by severe acute respiratory syndrome coronavirus 2" "disorder"))
  (adult 
		(clinical_finding (snomed_concept “Dyspnea” (finding))
		(clinical_finding (snomed_concept “Difficulty breathing” (finding))
		(clinical_finding (snomed_concept “Chest pain” (finding) “Continual” (qualifier value))
		(clinical_finding (snomed_concept “Tight chest” (finding) “Continual” (qualifier value))
		(clinical_finding (snomed_concept “Clouded consciousness” (finding) “New” (qualifier value))
		(clinical_finding (snomed_concept “Drowsy” (finding) “Worsening” (qualifier value))
		)
	)
)
;; Page 41 - Acute Covid 19
(system_diagnosis_rule
  "Acute Covid 19 likely"
  (adult
	(advice
	(direct_referral
  (snomed_concept "Acute disease caused by severe acute respiratory syndrome coronavirus 2" "disorder"))
	(snomed_concept “Patient given advice” (situation))
	(snomed_concept “Referral to emergency clinic” (procedure)
	or
	(snomed_concept “Free-standing emergency care center” (environment))
	(snomed_concept “Hospital-based outpatient emergency care center” (environment))
	)
	probable 
  (and
		(clinical_finding (snomed_concept “Diabetes mellitus” (disorder) “Known” (qualifier value))
and
		(clinical_finding (snomed_concept “Dyspnea” (finding))
		(clinical_finding (snomed_concept “Asthenia” (finding))
		(clinical_finding (snomed_concept “Fever” (finding))
		(clinical_finding (snomed_concept “Chill” (finding))
		)
;; Page 41 - Acute Covid 19
(system_diagnosis_rule
  "Acute Covid 19 likely"
  (adult
	(consultation 
  (snomed_concept "Acute disease caused by severe acute respiratory syndrome coronavirus 2" "disorder"))
	(snomed_concept “Consultation” (procedure) “Admission to establishment” (procedure))
	)
	probable 
  (and
		(clinical_finding (snomed_concept “Diabetes mellitus” (disorder) “Known” (qualifier value))
		(>= (snomed_concept “Current chronological age” (observable entity) year) 60))
		(clinical_finding (snomed_concept “Chronic kidney disease” (disorder))
		(>measurement (snomed_concept “Blood glucose status” (observable entity) “Finger-prick sampling” (procedure) mmol/L) 11))
		(clinical_finding (snomed_concept “Ketonuria” (finding))
		(clinical_finding (snomed_concept “Hemoglobin A1c greater than 10 percent indicating poor diabetic control” (finding))
		(clinical_finding (snomed_concept “Body mass index 30+ - obesity’ (finding))
		(clinical_finding (snomed_concept “Hypertensive disorder, systemic arterial” (disorder))
		(clinical_finding (snomed_concept “Ischemic heart disease” (disorder))
		(clinical_finding (snomed_concept “Peripheral vascular disease” (disorder))
		(clinical_finding (snomed_concept “History of cerebrovascular accident” (situation))
		(clinical_finding (snomed_concept “History of transient ischemic attack” (situation))
		(clinical_finding (snomed_concept “Human immunodeficiency virus infection” (disorder))
		(clinical_finding (snomed_concept “Tuberculosis” (disorder))
		(clinical_finding (snomed_concept “Malignant neoplastic disease” (disorder))
		(clinical_finding (snomed_concept “Chronic disease of respiratory system” (disorder))
		)
;; Page 41 - Acute Covid 19
(system_diagnosis_rule
  "Acute Covid 19 likely"
  (adult
	(urgent_return
  (snomed_concept "Acute disease caused by severe acute respiratory syndrome coronavirus 2" "disorder"))
	(snomed_concept “Recommendation to return” (procedure) “Urgent” (qualifier value))
	)
	probable 
  (and
		(clinical_finding (snomed_concept “Dyspnea” (finding))
		(clinical_finding (snomed_concept “Difficulty breathing” (finding))
		(clinical_finding (snomed_concept “Chest pain” (finding) “Continual” (qualifier value))
		(clinical_finding (snomed_concept “Tight chest” (finding) “Continual” (qualifier value))
		(clinical_finding (snomed_concept “Clouded consciousness” (finding) “New” (qualifier value))
		(clinical_finding (snomed_concept “Drowsy” (finding) “Worsening” (qualifier value))
		)
	)
)

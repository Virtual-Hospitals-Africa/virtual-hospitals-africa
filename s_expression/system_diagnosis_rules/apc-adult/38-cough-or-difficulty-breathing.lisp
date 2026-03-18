;; Page 38 - Cough/Breathing: Pulmonary embolism likely with calf swelling and breathlessness
(system_diagnosis_rule
  (diagnosis
    (snomed_concept "Pulmonary embolism" "disorder")
    possible
  )
  adult
  (and
    (or (clinical_finding (snomed_concept "Cough" "finding"))
        (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    )
    (clinical_finding (snomed_concept "Swollen calf" "finding"))
  )
)
;; Page 38 - Cough/Breathing: Tension pneumothorax likely with breathlessness, chest pain and hypotension
(system_diagnosis_rule
  (diagnosis
    (snomed_concept "Tension pneumothorax" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Dyspnea" "finding") (qualifier (snomed_concept "Sudden" "qualifier value")))
    (clinical_finding (snomed_concept "Finding of chest resonance to percussion" "finding"))
    (clinical_finding (snomed_concept "Decreased breath sounds" "finding"))
    (clinical_finding (snomed_concept "Trachea displaced" "disorder"))
    (clinical_finding (snomed_concept "Chest pain" "finding") (qualifier (snomed_concept "Unilateral" "qualifier value")))
    (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
    (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
  )
)
;; Page 38 - Cough/Breathing: Acute bronchitis likely 
(system_diagnosis_rule
  (diagnosis
    (snomed_concept "Acute bronchitis" "disorder")
    probable
	)
	adult
		(<duration (clinical_finding (snomed_concept “Cough” (finding) “week” (qualifier value) 2))
		(clinical_finding (snomed_concept “Cough” (finding) “No recurrence of problem” (situation)
)
		(clinical_finding (snomed_concept “Exposure to cold” (event) “Recent” (qualifier value)
		AND ANY
		(clinical_finding (snomed_concept “Tight chest” (finding))
		(clinical_finding (snomed_concept “Chest discomfort” (finding))
		(clinical_finding (snomed_concept “Productive cough” (finding))


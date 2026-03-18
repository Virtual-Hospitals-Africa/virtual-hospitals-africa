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
(system_diagnosis_rule
  (referral
    (snomed_concept "Pneumonia" "disorder")
  )
  adult
			(clinical_finding (snomed_concept “Patient referral” (procedure))
			(clinical_finding (snomed_concept “Drug compliance poor” (finding))
			(clinical_finding (snomed_concept “Urgent care clinic” (environment) “Difficult” (qualifier value) “Access” (attribute))
			(clinical_finding (snomed_concept “Human immunodeficiency virus infection” (disorder))
			(>clinical_finding (snomed_concept “Current chronological age” (observable entity) “year” (qualifier value) 65))
			(clinical_finding (snomed_concept “Disorder of lung” (disorder))
			(clinical_finding (snomed_concept “Heart disease” (disorder))
			(clinical_finding (snomed_concept “Disorder of liver” (disorder))
			(clinical_finding (snomed_concept “Kidney disease” (disorder))
			(clinical_finding (snomed_concept “Diabetes mellitus” (disorder))
			(clinical_finding (snomed_concept “Current drinker of alcohol” (finding))

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
;; Page 38 - Cough/Breathing: Bacterial pneumonia 
(system_diagnosis_rule
  (diagnosis
    (snomed_concept "Bacterial pneumonia” (disorder) “Severe” (severity modifier) (qualifier value))
    probable
  )
  adult
		(clinical_finding (snomed_concept “Bacterial pneumonia” (disorder) “Severe” (severity modifier) (qualifier value))
		(clinical_finding (snomed_concept “Cough” (finding))
		(clinical_finding (snomed_concept “Difficulty breathing” (finding))
		(>=measurement (snomed_concept “Respiratory rate” (observable entity) “Breaths/minute” (qualifier value) 30))
		(>=measurement (clinical_finding (snomed_concept " Body temperature” (observable entity) “Degrees Celsius” (qualifier value)38))

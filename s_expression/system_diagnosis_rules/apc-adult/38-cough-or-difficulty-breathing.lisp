;; Page 38 - Cough/Breathing: Pulmonary embolism likely with calf swelling and breathlessness
(system_diagnosis_rule
  (diagnosis
    (snomed_concept "Pulmonary embolism" "disorder")
    probable 
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
    (or (clinical_finding (snomed_concept "Cough" "finding"))
        (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    )
    (clinical_finding (snomed_concept "Chest pain" "finding") "Unilateral” (qualifier value))
    (< (measurement (clinical_finding (snomed_concept "Systolic blood pressure" "observable entity") “Millimeter of mercury”(qualifier value) 90))
		(< measurement (clinical_finding (snomed_concept “Diastolic blood pressure” (observable entity) “Millimeter of mercury” (qualifier value) 60))
		(clinical_finding (snomed_concept “Dyspnea” (finding) “Sudden” (qualifier value))
		(clinical_finding (snomed_concept “Increased vocal resonance” (finding))
		(clinical_finding (snomed_concept “Decreased breath sounds” (finding))
		(clinical_finding (snomed_concept “Trachea displaced” (disorder))
		(clinical_finding (snomed_concept “Disease caused by severe acute respiratory syndrome coronavirus 2” (disorder)
  )
)

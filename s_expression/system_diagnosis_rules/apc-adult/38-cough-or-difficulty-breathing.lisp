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
    (snomed_concept "Pneumocystosis jirovecii pneumonia”  "disorder")
    urgent
		(clinical_finding (snomed_concept “Urgent referral” (procedure) “In” (attribute) “hour” (qualifier value) 24))
  )
  adult
		(clinical_finding (snomed_concept “Atypical pneumonia” (disorder)) 
		AND 
		(clinical_finding (snomed_concept “Plain X-ray of chest abnormal” (finding))
)
		(clinical_finding (snomed_concept “Plain X-ray of chest” (procedure) “Not available” (qualifier value))
		AND
		(>measurement (snomed_concept “Respiratory rate” (observable entity) “Breaths/minute” (qualifier value) 24))

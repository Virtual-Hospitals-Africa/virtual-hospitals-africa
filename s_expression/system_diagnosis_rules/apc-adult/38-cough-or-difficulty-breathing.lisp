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
    possible
  )
  adult
  (and
    (or (clinical_finding (snomed_concept "Cough" "finding"))
        (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    )
    (clinical_finding (snomed_concept "Chest pain" "finding"))
    (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
  )
)
;; Page 38 - Cough/Breathing: Pneumonia likely
(system_diagnosis_rule
  (diagnosis
    (snomed_concept "Pneumonia" "disorder")
    probable 
  )
  adult
			(<duration (clinical_finding (snomed_concept “Cough” (finding) “week” (qualifier value) 2))
			(clinical_finding (snomed_concept “Cough” (finding) “No recurrence of problem” (situation))
			(clinical_finding (snomed_concept “Productive cough” (finding))
			ANY
			(>=measurement (snomed_concept “Respiratory rate” (observable entity) “Breaths/minute” (qualifier value) 20))
			(>= measurement (clinical_finding (snomed_concept “Pulse, function (observable entity) Beats/minute (qualifier value) 100))
			(clinical_finding (snomed_concept “Opacity of bilateral lungs on plain chest X-ray” (finding))
			(clinical_finding (snomed_concept “Auscultation” (procedure) “Both lungs” (body structure) ‘Respiratory crackles” (finding))
			(clinical_finding (snomed_concept “Auscultation” (procedure) “Both lungs” (body structure) “Bronchial breathing” (finding))

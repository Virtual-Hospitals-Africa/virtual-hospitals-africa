;; Page 26 - Weakness or Tiredness
(system_priority_evaluation
  "Urgent fatigue conditions"
  Urgent
  (clinical_finding (snomed_concept "Fatigue" "finding"))
  (adult
		(clinical_finding ( snomed_concept “Weakness of face muscles” (finding) “New” (qualifier value) “Sudden” (qualifier value) “Asymmetry” (qualifier value))
		AND
		(clinical_finding ( snomed_concept “Muscle weakness of upper limb” (finding) “New” (qualifier value) “Sudden” (qualifier value) “Asymmetry” (qualifier value))
		AND
		(clinical_finding ( snomed_concept “Weakness of muscle of lower limb” (finding) “New” (qualifier value) “Sudden” (qualifier value) “Asymmetry” (qualifier value))
		AND
		(clinical_finding ( snomed_concept “Numbness of face” (finding))
		AND
		(clinical_finding ( snomed_concept “Numbness of upper limb” (finding))
		AND
		(clinical_finding ( snomed_concept “Numbness of lower limb” (finding))
		AND
		(clinical_finding ( snomed_concept “Visual disturbance” (disorder))
		)
    (clinical_finding (snomed_concept "Chest pain" "finding"))
		)     
		(clinical_finding (snomed_concept "Difficulty breathing" "finding"))
		OR
		(>= measurement (clinical_finding ( snomed_concept “Respiratory rate” (observable entity) “Breaths/minute” (qualifier value) 30))
		)
		(clinical_finding ( snomed_concept “Difficulty breathing” (finding))
		AND     
		(clinical_finding (snomed_concept "Orthopnea" "finding"))
		AND
    (clinical_finding (snomed_concept “Swelling of lower limb” (finding))
		)     
		(>= (measurement (snomed_concept "Body temperature" "observable entity") “Degrees Celsius” (qualifier value) 38 “Current” (qualifier value))
		OR
		(>= measurement (clinical_finding ( snomed_concept “Body temperature” (observable entity) “Degrees Celsius” (qualifier value) 38 “In the past” (qualifier value) “day” (qualifier value) “Few” (qualifier value))
    )
		(<measurement (clinical_finding ( snomed_concept “Finding of blood glucose level” (finding) “Millimole/liter” (qualifier value) 3))
		OR
		(<measurement (clinical_finding ( snomed_concept “Finding of blood glucose level” (finding) “Diabetes mellitus” (disorder) “Millimole/liter” (qualifier value) 4))
		)
		(>= (measurement (snomed_concept "Blood glucose status" "observable entity") “Millimole/liter” (qualifier value) 11.1))
		)     
		(>= (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 30)
		)
		(clinical_finding ( snomed_concept “Thirst due to water deprivation” (finding))
		AND
		(clinical_finding ( snomed_concept “Xerostomia due to dehydration” (disorder))
		AND
		(clinical_finding ( snomed_concept “Decreased skin turgor” (finding))
		AND
		(clinical_finding ( snomed_concept “Drowsy” (finding))
		OR
		(clinical_finding ( snomed_concept “Clouded consciousness” (finding))
		AND     
		(< (measurement (snomed_concept "Systolic blood pressure" "observable entity") “Millimeter of mercury” (qualifier value) 90)
		AND
    (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") “Millimeter of mercury” (qualifier value) 60)
		AND
		(>=measurement (clinical_finding ( snomed_concept “Heart rate” (observable entity) “Beats/minute” (qualifier value) 100))
		)
		(<(clinical_finding ( snomed_concept “Measurement of total hemoglobin concentration” (procedure) “Gram/deciliter” (qualifier value) 6))
		)
		(clinical_finding ( snomed_concept “Weakness of muscle of lower limb” (finding) Worsening (qualifier value))
    )
  )
)
;; Page 38 - Cough/Breathing: Urgent for other signs
(system_priority_evaluation
  adult
  Urgent
  (and
    (or
      (clinical_finding (snomed_concept "Cough" "finding"))
      (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
      (clinical_finding (snomed_concept "Dyspnea" "finding"))
    )
    (or
      (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
			OR
      (clinical_finding (snomed_concept "Feeling agitated" "finding"))
)
			(clinical_finding (snomed_concept “Dyspnea at rest” (finding))
			OR
			(clinical_finding (snomed_concept “Dyspnea” (finding) "Speaking" (observable entity) "Associated with" (attribute))
)
			(>=measurement (snomed_concept “Respiratory rate” (observable entity) “Breaths/minute” (qualifier value) 30))
)
      (>= measurement (clinical_finding (snomed_concept “Hemoptysis” (finding) “Tablespoonful - unit of product usage” (qualifier value)1))
)
			(clinical_finding (snomed_concept “Swollen calf” (finding) “Unilateral” (qualifier value))
			AND
			(clinical_finding (snomed_concept “Pain in calf” (finding) “Unilateral” (qualifier value))
)
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
			AND
      (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
)
      (< measurement (clinical_finding (snomed_concept “Hemoglobin saturation with oxygen” (observable entity) “At rest” (qualifier value) “Percentage unit” (qualifier value) 92))
			(< measurement (clinical_finding (snomed_concept “Hemoglobin saturation with oxygen” (observable entity) “During exercise” (qualifier value) “Percentage unit” (qualifier value) 87))
			(< measurement (clinical_finding (snomed_concept “Hemoglobin saturation with oxygen” (observable entity) “Walking” (qualifier value) meter (qualifier value) 15 - 20) “Percentage unit” (qualifier value) 87))
)
      (>= (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 30)
)
      (clinical_finding (snomed_concept "Wheezing" "finding"))
			OR
			(clinical_finding (snomed_concept “Tight chest” (finding))
)
			(clinical_finding (snomed_concept “Difficulty breathing” (finding) Supine body position (finding) Worse (qualifier value))
			AND
			(clinical_finding (snomed_concept “Orthopnea” (finding))
			AND
			(clinical_finding (snomed_concept “Swelling of lower limb” (finding))
)
			(clinical_finding (snomed_concept “Dyspnea” (finding) “Sudden” (qualifier value))
			AND
			(clinical_finding (snomed_concept “Increased vocal resonance” (finding))
			AND
			(clinical_finding (snomed_concept “Decreased breath sounds” (finding))
			AND
			(clinical_finding (snomed_concept “Chest pain” (finding) “Unilateral” (qualifier value))
			AND
			(clinical_finding (snomed_concept “Trachea displaced” (disorder))
		)
) 

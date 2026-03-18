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
;; Page 38 - Cough/Breathing: Pneumocystosis jirovecii pneumonia likely 
(system_diagnosis_rule
  (diagnosis
    (snomed_concept "Pneumocystosis jirovecii pneumonia” "disorder")
    probable
  )
  adult
		(>=(clinical_finding (snomed_concept “Cough” (finding) “week” (qualifier value) 2))
		(>=(clinical_finding (snomed_concept “Difficulty breathing” (finding) “week” (qualifier value)2))
		(clinical_finding (snomed_concept “Cough” (finding) “Recurrent” (qualifier value))
		(clinical_finding (snomed_concept “Difficulty breathing” (finding) “Recurrent” (qualifier value))
		(clinical_finding (snomed_concept “Human immunodeficiency virus infection” (disorder))
		AND
		(<clinical_finding (snomed_concept “Helper cell decrease, function” (observable entity) “cells/microliter” (qualifier value) 200))
		(clinical_finding (snomed_concept “Dry cough” (finding))
		(clinical_finding (snomed_concept “Dyspnea” (finding))

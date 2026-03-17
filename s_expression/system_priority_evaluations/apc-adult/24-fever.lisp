;; Page 24 - Fever: Emergency if seizure or decreased consciousness
(system_priority_evaluation
  adult
  Emergency
  (and
    (clinical_finding (snomed_concept "Fever" "finding"))
    (or
      (clinical_finding (snomed_concept "Seizure" "finding"))
      (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
    )
  )
)
;; Page 24 - Fever: Urgent for other danger signs
(system_priority_evaluation
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Fever" "finding"))
    (or
     (clinical_finding (snomed_concept “Seizure” (finding))
		OR
		(clinical_finding (snomed_concept “Post-ictal state (finding))
		)
		(clinical_finding (snomed_concept “Decreased level of consciousness (finding))
		)
		(clinical_finding (snomed_concept "Stiff neck" "finding"))
		OR
    (clinical_finding (snomed_concept "Drowsy" "finding"))
		OR
    (clinical_finding (snomed_concept "Confusional state" "disorder"))
		OR 
    (clinical_finding (snomed_concept "Purpuric rash" "disorder"))
)
    (> (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 30)
		OR
		(clinical_finding (snomed_concept "Difficulty breathing" "finding"))
)
		(< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90))
    (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
    (clinical_finding (snomed_concept "Tenderness of right lower quadrant of abdomen" "finding"))
)
    (clinical_finding (snomed_concept "Acute abdominal pain" "finding")) Severe” (severity modifier) (qualifier value))
		OR
    (clinical_finding (snomed_concept "Backache" "finding") "Severe” (severity modifier)" "qualifier value"))
)
    (clinical_finding (snomed_concept "Jaundice" "finding"))
)
    (clinical_finding (snomed_concept "Easy bruising" "finding"))
		OR
    (clinical_finding (snomed_concept "Finding of tendency to bleed" "finding"))
      )
)

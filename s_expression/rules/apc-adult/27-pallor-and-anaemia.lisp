;; Page 27 - Pallor and Anaemia
(task
  "Check for urgent anaemia with haemodynamic or bleeding signs"
  adult
  (clinical_finding (snomed_concept "Pale conjunctiva" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Palpitations" "finding"))
    (clinical_finding (snomed_concept "Dizziness" "finding"))
    (clinical_finding (snomed_concept "Collapse" "finding"))
    (clinical_finding (snomed_concept "Chest pain" "finding"))
    (clinical_finding (snomed_concept "Leg swelling symptom" "finding"))
    (clinical_finding (snomed_concept "Jaundice" "finding"))
    (clinical_finding (snomed_concept "Melena" "disorder"))
    (clinical_finding (snomed_concept "Hematochezia" "finding"))
    (clinical_finding (snomed_concept "Easy bruising" "finding"))
    (clinical_finding (snomed_concept "Finding of tendency to bleed" "finding"))
    (clinical_finding (snomed_concept "Purpuric rash" "disorder"))
  )
)
;; Page 27 - Pallor and Anaemia
(system_priority_evaluation
  "Urgent: anaemia with haemodynamic or bleeding signs"
  adult
  Urgent
  (and
		(clinical_finding ( snomed_concept “Pale discoloration of entire skin of body” (finding))
		(clinical_finding ( snomed_concept “Anemia” (disorder))
    (or
      (clinical_finding (snomed_concept "Palpitations" "finding"))
      (clinical_finding (snomed_concept "Dizziness" "finding"))
      (clinical_finding (snomed_concept “Syncope” (finding))
      (clinical_finding (snomed_concept "Chest pain" "finding"))
      (clinical_finding (snomed_concept "Leg swelling symptom" "finding") “Both lower legs” (body structure))
      (clinical_finding (snomed_concept "Jaundice" "finding"))
      (clinical_finding (snomed_concept "Melena" "disorder"))
      (clinical_finding (snomed_concept "Hematochezia" "finding"))
      (clinical_finding (snomed_concept "Easy bruising" "finding"))
      (clinical_finding (snomed_concept “Multiple bruising” (finding) “Widespread” (qualifier value))
      (clinical_finding (snomed_concept "Purpuric rash" "disorder"))
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90))
      (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60))
      (>= (measurement (snomed_concept "Heart rate” (observable entity) entity") bpm) 100))
      (>= (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 30))
(<(clinical_finding ( snomed_concept “Measurement of total hemoglobin concentration” (procedure) g/dL ) 6))
    )
  )
)

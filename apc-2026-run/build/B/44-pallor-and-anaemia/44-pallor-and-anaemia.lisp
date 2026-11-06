;; Page 44 - Pallor and anaemia
(task
  "Check for urgent pallor/anaemia conditions"
  adult
  (or (clinical_finding (snomed_concept "Pale conjunctiva" "finding"))
      (clinical_finding (snomed_concept "Pale complexion" "finding"))
      (clinical_finding (snomed_concept "Pale discoloration of entire skin of body" "finding"))
      (clinical_finding (snomed_concept "Anemia" "disorder")))
  (check_for
    (clinical_finding (snomed_concept "Shock" "disorder"))
    (clinical_finding (snomed_concept "Dizziness" "finding"))
    (clinical_finding (snomed_concept "Feeling faint" "finding"))
    (clinical_finding (snomed_concept "Chest pain" "finding"))
    (clinical_finding (snomed_concept "Palpitations" "finding"))

    (clinical_finding (snomed_concept "Leg swelling symptom" "finding"))
    (clinical_finding (snomed_concept "Jaundice" "finding"))
    (clinical_finding (snomed_concept "Melena" "disorder"))
    (clinical_finding (snomed_concept "Hematochezia" "finding"))

    (clinical_finding (snomed_concept "Multiple bruising" "finding"))
    (clinical_finding (snomed_concept "Easy bruising" "finding"))
    (clinical_finding (snomed_concept "Purpuric rash" "disorder"))
  )
)
(task
  "Check for malaria exposure in pallor/anaemia"
  adult
  (and (or (clinical_finding (snomed_concept "Pale conjunctiva" "finding"))
           (clinical_finding (snomed_concept "Pale complexion" "finding"))
           (clinical_finding (snomed_concept "Pale discoloration of entire skin of body" "finding"))
           (clinical_finding (snomed_concept "Anemia" "disorder")))
       (active_condition (snomed_concept "Fever" "finding")))
  (check_for
    (clinical_finding (snomed_concept "History of travel with high risk of exposure to communicable disease" "situation"))
  )
)
(system_diagnosis_rule
  "Diagnose probable malaria in pallor/anaemia"
  (diagnosis
    (snomed_concept "Malaria" "disorder")
    probable
  )
  adult
  (and
    ;; Approach to the patient with pallor/anaemia not needing urgent attention (see 44-pallor-and-anaemia-flowchart.md)
    (or (clinical_finding (snomed_concept "Pale conjunctiva" "finding"))
        (clinical_finding (snomed_concept "Pale complexion" "finding"))
        (clinical_finding (snomed_concept "Pale discoloration of entire skin of body" "finding"))
        (clinical_finding (snomed_concept "Anemia" "disorder")))
    ;; "fever now or in past 3 days"
    (active_condition (snomed_concept "Fever" "finding"))
    ;; "in a malaria area in past 3 months"
    (< (onset (clinical_finding (snomed_concept "History of travel with high risk of exposure to communicable disease" "situation"))) (time_ago 3 months))
  )
)
(system_priority_evaluation
  "Urgent: pallor/anaemia with danger signs"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Pale conjunctiva" "finding"))
        (clinical_finding (snomed_concept "Pale complexion" "finding"))
        (clinical_finding (snomed_concept "Pale discoloration of entire skin of body" "finding"))
        (clinical_finding (snomed_concept "Anemia" "disorder")))
    (or
      ;; Hb < 6: not representable (no haemoglobin observable/unit)
      (clinical_finding (snomed_concept "Shock" "disorder"))
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 80)
      (>= (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 100)
      (>= (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 30)
      (clinical_finding (snomed_concept "Dizziness" "finding"))
      (clinical_finding (snomed_concept "Feeling faint" "finding"))
      (clinical_finding (snomed_concept "Chest pain" "finding"))
      (clinical_finding (snomed_concept "Palpitations" "finding"))
      (clinical_finding (snomed_concept "Leg swelling symptom" "finding"))
      (clinical_finding (snomed_concept "Jaundice" "finding"))
      (clinical_finding (snomed_concept "Melena" "disorder"))
      (clinical_finding (snomed_concept "Hematochezia" "finding"))
      (clinical_finding (snomed_concept "Multiple bruising" "finding"))
      (clinical_finding (snomed_concept "Easy bruising" "finding"))
      (clinical_finding (snomed_concept "Purpuric rash" "disorder"))
    )
  )
)

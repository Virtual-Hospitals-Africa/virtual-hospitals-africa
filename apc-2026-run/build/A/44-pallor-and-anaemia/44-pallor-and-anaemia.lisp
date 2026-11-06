;; Page 44 - Pallor and anaemia
(task
  "Check for urgent pallor/anaemia conditions"
  adult
  ;; Pallor = pale conjunctiva or palms (no SNOMED concept for pale palms; Pale complexion carries "pallor")
  (or (clinical_finding (snomed_concept "Pale complexion" "finding"))
      (clinical_finding (snomed_concept "Pale conjunctiva" "finding"))
      (clinical_finding (snomed_concept "Anemia" "disorder")))
  (check_for
    ;; Circulation (pulse, respiratory rate and SBP are routine vitals)
    (clinical_finding (snomed_concept "Shock" "disorder"))
    (clinical_finding (snomed_concept "Dizziness" "finding"))
    (clinical_finding (snomed_concept "Feeling faint" "finding"))
    (clinical_finding (snomed_concept "Chest pain" "finding"))
    (clinical_finding (snomed_concept "Palpitations" "finding"))

    (clinical_finding (snomed_concept "Swelling of lower limb" "finding"))
    (clinical_finding (snomed_concept "Jaundice" "finding"))

    ;; Bleeding
    (clinical_finding (snomed_concept "Melena" "disorder"))
    (clinical_finding (snomed_concept "Hematochezia" "finding"))
    (clinical_finding (snomed_concept "Easy bruising" "finding"))
    (clinical_finding (snomed_concept "Multiple bruising" "finding"))
    (clinical_finding (snomed_concept "Purpuric rash" "disorder"))
  )
)
(task
  "Check for malaria area exposure in pallor/anaemia with fever"
  adult
  (and
    (or (clinical_finding (snomed_concept "Pale complexion" "finding"))
        (clinical_finding (snomed_concept "Pale conjunctiva" "finding"))
        (clinical_finding (snomed_concept "Anemia" "disorder")))
    (active_condition (snomed_concept "Fever" "finding")))
  (check_for
    (finding (snomed_concept "Disease that is endemic in recent area visited" "observable entity") (snomed_concept "Malaria" "disorder"))
  )
)
(system_diagnosis_rule
  "Diagnose probable malaria in pallor/anaemia"
  (diagnosis
    (snomed_concept "Malaria" "disorder")
    probable
  )
  adult
  ;; "If fever now or in past 3 days, and in a malaria area in past 3 months, malaria likely"
  (and
    (or (clinical_finding (snomed_concept "Pale complexion" "finding"))
        (clinical_finding (snomed_concept "Pale conjunctiva" "finding"))
        (clinical_finding (snomed_concept "Anemia" "disorder")))
    (active_condition (snomed_concept "Fever" "finding"))
    (finding (snomed_concept "Disease that is endemic in recent area visited" "observable entity") (snomed_concept "Malaria" "disorder"))
  )
)
(system_priority_evaluation
  "Urgent: pallor/anaemia with danger signs"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Pale complexion" "finding"))
        (clinical_finding (snomed_concept "Pale conjunctiva" "finding"))
        (clinical_finding (snomed_concept "Anemia" "disorder")))
    (or
      ;; Hb < 6: not representable (no haemoglobin observable/unit)
      (>= (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 100)
      (>= (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 30)
      ;; Shock/SBP < 80, as written on this page
      (clinical_finding (snomed_concept "Shock" "disorder"))
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 80)
      (clinical_finding (snomed_concept "Dizziness" "finding"))
      (clinical_finding (snomed_concept "Feeling faint" "finding"))
      (clinical_finding (snomed_concept "Chest pain" "finding"))
      (clinical_finding (snomed_concept "Palpitations" "finding"))
      (clinical_finding (snomed_concept "Swelling of lower limb" "finding"))
      (clinical_finding (snomed_concept "Jaundice" "finding"))
      (clinical_finding (snomed_concept "Melena" "disorder"))
      (clinical_finding (snomed_concept "Hematochezia" "finding"))
      (clinical_finding (snomed_concept "Easy bruising" "finding"))
      (clinical_finding (snomed_concept "Multiple bruising" "finding"))
      (clinical_finding (snomed_concept "Purpuric rash" "disorder"))
    )
  )
)

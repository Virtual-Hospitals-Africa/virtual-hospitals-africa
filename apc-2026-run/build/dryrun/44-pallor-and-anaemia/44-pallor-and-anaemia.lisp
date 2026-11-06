;; Page 44 - Pallor and anaemia
(task
  "Check for urgent pallor/anaemia conditions"
  adult
  ;; Presenting complaint: pallor (pale conjunctiva or palms) or anaemia
  (or (clinical_finding (snomed_concept "Pale conjunctiva" "finding"))
      (clinical_finding (snomed_concept "Pale discoloration of entire skin of body" "finding"))
      (clinical_finding (snomed_concept "Anemia" "disorder"))
  )
  (check_for
    ;; Circulation (pulse, respiratory rate and SBP are routine vitals)
    (clinical_finding (snomed_concept "Shock" "disorder"))
    (clinical_finding (snomed_concept "Dizziness" "finding"))
    (clinical_finding (snomed_concept "Feeling faint" "finding"))
    (clinical_finding (snomed_concept "Chest pain" "finding"))
    (clinical_finding (snomed_concept "Palpitations" "finding"))

    (clinical_finding (snomed_concept "Leg swelling symptom" "finding"))
    (clinical_finding (snomed_concept "Jaundice" "finding"))

    ;; Bleeding
    (clinical_finding (snomed_concept "Melena" "disorder"))
    (clinical_finding (snomed_concept "Hematochezia" "finding"))
    (clinical_finding (snomed_concept "Easy bruising" "finding"))
    (clinical_finding (snomed_concept "Non-blanching rash" "disorder"))
    (clinical_finding (snomed_concept "Purpuric rash" "disorder"))
  )
)
(system_priority_evaluation
  "Urgent: pallor/anaemia with danger signs"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Pale conjunctiva" "finding"))
        (clinical_finding (snomed_concept "Pale discoloration of entire skin of body" "finding"))
        (clinical_finding (snomed_concept "Anemia" "disorder"))
    )
    (or
      ;; Hb < 6 is not encoded: the language has no haemoglobin unit (g/dL)
      (>= (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 100)
      (>= (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 30)
      ;; Shock/SBP < 80, as written on this page
      (clinical_finding (snomed_concept "Shock" "disorder"))
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 80)
      ;; Dizzy/faint
      (clinical_finding (snomed_concept "Dizziness" "finding"))
      (clinical_finding (snomed_concept "Feeling faint" "finding"))
      ;; Chest pain or palpitations
      (clinical_finding (snomed_concept "Chest pain" "finding"))
      (clinical_finding (snomed_concept "Palpitations" "finding"))
      (clinical_finding (snomed_concept "Leg swelling symptom" "finding"))
      (clinical_finding (snomed_concept "Jaundice" "finding"))
      ;; Black or bloody stools
      (clinical_finding (snomed_concept "Melena" "disorder"))
      (clinical_finding (snomed_concept "Hematochezia" "finding"))
      ;; Widespread/easy bruising
      (clinical_finding (snomed_concept "Easy bruising" "finding"))
      ;; Purple/red rash that does not disappear with pressure
      (clinical_finding (snomed_concept "Non-blanching rash" "disorder"))
      (clinical_finding (snomed_concept "Purpuric rash" "disorder"))
    )
  )
)

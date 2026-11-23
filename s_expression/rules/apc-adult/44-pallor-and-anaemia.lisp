;; Page 44 - Pallor and anaemia
(task
  "Check for urgent pallor/anaemia conditions"
  adult
  ;; Pallor = pale conjunctiva or palms. No SNOMED concept for pale palms: Pale complexion (VHA vocabulary)
  ;; and Pale discoloration of entire skin of body (synonym "Abnormal pallor skin of body") stand in for skin pallor
  (or (clinical_finding (snomed_concept "Pale complexion" "finding"))
      (clinical_finding (snomed_concept "Pale conjunctiva" "finding"))
      (clinical_finding (snomed_concept "Pale discoloration of entire skin of body" "finding"))
      (clinical_finding (snomed_concept "Anemia" "disorder")))
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
        (clinical_finding (snomed_concept "Pale discoloration of entire skin of body" "finding"))
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
        (clinical_finding (snomed_concept "Pale discoloration of entire skin of body" "finding"))
        (clinical_finding (snomed_concept "Anemia" "disorder")))
    (active_condition (snomed_concept "Fever" "finding"))
    (finding (snomed_concept "Disease that is endemic in recent area visited" "observable entity") (snomed_concept "Malaria" "disorder"))
  )
)
;; Hb < 6: not representable (no haemoglobin observable/unit)

(system_priority_evaluation
  "Urgent: pallor/anaemia with pulse, function ≥ 100 bpm"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Pale complexion" "finding"))
        (clinical_finding (snomed_concept "Pale conjunctiva" "finding"))
        (clinical_finding (snomed_concept "Pale discoloration of entire skin of body" "finding"))
        (clinical_finding (snomed_concept "Anemia" "disorder")))
    (>= (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 100)
  )
)

(system_priority_evaluation
  "Urgent: pallor/anaemia with respiratory rate ≥ 30 bpm"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Pale complexion" "finding"))
        (clinical_finding (snomed_concept "Pale conjunctiva" "finding"))
        (clinical_finding (snomed_concept "Pale discoloration of entire skin of body" "finding"))
        (clinical_finding (snomed_concept "Anemia" "disorder")))
    (>= (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 30)
  )
)
;; Shock/SBP < 80, as written on this page
(system_priority_evaluation
  "Urgent: pallor/anaemia with shock"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Pale complexion" "finding"))
        (clinical_finding (snomed_concept "Pale conjunctiva" "finding"))
        (clinical_finding (snomed_concept "Pale discoloration of entire skin of body" "finding"))
        (clinical_finding (snomed_concept "Anemia" "disorder")))
    (clinical_finding (snomed_concept "Shock" "disorder"))
  )
)

(system_priority_evaluation
  "Urgent: pallor/anaemia with systolic blood pressure < 80 mmHg"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Pale complexion" "finding"))
        (clinical_finding (snomed_concept "Pale conjunctiva" "finding"))
        (clinical_finding (snomed_concept "Pale discoloration of entire skin of body" "finding"))
        (clinical_finding (snomed_concept "Anemia" "disorder")))
    (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 80)
  )
)

(system_priority_evaluation
  "Urgent: pallor/anaemia with dizziness"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Pale complexion" "finding"))
        (clinical_finding (snomed_concept "Pale conjunctiva" "finding"))
        (clinical_finding (snomed_concept "Pale discoloration of entire skin of body" "finding"))
        (clinical_finding (snomed_concept "Anemia" "disorder")))
    (clinical_finding (snomed_concept "Dizziness" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: pallor/anaemia with feeling faint"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Pale complexion" "finding"))
        (clinical_finding (snomed_concept "Pale conjunctiva" "finding"))
        (clinical_finding (snomed_concept "Pale discoloration of entire skin of body" "finding"))
        (clinical_finding (snomed_concept "Anemia" "disorder")))
    (clinical_finding (snomed_concept "Feeling faint" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: pallor/anaemia with chest pain"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Pale complexion" "finding"))
        (clinical_finding (snomed_concept "Pale conjunctiva" "finding"))
        (clinical_finding (snomed_concept "Pale discoloration of entire skin of body" "finding"))
        (clinical_finding (snomed_concept "Anemia" "disorder")))
    (clinical_finding (snomed_concept "Chest pain" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: pallor/anaemia with palpitations"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Pale complexion" "finding"))
        (clinical_finding (snomed_concept "Pale conjunctiva" "finding"))
        (clinical_finding (snomed_concept "Pale discoloration of entire skin of body" "finding"))
        (clinical_finding (snomed_concept "Anemia" "disorder")))
    (clinical_finding (snomed_concept "Palpitations" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: pallor/anaemia with leg swelling symptom"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Pale complexion" "finding"))
        (clinical_finding (snomed_concept "Pale conjunctiva" "finding"))
        (clinical_finding (snomed_concept "Pale discoloration of entire skin of body" "finding"))
        (clinical_finding (snomed_concept "Anemia" "disorder")))
    (clinical_finding (snomed_concept "Leg swelling symptom" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: pallor/anaemia with jaundice"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Pale complexion" "finding"))
        (clinical_finding (snomed_concept "Pale conjunctiva" "finding"))
        (clinical_finding (snomed_concept "Pale discoloration of entire skin of body" "finding"))
        (clinical_finding (snomed_concept "Anemia" "disorder")))
    (clinical_finding (snomed_concept "Jaundice" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: pallor/anaemia with melena"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Pale complexion" "finding"))
        (clinical_finding (snomed_concept "Pale conjunctiva" "finding"))
        (clinical_finding (snomed_concept "Pale discoloration of entire skin of body" "finding"))
        (clinical_finding (snomed_concept "Anemia" "disorder")))
    (clinical_finding (snomed_concept "Melena" "disorder"))
  )
)

(system_priority_evaluation
  "Urgent: pallor/anaemia with hematochezia"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Pale complexion" "finding"))
        (clinical_finding (snomed_concept "Pale conjunctiva" "finding"))
        (clinical_finding (snomed_concept "Pale discoloration of entire skin of body" "finding"))
        (clinical_finding (snomed_concept "Anemia" "disorder")))
    (clinical_finding (snomed_concept "Hematochezia" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: pallor/anaemia with easy bruising"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Pale complexion" "finding"))
        (clinical_finding (snomed_concept "Pale conjunctiva" "finding"))
        (clinical_finding (snomed_concept "Pale discoloration of entire skin of body" "finding"))
        (clinical_finding (snomed_concept "Anemia" "disorder")))
    (clinical_finding (snomed_concept "Easy bruising" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: pallor/anaemia with multiple bruising"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Pale complexion" "finding"))
        (clinical_finding (snomed_concept "Pale conjunctiva" "finding"))
        (clinical_finding (snomed_concept "Pale discoloration of entire skin of body" "finding"))
        (clinical_finding (snomed_concept "Anemia" "disorder")))
    (clinical_finding (snomed_concept "Multiple bruising" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: pallor/anaemia with purpuric rash"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Pale complexion" "finding"))
        (clinical_finding (snomed_concept "Pale conjunctiva" "finding"))
        (clinical_finding (snomed_concept "Pale discoloration of entire skin of body" "finding"))
        (clinical_finding (snomed_concept "Anemia" "disorder")))
    (clinical_finding (snomed_concept "Purpuric rash" "disorder"))
  )
)

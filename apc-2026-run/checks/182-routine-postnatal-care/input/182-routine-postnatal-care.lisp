(task
  "Check for urgent routine postnatal care conditions"
  adult
  (clinical_finding (snomed_concept "Postpartum state" "finding"))
  (check_for

    (clinical_finding (snomed_concept "Heavy episode of vaginal bleeding" "finding"))


    (clinical_finding (snomed_concept "Third degree perineal laceration" "disorder"))
    (clinical_finding (snomed_concept "Fourth degree perineal laceration" "disorder"))


    (clinical_finding (snomed_concept "Seizure" "finding"))


    (clinical_finding (snomed_concept "Shock" "disorder"))


    (clinical_finding (snomed_concept "Pallor of skin of face" "finding"))
    (clinical_finding (snomed_concept "Dizziness" "finding"))
    (clinical_finding (snomed_concept "Feeling faint" "finding"))
    (clinical_finding (snomed_concept "Chest pain" "finding"))


    (clinical_finding (snomed_concept "Generally unwell" "finding"))
  )
)
(task
  "Measure BMI at routine postnatal visit"
  adult
  (clinical_finding (snomed_concept "Postpartum state" "finding"))
  (measure (measurement (snomed_concept "Body mass index" "observable entity") kg/m²))
)
(system_diagnosis_rule
  "Diagnose probable postpartum haemorrhage at routine postnatal care"
  (diagnosis
    (snomed_concept "Postpartum hemorrhage" "disorder")
    probable
  )
  adult



  (and (clinical_finding (snomed_concept "Postpartum state" "finding"))
       (<= (onset (clinical_finding (snomed_concept "Postpartum state" "finding"))) (time_ago 6 weeks))
       (clinical_finding (snomed_concept "Heavy episode of vaginal bleeding" "finding")))
)
(system_priority_evaluation
  "Urgent: routine postnatal care with danger signs"
  adult
  Urgent
  (and

    (clinical_finding (snomed_concept "Postpartum state" "finding"))
    (<= (onset (clinical_finding (snomed_concept "Postpartum state" "finding"))) (time_ago 6 weeks))
    (or
      (active_condition (snomed_concept "Postpartum hemorrhage" "disorder"))
      (clinical_finding (snomed_concept "Third degree perineal laceration" "disorder"))
      (clinical_finding (snomed_concept "Fourth degree perineal laceration" "disorder"))


      (and (clinical_finding (snomed_concept "Seizure" "finding"))
           (<= (onset (clinical_finding (snomed_concept "Postpartum state" "finding"))) (time_ago 1 weeks)))

      (clinical_finding (snomed_concept "Shock" "disorder"))
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 80)

      (and (clinical_finding (snomed_concept "Pallor of skin of face" "finding"))
           (or (>= (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 30)
               (clinical_finding (snomed_concept "Dizziness" "finding"))
               (clinical_finding (snomed_concept "Feeling faint" "finding"))
               (clinical_finding (snomed_concept "Chest pain" "finding"))))

      (and (clinical_finding (snomed_concept "Generally unwell" "finding"))
           (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38))

      (>= (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 100)
    )
  )
)

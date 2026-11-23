;; Page 182 - Routine postnatal care
(task
  "Check for urgent routine postnatal care conditions"
  adult
  (clinical_finding (snomed_concept "Postpartum state" "finding"))
  (check_for
    ;; Heavy bleeding (soaks pad in < 5 minutes), postpartum haemorrhage likely
    (clinical_finding (snomed_concept "Heavy episode of vaginal bleeding" "finding"))

    ;; Perineal tear extending to anus or rectum
    (clinical_finding (snomed_concept "Third degree perineal laceration" "disorder"))
    (clinical_finding (snomed_concept "Fourth degree perineal laceration" "disorder"))

    ;; Recent seizure, up to 1 week postpartum
    (clinical_finding (snomed_concept "Seizure" "finding"))

    ;; Shock/systolic BP < 80
    (clinical_finding (snomed_concept "Shock" "disorder"))

    ;; Pallor with respiratory rate >= 30, dizzy, faint or chest pain
    (clinical_finding (snomed_concept "Pallor of skin of face" "finding"))
    (clinical_finding (snomed_concept "Dizziness" "finding"))
    (clinical_finding (snomed_concept "Feeling faint" "finding"))
    (clinical_finding (snomed_concept "Chest pain" "finding"))

    ;; Unwell and temperature >= 38°C
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
  ;; "Heavy bleeding (soaks pad in < 5 minutes), postpartum haemorrhage likely"
  ;; The pad-soaking time cannot be expressed; heavy vaginal bleeding in the postpartum patient stands for it.
  ;; Scoped by the box header: "postnatal patient (within 6 weeks of delivery)".
  (and (clinical_finding (snomed_concept "Postpartum state" "finding"))
       (<= (onset (clinical_finding (snomed_concept "Postpartum state" "finding"))) (time_ago 6 weeks))
       (clinical_finding (snomed_concept "Heavy episode of vaginal bleeding" "finding")))
)

(system_priority_evaluation
  "Urgent: routine postnatal care with postpartum hemorrhage"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Postpartum state" "finding"))
    (<= (onset (clinical_finding (snomed_concept "Postpartum state" "finding"))) (time_ago 6 weeks))
    (active_condition (snomed_concept "Postpartum hemorrhage" "disorder"))
  )
)

(system_priority_evaluation
  "Urgent: routine postnatal care with third degree perineal laceration"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Postpartum state" "finding"))
    (<= (onset (clinical_finding (snomed_concept "Postpartum state" "finding"))) (time_ago 6 weeks))
    (clinical_finding (snomed_concept "Third degree perineal laceration" "disorder"))
  )
)

(system_priority_evaluation
  "Urgent: routine postnatal care with fourth degree perineal laceration"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Postpartum state" "finding"))
    (<= (onset (clinical_finding (snomed_concept "Postpartum state" "finding"))) (time_ago 6 weeks))
    (clinical_finding (snomed_concept "Fourth degree perineal laceration" "disorder"))
  )
)
;; Hb < 6: not representable (no haemoglobin observable/unit)
;; Recent seizure, up to 1 week postpartum
(system_priority_evaluation
  "Urgent: routine postnatal care with seizure and onset of postpartum state ≤ 1 weeks ago"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Postpartum state" "finding"))
    (<= (onset (clinical_finding (snomed_concept "Postpartum state" "finding"))) (time_ago 6 weeks))
    (clinical_finding (snomed_concept "Seizure" "finding"))
    (<= (onset (clinical_finding (snomed_concept "Postpartum state" "finding"))) (time_ago 1 weeks))
  )
)
;; Shock/systolic BP < 80
(system_priority_evaluation
  "Urgent: routine postnatal care with shock"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Postpartum state" "finding"))
    (<= (onset (clinical_finding (snomed_concept "Postpartum state" "finding"))) (time_ago 6 weeks))
    (clinical_finding (snomed_concept "Shock" "disorder"))
  )
)

(system_priority_evaluation
  "Urgent: routine postnatal care with systolic blood pressure < 80 mmHg"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Postpartum state" "finding"))
    (<= (onset (clinical_finding (snomed_concept "Postpartum state" "finding"))) (time_ago 6 weeks))
    (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 80)
  )
)
;; Pallor with respiratory rate >= 30, dizzy, faint or chest pain
(system_priority_evaluation
  "Urgent: routine postnatal care with pallor of skin of face and respiratory rate ≥ 30 bpm or dizziness or feeling faint or chest pain"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Postpartum state" "finding"))
    (<= (onset (clinical_finding (snomed_concept "Postpartum state" "finding"))) (time_ago 6 weeks))
    (clinical_finding (snomed_concept "Pallor of skin of face" "finding"))
    (or (>= (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 30)
        (clinical_finding (snomed_concept "Dizziness" "finding"))
        (clinical_finding (snomed_concept "Feeling faint" "finding"))
        (clinical_finding (snomed_concept "Chest pain" "finding")))
  )
)
;; Unwell and temperature >= 38°C
(system_priority_evaluation
  "Urgent: routine postnatal care with generally unwell and body temperature ≥ 38 °C"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Postpartum state" "finding"))
    (<= (onset (clinical_finding (snomed_concept "Postpartum state" "finding"))) (time_ago 6 weeks))
    (clinical_finding (snomed_concept "Generally unwell" "finding"))
    (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
  )
)
;; Pulse >= 100
(system_priority_evaluation
  "Urgent: routine postnatal care with pulse, function ≥ 100 bpm"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Postpartum state" "finding"))
    (<= (onset (clinical_finding (snomed_concept "Postpartum state" "finding"))) (time_ago 6 weeks))
    (>= (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 100)
  )
)

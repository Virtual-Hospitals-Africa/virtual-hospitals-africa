;; Page 57 - Abnormal Vaginal Bleeding
(task
  "Check for urgent vaginal bleeding conditions"
  adult
  (clinical_finding (snomed_concept "Abnormal vaginal bleeding" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Pregnancy" "finding"))
    (<= (onset (clinical_finding (snomed_concept "Delivery finding" "finding")))
        (time_ago 6 weeks))
    (<= (onset (clinical_finding (snomed_concept "Miscarriage" "disorder")))
        (time_ago 6 weeks))
    (<= (onset (clinical_finding (snomed_concept "Induced termination of pregnancy" "disorder")))
        (time_ago 6 weeks))
    (clinical_finding (snomed_concept "Pallor of skin of face" "finding"))
    (clinical_finding (snomed_concept "Dizziness" "finding"))
    (clinical_finding (snomed_concept "Feeling faint" "finding"))
    (clinical_finding (snomed_concept "Chest pain" "finding"))
    (clinical_finding (snomed_concept "Pale conjunctiva" "finding"))
  )
)
;; Page 57 - Abnormal Vaginal Bleeding: Urgent for haemodynamic signs
(system_priority_evaluation
  "Urgent: abnormal vaginal bleeding with haemodynamic compromise"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Abnormal vaginal bleeding" "finding"))
    (or
      (and
        (clinical_finding (snomed_concept "Pallor of skin of face" "finding"))
        (or
          (>= (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 100)
          (>= (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 30)
          (clinical_finding (snomed_concept "Dizziness" "finding"))
          (clinical_finding (snomed_concept "Chest pain" "finding"))
        )
      )
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
      (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
    )
  )
)

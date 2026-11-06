;; Page 43 - Weakness or tiredness
(task
  "Check for urgent weakness or tiredness conditions"
  adult
  (or (clinical_finding (snomed_concept "Fatigue" "finding"))
      (clinical_finding (snomed_concept "Asthenia" "finding")))
  (check_for
    ;; New sudden asymmetric weakness or numbness of face, arm or leg; difficulty speaking or visual disturbance
    (clinical_finding (snomed_concept "Weakness of face muscles" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of face" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Difficulty talking" "finding"))
    (clinical_finding (snomed_concept "Visual disturbance" "disorder"))

    ;; Glucose < 4 if diabetes
    (clinical_finding (snomed_concept "Diabetes mellitus" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))

    (clinical_finding (snomed_concept "Chest pain" "finding"))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))

    ;; Heart failure likely
    (clinical_finding (snomed_concept "Orthopnea" "finding"))
    (clinical_finding (snomed_concept "Leg swelling symptom" "finding"))

    ;; Worsening weakness of leg/s
    (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding") (qualifier (snomed_concept "Worsening" "qualifier value")))

    ;; Dehydration likely
    (clinical_finding (snomed_concept "Thirst due to water deprivation" "finding"))
    (clinical_finding (snomed_concept "Xerostomia" "finding"))
    (clinical_finding (snomed_concept "Decreased skin turgor" "finding"))
  )
)
(system_diagnosis_rule
  "Possible stroke in weakness or tiredness"
  (diagnosis
    (snomed_concept "Cerebrovascular accident" "disorder")
    possible
  )
  adult
  (and
    (or (clinical_finding (snomed_concept "Fatigue" "finding"))
      (clinical_finding (snomed_concept "Asthenia" "finding")))
    (or (clinical_finding (snomed_concept "Weakness of face muscles" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
        (clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
        (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
        (clinical_finding (snomed_concept "Numbness of face" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
        (clinical_finding (snomed_concept "Numbness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
        (clinical_finding (snomed_concept "Numbness of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
        (clinical_finding (snomed_concept "Difficulty talking" "finding"))
        (clinical_finding (snomed_concept "Visual disturbance" "disorder"))
    )
  )
)
(system_diagnosis_rule
  "Possible TIA in weakness or tiredness"
  (diagnosis
    (snomed_concept "Transient ischemic attack" "disorder")
    possible
  )
  adult
  (and
    (or (clinical_finding (snomed_concept "Fatigue" "finding"))
      (clinical_finding (snomed_concept "Asthenia" "finding")))
    (or (clinical_finding (snomed_concept "Weakness of face muscles" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
        (clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
        (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
        (clinical_finding (snomed_concept "Numbness of face" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
        (clinical_finding (snomed_concept "Numbness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
        (clinical_finding (snomed_concept "Numbness of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
        (clinical_finding (snomed_concept "Difficulty talking" "finding"))
        (clinical_finding (snomed_concept "Visual disturbance" "disorder"))
    )
  )
)
(system_diagnosis_rule
  "Probable heart failure in weakness or tiredness"
  (diagnosis
    (snomed_concept "Heart failure" "disorder")
    probable
  )
  adult
  (and
    (or (clinical_finding (snomed_concept "Fatigue" "finding"))
      (clinical_finding (snomed_concept "Asthenia" "finding")))
    ;; Difficulty breathing worse on lying flat and leg swelling
    (clinical_finding (snomed_concept "Orthopnea" "finding"))
    (clinical_finding (snomed_concept "Leg swelling symptom" "finding"))
  )
)
(system_diagnosis_rule
  "Probable dehydration in weakness or tiredness"
  (diagnosis
    (snomed_concept "Dehydration" "disorder")
    probable
  )
  adult
  (and
    (or (clinical_finding (snomed_concept "Fatigue" "finding"))
      (clinical_finding (snomed_concept "Asthenia" "finding")))
    ;; Thirst, dry mouth, poor skin turgor, BP < 90/60 (read as any of; see remaining questions)
    (or (clinical_finding (snomed_concept "Thirst due to water deprivation" "finding"))
        (clinical_finding (snomed_concept "Xerostomia" "finding"))
        (clinical_finding (snomed_concept "Decreased skin turgor" "finding"))
        (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
        (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
    )
  )
)
(system_priority_evaluation
  "Urgent: weakness or tiredness with danger signs"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Fatigue" "finding"))
      (clinical_finding (snomed_concept "Asthenia" "finding")))
    (or
      ;; Stroke or TIA signs
      (clinical_finding (snomed_concept "Weakness of face muscles" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Numbness of face" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Numbness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Numbness of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Difficulty talking" "finding"))
      (clinical_finding (snomed_concept "Visual disturbance" "disorder"))

      ;; Glucose < 3 (or < 4 if diabetes) or >= 11.1
      (< (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 3)
      (and (clinical_finding (snomed_concept "Diabetes mellitus" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
           (< (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 4))
      (>= (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 11.1)

      (clinical_finding (snomed_concept "Chest pain" "finding"))

      ;; Difficulty breathing or respiratory rate >= 30
      (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
      (>= (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 30)

      ;; Hb < 6: not representable (no haemoglobin observable or unit)

      ;; Heart failure likely
      (active_condition (snomed_concept "Heart failure" "disorder"))

      ;; Worsening weakness of leg/s
      (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding") (qualifier (snomed_concept "Worsening" "qualifier value")))

      ;; Dehydration likely
      (active_condition (snomed_concept "Dehydration" "disorder"))

      ;; Temperature >= 38 C now or in past 3 days
      (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
      (active_condition (snomed_concept "Fever" "finding"))
    )
  )
)
